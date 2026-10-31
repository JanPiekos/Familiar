import type { LifelineLegendItem } from "./types";
import appI18n from "@/lib/i18n";

const LEGEND_DOT_CLASS: Record<LifelineLegendItem["type"], string> = {
	mentor: "bg-blue-500",
	met: "bg-pink-500",
};

const DEFAULT_ITEMS: LifelineLegendItem[] = [
	{
		type: "mentor",
		get label() {
			return appI18n.t("ui.mentors", "Mentors");
		},
	},
	{
		type: "met",
		get label() {
			return appI18n.t("ui.met_in_person", "Met in person");
		},
	},
];

export function LifelineLegend({
	items = DEFAULT_ITEMS,
}: {
	items?: LifelineLegendItem[];
}) {
	return (
		<ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-zinc-500">
			{items.map((item) => (
				<li key={item.type} className="flex items-center gap-2">
					<span
						className={`h-1.5 w-1.5 shrink-0 rounded-full ${LEGEND_DOT_CLASS[item.type]}`}
						aria-hidden="true"
					/>
					<span>{item.label}</span>
				</li>
			))}
		</ul>
	);
}
