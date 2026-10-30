import { useEffect } from "react";
import { initializeAccessibility } from "@/lib/accessibility";

export function AccessibilityEffects() {
	useEffect(initializeAccessibility, []);
	return null;
}
