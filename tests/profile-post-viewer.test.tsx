import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
const data = vi.hoisted(() => ({
	remove: vi.fn(),
	update: vi.fn(),
	viewerId: "artist",
	post: {
		id: "first",
		title: "Wide artwork",
		description: "Artwork description",
		createdAt: "2026-10-27T00:00:00Z",
		tags: [],
		contentWarnings: [] as string[],
		images: [
			{ id: "wide", mediaType: "IMAGE", fullSize: { path: "/wide.png" } },
			{ id: "tall", mediaType: "IMAGE", fullSize: { path: "/tall.png" } },
		],
	},
}));
vi.mock("@/hooks/portfolio/use-portfolio", () => ({
	useArtistPortfolioPost: () => ({
		data: data.post,
		isPending: false,
		isError: false,
	}),
	useDeletePortfolioPost: () => ({
		mutateAsync: data.remove,
		isPending: false,
	}),
	useUpdatePortfolioPost: () => ({
		mutateAsync: data.update,
		isPending: false,
	}),
	useAddPortfolioPostToCatalog: () => ({ mutateAsync: vi.fn() }),
	useRemovePortfolioPostFromCatalog: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@/hooks/user/use-user", () => ({
	useUserByUsername: () => ({
		user: { userId: "artist", username: "artist", displayName: "Demo artist" },
		isPending: false,
	}),
}));
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({ user: { userId: data.viewerId, username: data.viewerId } }),
}));
vi.mock("@/components/layout/profile/user", () => ({
	default: () => (
		<div>
			Demo artist <span>@artist</span>
		</div>
	),
}));
vi.mock("@/api/commisions/index", () => ({ getTags: async () => [] }));
import {
	PortfolioPostModal,
	PortfolioPostPage,
} from "@/components/layout/modal/portfolio-post";
import { PostViewerLayout } from "@/components/layout/modal/portfolio-post/post-viewer-layout";
const clients: QueryClient[] = [];
beforeEach(() => {
	data.remove.mockReset().mockResolvedValue(undefined);
	data.update.mockReset().mockResolvedValue(undefined);
	data.viewerId = "artist";
	data.post.id = "first";
	data.post.contentWarnings = [];
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	clients.forEach((client) => client.clear());
	clients.length = 0;
});

it.each([
	["modal", "More options"],
	["page", "More"],
])(
	"opens the working editor from the %s and only saves changed fields",
	async (view, more) => {
		const close = vi.fn();
		await mount(
			view === "modal" ? (
				<PortfolioPostModal
					postId="first"
					username="artist"
					open
					onOpenChange={close}
				/>
			) : (
				<PortfolioPostPage postId="first" username="artist" />
			),
		);
		fireEvent.keyDown(screen.getByRole("button", { name: more }), {
			key: "ArrowDown",
		});
		fireEvent.click(await screen.findByRole("menuitem", { name: "Edit post" }));
		const editor = screen.getByRole("dialog", { name: "Edit post" });
		const title = within(editor).getByRole("textbox", { name: "Title *" });
		expect((title as HTMLInputElement).value).toBe("Wide artwork");
		fireEvent.change(title, { target: { value: " Updated artwork " } });
		fireEvent.click(
			within(editor).getByRole("button", { name: "Save changes" }),
		);
		await waitFor(() =>
			expect(data.update).toHaveBeenCalledExactlyOnceWith({
				postId: "first",
				data: { title: "Updated artwork" },
			}),
		);
		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Edit post" })).toBeNull(),
		);
		expect(screen.getByRole("img")).toBeTruthy();
		expect(close).not.toHaveBeenCalled();
	},
);

it("keeps a failed edit open for retry and cancels without closing the viewer", async () => {
	data.update.mockRejectedValueOnce(new Error("Unavailable"));
	const close = vi.fn();
	await mount(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={close}
		/>,
	);
	fireEvent.keyDown(screen.getByRole("button", { name: "More options" }), {
		key: "ArrowDown",
	});
	fireEvent.click(await screen.findByRole("menuitem", { name: "Edit post" }));
	const editor = screen.getByRole("dialog", { name: "Edit post" });
	fireEvent.change(
		within(editor).getByRole("textbox", { name: "Description" }),
		{ target: { value: "Updated description" } },
	);
	fireEvent.click(within(editor).getByRole("button", { name: "Save changes" }));
	expect(await within(editor).findByRole("alert")).toBeTruthy();
	expect(editor.isConnected).toBe(true);
	expect(close).not.toHaveBeenCalled();
	fireEvent.click(within(editor).getByRole("button", { name: "Save changes" }));
	await waitFor(() => expect(data.update).toHaveBeenCalledTimes(2));
	await waitFor(() =>
		expect(screen.queryByRole("dialog", { name: "Edit post" })).toBeNull(),
	);
	fireEvent.keyDown(screen.getByRole("button", { name: "More options" }), {
		key: "ArrowDown",
	});
	fireEvent.click(await screen.findByRole("menuitem", { name: "Edit post" }));
	fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
	await waitFor(() =>
		expect(screen.queryByRole("dialog", { name: "Edit post" })).toBeNull(),
	);
	expect(data.update).toHaveBeenCalledTimes(2);
	expect(close).not.toHaveBeenCalled();
});

