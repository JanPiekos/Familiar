import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	HeadContent,
	notFound,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { APP_FAVICONS } from "@/lib/favicon";
import { RouteFavicon } from "@/components/layout/route-favicon";

// Keep the real app head configuration and favicon owner; omit unrelated providers.
vi.mock("@/providers/auth", () => ({
	AuthProvider: ({ children }: { children: ReactNode }) => children,
	useAuth: () => ({ user: null, isPending: false }),
}));
vi.mock(
	"@/components/layout/modal/profile/settings/routed-user-settings",
	() => ({ RoutedUserSettings: () => null }),
);
import { Route as AppRootRoute } from "@/routes/__root";

const images: { src: string; onload: (() => void) | null }[] = [];
class FakeImage {
	src = "";
	onload: (() => void) | null = null;
	constructor() {
		images.push(this);
	}
}
const drawImage = vi.fn();

beforeEach(() => {
	vi.stubGlobal("Image", FakeImage);
	vi.stubGlobal(
		"fetch",
		vi.fn(
			async () =>
				new Response("<svg/>", {
					headers: { "Content-Type": "image/svg+xml" },
				}),
		),
	);
	vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:avatar");
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
		drawImage,
	} as never);
	vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
		"data:image/png;base64,PROFILE",
	);
	window.scrollTo = vi.fn();
});
afterEach(() => {
	cleanup();
	document.head
		.querySelectorAll('link[rel~="icon"]')
		.forEach((link) => link.remove());
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	drawImage.mockClear();
	images.length = 0;
});

async function app(path: string, kind: "avatar" | "generated" = "avatar") {
	const root = createRootRoute({
		head: AppRootRoute.options.head as never,
		component: () => (
			<>
				<HeadContent />
				<RouteFavicon />
				<Outlet />
			</>
		),
	});
	// Match the app's optional locale and pathless layout route IDs.
	const main = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}",
		component: Outlet,
	}).update({ id: "/{-$locale}/_main" } as never);
	const profile = createRoute({
		getParentRoute: () => main,
		path: "/user/$username",
		loader: ({ params }) => {
			if (params.username === "missing") throw notFound();
			return {
				username: params.username,
				faviconUrl: `/api/avatar?name=${params.username}`,
				user: {
					username: params.username,
					displayName: params.username,
					avatarPath:
						kind === "avatar" && params.username !== "guest"
							? "/avatar.webp"
							: null,
				},
			};
		},
		notFoundComponent: () => <h1>Not found</h1>,
		component: () => {
			const { username } = profile.useParams();
			return (
				<>
					<h1>Profile {username}</h1>
					<Outlet />
				</>
			);
		},
	});
	const tab = createRoute({
		getParentRoute: () => profile,
		path: "$tab",
		component: Outlet,
	});
	const chat = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/chat",
		component: () => <h1>Chat</h1>,
	});
	const shop = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/shop",
		component: () => <h1>Shop</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren([
			main.addChildren([profile.addChildren([tab])]),
			chat,
			shop,
		]),
		history: createMemoryHistory({ initialEntries: [path] }),
		defaultPendingMinMs: 0,
	});
	render(<RouterProvider router={router as never} />);
	await screen.findByRole("heading", { level: 1 });
	return router;
}
function expectOnlyIcon(href: string) {
	const icons = Array.from(
		document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
	);
	expect(icons.map((icon) => icon.getAttribute("href"))).toEqual([href]);
	return icons[0];
}
async function loadAvatar(index = 0, href = "data:image/png;base64,PROFILE") {
	await waitFor(() => expect(images[index]?.src).toBe("blob:avatar"));
	vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockReturnValue(href);
	await act(async () => images[index].onload?.());
	await waitFor(() => expectOnlyIcon(href));
}

function expectAppIcons() {
	const icons = Array.from(
		document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
	);
	expect(icons.map((icon) => icon.getAttribute("href"))).toEqual(
		APP_FAVICONS.map((icon) => icon.href),
	);
	expect(icons.map((icon) => icon.getAttribute("media"))).toEqual([
		"(prefers-color-scheme: light)",
		"(prefers-color-scheme: dark)",
		null,
	]);
}

