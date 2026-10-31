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
	Link,
	Outlet,
	RouterProvider,
	useLocation,
} from "@tanstack/react-router";
import { createInstance } from "i18next";
import { useMemo, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	PortfolioCreationMenu,
	PortfolioCreationProvider,
	usePublishPortfolioCreation,
} from "@/components/layout/profile/portfolio-creation";
import en from "@/i18n/en";
import { TRoles } from "@/types/user/roles";

const state = vi.hoisted(() => ({
	compact: false,
	folderActions: false,
	create: vi.fn(),
}));
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({
		user: { username: "artist", roles: [TRoles.Artist] },
		isPending: false,
	}),
}));
vi.mock("@/hooks/ui/use-mobile", () => ({ useIsTablet: () => state.compact }));
beforeEach(() => {
	state.create.mockReset();
	state.compact = false;
	state.folderActions = false;
	window.scrollTo = vi.fn();
});
afterEach(cleanup);

function Publisher({
	name,
	active = true,
}: {
	name: string;
	active?: boolean;
}) {
	const pathname = useLocation({ select: (location) => location.pathname });
	const actions = useMemo(
		() =>
			active
				? {
						pathname,
						username: "artist",
						onCreatePost: () => state.create(name),
						onCreateFolder: () => state.create(`${name}-folder`),
					}
				: null,
		[pathname, name, active],
	);
	usePublishPortfolioCreation(actions);
	return null;
}
const profileParams = {
	locale: undefined,
	username: "artist",
	tab: "portfolio",
};
function Profile() {
	const inFolder = useLocation({
		select: (location) => location.pathname.includes("/folder/"),
	});
	return (
		<>
			{!inFolder && (
				<>
					<Publisher name="profile" />
					<h1>Portfolio</h1>
					<Link
						to="/{-$locale}/user/$username/$tab/folder/$folderSlug"
						params={{ ...profileParams, folderSlug: "sketches" }}
					>
						Open folder
					</Link>
				</>
			)}
			<Outlet />
		</>
	);
}
function Folder() {
	return (
		<>
			<Publisher name="folder" active={state.folderActions} />
			<h1>Sketches</h1>
			<Link to="/{-$locale}/user/$username/$tab" params={profileParams}>
				Back to portfolio
			</Link>
		</>
	);
}
function Handoff() {
	const [step, setStep] = useState(0);
	return (
		<>
			{step < 2 && <Publisher key="folder" name="folder" />}
			{step > 0 && <Publisher key="profile" name="profile" />}
			<button onClick={() => setStep(1)}>Show portfolio</button>
			<button onClick={() => setStep(2)}>Finish folder transition</button>
		</>
	);
}
function Underlay() {
	const [folder, setFolder] = useState(false);
	return (
		<>
			<Publisher name="profile" />
			{folder && <Publisher name="folder" />}
			<button onClick={() => setFolder(!folder)}>Toggle folder</button>
		</>
	);
}
async function app(component = Profile) {
	const i18n = createInstance();
	await i18n.init({
		lng: "en",
		resources: { en: { translation: en } },
		interpolation: { escapeValue: false },
	});
	const root = createRootRoute({
		component: () => (
			<PortfolioCreationProvider>
				<PortfolioCreationMenu />
				<Outlet />
			</PortfolioCreationProvider>
		),
	});
	const profile = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/user/$username/$tab",
		component,
	});
	const folder = createRoute({
		getParentRoute: () => profile,
		path: "folder/$folderSlug",
		component: Folder,
	});
	const home = createRoute({
		getParentRoute: () => root,
		path: "/",
		component: () => <h1>Home</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren([profile.addChildren([folder]), home]),
		history: createMemoryHistory({
			initialEntries: ["/user/artist/portfolio"],
		}),
		defaultPendingMinMs: 0,
	});
	render(
		<I18nextProvider i18n={i18n}>
			<RouterProvider router={router as never} />
		</I18nextProvider>,
	);
	await screen.findByRole("button", { name: "Add to portfolio" });
	return router;
}
async function createPost(from: string) {
	fireEvent.keyDown(screen.getByRole("button", { name: "Add to portfolio" }), {
		key: "Enter",
	});
	fireEvent.click(await screen.findByRole("menuitem", { name: "Create post" }));
	expect(state.create).toHaveBeenLastCalledWith(from);
	await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
}

describe("portfolio creation navigation", () => {
	it.each([
		[false, false],
		[true, false],
		[false, true],
		[true, true],
	])(
		"keeps creation usable after folder Back and browser Back (compact: %s, folder actions: %s)",
		async (compact, folderActions) => {
			state.compact = compact;
			state.folderActions = folderActions;
			const router = await app();
			for (const browserBack of [false, true, false]) {
				fireEvent.click(screen.getByRole("link", { name: "Open folder" }));
				await screen.findByRole("heading", { name: "Sketches" });
				if (folderActions) await createPost("folder");
				else
					expect(
						screen.queryByRole("button", { name: "Add to portfolio" }),
					).toBeNull();
				if (browserBack)
					await act(async () => {
						router.history.back();
					});
				else
					fireEvent.click(
						screen.getByRole("link", { name: "Back to portfolio" }),
					);
				await screen.findByRole("heading", { name: "Portfolio" });
				await screen.findByRole("button", { name: "Add to portfolio" });
				await createPost("profile");
			}
			await act(async () => {
				await router.navigate({ to: "/" });
			});
			await screen.findByRole("heading", { name: "Home" });
			expect(
				screen.queryByRole("button", { name: "Add to portfolio" }),
			).toBeNull();
		},
	);
	it("does not let a departing folder clear the newly mounted profile menu", async () => {
		await app(Handoff);
		fireEvent.click(screen.getByRole("button", { name: "Show portfolio" }));
		await createPost("profile");
		fireEvent.click(
			screen.getByRole("button", { name: "Finish folder transition" }),
		);
		await screen.findByRole("button", { name: "Add to portfolio" });
		await createPost("profile");
	});
	it("restores the still-mounted profile actions when a nested folder unmounts", async () => {
		await app(Underlay);
		fireEvent.click(screen.getByRole("button", { name: "Toggle folder" }));
		await createPost("folder");
		fireEvent.click(screen.getByRole("button", { name: "Toggle folder" }));
		await screen.findByRole("button", { name: "Add to portfolio" });
		await createPost("profile");
	});
	it("does not let an inactive publisher hide supported profile actions", async () => {
		await app(() => (
			<>
				<Publisher name="profile" />
				<Publisher name="inactive" active={false} />
			</>
		));
		await createPost("profile");
	});
});
