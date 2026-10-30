export type PageErrorKind =
	| "not_found"
	| "unauthorized"
	| "forbidden"
	| "rate_limit"
	| "timeout"
	| "unavailable"
	| "server"
	| "request"
	| "network"
	| "update"
	| "unknown";

export type PageError = {
	kind: PageErrorKind;
	status?: number;
	retryable: boolean;
};

function httpStatus(value: unknown): number | undefined {
	const status =
		typeof value === "string" && /^\d{3}$/.test(value) ? Number(value) : value;
	return typeof status === "number" &&
		Number.isInteger(status) &&
		status >= 400 &&
		status <= 599
		? status
		: undefined;
}

/** Also accepts serialized errors received during server rendering. Never displays their message/body. */
export function getErrorStatus(error: unknown): number | undefined {
	if (typeof error !== "object" || error === null) return undefined;
	const value = error as {
		status?: unknown;
		statusCode?: unknown;
		message?: unknown;
		response?: { status?: unknown };
	};
	const status =
		httpStatus(value.status) ??
		httpStatus(value.statusCode) ??
		httpStatus(value.response?.status);
	if (status) return status;
	// Error serialization can retain only name/message. ApiFetchError keeps this prefix safe and stable.
	if (typeof value.message === "string") {
		const match = /^Request failed:\s*(\d{3})(?:\s|$)/.exec(value.message);
		return httpStatus(match?.[1]);
	}
	return undefined;
}

export function getPageError(error: unknown): PageError {
	const status = getErrorStatus(error);
	if (status) {
		if (status === 404 || status === 410)
			return { kind: "not_found", status, retryable: false };
		if (status === 401)
			return { kind: "unauthorized", status, retryable: false };
		if (status === 403) return { kind: "forbidden", status, retryable: false };
		if (status === 429) return { kind: "rate_limit", status, retryable: true };
		if ([408, 504, 522, 524].includes(status))
			return { kind: "timeout", status, retryable: true };
		if ([502, 503].includes(status) || status >= 520)
			return { kind: "unavailable", status, retryable: true };
		if (status >= 500) return { kind: "server", status, retryable: true };
		return { kind: "request", status, retryable: true };
	}
	const value = error as { name?: unknown; message?: unknown } | null;
	const message = typeof value?.message === "string" ? value.message : "";
	if (
		/Failed to fetch dynamically imported module|error loading dynamically imported module|Loading (?:CSS )?chunk [\w-]+ failed|Importing a module script failed/i.test(
			message,
		)
	)
		return { kind: "update", retryable: true };
	if (
		value?.name === "ApiNetworkError" ||
		/^(?:Failed to fetch|fetch failed|NetworkError when attempting to fetch resource\.?|Load failed|Network request failed)$/i.test(
			message,
		)
	)
		return { kind: "network", retryable: true };
	return { kind: "unknown", retryable: true };
}
