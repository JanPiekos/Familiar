import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreatePostModal } from "@/components/layout/modal/profile/portfolio/create-post-modal";
import { useCreationExit } from "@/hooks/portfolio/use-creation-exit";
import {
	useCreatePortfolioPost,
	useMyCatalogs,
} from "@/hooks/portfolio/use-portfolio";

export const Route = createFileRoute("/{-$locale}/create/post")({
	component: CreatePostPage,
});

export function CreatePostPage() {
	const create = useCreatePortfolioPost();
	const { data: catalogs = [] } = useMyCatalogs();
	const [busy, setBusy] = useState(false);
	const close = useCreationExit(busy || create.isPending);
	return (
		<CreatePostModal
			open
			layout="page"
			onBusyChange={setBusy}
			onOpenChange={(open) => {
				if (!open) close();
			}}
			onCreatePost={create.mutateAsync}
			isCreating={create.isPending}
			catalogs={catalogs}
		/>
	);
}
