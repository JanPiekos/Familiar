import { MotionConfig, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useAccessibility } from "@/lib/accessibility";

export function MotionProvider({ children }: { children: ReactNode }) {
	const shouldReduceMotion = useReducedMotion();
	const { reduceMotion } = useAccessibility();

	return (
		<MotionConfig
			reducedMotion={shouldReduceMotion || reduceMotion ? "always" : "user"}
		>
			{children}
		</MotionConfig>
	);
}
