import { useEffect } from "react";

// Use a self-contained PNG for uploaded-avatar tab icons.
export function AvatarFavicon({ src }: { src: string }) {
	useEffect(() => {
		let cancelled = false;
		let objectUrl: string | undefined;
		const controller = new AbortController();
		let link: HTMLLinkElement | undefined;
		let previous: { link: HTMLLinkElement; rel: string | null }[] = [];
		const image = new Image();
		image.onload = () => {
			if (cancelled) return;
			const canvas = document.createElement("canvas");
			canvas.width = canvas.height = 64;
			const context = canvas.getContext("2d");
			if (!context) return;
			try {
				context.drawImage(image, 0, 0, 64, 64);
				const href = canvas.toDataURL("image/png");
				previous = Array.from(
					document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
				).map((link) => ({ link, rel: link.getAttribute("rel") }));
				for (const { link } of previous) link.rel = "alternate";
				link = document.createElement("link");
				link.rel = "icon";
				link.type = "image/png";
				link.sizes = "64x64";
				link.href = href;
				document.head.appendChild(link);
			} catch {
				// Leave the server-rendered icon in place if conversion fails.
			}
		};
		// Fetch first: Nitro dev treats direct image requests as static assets.
		// A local blob also avoids cross-origin restrictions when exporting PNG.
		void fetch(src, { signal: controller.signal })
			.then(async (response) => {
				if (!response.ok) throw new Error("Unable to load avatar icon");
				const blob = await response.blob();
				if (cancelled) return;
				objectUrl = URL.createObjectURL(blob);
				image.src = objectUrl;
			})
			.catch(() => {
				/* Keep the server-rendered fallback. */
			});
		return () => {
			cancelled = true;
			controller.abort();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			image.onload = null;
			link?.remove();
			for (const { link, rel } of previous) {
				if (rel === null) link.removeAttribute("rel");
				else link.setAttribute("rel", rel);
			}
		};
	}, [src]);
	return null;
}
