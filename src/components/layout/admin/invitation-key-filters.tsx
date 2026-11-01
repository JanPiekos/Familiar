import { CheckCircle2, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { InvitationKey } from "@/api/admin/invitation-keys";
import {
	FilterBar,
	type FilterGroup,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export function invitationUsedFilter(filter?: ManagedFilterValue) {
	const selected = Array.isArray(filter?.value) ? filter.value.map(String) : [];
	const negated =
		filter?.operator === "is not" || filter?.operator === "is none of";
	if (selected.includes("true") && selected.includes("false"))
		return negated ? null : undefined;
	if (selected.length !== 1 || !["true", "false"].includes(String(selected[0])))
		return undefined;
	const used = selected[0] === "true";
	return negated ? !used : used;
}

export function InvitationKeyFilters({
	data,
	status,
	owner,
	search,
	onStatusChange,
	onOwnerChange,
	onSearchChange,
}: {
	data: InvitationKey[];
	status?: ManagedFilterValue;
	owner?: string;
	search: string;
	onStatusChange: (status?: ManagedFilterValue) => void;
	onOwnerChange: (owner?: string) => void;
	onSearchChange: (search: string) => void;
}) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState("");
	const [error, setError] = useState("");
	const groups = useMemo<FilterGroup<InvitationKey>[]>(
		() => [
			{
				id: "status",
				label: t("admin_keys.status"),
				type: "select",
				icon: CheckCircle2,
				getItemValue: (key) => String(key.isUsed),
				options: [
					{ id: "false", label: t("admin_keys.available") },
					{ id: "true", label: t("admin_keys.used") },
				],
			},
		],
		[t],
	);
	return (
		<div className="space-y-3">
			<FilterBar
				data={data}
				groups={groups}
				values={{ status }}
				searchQuery={search}
				searchPlaceholder={t("admin_keys.search")}
				onSearchChange={onSearchChange}
				onFilterChange={(_id, value, operator) =>
					onStatusChange({ value, operator })
				}
				onClearAll={() => {
					onStatusChange(undefined);
					onOwnerChange(undefined);
					setDraft("");
				}}
				endAction={
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="xl"
								className="h-11 lg:h-10"
							>
								<UserRound aria-hidden="true" />
								{t("admin_keys.owner")}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							align="end"
							aria-label={t("admin_keys.owner_id")}
							sideOffset={8}
							collisionPadding={16}
							className="w-88 max-w-[calc(100vw-2rem)] p-4"
						>
							<form
								className="flex flex-col gap-4"
								onSubmit={(event) => {
									event.preventDefault();
									const value = draft.trim();
									if (
										value &&
										!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
											value,
										)
									) {
										setError(t("admin_keys.invalid_owner"));
										return;
									}
									onOwnerChange(value || undefined);
									setError("");
									setOpen(false);
								}}
							>
								<div className="flex flex-col gap-2">
									<label
										htmlFor="invite-owner"
										className="block text-sm font-medium"
									>
										{t("admin_keys.owner_id")}
									</label>
									<InputGroup className="h-11 lg:h-10">
										<InputGroupInput
											id="invite-owner"
											value={draft}
											placeholder={t("admin_keys.owner_placeholder")}
											className="h-full"
											autoComplete="off"
											autoCapitalize="none"
											spellCheck={false}
											aria-invalid={!!error}
											aria-describedby={
												error ? "invite-owner-error" : undefined
											}
											onChange={(event) => {
												setDraft(event.target.value);
												setError("");
											}}
										/>
									</InputGroup>
									{error && (
										<p
											id="invite-owner-error"
											role="alert"
											className="text-xs leading-relaxed text-destructive"
										>
											{error}
										</p>
									)}
								</div>
								<div className="flex items-center justify-between gap-3">
									<Button
										type="button"
										variant="outline"
										size="xl"
										className="h-11 px-5 lg:h-10"
										onClick={() => {
											onOwnerChange(undefined);
											setDraft("");
											setError("");
											setOpen(false);
										}}
									>
										{t("admin_keys.clear")}
									</Button>
									<Button type="submit" size="xl" className="h-11 px-5 lg:h-10">
										{t("admin_keys.apply")}
									</Button>
								</div>
							</form>
						</PopoverContent>
					</Popover>
				}
			/>
			{owner && (
				<Button
					type="button"
					size="xl"
					variant="secondary"
					className="max-w-full gap-2"
					onClick={() => {
						onOwnerChange(undefined);
						setDraft("");
					}}
					aria-label={t("admin_keys.clear_owner")}
				>
					<UserRound aria-hidden="true" />
					<span className="truncate font-mono text-xs">{owner}</span>
					<X aria-hidden="true" />
				</Button>
			)}
		</div>
	);
}
