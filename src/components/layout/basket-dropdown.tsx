import { Typography } from "@heroui/react";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsTablet } from "@/hooks/ui/use-mobile";
import { EmptyPage } from "./empty-page";

export function BasketDropdown() {
	const { t } = useTranslation();
	const isTablet = useIsTablet();
	const [open, setOpen] = useState(false);
	const trigger = (
		<Button variant="secondary" size="icon-xl" aria-label={t("ui.basket")}>
			<ShoppingCart />
		</Button>
	);
	const content = (
		<div className="flex flex-col">
			<div className="border-b border-border p-3">
				<Typography.Heading level={4}>{t("ui.basket")}</Typography.Heading>
			</div>
			<EmptyPage icon={ShoppingCart} title={t("ui.no_items_found")} />
		</div>
	);
	if (isTablet) {
		return (
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>{trigger}</DrawerTrigger>
				<DrawerContent className="overflow-hidden p-0">{content}</DrawerContent>
			</Drawer>
		);
	}
	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-md overflow-hidden rounded-3xl p-0"
				align="end"
				sideOffset={8}
			>
				{content}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
