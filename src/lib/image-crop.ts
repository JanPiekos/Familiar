export type ProfileImageKind = "avatar" | "cover";
export type CropArea = { x: number; y: number; width: number; height: number };
export type CroppedProfileImage = { file: File; dataUrl: string };

// Representative viewports for ProfileCover's h-48 / md:h-72 layout.
export const COVER_GUIDES = [
	{ id: "desktop", aspect: 1280 / 288, color: "#c4b5fd" },
	{ id: "tablet", aspect: 768 / 288, color: "#fbbf24" },
	{ id: "mobile", aspect: 390 / 192, color: "#5eead4" },
] as const;

export function coverGuideBounds(aspect: number) {
	const width = Math.min(1, aspect / 3);
	const height = Math.min(1, 3 / aspect);
	return { left: (1 - width) / 2, top: (1 - height) / 2, width, height };
}

export function readImageFile(file: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error("Image could not be read"));
		reader.onabort = () => reject(new Error("Image reading was cancelled"));
		reader.readAsDataURL(file);
	});
}

export async function isAnimatedImage(file: File) {
	if (file.type === "image/gif") return true;
	if (!["image/png", "image/webp"].includes(file.type)) return false;
	const header = await readImageFile(file.slice(0, 65536));
	const bytes = atob(header.slice(header.indexOf(",") + 1));
	return file.type === "image/png"
		? bytes.includes("acTL")
		: bytes.includes("ANIM");
}

export async function cropProfileImage(
	source: string,
	area: CropArea,
	rotation: number,
	kind: ProfileImageKind,
	filename: string,
): Promise<CroppedProfileImage> {
	if (
		Object.values(area).some((value) => !Number.isFinite(value)) ||
		area.width <= 0 ||
		area.height <= 0 ||
		!Number.isFinite(rotation)
	) {
		throw new Error("Invalid image crop");
	}
	const image = new Image();
	image.src = source;
	await image.decode();
	const radians = (rotation * Math.PI) / 180;
	const width =
		Math.abs(Math.cos(radians) * image.naturalWidth) +
		Math.abs(Math.sin(radians) * image.naturalHeight);
	const height =
		Math.abs(Math.sin(radians) * image.naturalWidth) +
		Math.abs(Math.cos(radians) * image.naturalHeight);
	const ratio = area.width / area.height;
	const outputWidth = Math.max(
		1,
		Math.min(kind === "avatar" ? 512 : 1500, Math.round(area.width)),
	);
	const canvas = document.createElement("canvas");
	canvas.width = outputWidth;
	canvas.height = Math.max(1, Math.round(outputWidth / ratio));
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Image cropping is unavailable");
	// Draw directly into the small output canvas, avoiding a full-size rotated copy.
	context.scale(canvas.width / area.width, canvas.height / area.height);
	context.translate(-area.x, -area.y);
	context.translate(width / 2, height / 2);
	context.rotate(radians);
	context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(result) =>
				result ? resolve(result) : reject(new Error("Image crop failed")),
			"image/png",
		);
	});
	const file = new File(
		[blob],
		`${filename.replace(/\.[^.]+$/, "")}-cropped.png`,
		{ type: "image/png" },
	);
	return { file, dataUrl: await readImageFile(file) };
}