// These are client navigations on one mounted router: no reload between pages.
describe("route favicon lifecycle", () => {
	it.each(["/chat", "/pl/chat"])(
		"declares the app icon on a direct visit to %s",
		async (path) => {
			await app(path);
			expectAppIcons();
		},
	);

	it("uses only the profile icon immediately after client navigation from chat", async () => {
		const router = await app("/chat");
		await act(async () => {
			await router.navigate({ to: "/user/alice" as never });
		});
		await screen.findByRole("heading", { name: "Profile alice" });
		expectOnlyIcon("/api/avatar?name=alice");
		await loadAvatar();
	});

	it.each(["avatar", "generated"] as const)(
		"restores the app icon after leaving a profile with a %s icon",
		async (kind) => {
			const router = await app("/pl/user/alice", kind);
			if (kind === "avatar") await loadAvatar();
			else
				await waitFor(() =>
					expectOnlyIcon(expect.stringContaining("data:image/svg+xml;base64,")),
				);
			await act(async () => {
				await router.navigate({ to: "/pl/chat" as never });
			});
			await screen.findByRole("heading", { name: "Chat" });
			await waitFor(() => expectAppIcons());
			await act(async () => {
				await router.navigate({ to: "/pl/shop" as never });
			});
			await screen.findByRole("heading", { name: "Shop" });
			expectAppIcons();
		},
	);

	it("updates profile-to-profile navigation and browser back/forward without reloading", async () => {
		const router = await app("/user/alice");
		await loadAvatar(0, "data:image/png;base64,ALICE");
		await act(async () => {
			await router.navigate({ to: "/user/bob" as never });
		});
		await screen.findByRole("heading", { name: "Profile bob" });
		expectOnlyIcon("/api/avatar?name=bob");
		await loadAvatar(1, "data:image/png;base64,BOB");
		await act(async () => {
			router.history.back();
		});
		await screen.findByRole("heading", { name: "Profile alice" });
		expectOnlyIcon("/api/avatar?name=alice");
		await loadAvatar(2, "data:image/png;base64,ALICE");
		await act(async () => {
			router.history.forward();
		});
		await screen.findByRole("heading", { name: "Profile bob" });
		expectOnlyIcon("/api/avatar?name=bob");
		await loadAvatar(3, "data:image/png;base64,BOB");
	});

	it("keeps the profile icon through tab, locale, query, and head updates", async () => {
		const router = await app("/user/alice/portfolio");
		await loadAvatar();
		await act(async () => {
			await router.navigate({
				to: "/pl/user/alice/liked?settings=profile#bio" as never,
			});
		});
		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/pl/user/alice/liked"),
		);
		await act(async () => {
			await router.invalidate();
		});
		expectOnlyIcon("data:image/png;base64,PROFILE");
		expect(images).toHaveLength(1);
	});

	it("switches between uploaded avatars and generated faces on profile routes", async () => {
		const router = await app("/user/alice");
		await loadAvatar();
		await act(async () => {
			await router.navigate({ to: "/user/guest" as never });
		});
		await screen.findByRole("heading", { name: "Profile guest" });
		await waitFor(() =>
			expectOnlyIcon(expect.stringContaining("data:image/svg+xml;base64,")),
		);
		await act(async () => {
			await router.navigate({ to: "/user/bob" as never });
		});
		await screen.findByRole("heading", { name: "Profile bob" });
		expectOnlyIcon("/api/avatar?name=bob");
		await loadAvatar(1, "data:image/png;base64,BOB");
	});

	it("updates generated icons when the profile username changes", async () => {
		const router = await app("/user/alice", "generated");
		await waitFor(() =>
			expectOnlyIcon(expect.stringContaining("data:image/svg+xml;base64,")),
		);
		const first =
			document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href;
		await act(async () => {
			await router.navigate({ to: "/user/bob" as never });
		});
		await screen.findByRole("heading", { name: "Profile bob" });
		await waitFor(() => {
			const icon = expectOnlyIcon(
				expect.stringContaining("data:image/svg+xml;base64,"),
			);
			expect(icon.href).not.toBe(first);
			expect(atob(icon.href.split(",")[1])).toContain(">B</text>");
		});
	});

	it("ignores delayed loads from a profile that has already been left", async () => {
		let finish!: (value: Response) => void;
		vi.stubGlobal(
			"fetch",
			vi.fn(
				() =>
					new Promise<Response>((resolve) => {
						finish = resolve;
					}),
			),
		);
		const router = await app("/user/alice");
		const staleLoad = images[0].onload;
		await act(async () => {
			await router.navigate({ to: "/chat" as never });
		});
		await screen.findByRole("heading", { name: "Chat" });
		await act(async () => {
			finish(new Response("<svg/>"));
			staleLoad?.();
		});
		expect(drawImage).not.toHaveBeenCalled();
		expectAppIcons();
	});

	it("keeps the profile SVG when the optional PNG conversion fails", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		await app("/user/alice");
		expectOnlyIcon("/api/avatar?name=alice");
	});

	it("uses the app icon when the profile does not exist", async () => {
		const router = await app("/user/alice");
		await loadAvatar();
		await act(async () => {
			await router.navigate({ to: "/user/missing" as never });
		});
		await screen.findByRole("heading", { name: "Not found" });
		expectAppIcons();
	});
});
