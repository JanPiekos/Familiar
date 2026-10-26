import { apiFetch } from "@/lib/fetch";
import type { TUserResponse } from "@/types/user";

export async function getUsersByFilter({
	page,
	pageSize,
}: {
	page: number;
	pageSize: number;
}) {
	return apiFetch<TUserResponse[]>(`users?page=${page}&pageSize=${pageSize}`);
}

export async function getUserById(userId: string) {
	return apiFetch<TUserResponse>(`users/id/${userId}`);
}

export async function getUserByUsername(username: string) {
	return apiFetch<TUserResponse>(`users/${username}`);
}

export async function getCurrentUser() {
	return apiFetch<TUserResponse>(`users/me`);
}

// UpdateProfileRequest from the v1 OpenAPI contract. Null means unchanged.
export interface UpdateProfileRequest {
	bio?: string;
	avatarMultimediaId?: string;
	coverMultimediaId?: string;
	socials?: Record<string, string>;
}

export function updateMyProfile(input: UpdateProfileRequest) {
	return apiFetch<TUserResponse>("users/me", {
		apiVersion: "v1",
		method: "PATCH",
		body: JSON.stringify(input),
	});
}
