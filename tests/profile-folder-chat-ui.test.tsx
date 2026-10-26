import { afterEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import type {
	CatalogResponse,
	CreateCatalogRequest,
} from "@/api/portfolio/catalogs/catalog-types";

vi.mock("@/components/layout/content-warning-overlay", () => ({
	ContentWarningOverlay: ({ children }: { children: ReactNode }) => (
		<>{children}</>
	),
}));
vi.mock("boneyard-js/react", () => ({
	Skeleton: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
import {
	CreateCatalogModal,
	RenameCatalogModal,
} from "@/components/layout/modal/profile/portfolio/portfolio";
import { ChatSidebar } from "@/components/layout/chat/chat-sidebar";

afterEach(cleanup);
async function language(locale = "en") {
	const instance = createInstance();
	await instance.init({
		lng: locale,
		fallbackLng: "en",
		resources: { en: { translation: en }, pl: { translation: pl } },
		interpolation: { escapeValue: false },
	});
	return instance;
}

function CreateHarness({
	submit,
}: {
	submit: (data: CreateCatalogRequest) => Promise<CatalogResponse>;
}) {
	const [open, setOpen] = useState(true);
	const [pending, setPending] = useState(false);
	return (
		<>
			<button type="button" onClick={() => setOpen(true)}>
				Open folder form
			</button>
			<CreateCatalogModal
				open={open}
				onOpenChange={setOpen}
				isCreating={pending}
				onCreateCatalog={async (data) => {
					setPending(true);
					try {
						return await submit(data);
					} finally {
						setPending(false);
					}
				}}
			/>
		</>
	);
}

describe("folder editor", () => {
	it("previews the draft, saves trimmed values, and resets after reopening", async () => {
		const submit = vi
			.fn()
			.mockResolvedValue({ id: "folder-1", name: "Illustrations" });
		render(
			<I18nextProvider i18n={await language()}>
				<CreateHarness submit={submit} />
			</I18nextProvider>,
		);
		fireEvent.change(screen.getByRole("textbox", { name: /Folder name/ }), {
			target: { value: "  Illustrations  " },
		});
		fireEvent.change(screen.getByRole("textbox", { name: "Description" }), {
			target: { value: "  Finished artwork  " },
		});
		expect(
			screen.getByRole("heading", { name: "Illustrations" }),
		).toBeDefined();
		expect(submit).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: /Create folder/ }));
		await waitFor(() =>
			expect(submit).toHaveBeenCalledWith({
				name: "Illustrations",
				description: "Finished artwork",
			}),
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		fireEvent.click(screen.getByRole("button", { name: "Open folder form" }));
		expect(
			(screen.getByRole("textbox", { name: /Folder name/ }) as HTMLInputElement)
				.value,
		).toBe("");
	});

	it("retains a failed draft and permits retry with a localized error", async () => {
		const submit = vi
			.fn()
			.mockRejectedValueOnce(null)
			.mockResolvedValue({ id: "folder-1", name: "Ilustracje" });
		render(
			<I18nextProvider i18n={await language("pl")}>
				<CreateHarness submit={submit} />
			</I18nextProvider>,
		);
		fireEvent.change(screen.getByRole("textbox", { name: /Nazwa folderu/ }), {
			target: { value: "Ilustracje" },
		});
		fireEvent.click(screen.getByRole("button", { name: /Utwórz folder/ }));
		expect(await screen.findByRole("alert")).toHaveProperty(
			"textContent",
			"Nie udało się utworzyć folderu.",
		);
		expect(
			(
				screen.getByRole("textbox", {
					name: /Nazwa folderu/,
				}) as HTMLInputElement
			).value,
		).toBe("Ilustracje");
		fireEvent.click(screen.getByRole("button", { name: /Utwórz folder/ }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(submit).toHaveBeenCalledTimes(2);
	});

	it("keeps the pending form open and blocks duplicate submission or dismissal", async () => {
		let finish!: (value: CatalogResponse) => void;
		const submit = vi.fn(
			() =>
				new Promise<CatalogResponse>((resolve) => {
					finish = resolve;
				}),
		);
		render(
			<I18nextProvider i18n={await language()}>
				<CreateHarness submit={submit} />
			</I18nextProvider>,
		);
		fireEvent.change(screen.getByRole("textbox", { name: /Folder name/ }), {
			target: { value: "Sketches" },
		});
		fireEvent.click(screen.getByRole("button", { name: /Create folder/ }));
		expect(
			(screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		expect(
			(screen.getByRole("button", { name: "Close" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		expect(screen.getByRole("dialog")).toBeDefined();
		expect(submit).toHaveBeenCalledTimes(1);
		await act(async () => finish({ id: "folder-1", name: "Sketches" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("preserves the folder identity and allows clearing its description", async () => {
		const rename = vi
			.fn()
			.mockResolvedValue({ id: "folder-1", name: "New name" });
		const close = vi.fn();
		render(
			<I18nextProvider i18n={await language()}>
				<RenameCatalogModal
					open
					onOpenChange={close}
					isRenaming={false}
					catalog={{
						id: "folder-1",
						name: "Old name",
						description: "Old description",
					}}
					onRenameCatalog={rename}
				/>
			</I18nextProvider>,
		);
		fireEvent.change(screen.getByRole("textbox", { name: "Folder name" }), {
			target: { value: "  New name  " },
		});
		fireEvent.change(screen.getByRole("textbox", { name: "Description" }), {
			target: { value: "" },
		});
		fireEvent.click(screen.getByRole("button", { name: /Save changes/ }));
		await waitFor(() =>
			expect(rename).toHaveBeenCalledWith("folder-1", {
				name: "New name",
				description: "",
			}),
		);
		expect(close).toHaveBeenCalledWith(false);
	});

	it("resets an unsaved rename when switching to a different folder with matching saved text", async () => {
		const i18n = await language();
		const props = {
			open: true,
			onOpenChange: vi.fn(),
			isRenaming: false,
			onRenameCatalog: vi.fn(),
			catalog: { id: "folder-1", name: "Sketches" },
		};
		const view = render(
			<I18nextProvider i18n={i18n}>
				<RenameCatalogModal {...props} />
			</I18nextProvider>,
		);
		fireEvent.change(screen.getByRole("textbox", { name: "Folder name" }), {
			target: { value: "Unsaved name" },
		});
		view.rerender(
			<I18nextProvider i18n={i18n}>
				<RenameCatalogModal
					{...props}
					catalog={{ id: "folder-2", name: "Sketches" }}
				/>
			</I18nextProvider>,
		);
		expect(
			(screen.getByRole("textbox", { name: "Folder name" }) as HTMLInputElement)
				.value,
		).toBe("Sketches");
	});
});

describe("translated chat sidebar", () => {
	const props = {
		conversations: [],
		activeConversationId: null,
		searchQuery: "",
		isAuthPending: false,
		isPending: false,
		error: null,
		onSearchChange: vi.fn(),
		onSelectConversation: vi.fn(),
	};
	it("updates compact labels, accessible names, and the active empty state when switching language", async () => {
		const i18n = await language("en");
		render(
			<I18nextProvider i18n={i18n}>
				<ChatSidebar {...props} />
			</I18nextProvider>,
		);
		expect(
			screen.getByRole("tab", { name: "Direct messages (0)" }),
		).toHaveProperty("textContent", "DMs0");
		expect(screen.getByText("No conversations yet")).toBeDefined();
		await act(async () => i18n.changeLanguage("pl"));
		expect(
			screen.getByRole("tab", { name: "Wiadomości prywatne (0)" }),
		).toHaveProperty("textContent", "Prywatne0");
		expect(screen.getByText("Brak rozmów")).toBeDefined();
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Zapytania (0)" }), {
			button: 0,
			ctrlKey: false,
		});
		expect(await screen.findByText("Brak zapytań")).toBeDefined();
	});

	it("distinguishes an empty search from having no conversations", async () => {
		render(
			<I18nextProvider i18n={await language("pl")}>
				<ChatSidebar {...props} searchQuery="missing" />
			</I18nextProvider>,
		);
		expect(screen.getByText("Brak pasujących rozmów")).toBeDefined();
		expect(screen.queryByText("Brak rozmów")).toBeNull();
	});
});
