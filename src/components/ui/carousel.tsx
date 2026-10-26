import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "src/components/ui/button";
import { cn } from "@/lib/utils";
import React, {
	createContext,
	useCallback,
	use,
	useEffect,
	useRef,
	useState,
	type MutableRefObject,
} from "react";
import { useTranslation } from "react-i18next";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: "horizontal" | "vertical";

	/**
	 * Use this instead of setApi.
	 *
	 * Example:
	 * const apiRef = useRef<CarouselApi | null>(null);
	 * <Carousel apiRef={apiRef}>...</Carousel>
	 */
	apiRef?: MutableRefObject<CarouselApi | null>;
};

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = use(CarouselContext);

	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}

	return context;
}

function Carousel({
	orientation = "horizontal",
	opts,
	apiRef,
	plugins,
	className,
	children,
	...props
}: React.ComponentProps<"section"> & CarouselProps) {
	const { t } = useTranslation();
	const [carouselRef, api] = useEmblaCarousel(
		{
			...opts,
			axis: orientation === "horizontal" ? "x" : "y",
		},
		plugins,
	);

	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	const onSelect = useCallback(
		(api: CarouselApi) => {
			if (!api) return;

			setCanScrollPrev(api.canScrollPrev());
			setCanScrollNext(api.canScrollNext());
		},
		[t],
	);

	const onSelectRef = useRef(onSelect);

	useEffect(() => {
		onSelectRef.current = onSelect;
	}, [onSelect]);

	useEffect(() => {
		if (!apiRef) return;

		apiRef.current = api ?? null;

		return () => {
			apiRef.current = null;
		};
	}, [api, apiRef]);

	const scrollPrev = useCallback(() => {
		api?.scrollPrev();
	}, [api, t]);

	const scrollNext = useCallback(() => {
		api?.scrollNext();
	}, [api, t]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLElement>) => {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				scrollPrev();
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				scrollNext();
			}
		},
		[scrollPrev, scrollNext, t],
	);

	useEffect(() => {
		if (!api) return;

		const handleSelect = () => {
			onSelectRef.current(api);
		};

		handleSelect();

		api.on("reInit", handleSelect);
		api.on("select", handleSelect);

		return () => {
			api.off("reInit", handleSelect);
			api.off("select", handleSelect);
		};
	}, [api]);

	return (
		<CarouselContext.Provider
			value={{
				carouselRef,
				api,
				opts,
				plugins,
				apiRef,
				orientation:
					orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
				scrollPrev,
				scrollNext,
				canScrollPrev,
				canScrollNext,
			}}
		>
			<section
				onKeyDownCapture={handleKeyDown}
				className={cn("relative", className)}
				aria-roledescription={t("ui.carousel_2c6160", "carousel")}
				aria-label={t("ui.carousel", "Carousel")}
				data-slot="carousel"
				{...props}
			>
				{children}
			</section>
		</CarouselContext.Provider>
	);
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
	const { carouselRef, orientation } = useCarousel();

	return (
		<div
			ref={carouselRef}
			className="overflow-hidden"
			data-slot="carousel-content"
		>
			<div
				className={cn(
					"flex",
					orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function CarouselItem({
	className,
	...props
}: React.ComponentProps<"fieldset">) {
	const { t } = useTranslation();
	const { orientation } = useCarousel();

	return (
		<fieldset
			aria-roledescription={t("ui.slide", "slide")}
			data-slot="carousel-item"
			className={cn(
				"min-w-0 shrink-0 grow-0 basis-full",
				orientation === "horizontal" ? "pl-4" : "pt-4",
				className,
			)}
			{...props}
		/>
	);
}

function CarouselPrevious({
	className,
	variant = "outline",
	size = "icon",
	...props
}: React.ComponentProps<typeof Button>) {
	const { t } = useTranslation();
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();

	return (
		<Button
			data-slot="carousel-previous"
			variant={variant}
			size={size}
			className={cn(
				"absolute size-8 rounded-full",
				orientation === "horizontal"
					? "top-1/2 -left-12 -translate-y-1/2"
					: "-top-12 left-1/2 -translate-x-1/2 rotate-90",
				className,
			)}
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			{...props}
		>
			<ArrowLeft />
			<span className="sr-only">
				{t("ui.previous_slide", "Previous slide")}
			</span>
		</Button>
	);
}

function CarouselNext({
	className,
	variant = "outline",
	size = "icon",
	...props
}: React.ComponentProps<typeof Button>) {
	const { t } = useTranslation();
	const { orientation, scrollNext, canScrollNext } = useCarousel();

	return (
		<Button
			data-slot="carousel-next"
			variant={variant}
			size={size}
			className={cn(
				"absolute size-8 rounded-full",
				orientation === "horizontal"
					? "top-1/2 -right-12 -translate-y-1/2"
					: "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
				className,
			)}
			disabled={!canScrollNext}
			onClick={scrollNext}
			{...props}
		>
			<ArrowRight />
			<span className="sr-only">{t("ui.next_slide", "Next slide")}</span>
		</Button>
	);
}

export {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
	useCarousel,
};
