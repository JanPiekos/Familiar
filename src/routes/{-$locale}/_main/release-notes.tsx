import { createFileRoute } from "@tanstack/react-router";
import { TimelinesReleaseNotes } from "@/components/layout/timelines-changelog";

export const Route = createFileRoute("/{-$locale}/_main/release-notes")({
	component: RouteComponent,
});

function RouteComponent() {
	return <TimelinesReleaseNotes />;
}
