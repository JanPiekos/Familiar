import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const state = vi.hoisted(() => ({
	viewer: "viewer",
	post: { id: "post-1", userId: "author", title: "Original artwork", images: [], likedByCurrentUser: false },
	postQuery: vi.fn(),
	authorQuery: vi.fn(),
	send: vi.fn(),
}));

vi.mock("@heroui/react", () => ({ Typography: { Paragraph: ({ children }: any) => <p>{children}</p> } }));
vi.mock("react-i18next", async (importOriginal) => ({ ...await importOriginal<typeof import("react-i18next")>(), useTranslation: () => ({ t: (_key: string, fallback: string) => fallback, i18n: { language: "en" } }) }));
vi.mock("@/providers/auth", () => ({ useAuth: () => ({ user: { userId: state.viewer, username: state.viewer === "author" ? "real-author" : "viewer" } }) }));
vi.mock("@/hooks/portfolio/use-portfolio", () => ({
	usePortfolioPost: (id: string) => { state.postQuery(id); return { data: state.post, isPending: false, isError: false }; },
	useArtistPortfolioPost: (username: string, id: string) => { state.postQuery(username, id); return { data: username === "real-author" ? state.post : undefined, isPending: false, isError: username !== "real-author" }; },
	useDeletePortfolioPost: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/user/use-user", () => ({
	useUserById: (id: string) => { state.authorQuery(id); return { user: { userId: id, username: "real-author", displayName: "Real author" }, isPending: false }; },
	useUserByUsername: (username: string) => ({ user: username ? { userId: "author", username, displayName: "Real author" } : undefined, isPending: false }),
}));
vi.mock("@/components/icons/icons", () => ({
	OutlineBookmark: () => null, OutlineChat: () => null,
	OutlineChevronLeft: () => null, OutlineChevronRight: () => null,
	OutlineHeart: () => null, OutlineSend: () => null, OutlineClose: () => null,
}));
vi.mock("@/components/layout/profile/user", () => ({ default: ({ user }: any) => <span>{user?.displayName}</span> }));
vi.mock("@/components/layout/profile/avatar", () => ({ default: () => null }));
vi.mock("@/components/layout/empty-page", () => ({ EmptyPage: ({ title }: any) => <div>{title}</div> }));
vi.mock("@/components/layout/modal/universal-modal-layout", () => ({ UniversalModalLayout: () => null }));
vi.mock("@/components/layout/content-warning-overlay", () => ({ ContentWarningOverlay: ({ children }: any) => <>{children}</> }));
vi.mock("@/components/ui/dropdown-menu", () => ({
	DropdownMenu: ({ children }: any) => <div>{children}</div>,
	DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
	DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
	DropdownMenuItem: ({ children, onSelect, disabled }: any) => <button type="button" disabled={disabled} onClick={onSelect}>{children}</button>,
	DropdownMenuSeparator: () => null,
}));
vi.mock("@/hooks/chat/use-chat", () => ({ usePostChatMessage: () => ({ mutateAsync: state.send, isPending: false, error: null }) }));

import { PortfolioPostPage } from "@/components/layout/modal/portfolio-post";
import { MessageComposer } from "@/components/layout/chat/message-composer";

function renderPost(username?: string) {
	return render(<QueryClientProvider client={new QueryClient()}><PortfolioPostPage postId="post-1" username={username} /></QueryClientProvider>);
}

beforeEach(() => { vi.clearAllMocks(); state.viewer = "viewer"; });
afterEach(cleanup);

describe("post attribution", () => {
	it("does not attribute a post to a username that failed portfolio verification", () => {
		renderPost("viewer");
		expect(state.postQuery).toHaveBeenCalledWith("viewer", "post-1");
		expect(screen.queryByText("Original artwork")).toBeNull();
		expect(screen.queryByText("Real author")).toBeNull();
		expect(screen.queryByText("Delete post")).toBeNull();
	});
	it("loads a direct post link without a username and allows its actual owner to manage it", () => {
		state.viewer = "author";
		renderPost();
		expect((screen.getByText("Delete post") as HTMLButtonElement).disabled).toBe(false);
		expect((screen.getByText("Edit post") as HTMLButtonElement).disabled).toBe(true);
		for (const name of ["Like", "Comment", "Share", "Bookmark"]) {
			const button = screen.getByRole("button", { name }) as HTMLButtonElement;
			expect(button.disabled).toBe(true);
			fireEvent.click(button);
		}
		expect(screen.getByText("0 likes")).toBeTruthy();
		expect(screen.getAllByText("Real author")).toHaveLength(1);
	});
});

describe("message retries", () => {
	it("keeps a rejected draft and clears it only after a successful retry", async () => {
		state.send.mockRejectedValueOnce(new Error("Network unavailable")).mockResolvedValueOnce({ id: "message-1" });
		render(<MessageComposer conversationId="conversation-1" />);
		const input = screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
		fireEvent.change(input, { target: { value: "Please keep this draft" } });
		fireEvent.click(screen.getByRole("button", { name: "Send message" }));
		await waitFor(() => expect(state.send).toHaveBeenCalledTimes(1));
		expect(input.value).toBe("Please keep this draft");
		fireEvent.click(screen.getByRole("button", { name: "Send message" }));
		await waitFor(() => expect(input.value).toBe(""));
		expect(state.send).toHaveBeenCalledTimes(2);
	});
});