it("uses the post confirmation without deleting or closing the viewer on cancel", async () => {
	const close = vi.fn();
	await mount(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={close}
		/>,
	);
	fireEvent.keyDown(screen.getByRole("button", { name: "More options" }), {
		key: "ArrowDown",
	});
	fireEvent.click(await screen.findByRole("menuitem", { name: "Delete post" }));
	const confirmation = screen.getByRole("alertdialog", {
		name: "Delete post?",
	});
	expect(within(confirmation).getByText("Wide artwork")).toBeTruthy();
	expect(data.remove).not.toHaveBeenCalled();
	fireEvent.click(within(confirmation).getByRole("button", { name: "Cancel" }));
	await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
	expect(screen.getByRole("dialog", { name: "Wide artwork" })).toBeTruthy();
	expect(close).not.toHaveBeenCalled();
	expect(data.remove).not.toHaveBeenCalled();
});

it("does not offer edit or delete to visitors", async () => {
	data.viewerId = "visitor";
	await mount(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={() => {}}
		/>,
	);
	fireEvent.keyDown(screen.getByRole("button", { name: "More options" }), {
		key: "ArrowDown",
	});
	expect(
		await screen.findByRole("menuitem", { name: "Report post" }),
	).toBeTruthy();
	expect(screen.queryByRole("menuitem", { name: "Edit post" })).toBeNull();
	expect(screen.queryByRole("menuitem", { name: "Delete post" })).toBeNull();
	expect(data.update).not.toHaveBeenCalled();
	expect(data.remove).not.toHaveBeenCalled();
});

