import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/{-$locale}/create/")({
	beforeLoad: ({ params, search }) => {
		throw redirect({
			to: "/{-$locale}/create/post",
			params,
			search,
			replace: true,
		});
	},
});
