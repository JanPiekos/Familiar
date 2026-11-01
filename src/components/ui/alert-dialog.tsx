import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import * as React from "react";
import { Button } from "src/components/ui/button";
import { cn } from "@/lib/utils";
import "./alert-dialog.css";

function AlertDialog({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
	return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
	return (
		<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
	);
}

function AlertDialogPortal({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
	return (
		<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
	);
}

function AlertDialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
	return (
		<AlertDialogPrimitive.Overlay
			data-slot="alert-dialog-overlay"
			className={cn(
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogContent({
	className,
	size = "default",
	ref,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
	size?: "default" | "sm";
}) {
	const content = React.useRef<HTMLDivElement | null>(null);
	const animation = React.useRef<Animation | null>(null);
	const timeout = React.useRef<number | undefined>(undefined);
	const stopFeedback = React.useCallback(() => {
		animation.current?.cancel();
		animation.current = null;
		window.clearTimeout(timeout.current);
		if (content.current) delete content.current.dataset.outsideFeedback;
	}, []);
	React.useEffect(() => stopFeedback, [stopFeedback]);
	const setContent = React.useCallback(
		(node: HTMLDivElement | null) => {
			content.current = node;
			const cleanup = typeof ref === "function" ? ref(node) : undefined;
			if (ref && typeof ref !== "function") ref.current = node;
			return () => {
				stopFeedback();
				content.current = null;
				if (typeof cleanup === "function") cleanup();
				else if (typeof ref === "function") ref(null);
				else if (ref) ref.current = null;
			};
		},
		[ref, stopFeedback],
	);
	const indicateRequiredChoice = (
		event: React.PointerEvent<HTMLDivElement>,
	) => {
		if (event.button !== 0 || event.target !== event.currentTarget) return;
		const element = content.current;
		if (!element || element.dataset.state !== "open") return;
		event.preventDefault();
		stopFeedback();
		element.dataset.outsideFeedback = "true";
		timeout.current = window.setTimeout(() => {
			delete element.dataset.outsideFeedback;
		}, 400);
		if (
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
			document.documentElement.dataset.a11yReduceMotion === "true"
		)
			return;
		if (typeof element.animate !== "function") return;
		// Add to the existing transform so centering and enter/exit motion stay intact.
		const feedback = element.animate(
			[0, -6, 6, -4, 4, 0].map((x) => ({ transform: `translateX(${x}px)` })),
			{ duration: 320, easing: "ease-in-out", composite: "add" },
		);
		animation.current = feedback;
		feedback.onfinish = () => {
			if (animation.current === feedback) animation.current = null;
		};
	};
	return (
		<AlertDialogPortal>
			<AlertDialogOverlay onPointerDown={indicateRequiredChoice} />
			<AlertDialogPrimitive.Content
				ref={setContent}
				data-slot="alert-dialog-content"
				data-size={size}
				className={cn(
					"bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg",
					className,
				)}
				{...props}
			/>
		</AlertDialogPortal>
	);
}

function AlertDialogHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-header"
			className={cn(
				"grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogFooter({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
	return (
		<AlertDialogPrimitive.Title
			data-slot="alert-dialog-title"
			className={cn(
				"text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
	return (
		<AlertDialogPrimitive.Description
			data-slot="alert-dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function AlertDialogMedia({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-media"
			className={cn(
				"bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogAction({
	className,
	variant = "default",
	size = "default",
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
	Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
	return (
		<Button variant={variant} size={size} asChild>
			<AlertDialogPrimitive.Action
				data-slot="alert-dialog-action"
				className={cn(className)}
				{...props}
			/>
		</Button>
	);
}

function AlertDialogCancel({
	className,
	variant = "outline",
	size = "default",
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
	Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
	return (
		<Button variant={variant} size={size} asChild>
			<AlertDialogPrimitive.Cancel
				data-slot="alert-dialog-cancel"
				className={cn(className)}
				{...props}
			/>
		</Button>
	);
}

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
};
