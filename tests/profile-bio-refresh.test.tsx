import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { TUserProfile } from "@/types/user";

const state = vi.hoisted(() => ({
	api: vi.fn(),
	ownBio: "Original bio",
	failSave: false,
}));
vi.mock("@/lib/fetch", async (original) => ({
	...(await original<typeof import("@/lib/fetch")>()),
	apiFetch: state.api,
}));
vi.mock("@/components/layout/error-page", () => ({
	RouteNotFoundPage: () => <h1>Missing profile</h1>,
}));
vi.mock("@/components/layout/profile/feed/commissions", () => ({
	ProfileCommissions: () => null,
}));
vi.mock("@/components/layout/profile/feed/portfolio", () => ({
	ProfilePortfolio: () => null,
}));
vi.mock("@/components/layout/profile/feed/portfolio-unavailable", () => ({
	hasArtistPortfolio: () => true,
	PortfolioUnavailable: () => null,
}));
vi.mock("@/hooks/commissions/use-commissions", () => ({
	useProfileCommissions: () => ({}),
}));
vi.mock("@/hooks/user/use-profile-content", () => ({
	useProfileContent: () => ({}),
}));
vi.mock("@/hooks/ui/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("@/lib/seo", () => ({ seo: () => [], getSeoLinks: () => [] }));
vi.mock("@/components/layout/profile/profile", () => ({
	default: ({
		user,
		children,
	}: {
		user: TUserProfile;
		children: ReactNode;
	}) => (
		<>
			<div data-testid="visible-bio">
				<ProfileBio user={user} />
			</div>
			<SaveControls
				user={
					user.username === "hasira"
						? user
						: {
								...user,
								userId: "own-id",
								username: "hasira",
								displayName: "Hasira",
								bio: state.ownBio,
							}
				}
			/>
			{children}
		</>
	),
	UserProfileSkeleton: () => <p>Loading profile</p>,
	TabContentSkeleton: () => null,
}));
import { useUpdateProfile } from "@/hooks/user/use-update-profile";
import { ProfileBio } from "@/components/layout/profile/bio";
import { Route as ProfileRoute } from "@/routes/{-$locale}/_main/user.$username";

function SaveControls({ user }: { user: TUserProfile }) {
	const [bio, setBio] = useState(user.bio ?? "");
	const save = useUpdateProfile();
	const initialValues = {
		username: user.username,
		display_name: user.displayName,
		bio: user.bio ?? "",
		avatar_url: "",
		cover_url: "",
		accent_color: "",
	};
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				save.mutate({ initialValues, values: { ...initialValues, bio } });
			}}
		>
			<label htmlFor="bio">Bio</label>
			<input
				id="bio"
				value={bio}
				onChange={(event) => setBio(event.target.value)}
			/>
			<button type="submit" disabled={save.isPending}>
				Save bio
			</button>
			{save.isError && <p role="alert">Save failed</p>}
		</form>
	);
}

const clients: QueryClient[] = [];
function user(username = "hasira") {
	return {
		userId: username === "hasira" ? "own-id" : "other-id",
		username,
		displayName: username === "hasira" ? "Hasira" : "Other",
		bio: username === "hasira" ? state.ownBio : "Other person's bio",
		roles: ["ARTIST"],
		socials: [],
		createdAt: "2026-01-01",
	};
}
function mount(username = "hasira") {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	clients.push(client);
	const root = createRootRoute({
		component: () => (
			<QueryClientProvider client={client}>
				<Outlet />
			</QueryClientProvider>
		),
	});
	const main = createRoute({
		getParentRoute: () => root,
		id: "/{-$locale}/_main",
		component: Outlet,
	});
	const profile = ProfileRoute.update({
		getParentRoute: () => main,
		id: "/user/$username",
		path: "/{-$locale}/user/$username",
	} as never);
	const tab = createRoute({
		getParentRoute: () => profile,
		path: "$tab",
		component: () => <p>Portfolio</p>,
	});
	const router = createRouter({
		routeTree: root.addChildren([
			main.addChildren([profile.addChildren([tab])]),
		]),
		history: createMemoryHistory({
			initialEntries: [`/user/${username}/portfolio`],
		}),
		context: { queryClient: client },
		defaultPendingMinMs: 0,
	});
	render(<RouterProvider router={router as never} />);
	return { client, router };
}
beforeEach(() => {
	state.ownBio = "Original bio";
	state.failSave = false;
	state.api
		.mockReset()
		.mockImplementation(
			async (path: string, init?: { method?: string; body?: string }) => {
				if (init?.method === "PATCH") {
					if (state.failSave) throw new Error("Save failed");
					state.ownBio = JSON.parse(init.body ?? "{}").bio;
					return user();
				}
				if (path === "/users/hasira") return user();
				if (path === "/users/other") return user("other");
				throw new Error(`Unexpected profile request: ${path}`);
			},
		);
});
afterEach(() => {
	cleanup();
	clients.forEach((client) => client.clear());
});

it("updates the visible profile after consecutive saves and clearing the bio, while the loader snapshot stays unchanged", async () => {
	const { router } = mount();
	expect((await screen.findByTestId("visible-bio")).textContent).toBe(
		"Original bio",
	);
	for (const bio of ["First saved bio", "Second saved bio", ""]) {
		fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
			target: { value: bio },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save bio" }));
		await waitFor(() =>
			expect(screen.getByTestId("visible-bio").textContent).toBe(bio),
		);
	}
	const loaded = router.state.matches.find(
		(match) => (match.loaderData as { user?: TUserProfile } | undefined)?.user,
	);
	expect((loaded?.loaderData as { user: TUserProfile }).user.bio).toBe(
		"Original bio",
	);
	expect(
		state.api.mock.calls.filter(([, init]) => init?.method === "PATCH"),
	).toHaveLength(3);
	expect(
		state.api.mock.calls.filter(
			([path, init]) => path === "/users/hasira" && !init?.method,
		),
	).toHaveLength(1);
});
it("keeps the displayed bio and unsaved edits after failure, then updates them after retry", async () => {
	mount();
	await screen.findByTestId("visible-bio");
	state.failSave = true;
	fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
		target: { value: "Retry this bio" },
	});
	fireEvent.click(screen.getByRole("button", { name: "Save bio" }));
	await screen.findByRole("alert");
	expect(screen.getByTestId("visible-bio").textContent).toBe("Original bio");
	expect(
		(screen.getByRole("textbox", { name: "Bio" }) as HTMLInputElement).value,
	).toBe("Retry this bio");
	state.failSave = false;
	fireEvent.click(screen.getByRole("button", { name: "Save bio" }));
	await waitFor(() =>
		expect(screen.getByTestId("visible-bio").textContent).toBe(
			"Retry this bio",
		),
	);
});
it("does not replace a different person's displayed bio when saving the signed-in profile", async () => {
	const { client } = mount("other");
	await screen.findByTestId("visible-bio");
	fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
		target: { value: "My updated bio" },
	});
	fireEvent.click(screen.getByRole("button", { name: "Save bio" }));
	await waitFor(() =>
		expect(client.getQueryData(["users", "username", "hasira"])).toMatchObject({
			bio: "My updated bio",
		}),
	);
	expect(screen.getByTestId("visible-bio").textContent).toBe(
		"Other person's bio",
	);
});
