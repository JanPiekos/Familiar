import { useQuery } from "@tanstack/react-query";
import type { MockShopItem } from "@/types/shop";

// Shop endpoints are not available yet; do not present sample listings as real items.
export function useShopItems(categoryId?: string) {
	return useQuery<MockShopItem[]>({
		queryKey: ["shop-items", categoryId],
		queryFn: async () => [],
	});
}

export function useShopItem(id: string) {
	return useQuery<MockShopItem | null>({
		queryKey: ["shop-item", id],
		queryFn: async () => null,
		enabled: Boolean(id),
	});
}
