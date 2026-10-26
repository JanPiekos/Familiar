import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { AvatarFavicon } from "@/components/layout/profile/avatar-favicon";

const images: { src: string; onload: (() => void) | null }[] = [];
class FakeImage {
    src = "";
    onload: (() => void) | null = null;
    constructor() { images.push(this); }
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); images.length = 0; });

it("converts the same-origin avatar icon to PNG and restores other icons when leaving", async () => {
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("<svg/>", { headers: { "Content-Type": "image/svg+xml" } })));
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:avatar");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as any);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,AQID");
    const original = document.createElement("link");
    original.rel = "icon";
    original.href = "/favicon.ico";
    document.head.appendChild(original);
    const view = render(<AvatarFavicon src="/api/avatar?name=One&image=first" />);
    const staleLoad = images[0].onload;
    view.rerender(<AvatarFavicon src="/api/avatar?name=Two&image=second" />);
    await act(async () => { staleLoad?.(); });
    expect(drawImage).not.toHaveBeenCalled();
    await waitFor(() => expect(images[1].src).toBe("blob:avatar"));
    await act(async () => { images[1].onload?.(); });
    expect(drawImage).toHaveBeenCalledWith(images[1], 0, 0, 64, 64);
    const icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    expect(icon?.type).toBe("image/png");
    expect(icon?.href).toBe("data:image/png;base64,AQID");
    expect(original.rel).toBe("alternate");
    view.unmount();
    expect(original.rel).toBe("icon");
    expect(icon?.isConnected).toBe(false);
    original.remove();
});
