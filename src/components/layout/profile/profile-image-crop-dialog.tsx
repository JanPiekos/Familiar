import {
	Crop,
	LoaderCircle,
	Minus,
	Plus,
	RotateCcw,
	RotateCw,
	X,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	COVER_GUIDES,
	type CropArea,
	type CroppedProfileImage,
	coverGuideBounds,
	cropProfileImage,
	isAnimatedImage,
	type ProfileImageKind,
	readImageFile,
} from "@/lib/image-crop";

type Request = {
	file: File;
	kind: ProfileImageKind;
	apply: (image: CroppedProfileImage) => void;
	id: number;
};

export function useProfileImageCrop() {
	const [request, setRequest] = useState<Request | null>(null);
	const id = useRef(0);
	return {
		requestCrop: (
			file: File,
			kind: ProfileImageKind,
			apply: Request["apply"],
		) => setRequest({ file, kind, apply, id: ++id.current }),
		cropDialog: request && (
			<ProfileImageCropDialog
				key={request.id}
				file={request.file}
				kind={request.kind}
				onCancel={() => setRequest(null)}
				onApply={(image) => {
					request.apply(image);
					setRequest(null);
				}}
			/>
		),
	};
}

export function ProfileImageCropDialog({
	file,
	kind,
	onCancel,
	onApply,
}: {
	file: File;
	kind: ProfileImageKind;
	onCancel: () => void;
	onApply: (image: CroppedProfileImage) => void;
}) {
	const { t } = useTranslation();
	const helpId = useId();
	const [source, setSource] = useState("");
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [cropSize, setCropSize] = useState({ width: 0, height: 0 });
	const [showGuides, setShowGuides] = useState(true);
	const [ready, setReady] = useState(false);
	const [animated, setAnimated] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const pending = useRef(false);
	const area = useRef<CropArea | null>(null);

	useEffect(() => {
		const url = URL.createObjectURL(file);
		let active = true;
		setSource(url);
		void isAnimatedImage(file)
			.then((value) => {
				if (active) setAnimated(value);
			})
			.catch(() => {});
		return () => {
			active = false;
			URL.revokeObjectURL(url);
		};
	}, [file]);

	async function apply(original = false) {
		if (pending.current || !ready || (!original && !area.current)) return;
		pending.current = true;
		setBusy(true);
		setError("");
		try {
			const image = original
				? { file, dataUrl: await readImageFile(file) }
				: await cropProfileImage(
						source,
						area.current as CropArea,
						rotation,
						kind,
						file.name,
					);
			onApply(image);
		} catch {
			setError(t("image_crop.failed"));
		} finally {
			pending.current = false;
			setBusy(false);
		}
	}

	function reset() {
		setCrop({ x: 0, y: 0 });
		setZoom(1);
		setRotation(0);
	}
	const disabled = busy || !ready;
	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open && !pending.current) onCancel();
			}}
		>
			<DialogContent
				showCloseButton={false}
				className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 sm:max-w-3xl max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-none max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0"
				onEscapeKeyDown={(event) => {
					if (pending.current) event.preventDefault();
				}}
				onInteractOutside={(event) => {
					if (pending.current) event.preventDefault();
				}}
			>
				<header className="flex shrink-0 items-center gap-3 border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
						<Crop className="size-5" />
					</div>
					<div className="min-w-0 flex-1">
						<DialogTitle className="text-base leading-6">
							{t(
								kind === "avatar"
									? "image_crop.avatar_title"
									: "image_crop.cover_title",
							)}
						</DialogTitle>
						<DialogDescription className="mt-0.5">
							{t("image_crop.description")}
						</DialogDescription>
					</div>
					<Button
						type="button"
						size="icon-lg"
						variant="ghost"
						className="size-10 lg:size-9"
						aria-label={t("image_crop.close")}
						disabled={busy}
						onClick={onCancel}
					>
						<X />
					</Button>
				</header>
				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
					<div
						className="relative min-h-64 flex-1 bg-muted/40 sm:h-[min(50dvh,26rem)] sm:flex-none"
						aria-busy={!ready}
					>
						{source && (
							<Cropper
								image={source}
								crop={crop}
								zoom={zoom}
								rotation={rotation}
								aspect={kind === "avatar" ? 1 : 3}
								cropShape={kind === "avatar" ? "round" : "rect"}
								showGrid={false}
								maxZoom={4}
								keyboardStep={4}
								disableAutomaticStylesInjection
								onCropChange={(position) => {
									if (!pending.current) setCrop(position);
								}}
								onZoomChange={(value) => {
									if (!pending.current) setZoom(value);
								}}
								onCropSizeChange={setCropSize}
								onCropAreaChange={(_, pixels) => {
									area.current = pixels;
								}}
								onMediaLoaded={() => setReady(true)}
								onTouchRequest={() => !pending.current}
								onWheelRequest={() => !pending.current}
								cropperProps={{
									role: "region",
									"aria-label": t("image_crop.position"),
									"aria-describedby": helpId,
								}}
								mediaProps={{
									alt: t("image_crop.image_alt"),
									onError: () => {
										setReady(false);
										setError(t("image_crop.load_failed"));
									},
								}}
								style={{
									cropAreaStyle: {
										border: "1px solid rgb(255 255 255 / 85%)",
										boxShadow: "0 0 0 9999em rgb(0 0 0 / 65%)",
									},
								}}
							/>
						)}
						{kind === "cover" && ready && showGuides && (
							<div
								aria-hidden="true"
								className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
								style={{ width: cropSize.width, height: cropSize.height }}
							>
								{COVER_GUIDES.map((guide) => {
									const bounds = coverGuideBounds(guide.aspect);
									return (
										<div
											key={guide.id}
											className="absolute border border-dashed"
											style={{
												left: `${bounds.left * 100}%`,
												top: `${bounds.top * 100}%`,
												width: `${bounds.width * 100}%`,
												height: `${bounds.height * 100}%`,
												borderColor: guide.color,
											}}
										>
											<span
												className={`absolute rounded-full bg-black/80 px-2 py-0.5 text-[11px] font-medium ${guide.id === "tablet" ? "bottom-1 left-1" : guide.id === "desktop" ? "top-1 right-1" : "top-1 left-1"}`}
												style={{ color: guide.color }}
											>
												{t(`image_crop.${guide.id}`)}
											</span>
										</div>
									);
								})}
							</div>
						)}
						{!ready && !error && (
							<div
								className="pointer-events-none absolute inset-0 flex items-center justify-center"
								role="status"
								aria-label={t("image_crop.loading")}
							>
								<LoaderCircle className="size-6 animate-spin" />
							</div>
						)}
					</div>
					<div className="shrink-0 space-y-4 border-t p-4 sm:px-6">
						<p
							id={helpId}
							className="text-center text-xs text-muted-foreground"
						>
							{t("image_crop.position_help")}
						</p>
						<div className="flex items-center gap-3">
							<label htmlFor={`${helpId}-zoom`} className="text-sm font-medium">
								{t("image_crop.zoom")}
							</label>
							<Button
								type="button"
								size="icon-lg"
								variant="ghost"
								className="size-10 lg:size-9"
								aria-label={t("image_crop.zoom_out")}
								disabled={disabled || zoom <= 1}
								onClick={() => setZoom(Math.max(1, zoom - 0.1))}
							>
								<Minus />
							</Button>
							<input
								id={`${helpId}-zoom`}
								type="range"
								min={1}
								max={4}
								step={0.01}
								value={zoom}
								onChange={(event) => setZoom(Number(event.target.value))}
								disabled={disabled}
								className="h-10 min-w-0 flex-1 cursor-pointer accent-primary disabled:opacity-50"
								aria-valuetext={`${Math.round(zoom * 100)}%`}
							/>
							<Button
								type="button"
								size="icon-lg"
								variant="ghost"
								className="size-10 lg:size-9"
								aria-label={t("image_crop.zoom_in")}
								disabled={disabled || zoom >= 4}
								onClick={() => setZoom(Math.min(4, zoom + 0.1))}
							>
								<Plus />
							</Button>
							<output
								htmlFor={`${helpId}-zoom`}
								className="w-10 text-right text-xs tabular-nums text-muted-foreground"
							>
								{Math.round(zoom * 100)}%
							</output>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Button
								type="button"
								variant="secondary"
								size="lg"
								className="h-10 lg:h-9"
								disabled={disabled}
								onClick={() => {
									setRotation((rotation + 90) % 360);
									setCrop({ x: 0, y: 0 });
								}}
							>
								<RotateCw />
								{t("image_crop.rotate")}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="lg"
								className="h-10 lg:h-9"
								disabled={disabled}
								onClick={reset}
							>
								<RotateCcw />
								{t("image_crop.reset")}
							</Button>
							{kind === "cover" && (
								<label className="ml-auto flex min-h-10 cursor-pointer items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={showGuides}
										onChange={(event) => setShowGuides(event.target.checked)}
										className="size-4 accent-primary"
									/>
									{t("image_crop.guides")}
								</label>
							)}
						</div>
						{kind === "cover" && (
							<p className="text-xs text-muted-foreground">
								{t("image_crop.guide_help")}
							</p>
						)}
						{animated && (
							<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted p-3 text-sm">
								<span>{t("image_crop.animation")}</span>
								<Button
									type="button"
									size="lg"
									variant="outline"
									disabled={disabled}
									onClick={() => void apply(true)}
								>
									{t("image_crop.original")}
								</Button>
							</div>
						)}
						{error && (
							<p role="alert" className="text-sm text-destructive">
								{error}
							</p>
						)}
					</div>
				</div>
				<footer className="flex shrink-0 justify-end gap-2 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
					<Button
						type="button"
						variant="outline"
						size="xl"
						className="h-10 lg:h-9"
						disabled={busy}
						onClick={onCancel}
					>
						{t("image_crop.cancel")}
					</Button>
					<Button
						type="button"
						size="xl"
						className="h-10 lg:h-9"
						disabled={disabled}
						aria-busy={busy}
						onClick={() => void apply()}
					>
						{busy && <LoaderCircle className="animate-spin" />}
						{t("image_crop.apply")}
					</Button>
				</footer>
			</DialogContent>
		</Dialog>
	);
}
