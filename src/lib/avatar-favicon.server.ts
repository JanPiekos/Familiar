const MEDIA_ORIGIN = "https://pub-7a6afd837dd4448eaf606c16c006f585.r2.dev";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
	"image/avif",
]);

// Only proxy public uploads from Familiar's image bucket, never arbitrary URLs.
export async function createUploadedAvatarSvg(
	source: string,
	size: number,
): Promise<string> {
	const url = new URL(source);
	if (
		url.origin !== MEDIA_ORIGIN ||
		!url.pathname.startsWith("/media/") ||
		url.username ||
		url.password
	) {
		throw new Error("Unsupported avatar source");
	}
	const response = await fetch(url, {
		redirect: "error",
		signal: AbortSignal.timeout(5_000),
	});
	const mime =
		response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ??
		"";
	if (
		!response.ok ||
		!IMAGE_TYPES.has(mime) ||
		!response.body ||
		Number(response.headers.get("content-length")) > MAX_IMAGE_BYTES
	) {
		await response.body?.cancel();
		throw new Error("Unsupported avatar image");
	}
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let length = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			length += value.byteLength;
			if (length > MAX_IMAGE_BYTES) throw new Error("Avatar image too large");
			chunks.push(value);
		}
	} finally {
		await reader.cancel();
		reader.releaseLock();
	}
	if (!length) throw new Error("Empty avatar image");
	const data = Buffer.concat(chunks).toString("base64");
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <defs><clipPath id="avatar-circle"><circle cx="32" cy="32" r="32" /></clipPath></defs>
        <g clip-path="url(#avatar-circle)">
            <circle cx="32" cy="32" r="32" fill="#ffffff" />
            <image href="data:${mime};base64,${data}" width="64" height="64" preserveAspectRatio="xMidYMid slice" />
        </g>
    </svg>`;
}
