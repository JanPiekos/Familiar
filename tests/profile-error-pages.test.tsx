import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { createInstance } from "i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import {
	ErrorPage,
	RouteErrorPage,
	RouteNotFoundPage,
} from "@/components/layout/error-page";
import { ApiFetchError, ApiNetworkError, apiFetch } from "@/lib/fetch";
import { getErrorStatus, getPageError } from "@/lib/page-error";
import { getRouteSeo } from "@/lib/route-seo";

vi.mock("@/lib/supabase", () => ({ getAccessToken: async () => null }));

const secret = "<html>Cloudflare Tunnel error: private upstream detail</html>";
function failure(status: number) {
	return new ApiFetchError(new Response(secret, { status }), secret);
}
let mockConsole: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	window.scrollTo = vi.fn();
	mockConsole = vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

async function app({
	error = failure(530) as unknown,
	path = "/broken",
	locale = "en",
	renderFailure = false,
	retry = undefined as (() => Promise<unknown>) | undefined,
} = {}) {
	let current = error;
	let attempts = 0;
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	const root = createRootRoute({
		component: Outlet,
		errorComponent: RouteErrorPage,
		notFoundComponent: RouteNotFoundPage,
	});
	const page = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/broken",
		loader: async () => {
			attempts++;
			if (renderFailure || retry) return;
			await client.ensureQueryData({
				queryKey: ["page"],
				queryFn: async () => {
					if (current) throw current;
					return "Loaded successfully";
				},
			});
		},
		component: () => {
			if (retry) return <ErrorPage error={error} compact onRetry={retry} />;
			if (renderFailure && current) throw current;
			return <h1>Loaded successfully</h1>;
		},
	});
	const router = createRouter({
		routeTree: root.addChildren([page]),
		defaultErrorComponent: RouteErrorPage,
		history: createMemoryHistory({ initialEntries: [path] }),
		defaultPendingMinMs: 0,
	});
	await router.load();
	render(
		<I18nextProvider i18n={i18n}>
			<RouterProvider router={router as never} />
		</I18nextProvider>,
	);
	return {
		router,
		recover: () => {
			current = null;
		},
		attempts: () => attempts,
	};
}

describe("safe HTTP errors", () => {
	it("keeps diagnostic response data out of the error message, including serialized errors", () => {
		const error = failure(530);
		expect(error.message).toBe("Request failed: 530");
		expect(error.body).toBe(secret);
		expect(getPageError({ name: error.name, message: error.message })).toEqual({
			kind: "unavailable",
			status: 530,
			retryable: true,
		});
		expect(error.message).not.toContain("Cloudflare");
	});
	it.each([
		[404, "not_found"],
		[410, "not_found"],
		[401, "unauthorized"],
		[403, "forbidden"],
		[429, "rate_limit"],
		[408, "timeout"],
		[504, "timeout"],
		[524, "timeout"],
		[500, "server"],
		[502, "unavailable"],
		[503, "unavailable"],
		[530, "unavailable"],
		[400, "request"],
	])("classifies HTTP %s", (status, kind) => {
		expect(getPageError(failure(status as number))).toMatchObject({
			status,
			kind,
		});
	});
	it("does not turn arbitrary numbers in a message or response body into a status", () => {
		expect(getErrorStatus(new Error("User 530 crashed"))).toBeUndefined();
		expect(getPageError({ body: '{"status":404}', status: 200 }).kind).toBe(
			"unknown",
		);
		expect(getErrorStatus({ statusCode: "503" })).toBe(503);
	});
	it("distinguishes failed downloads, network problems, and programming errors", () => {
		expect(
			getPageError(
				new TypeError(
					"Failed to fetch dynamically imported module: /assets/page.js",
				),
			).kind,
		).toBe("update");
		expect(
			getPageError(new ApiNetworkError(new TypeError("fetch failed"))).kind,
		).toBe("network");
		expect(
			getPageError(new TypeError("Cannot read properties of undefined")).kind,
		).toBe("unknown");
	});
	it("wraps network failures safely while preserving deliberate request cancellation", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new TypeError("fetch failed")),
		);
		await expect(
			apiFetch("/example", { withAuth: false }),
		).rejects.toBeInstanceOf(ApiNetworkError);
		const abort = new DOMException("Aborted", "AbortError");
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abort));
		await expect(apiFetch("/example", { withAuth: false })).rejects.toBe(abort);
		expect(mockConsole).toHaveBeenCalled();
	});
});

