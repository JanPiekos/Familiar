import { stringHash } from "facehash";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_BACKGROUND = "#d1d5db";
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

type SvgFaviconProps = {
	children: ReactNode;
	fallbackHref?: string;
};

/** Serialize the detached SVG into the same React-owned favicon link. */
function SvgFavicon({ children, fallbackHref }: SvgFaviconProps) {
	const [fragment, setFragment] = useState<DocumentFragment | null>(null);
	const [href, setHref] = useState<string>();
	useEffect(() => {
		setFragment(document.createDocumentFragment());
	}, []);
	useEffect(() => {
		if (!fragment) return;
		const serializer = new XMLSerializer();
		const updateIcon = () => {
			const source = serializer.serializeToString(fragment);
			if (!source) return;
			const bytes = new TextEncoder().encode(source);
			let binary = "";
			for (const byte of bytes) binary += String.fromCharCode(byte);
			setHref(`data:image/svg+xml;base64,${window.btoa(binary)}`);
		};
		const observer = new MutationObserver(updateIcon);
		observer.observe(fragment, {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: true,
		});
		updateIcon();
		return () => observer.disconnect();
	}, [fragment]);
	const icon = href ?? fallbackHref;
	return (
		<>
			{fragment ? createPortal(children, fragment) : null}
			{icon ? (
				<link
					key={icon}
					rel="icon"
					href={icon}
					type="image/svg+xml"
					sizes="any"
					data-facehash-favicon="true"
				/>
			) : null}
		</>
	);
}
function normalizeColor(value?: string | null) {
	return value && HEX_COLOR_PATTERN.test(value)
		? value.slice(0, value.length <= 5 ? 4 : 7)
		: DEFAULT_BACKGROUND;
}

function getForegroundColor(background: string) {
	let hex = background.slice(1);

	if (hex.length === 3 || hex.length === 4) {
		hex = hex
			.slice(0, 3)
			.split("")
			.map((character) => character + character)
			.join("");
	} else {
		hex = hex.slice(0, 6);
	}

	const red = Number.parseInt(hex.slice(0, 2), 16);
	const green = Number.parseInt(hex.slice(2, 4), 16);
	const blue = Number.parseInt(hex.slice(4, 6), 16);
	const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;

	return luminance > 0.55 ? "#24272f" : "#ffffff";
}

function useBlink(name: string) {
	const [isBlinking, setIsBlinking] = useState(false);

	useEffect(() => {
		const seed = stringHash(name);
		let cycle = 0;
		let blinkTimer: number | undefined;
		let openTimer: number | undefined;

		const scheduleBlink = () => {
			// Stable per-user timing with a little variation between blinks.
			const delay = 3_000 + ((seed + cycle * 977) % 5_000);

			blinkTimer = window.setTimeout(() => {
				setIsBlinking(true);
				openTimer = window.setTimeout(() => {
					setIsBlinking(false);
					cycle += 1;
					scheduleBlink();
				}, 140);
			}, delay);
		};

		scheduleBlink();

		return () => {
			if (blinkTimer !== undefined) window.clearTimeout(blinkTimer);
			if (openTimer !== undefined) window.clearTimeout(openTimer);
		};
	}, [name]);

	return isBlinking;
}

function Face({ index, color }: { index: number; color: string }) {
	switch (index) {
		case 0:
			return (
				<>
					<circle cx="7.2" cy="7.2" r="7.2" fill={color} />
					<circle cx="55.2" cy="7.2" r="7.2" fill={color} />
				</>
			);
		case 1:
			return (
				<g fill={color}>
					<rect x="8" width="7" height="23" rx="3.5" />
					<rect y="8" width="23" height="7" rx="3.5" />
					<rect x="55.2" width="7" height="23" rx="3.5" />
					<rect x="47.3" y="8" width="23" height="7" rx="3.5" />
				</g>
			);
		case 2:
			return (
				<g fill={color}>
					<rect x="0.07" y="0.16" width="6.9" height="6.9" rx="3.5" />
					<rect x="7.9" y="0.16" width="20.7" height="6.9" rx="3.5" />
					<rect x="74.7" y="0.16" width="6.9" height="6.9" rx="3.5" />
					<rect x="53.1" y="0.16" width="20.7" height="6.9" rx="3.5" />
				</g>
			);
		default:
			return (
				<g fill={color}>
					<path d="M0 5.1v-.3c.1-.5.3-1 .7-1.3C2.3 2.2 6 0 10.5 0s8.1 2.2 9.8 3.4c.4.3.7.9.7 1.3V6.7c-.2 1.3-1.2 1.9-2.5 1.6-.2 0-.7-.3-1.8-.8C15 6.7 12.8 6 10.5 6s-4.5.7-6.3 1.5c-1 .5-1.5.7-1.8.8-1.3.3-2.3-.3-2.5-1.6V5.1Z" />
					<path d="M42 5.1v-.3c.1-.5.3-1 .7-1.3C44.3 2.2 48 0 52.5 0s8.1 2.2 9.8 3.4c.4.3.7.9.7 1.3V6.7c-.2 1.3-1.2 1.9-2.5 1.6-.2 0-.7-.3-1.8-.8C57 6.7 54.8 6 52.5 6s-4.5.7-6.3 1.5c-1 .5-1.5.7-1.8.8-1.3.3-2.3-.3-2.5-1.6V5.1Z" />
				</g>
			);
	}
}

const FACE_DIMENSIONS = [
	{ viewBox: "0 0 63 15", width: 63, height: 15 },
	{ viewBox: "0 0 71 23", width: 71, height: 23 },
	{ viewBox: "0 0 82 8", width: 82, height: 8 },
	{ viewBox: "0 0 63 9", width: 63, height: 9 },
] as const;

export function FacehashFavicon({
	name,
	backgroundColor,
	fallbackHref,
}: {
	name: string;
	backgroundColor?: string | null;
	fallbackHref?: string;
}) {
	const hash = useMemo(() => stringHash(name), [name]);
	const faceIndex = hash % FACE_DIMENSIONS.length;
	const dimensions = FACE_DIMENSIONS[faceIndex] ?? FACE_DIMENSIONS[0];
	const background = normalizeColor(backgroundColor);
	const foreground = getForegroundColor(background);
	const isBlinking = useBlink(name);
	const faceWidth = 64;
	const faceHeight = faceWidth * (dimensions.height / dimensions.width);
	const faceCenterY = dimensions.height / 2;
	const blinkTransform = `translate(0 ${faceCenterY}) scale(1 ${
		isBlinking ? 0.06 : 1
	}) translate(0 ${-faceCenterY})`;
	const initial = Array.from(name.trim())[0]?.toUpperCase() ?? "?";

	return (
		<SvgFavicon fallbackHref={fallbackHref}>
			<svg
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="64"
				height="64"
				viewBox="0 0 100 100"
			>
				<circle cx="50" cy="50" r="50" fill={background} />
				<svg
					aria-hidden="true"
					x="18"
					y="25"
					width={faceWidth}
					height={faceHeight}
					viewBox={dimensions.viewBox}
					preserveAspectRatio="xMidYMid meet"
				>
					<g transform={blinkTransform}>
						<Face index={faceIndex} color={foreground} />
					</g>
				</svg>
				<text
					x="50"
					y="70"
					fill={foreground}
					fontFamily="Arial, system-ui, sans-serif"
					fontSize="29"
					fontWeight="500"
					textAnchor="middle"
					dominantBaseline="middle"
				>
					{initial}
				</text>
			</svg>
		</SvgFavicon>
	);
}
