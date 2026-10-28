import { memo } from "react";
import type { Control } from "react-hook-form";
import { OutlineUser } from "@/components/icons/icons";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormField } from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import type { PrebuiltRequestFormBlock } from "@/types/commissions/form";
import type { FormValues } from "../types";
import { useTranslation } from "react-i18next";

interface Props {
	control: Control<FormValues>;
	block: PrebuiltRequestFormBlock;
}

export const RequesterNameBlock = memo(function RequesterNameBlock({
	control,
	block,
}: Props) {
	const { t } = useTranslation();
	return (
		<FormField
			control={control}
			name="name"
			render={({ field, fieldState }) => (
				<Field>
					<FieldLabel htmlFor={field.name} className="w-full justify-between">
						<span className="flex-1 w-full">
							{block.label ?? t("ui.your_name", "Your name")}
						</span>
						{block.isRequired ? (
							<span className="w-fit text-destructive">
								{t("ui.required", "Required *")}
							</span>
						) : null}
					</FieldLabel>

					<InputGroup className="h-12">
						<InputGroupAddon>
							<OutlineUser />
						</InputGroupAddon>
						<InputGroupInput
							id={field.name}
							placeholder={
								block.description ?? t("ui.name_nickname", "Name / nickname")
							}
							{...field}
						/>
					</InputGroup>

					<FieldError errors={[fieldState.error]} />
				</Field>
			)}
		/>
	);
});