it("finishes the delete confirmation exit before dismissing the post viewer", async () => {
	const getStyle = globalThis.getComputedStyle;
	vi.stubGlobal("CSS", { escape: (value: string) => value });
	vi.spyOn(globalThis, "getComputedStyle").mockImplementation(
		(element, pseudo) => {
			const style = getStyle(element, pseudo);
			if (element.getAttribute("data-slot") !== "alert-dialog-content")
				return style;
			return new Proxy(style, {
				get(target, property) {
					return property === "animationName"
						? element.getAttribute("data-state") === "closed"
							? "exit"
							: "enter"
						: Reflect.get(target, property, target);
				},
			});
		},
	);
	const close = vi.fn();
	await mount(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={close}
		/>,
	);
	fireEvent.keyDown(screen.getByRole("button", { name: "More options" }), {
		key: "ArrowDown",
	});
	fireEvent.click(await screen.findByRole("menuitem", { name: "Delete post" }));
	const confirmation = screen.getByRole("alertdialog");
	const remove = screen.getByRole("button", { name: "Delete" });
	fireEvent.click(remove);
	await waitFor(() => expect(confirmation.dataset.state).toBe("closed"));
	expect(confirmation.isConnected).toBe(true);
	expect(close).not.toHaveBeenCalled();
	fireEvent.click(remove);
	expect(data.remove).toHaveBeenCalledExactlyOnceWith("first");
	const finish = new Event("animationend", { bubbles: true });
	Object.defineProperty(finish, "animationName", { value: "exit" });
	fireEvent(confirmation, finish);
	await waitFor(() => expect(close).toHaveBeenCalledExactlyOnceWith(false));
});
async function mount(children: React.ReactNode, locale = "en") {
	const i18n = createInstance();
	await i18n.init({
		lng: locale,
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	clients.push(client);
	return render(children, {
		wrapper: ({ children }) => (
			<QueryClientProvider client={client}>
				<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
			</QueryClientProvider>
		),
	});
}
function imageLoaded(width: number, height: number) {
	const image = screen.getByRole("img");
	Object.defineProperties(image, {
		naturalWidth: { configurable: true, value: width },
		naturalHeight: { configurable: true, value: height },
	});
	fireEvent.load(image);
}
it("fits the first artwork and keeps the frame stable while navigating a mixed-ratio gallery", async () => {
	const close = vi.fn();
	await mount(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={close}
		/>,
	);
	const dialog = screen.getByRole("dialog", { name: "Wide artwork" });
	expect(document.activeElement).toBe(dialog);
	imageLoaded(3000, 1000);
	expect(dialog.style.getPropertyValue("--post-ratio")).toBe("3");
	expect(screen.getAllByText("Demo artist", { exact: false })).toHaveLength(1);
	expect(screen.getByText("October 27, 2026")).toBeTruthy();
	expect(screen.queryByRole("link", { name: "View full size" })).toBeNull();
	fireEvent.click(screen.getByRole("button", { name: "Next image" }));
	expect(screen.getByRole("img").getAttribute("src")).toBe("/tall.png");
	imageLoaded(200, 3000);
	expect(dialog.style.getPropertyValue("--post-ratio")).toBe("3");
	expect(screen.queryByRole("link", { name: "View full size" })).toBeNull();
	fireEvent.click(screen.getByRole("button", { name: /^Close$/ }));
	expect(close).toHaveBeenCalledWith(false);
});
it("resets the frame for a different post and ignores invalid image dimensions", async () => {
	function View({ id }: { id: string }) {
		return (
			<PostViewerLayout
				key={id}
				title="Artwork"
				open
				onOpenChange={() => {}}
				mediaContent={<img src={`/${id}.png`} alt="Artwork" />}
				detailsContent={<p>Details</p>}
			/>
		);
	}
	const view = await mount(<View id="first" />);
	imageLoaded(0, 0);
	expect(
		screen.getByRole("dialog").style.getPropertyValue("--post-ratio"),
	).toBe("1");
	imageLoaded(9000, 1000);
	expect(
		screen.getByRole("dialog").style.getPropertyValue("--post-ratio"),
	).toBe("6");
	// Keep the same providers while changing only the post identity.
	const wrapper = screen.getByRole("dialog");
	view.rerender(<View id="second" />);
	await waitFor(() => expect(screen.getByRole("dialog")).not.toBe(wrapper));
	imageLoaded(100, 2000);
	expect(
		screen.getByRole("dialog").style.getPropertyValue("--post-ratio"),
	).toBe("0.12");
});
it("handles video metadata and Escape without focusing media controls", async () => {
	const close = vi.fn();
	await mount(
		<PostViewerLayout
			title="Video"
			open
			onOpenChange={close}
			mediaContent={<video aria-label="Artwork video" controls />}
			detailsContent={<p>Details</p>}
		/>,
	);
	const dialog = screen.getByRole("dialog");
	const video = screen.getByLabelText("Artwork video");
	Object.defineProperties(video, {
		videoWidth: { value: 1920 },
		videoHeight: { value: 1080 },
	});
	fireEvent.loadedMetadata(video);
	expect(Number(dialog.style.getPropertyValue("--post-ratio"))).toBeCloseTo(
		16 / 9,
	);
	expect(document.activeElement).toBe(dialog);
	fireEvent.keyDown(dialog, { key: "Escape" });
	expect(close).toHaveBeenCalledWith(false);
});
it("keeps content warnings covered and owner dialogs accessible from the inside menu", async () => {
	data.post.contentWarnings = ["Violence"];
	const close = vi.fn();
	await mount(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={close}
		/>,
	);
	expect(document.querySelector("[inert]")).not.toBeNull();
	fireEvent.click(screen.getByRole("button", { name: "Show" }));
	expect(document.querySelector("[inert]")).toBeNull();
	expect(screen.queryByRole("link", { name: "View full size" })).toBeNull();
	fireEvent.click(
		screen.getByRole("button", { name: "Hide sensitive content" }),
	);
	expect(document.querySelector("[inert]")).not.toBeNull();
	fireEvent.click(screen.getByRole("button", { name: "Show" }));
	fireEvent.keyDown(screen.getByRole("button", { name: "More options" }), {
		key: "ArrowDown",
		code: "ArrowDown",
	});
	fireEvent.click(
		await screen.findByRole("menuitem", { name: "Content warnings" }),
	);
	expect(
		await screen.findByRole("dialog", { name: "Content warnings" }),
	).toBeTruthy();
	expect(close).not.toHaveBeenCalled();
});
