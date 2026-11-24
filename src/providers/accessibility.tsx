import { useEffect } from "react";
import { ReadingGuide } from "@/components/layout/reading-guide";
import { initializeAccessibility } from "@/lib/accessibility";

export function AccessibilityEffects() {
	useEffect(initializeAccessibility, []);
	return <ReadingGuide />;
}
