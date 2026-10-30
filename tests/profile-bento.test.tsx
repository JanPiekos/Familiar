import { describe, expect, it } from "vitest";
import {
	bucketFromDimensions,
	packAppend,
	toPixels,
	type PlacedTile,
	type Tile,
} from "@/lib/bento";

function tile(
	id: string,
	width: number,
	height: number,
	createdAt = "2026-10-26T12:00:00Z",
): Tile {
	return {
		id,
		createdAt,
		...bucketFromDimensions(width, height),
		cover: { path: `/${id}.png`, width, height, alt: id },
	};
}

function expectValidLayout(placed: PlacedTile[], columns: number) {
	const occupied = new Set<string>();
	for (const item of placed) {
		expect(item.x).toBeGreaterThanOrEqual(0);
		expect(item.y).toBeGreaterThanOrEqual(0);
		expect(item.x + item.widthUnit).toBeLessThanOrEqual(columns);
		for (let y = item.y; y < item.y + item.heightUnit; y += 1) {
			for (let x = item.x; x < item.x + item.widthUnit; x += 1) {
				const cell = `${x},${y}`;
				expect(occupied.has(cell), `overlapping cell ${cell}`).toBe(false);
				occupied.add(cell);
			}
		}
	}
}

describe("adaptive bento squares", () => {
	it.each([
		["2026-10-26T12:00:00Z", "2026-10-20T12:00:00Z"],
		["2026-10-20T12:00:00Z", "2026-10-26T12:00:00Z"],
		["2026-10-26T12:00:00Z", "2026-10-26T12:00:00Z"],
	])(
		"fills the space beside a portrait regardless of post order (%s, %s)",
		(portraitDate, squareDate) => {
			const posts = [
				tile("portrait", 800, 1200, portraitDate),
				tile("square", 800, 800, squareDate),
			];
			const original = structuredClone(posts);
			const placed = packAppend([], posts, 4);
			const square = placed.find((item) => item.tile.id === "square")!;
			const portrait = placed.find((item) => item.tile.id === "portrait")!;

			expect(square).toMatchObject({ y: 0, widthUnit: 2, heightUnit: 2 });
			expect([square.x, portrait.x].sort()).toEqual([0, 2]);
			expect(portrait).toMatchObject({ y: 0, widthUnit: 2, heightUnit: 3 });
			expectValidLayout(placed, 4);
			expect(posts).toEqual(original);
			expect(square.tile.cover).toEqual(original[1].cover);
			const layout = toPixels(placed, 200, 1);
			expect(
				layout.nodes.find((node) => node.key === "square")?.style,
			).toMatchObject({ width: 401, height: 401 });
			expect(layout.containerHeight).toBe(602);
		},
	);

	it("does not grow a square when neighboring posts block the space", () => {
		const existing: PlacedTile[] = [
			{
				x: 0,
				y: 0,
				widthUnit: 2,
				heightUnit: 3,
				tile: tile("portrait", 800, 1200),
			},
			{
				x: 2,
				y: 0,
				widthUnit: 1,
				heightUnit: 2,
				tile: tile("narrow", 400, 1200),
			},
		];
		const placed = packAppend(existing, [tile("square", 800, 800)], 4);
		expect(placed.at(-1)).toMatchObject({
			x: 3,
			y: 0,
			widthUnit: 1,
			heightUnit: 1,
		});
		expectValidLayout(placed, 4);
	});

	it("fills the partial square row when a portrait takes the full mobile width", () => {
		const posts = [tile("portrait", 800, 1200), tile("square", 800, 800)];
		const original = structuredClone(posts);
		const placed = packAppend([], posts, 2);
		const square = placed.find((item) => item.tile.id === "square")!;
		expect(square).toMatchObject({ x: 0, widthUnit: 2, heightUnit: 2 });
		expect(square.tile).toEqual(original[1]);
		expect(posts).toEqual(original);
		expectValidLayout(placed, 2);
		expect(toPixels(placed, 180, 1).containerHeight).toBe(904);
	});

	it("shrinks enlarged squares again when new posts need their space", () => {
		const portrait = tile("portrait", 800, 1200);
		const square = tile("square", 800, 800, "2026-10-20T12:00:00Z");
		const sparse = packAppend([], [portrait, square], 4);
		expect(sparse.find((item) => item.tile.id === "square")).toMatchObject({
			widthUnit: 2,
			heightUnit: 2,
		});
		const dense = packAppend(
			[],
			[
				portrait,
				square,
				...Array.from({ length: 5 }, (_, index) =>
					tile("new-" + index, 800, 800, "2026-10-20T12:00:00Z"),
				),
			],
			4,
		);
		expect(
			dense.every(
				(item) =>
					item.tile.id === "portrait" ||
					(item.widthUnit === 1 && item.heightUnit === 1),
			),
		).toBe(true);
		expectValidLayout(dense, 4);
		expect(toPixels(dense, 200, 1).containerHeight).toBe(602);
	});

	it("keeps a complete row of squares compact", () => {
		const posts = Array.from({ length: 4 }, (_, index) =>
			tile(`square-${index}`, 800, 800),
		);
		const placed = packAppend([], posts, 4);
		expect(
			placed.every((item) => item.widthUnit === 1 && item.heightUnit === 1),
		).toBe(true);
		expect(toPixels(placed, 200, 1).containerHeight).toBe(200);
		expectValidLayout(placed, 4);
	});

	it("preserves existing tiles when appending posts", () => {
		const existing: PlacedTile[] = [
			{
				x: 0,
				y: 0,
				widthUnit: 1,
				heightUnit: 1,
				tile: tile("square", 800, 800),
			},
			{
				x: 2,
				y: 0,
				widthUnit: 2,
				heightUnit: 3,
				tile: tile("portrait", 800, 1200),
			},
		];
		const original = structuredClone(existing);
		const placed = packAppend(existing, [tile("new-square", 800, 800)], 4);
		expect(placed.slice(0, existing.length)).toEqual(original);
		expect(existing).toEqual(original);
		expectValidLayout(placed, 4);
	});

	it.each([1, 2, 3, 4])(
		"keeps mixed layouts in bounds without overlaps at %i columns",
		(columns) => {
			const shapes = [
				[800, 800],
				[800, 1200],
				[1600, 800],
				[400, 1200],
			];
			for (const strategy of ["balanced", "recency", "fit"] as const) {
				for (let count = 1; count <= 24; count += 1) {
					const posts = Array.from({ length: count }, (_, index) => {
						const [width, height] = shapes[(index * 7 + count) % shapes.length];
						return tile(`post-${index}`, width, height);
					});
					const placed = packAppend([], posts, columns, strategy);
					expect(placed).toHaveLength(count);
					expect(new Set(placed.map((item) => item.tile.id)).size).toBe(count);
					expectValidLayout(placed, columns);
					if (columns === 1)
						expect(
							placed.every(
								(item) => item.widthUnit === 1 && item.heightUnit === 1,
							),
						).toBe(true);
				}
			}
		},
	);
});