describe("page error recovery", () => {
	it.each([
		[530, "Familiar is temporarily unavailable"],
		[500, "Something went wrong on the server"],
		[404, "This page couldn't be found"],
		[429, "Let's take a short break"],
		[403, "You don't have access to this page"],
	])(
		"shows an explanation for HTTP %s without raw server details",
		async (status, title) => {
			await app({ error: failure(status as number) });
			const heading = await screen.findByRole("heading", {
				name: title as string,
			});
			expect(document.activeElement).toBe(heading);
			expect(screen.getByText("Error " + status)).toBeDefined();
			expect(
				screen.getByRole("link", { name: "Back to home" }).getAttribute("href"),
			).toBe("/");
			expect(document.body.textContent).not.toContain(secret);
			expect(document.body.textContent).not.toContain("Request failed:");
			expect(screen.queryByText("Show Error")).toBeNull();
		},
	);
	it("retries a failed loader and query rather than just hiding the error", async () => {
		const fixture = await app();
		await screen.findByRole("heading", {
			name: "Familiar is temporarily unavailable",
		});
		fixture.recover();
		fireEvent.click(screen.getByRole("button", { name: "Try again" }));
		await screen.findByRole("heading", { name: "Loaded successfully" });
		expect(fixture.attempts()).toBe(2);
	});
	it("recovers from a render error", async () => {
		const fixture = await app({
			renderFailure: true,
			error: new Error(secret),
		});
		await screen.findByRole("heading", { name: "We couldn't load this page" });
		fixture.recover();
		fireEvent.click(screen.getByRole("button", { name: "Try again" }));
		await screen.findByRole("heading", { name: "Loaded successfully" });
	});
	it("renders a missing URL as 404 without offering an ineffective retry", async () => {
		await app({ path: "/this-page-does-not-exist" });
		await screen.findByRole("heading", { name: "This page couldn't be found" });
		expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
	});
	it("offers a localized sign-in link for 401", async () => {
		await app({ error: failure(401), locale: "pl", path: "/pl/broken" });
		await screen.findByRole("heading", {
			name: "Zaloguj się, aby kontynuować",
		});
		expect(
			screen.getByRole("link", { name: "Zaloguj się" }).getAttribute("href"),
		).toBe("/pl/auth/login");
		expect(
			screen.getByRole("link", { name: "Strona główna" }).getAttribute("href"),
		).toBe("/pl");
	});
	it("keeps the explanation visible and prevents duplicate retries while retrying", async () => {
		let reject!: (reason: unknown) => void;
		const retry = vi.fn(
			() =>
				new Promise((_, fail) => {
					reject = fail;
				}),
		);
		await app({ retry });
		const button = screen.getByRole("button", { name: "Try again" });
		fireEvent.click(button);
		expect(
			screen
				.getByRole("button", { name: "Trying again…" })
				.hasAttribute("disabled"),
		).toBe(true);
		fireEvent.click(button);
		expect(retry).toHaveBeenCalledTimes(1);
		await act(async () => {
			reject(new Error(secret));
		});
		await waitFor(() =>
			expect(
				screen
					.getByRole("button", { name: "Try again" })
					.hasAttribute("disabled"),
			).toBe(false),
		);
		expect(document.body.textContent).not.toContain(secret);
	});
	it("uses an error title and description without putting diagnostics into metadata", () => {
		const data = getRouteSeo([
			{
				routeId: "/{-$locale}/_main/user/$username",
				pathname: "/pl/user/artist",
				params: { locale: "pl", username: "artist" },
				status: "error",
				error: failure(530),
			},
		]);
		expect(data.meta.find((meta) => "title" in meta)?.title).toContain(
			"Familiar jest chwilowo niedostępny",
		);
		expect(JSON.stringify(data)).not.toContain(secret);
	});
});
