import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveProfileSettings } from "./save-profile-settings";
import { toUserProfile } from "./use-user";

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: saveProfileSettings,
		onSuccess: async (response) => {
			if (!response) return;
			const user = toUserProfile(response);
			// Cancel older reads so they cannot overwrite the saved profile.
			await queryClient.cancelQueries({ queryKey: ["users"] });
			queryClient.setQueryData(["users", "me"], user);
			queryClient.setQueryData(["users", "id", user.userId], user);
			queryClient.setQueryData(["users", "username", user.username], user);
		},
	});
}
