import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsProfileEditor } from "@/components/layout/profile/settings-profile-editor";
import { toast } from "sonner";
vi.mock("sonner", () => ({ toast: { loading: vi.fn(() => "save-toast"), success: vi.fn(), info: vi.fn(), error: vi.fn() } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }) }));
vi.mock("@heroui/react", () => ({ Typography: { Paragraph: ({ size: _size, ...props }: any) => <p {...props} /> } }));
vi.mock("@/components/layout/profile/avatar", () => ({ default: () => null }));
vi.mock("@/components/icons/icons", () => ({ OutlineAt: () => null, OutlineEdit: () => null, OutlineTrash: () => null, OutlineUser: () => null }));
const initialValues = { username: "hasira", display_name: "Hasira", bio: "Old bio", avatar_url: "", cover_url: "", accent_color: "" };
function editor(onSubmit: () => Promise<void>) {
 return render(<><SettingsProfileEditor initialValues={initialValues} onSubmit={onSubmit} /><button type="submit" form="profile-settings-form">Save changes</button></>);
}
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe("profile settings Save feedback", () => {
 it("submits from the external footer button, shows loading, then success only when resolved", async () => {
  let resolve!: () => void;
  const submit = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
  editor(submit);
  fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "New bio" } });
  fireEvent.click(screen.getByText("Save changes"));
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(toast.loading).toHaveBeenCalled();
  expect(toast.success).not.toHaveBeenCalled();
  expect(document.querySelector("fieldset")?.disabled).toBe(true);
  await act(async () => resolve());
  await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Profile changes saved.", { id: "save-toast" }));
 });
 it("shows an error toast, retains edits, and allows retry after a failed save", async () => {
  const submit = vi.fn().mockRejectedValueOnce(new Error("Could not save")).mockResolvedValueOnce(undefined);
  editor(submit);
  fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "New bio" } });
  fireEvent.click(screen.getByText("Save changes"));
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Could not save", { id: "save-toast" }));
  expect((screen.getByLabelText("Bio") as HTMLTextAreaElement).value).toBe("New bio");
  expect(toast.success).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Save changes"));
  await waitFor(() => expect(toast.success).toHaveBeenCalled());
 });
 it("keeps draft text and its original baseline when a background query refreshes", async () => {
  const submit = vi.fn().mockResolvedValue(undefined);
  const { rerender } = editor(submit);
  fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "My draft" } });
  rerender(<><SettingsProfileEditor initialValues={{ ...initialValues, bio: "Background value" }} onSubmit={submit} /><button type="submit" form="profile-settings-form">Save changes</button></>);
  expect((screen.getByLabelText("Bio") as HTMLTextAreaElement).value).toBe("My draft");
  fireEvent.click(screen.getByText("Save changes"));
  await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ bio: "My draft" }), initialValues));
 });
 it("uses the confirmed response as the baseline for the next save", async () => {
  const saved = { ...initialValues, bio: "New bio" };
  const submit = vi.fn().mockResolvedValueOnce(saved).mockResolvedValueOnce(null);
  editor(submit);
  fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "New bio" } });
  fireEvent.click(screen.getByText("Save changes"));
  await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByText("Save changes"));
  await waitFor(() => expect(toast.info).toHaveBeenCalledWith("No changes to save.", { id: "save-toast" }));
  expect(submit).toHaveBeenLastCalledWith(saved, saved);
  expect(toast.success).toHaveBeenCalledTimes(1);
 });

 it("shows validation feedback without calling the save handler", async () => {
  const submit = vi.fn();
  editor(submit);
  fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "x".repeat(151) } });
  fireEvent.click(screen.getByText("Save changes"));
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Please correct the highlighted fields before saving."));
  expect(submit).not.toHaveBeenCalled();
  expect(toast.loading).not.toHaveBeenCalled();
 });
});
