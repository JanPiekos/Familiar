import { apiFetch } from "@/lib/fetch";
import type { TMediaProcessingJob } from "./media-types";

export async function uploadProfileImage(dataUrl: string): Promise<string> {
	const match = /^data:(image\/[\w.+-]+);base64,([\s\S]+)$/.exec(dataUrl);
	if (!match) throw new Error("Choose a new image before saving.");
	const bytes = Uint8Array.from(atob(match[2]), (character) =>
		character.charCodeAt(0),
	);
	const body = new FormData();
	body.append(
		"files",
		new Blob([bytes], { type: match[1] }),
		`profile.${match[1].split("/")[1]}`,
	);
	const jobs = await apiFetch<TMediaProcessingJob[]>("media/upload", {
		apiVersion: "v1",
		method: "POST",
		body,
	});
	let job = jobs[0];
	if (!job?.jobId)
		throw new Error("The image upload did not return a processing job.");
	const deadline = Date.now() + 60_000;
	while (true) {
		const status = job.status.toLowerCase();
		if (status === "failed" || status === "error") {
			throw new Error(
				job.errorMessage ||
					"Image processing failed. Please try another image.",
			);
		}
		if (status === "completed") {
			if (!job.fullSizeId)
				throw new Error("The processed image did not return a multimedia ID.");
			return job.fullSizeId;
		}
		if (Date.now() >= deadline)
			throw new Error("Image processing timed out. Please try again.");
		await new Promise((resolve) => setTimeout(resolve, 750));
		job = await apiFetch<TMediaProcessingJob>(
			`media/jobs/${encodeURIComponent(job.jobId)}`,
			{ apiVersion: "v1" },
		);
	}
}
