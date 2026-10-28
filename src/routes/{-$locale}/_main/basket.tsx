import { Typography } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Edit2,
	Lock,
	MessageCircle,
	ShoppingBasket,
	Trash2,
} from "lucide-react";
import { MOCK_BASKET_ITEMS } from "mock/shop";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
	OutlineChat,
	OutlineEdit,
	OutlineLock,
	OutlineMail,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import User from "@/components/layout/profile/user";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import useFormValidation from "@/hooks/form/use-form-validation";
import { Elevated } from "@/lib/elevated";

export const Route = createFileRoute("/{-$locale}/_main/basket")({
	component: BasketPage,
});

const basketSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	note: z.string().optional(),
});

function BasketPage() {
	const { t } = useTranslation();
	const item = MOCK_BASKET_ITEMS[0]; // Just mock one item in basket

	const form = useFormValidation({
		schema: basketSchema,
		initialData: {
			name: "Hasiradoo",
			email: "kris@rabbittale.co",
			note: "",
		},
	});

	function onSubmit(data: z.infer<typeof basketSchema>) {
		console.log(data);
	}

	return (
		<div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pt-4 px-4 lg:px-0 pb-10">
			<Typography.Heading level={2}>
				{t("ui.my_basket", "My basket")}
			</Typography.Heading>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col lg:flex-row gap-8 items-start"
				>
					{/* Left Column - Items */}
					<div className="flex-1 flex flex-col gap-6 w-full">
						<Elevated className="p-5 rounded-2xl flex flex-col gap-4">
							{/* Artist Header */}
							<div className="flex flex-row items-center justify-between gap-2">
								<div className="flex items-center gap-2 overflow-hidden">
									<User
										user={item.author as any}
										showUsername={false}
										avatarSize="sm"
										buttonClassName="py-0 h-fit w-fit hover:bg-transparent shrink-0"
									/>
									<Typography.Paragraph
										size={"xs"}
										className="text-muted-foreground truncate"
									>
										{t("ui.1_item", "1 item •")} {item.currency}{" "}
										{item.price.toFixed(2)}
									</Typography.Paragraph>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<Button disabled variant={"secondary"} size={"icon"}>
										<OutlineChat />
									</Button>
									<Button disabled variant={"destructive"}>
										{t("ui.remove_all", "Remove all")}
									</Button>
								</div>
							</div>

							{/* Item Row */}
							<div className="flex flex-row gap-4 mt-2">
								<div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
									<img
										src={item.image}
										alt={item.title}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="flex-1 flex flex-col justify-center min-w-0">
									<div className="flex justify-between items-start gap-3">
										<div className="flex flex-col min-w-0">
											<Typography.Heading level={6} className="line-clamp-2">
												{item.title}
											</Typography.Heading>
											<Typography.Paragraph
												size={"xs"}
												className="text-muted-foreground mt-0.5"
											>
												#1
											</Typography.Paragraph>
										</div>
										<Typography.Paragraph
											size={"sm"}
											className="text-muted-foreground whitespace-nowrap shrink-0 mt-0.5"
										>
											{item.currency} {item.price.toFixed(2)}
										</Typography.Paragraph>
									</div>
									<div className="flex items-center gap-2 mt-3">
										<Button disabled variant={"destructive"} size={"icon"}>
											<Trash2 className="size-4" />
										</Button>
										<Button disabled variant="secondary">
											<OutlineEdit /> {t("ui.edit", "Edit")}
										</Button>
									</div>
								</div>
							</div>

							{/* Note to artist */}
							<div className="mt-2">
								<FormField
									control={form.control}
									name="note"
									render={({ field }) => (
										<FormItem>
											<div className="flex justify-between items-center mb-1">
												<FormLabel className="text-xs font-semibold text-foreground/80">
													{t("ui.note_to_artist", "Note to artist")}
												</FormLabel>
												<span className="text-[10px] text-muted-foreground">
													{t("ui.optional", "Optional")}
												</span>
											</div>
											<FormControl>
												<Textarea
													placeholder={t(
														"ui.leave_an_important_note_say_thanks_or_just_say_something_nice_to_the_artist",
														"Leave an important note, say thanks, or just say something nice to the artist!",
													)}
													className="resize-none bg-secondary min-h-[80px] border-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</Elevated>

						{/* More from artist mock */}
						<Elevated className="p-5 rounded-2xl flex flex-col gap-4">
							<div className="flex items-center gap-3">
								<Typography.Heading level={4} className="text-lg">
									{t("ui.more_from", "More from")} {item.author.username}
									{t("ui.s_shop", "'s shop")}
								</Typography.Heading>
								<Button disabled variant="secondary" size={"sm"}>
									{t("ui.follow", "Follow")}
								</Button>
							</div>
							<EmptyPage
								icon={ShoppingBasket}
								title={t("ui.no_more_items", "No more items")}
								description={t(
									"ui.add_more_items_to_your_basket",
									"Add more items to your basket",
								)}
							/>
						</Elevated>
					</div>

					{/* Right Column - Checkout */}
					<div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("ui.your_name_7b44f2", "Your name*")}
									</FormLabel>
									<FormControl>
										<InputGroup>
											<InputGroupInput
												placeholder={t("ui.enter_your_name", "Enter your name")}
												{...field}
											/>
										</InputGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("ui.your_email_35787b", "Your email*")}
									</FormLabel>
									<FormControl>
										<InputGroup>
											<InputGroupAddon aria-hidden="true">
												<OutlineMail />
											</InputGroupAddon>
											<InputGroupInput
												type="email"
												placeholder={t(
													"ui.enter_your_email",
													"Enter your email",
												)}
												{...field}
											/>
										</InputGroup>
									</FormControl>
									<div className="flex items-start gap-1.5">
										<OutlineLock className="size-4 text-muted-foreground mt-0.5" />
										<Typography.Paragraph
											size={"xs"}
											className="text-muted-foreground"
										>
											{t(
												"ui.email_is_not_shared_with_anyone_only_used_by_familiar_for_order_updates",
												"Email is NOT shared with ANYONE. Only used by Familiar for order updates.",
											)}
										</Typography.Paragraph>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex flex-col gap-3 mt-2">
							<div className="flex justify-between items-center py-2 border-b border-border/50">
								<div className="flex flex-col">
									<Typography.Heading level={6}>
										{t("ui.subtotal", "Subtotal")}
									</Typography.Heading>
									<Typography.Paragraph
										size={"xs"}
										className="text-muted-foreground"
									>
										{t("ui.for_all_items", "For all items")}
									</Typography.Paragraph>
								</div>
								<div className="flex items-center gap-2">
									<Typography.Paragraph size={"sm"} className="font-bold">
										{item.price.toFixed(2)}
									</Typography.Paragraph>
									<Typography.Paragraph
										size={"xs"}
										className="text-muted-foreground"
									>
										{item.currency}
									</Typography.Paragraph>
								</div>
							</div>

							<div className="flex justify-between items-center py-2">
								<div className="flex flex-col">
									<Typography.Heading level={6}>
										{t("ui.due_now", "Due now")}
									</Typography.Heading>
									<Typography.Paragraph
										size={"xs"}
										className="text-muted-foreground"
									>
										{t(
											"ui.currency_conversion_fees_may_apply",
											"Currency conversion fees may apply",
										)}
									</Typography.Paragraph>
								</div>
								<div className="flex items-center gap-2">
									<Typography.Paragraph size={"sm"} className="font-bold">
										{item.price.toFixed(2)}
									</Typography.Paragraph>
									<Typography.Paragraph
										size={"xs"}
										className="text-muted-foreground"
									>
										{item.currency}
									</Typography.Paragraph>
								</div>
							</div>
						</div>

						<Button disabled size={"2xl"} className="w-full">
							{t("ui.pay_with_mollie", "Pay with Mollie")}
						</Button>

						<Typography.Paragraph
							size={"xs"}
							className="text-center text-muted-foreground px-4"
						>
							{t(
								"ui.by_purchasing_this_item_you_agree_to_familiar_s",
								"By purchasing this item, you agree to Familiar's",
							)}{" "}
							<Link to="/tos" className="font-bold link text-xs">
								{t("ui.terms_of_service", "Terms of Service")}
							</Link>{" "}
							{t("ui.and_acknowledge_our", "and acknowledge our")}{" "}
							<Link to="/privacy" className="font-bold link text-xs">
								{t("ui.privacy_policy", "Privacy Policy")}
							</Link>
							.
						</Typography.Paragraph>
					</div>
				</form>
			</Form>
		</div>
	);
}
