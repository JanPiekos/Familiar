import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import { PortfolioFeedItem } from "@/components/layout/feed/item";
import {
	PostManagementDialog,
	type PostManagementAction,
} from "@/components/layout/modal/portfolio-post/post-management-dialog";
import i18n from "@/lib/i18n";

const mutations = vi.hoisted(() => ({
	update: vi.fn(),
	remove: vi.fn(),
	add: vi.fn(),
	unfile: vi.fn(),
}));
vi.mock("@/hooks/portfolio/use-portfolio", () => ({
	useUpdatePortfolioPost: () => ({ mutateAsync: mutations.update }),
	useDeletePortfolioPost: () => ({ mutateAsync: mutations.remove }),
	useAddPortfolioPostToCatalog: () => ({ mutateAsync: mutations.add }),
	useRemovePortfolioPostFromCatalog: () => ({ mutateAsync: mutations.unfile }),
}));
const post: PortfolioPostResponse = {
	id: "post-1",
	title: "Artwork",
	description: "Original",
	visibility: "PUBLIC",
	catalogIds: ["old-1", "old-2"],
	contentWarnings: ["Horror"],
	images: [
		{
			id: "image-1",
			mediaType: "IMAGE",
			fullSize: { id: "media-1", path: "/artwork.png" },
		},
	],
};
const folders = [{ id: "destination", name: "Illustrations" }];
const close = vi.fn();
function mount(node: React.ReactNode) {
	return render(<I18nextProvider i18n={i18n}>{node}</I18nextProvider>);
}
function dialog(action: PostManagementAction, availableFolders = folders) {
	return mount(
		<PostManagementDialog
			post={post}
			action={action}
			folders={availableFolders}
			onClose={close}
		/>,
	);
}
async function selectDestination() {
	fireEvent.keyDown(
		screen.getByRole("combobox", { name: "Destination folder" }),
		{ key: "ArrowDown" },
	);
	fireEvent.click(await screen.findByRole("option", { name: "Illustrations" }));
}
beforeEach(async () => {
	vi.resetAllMocks();
	await i18n.changeLanguage("en");
	Object.values(mutations).forEach((mock) => mock.mockResolvedValue(undefined));
	window.HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("post card menus", () => {
	function card(owner: boolean) {
		const manage = vi.fn(),
			view = vi.fn();
		mount(
			<PortfolioFeedItem
				p={{
					id: "post-1",
					createdAt: "2026-10-31",
					widthUnit: 1,
					heightUnit: 1,
					cover: {
						path: "/artwork.png",
						width: 400,
						height: 400,
						alt: "Artwork",
					},
				}}
				post={post}
				style={{ width: 300, height: 300 }}
				isOwner={owner}
				handlePostClick={view}
				onManagePost={manage}
			/>,
		);
		return { manage, view };
	}
	it("opens owner actions above a sensitive overlay without opening or revealing the post", async () => {
		const { manage, view } = card(true);
		fireEvent.keyDown(screen.getByRole("button", { name: "Post options" }), {
			key: "Enter",
		});
		fireEvent.click(
			await screen.findByRole("menuitem", { name: /Move to folder/ }),
		);
		expect(manage).toHaveBeenCalledWith(post, "move");
		expect(view).not.toHaveBeenCalled();
		expect(screen.getByText("Sensitive content")).toBeDefined();
		expect(document.querySelector("img")?.closest("[inert]")).not.toBeNull();
	});
	it("shows only a disabled report action on another user's post", async () => {
		card(false);
		fireEvent.keyDown(screen.getByRole("button", { name: "Post options" }), {
			key: "Enter",
		});
		expect(
			(
				await screen.findByRole("menuitem", { name: /Report post/ })
			).getAttribute("aria-disabled"),
		).toBe("true");
		expect(screen.queryByRole("menuitem", { name: /Edit post/ })).toBeNull();
		expect(screen.queryByRole("menuitem", { name: /Delete post/ })).toBeNull();
	});
});

describe("owner post management", () => {
	it("updates post details while preserving media, tags, warnings, and folder memberships", async () => {
		dialog("edit");
		fireEvent.change(screen.getByRole("textbox", { name: "Title *" }), {
			target: { value: " Revised title " },
		});
		fireEvent.change(screen.getByRole("textbox", { name: "Description" }), {
			target: { value: "" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
		expect(mutations.update).toHaveBeenCalledWith({
			postId: "post-1",
			data: { title: "Revised title", description: "" },
		});
	});
	it("keeps failed edits open and prevents duplicate submissions", async () => {
		let fail!: (reason: unknown) => void;
		mutations.update.mockImplementationOnce(
			() =>
				new Promise((_ok, reject) => {
					fail = reject;
				}),
		);
		dialog("edit");
		fireEvent.change(screen.getByRole("textbox", { name: "Title *" }), {
			target: { value: "Revised title" },
		});
		const form = screen
			.getByRole("textbox", { name: "Title *" })
			.closest("form")!;
		fireEvent.submit(form);
		fireEvent.submit(form);
		expect(mutations.update).toHaveBeenCalledTimes(1);
		await act(async () => fail(new Error("failed")));
		await screen.findByRole("alert");
		expect(close).not.toHaveBeenCalled();
		expect(
			(screen.getByRole("textbox", { name: "Title *" }) as HTMLInputElement)
				.value,
		).toBe("Revised title");
	});
	it("deletes only after confirmation and keeps an error retryable", async () => {
		mutations.remove.mockRejectedValueOnce(new Error("failed"));
		dialog("delete");
		expect(mutations.remove).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		await screen.findByRole("alert");
		expect(close).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
		expect(mutations.remove).toHaveBeenLastCalledWith("post-1");
	});
	it("confirms removing just one folder membership and keeps failures retryable", async () => {
		mutations.unfile.mockRejectedValueOnce(new Error("failed"));
		mount(
			<PostManagementDialog
				post={post}
				action="remove"
				folders={folders}
				folder={{ id: "old-1", name: "Sketches" }}
				onClose={close}
			/>,
		);
		expect(screen.getByRole("alertdialog").textContent).toContain("Sketches");
		expect(
			screen.getByText(/stay in your portfolio and other folders/),
		).toBeDefined();
		expect(mutations.unfile).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Remove" }));
		await screen.findByRole("alert");
		expect(close).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Remove" }));
		await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
		expect(mutations.unfile.mock.calls).toEqual([
			[{ postId: "post-1", catalogId: "old-1" }],
			[{ postId: "post-1", catalogId: "old-1" }],
		]);
		expect(mutations.remove).not.toHaveBeenCalled();
		expect(mutations.add).not.toHaveBeenCalled();
	});
	it("adds the destination before removing other folder memberships", async () => {
		const requests: string[] = [];
		mutations.add.mockImplementation(async () => {
			requests.push("add");
		});
		mutations.unfile.mockImplementation(async ({ catalogId }) => {
			requests.push(catalogId);
		});
		dialog("move");
		await selectDestination();
		fireEvent.click(screen.getByRole("button", { name: "Move to folder" }));
		await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
		expect(requests).toEqual(["add", "old-1", "old-2"]);
	});
	it("does not remove memberships when adding the destination fails", async () => {
		mutations.add.mockRejectedValueOnce(new Error("failed"));
		dialog("move");
		await selectDestination();
		fireEvent.click(screen.getByRole("button", { name: "Move to folder" }));
		await screen.findByRole("alert");
		expect(mutations.unfile).not.toHaveBeenCalled();
		expect(close).not.toHaveBeenCalled();
	});
	it("retries a partial move without repeating successful requests", async () => {
		mutations.unfile
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(new Error("failed"));
		dialog("move");
		await selectDestination();
		fireEvent.click(screen.getByRole("button", { name: "Move to folder" }));
		expect((await screen.findByRole("alert")).textContent).toContain(
			"Retry to finish",
		);
		fireEvent.click(screen.getByRole("button", { name: "Move to folder" }));
		await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
		expect(mutations.add).toHaveBeenCalledTimes(1);
		expect(mutations.unfile.mock.calls.map(([args]) => args.catalogId)).toEqual(
			["old-1", "old-2", "old-2"],
		);
	});
	it("explains when no folders exist and disables moving", () => {
		dialog("move", []);
		expect(
			screen.getByText(/Create a folder in your portfolio first/),
		).toBeDefined();
		expect(
			screen.getByRole("button", { name: "Move to folder" }),
		).toHaveProperty("disabled", true);
	});
});
