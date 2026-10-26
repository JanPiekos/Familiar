import { useEffect, useState } from "react";

// React owns this single link, so route changes cannot leave competing icons.
export function AvatarFavicon({ src }: { src: string }) {
	const [converted, setConverted] = useState<{ src: string; href: string }>();
	useEffect(() => {
		let cancelled = false;
		let objectUrl: string | undefined;
		const controller = new AbortController();
		const image = new Image();
		image.onload = () => {
			if (cancelled) return;
			const canvas = document.createElement("canvas");
			canvas.width = canvas.height = 64;
			const context = canvas.getContext("2d");
			if (!context) return;
			try {
				context.drawImage(image, 0, 0, 64, 64);
				setConverted({ src, href: canvas.toDataURL("image/png") });
			} catch {
				// Keep the server-rendered SVG if conversion fails.
			}
		};
		// Fetch first: Nitro dev treats direct image requests as static assets.
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
		};
	}, [src]);
	const png = converted?.src === src ? converted.href : undefined;
	return (
		<link
			key={png ?? src}
			rel="icon"
			type={png ? "image/png" : "image/svg+xml"}
			sizes={png ? "64x64" : "any"}
			href={png ?? src}
		/>
	);
}
