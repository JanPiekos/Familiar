import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Column, ColumnDataType } from "../core/types";

interface FilterSubjectProps<TData, TType extends ColumnDataType> {
	column: Column<TData, TType>;
}

export function FilterSubject<TData, TType extends ColumnDataType>({
	column,
}: FilterSubjectProps<TData, TType>) {
	const hasIcon = !!column.icon;
	return (
		<Button
			aria-haspopup="true"
			variant={"ghost"}
			size="2xl"
			className={cn(
				"h-full rounded-r-none hover:text-foreground text-sm hover:bg-transparent",
			)}
		>
			{hasIcon && <column.icon className="size-4" />}
			{column.displayName}
		</Button>
	);
}
