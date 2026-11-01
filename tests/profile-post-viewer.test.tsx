import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
const data = vi.hoisted(() => ({
	pending: false,
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
		isPending: data.pending,
		isError: false,
	}),
	useDeletePortfolioPost: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useUpdatePortfolioPost: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/user/use-user", () => ({
	useUserByUsername: () => ({
		user: { userId: "artist", username: "artist", displayName: "Demo artist" },
		isPending: false,
	}),
}));
vi.mock("@/providers/auth", () => ({
	useAuth: () => ({ user: { userId: "artist", username: "artist" } }),
}));
vi.mock("@/components/layout/profile/user", () => ({
	default: () => (
		<div>
			Demo artist <span>@artist</span>
		</div>
	),
}));
vi.mock("@/api/commisions/index", () => ({ getTags: async () => [] }));
import { PortfolioPostModal } from "@/components/layout/modal/portfolio-post";
import { PostViewerLayout } from "@/components/layout/modal/portfolio-post/post-viewer-layout";
const clients: QueryClient[] = [];
beforeEach(() => {
	data.pending = false;
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
	await waitFor(() => expect(close).toHaveBeenCalledWith(false));
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
	await waitFor(() => expect(close).toHaveBeenCalledWith(false));
});
it("keeps the same dialog while loading becomes artwork", async () => {
	data.pending = true;
	const close = vi.fn();
	const view = await mount(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={close}
		/>,
	);
	const dialog = screen.getByRole("dialog", { name: "Loading post..." });
	data.pending = false;
	view.rerender(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={close}
		/>,
	);
	expect(screen.getByRole("dialog", { name: "Wide artwork" })).toBe(dialog);
	expect(document.activeElement).toBe(dialog);
	expect(close).not.toHaveBeenCalled();
});

// jsdom has no animation engine; expose live state names to Radix Presence.
function enableDialogAnimations() {
	const getStyle = globalThis.getComputedStyle;
	vi.stubGlobal("CSS", { escape: (value: string) => value });
	vi.spyOn(globalThis, "getComputedStyle").mockImplementation(
		(element, pseudo) => {
			const style = getStyle(element, pseudo);
			if (!element.hasAttribute("data-post-viewer")) return style;
			return new Proxy(style, {
				get(target, property) {
					return property === "animationName"
						? element.getAttribute("data-state") === "closed"
							? "post-viewer-exit"
							: "post-viewer-enter"
						: Reflect.get(target, property, target);
				},
			});
		},
	);
}
function endExit(element: Element) {
	const event = new Event("animationend", { bubbles: true });
	Object.defineProperty(event, "animationName", { value: "post-viewer-exit" });
	fireEvent(element, event);
}
it.each(["button", "escape", "backdrop"])(
	"waits for the exit animation before route dismissal via %s",
	async (action) => {
		enableDialogAnimations();
		const close = vi.fn();
		await mount(
			<PortfolioPostModal
				postId="first"
				username="artist"
				open
				onOpenChange={close}
			/>,
		);
		const dialog = screen.getByRole("dialog");
		if (action === "button")
			fireEvent.click(screen.getByRole("button", { name: "Close" }));
		else if (action === "escape") fireEvent.keyDown(dialog, { key: "Escape" });
		else {
			await new Promise((resolve) => setTimeout(resolve, 0));
			const overlay = document.querySelector('[data-slot="dialog-overlay"]')!;
			fireEvent.pointerDown(overlay, { button: 0, pointerType: "mouse" });
			fireEvent.click(overlay);
		}
		await waitFor(() =>
			expect(dialog.getAttribute("data-state")).toBe("closed"),
		);
		expect(dialog.isConnected).toBe(true);
		expect(close).not.toHaveBeenCalled();
		endExit(dialog.querySelector("img")!);
		expect(close).not.toHaveBeenCalled();
		endExit(dialog);
		await waitFor(() => expect(close).toHaveBeenCalledExactlyOnceWith(false));
	},
);
it("does not navigate later if another route unmounts a closing post", async () => {
	enableDialogAnimations();
	const close = vi.fn();
	const view = await mount(
		<PortfolioPostModal
			postId="first"
			username="artist"
			open
			onOpenChange={close}
		/>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Close" }));
	view.unmount();
	await new Promise((resolve) => setTimeout(resolve, 0));
	expect(close).not.toHaveBeenCalled();
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
