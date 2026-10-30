import { createFileRoute } from "@tanstack/react-router";
import { CreateCatalogModal } from "@/components/layout/modal/profile/portfolio/portfolio";
import { useCreationExit } from "@/hooks/portfolio/use-creation-exit";
import { useCreateCatalog } from "@/hooks/portfolio/use-portfolio";

export const Route = createFileRoute("/{-$locale}/create/folder")({
	component: CreateFolderPage,
});

export function CreateFolderPage() {
	const create = useCreateCatalog();
	const close = useCreationExit(create.isPending);
	return (
		<CreateCatalogModal
			open
			layout="page"
			onOpenChange={(open) => {
				if (!open) close();
			}}
			onCreateCatalog={create.mutateAsync}
			isCreating={create.isPending}
		/>
	);
}
