import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	HeadContent,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import type { ReactNode } from "react";
import i18n from "@/lib/i18n";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import { getLocalizedUrl, getSeoLinks, seo } from "@/lib/seo";
import { getRouteSeo, ROUTE_SEO } from "@/lib/route-seo";
import { loadFolderSeo, loadPostSeo } from "@/lib/content-seo";
import {
	artistCatalogsQueryOptions,
	artistPortfolioPostQueryOptions,
} from "@/hooks/portfolio/use-portfolio";

vi.mock("@/providers/auth", () => ({
	AuthProvider: ({ children }: { children: ReactNode }) => children,
	useAuth: () => ({ user: null, isPending: false }),
}));
vi.mock(
	"@/components/layout/modal/profile/settings/routed-user-settings",
	() => ({ RoutedUserSettings: () => null }),
);
import { Route as AppRoot } from "@/routes/__root";

afterEach(cleanup);
function value(meta: ReturnType<typeof seo>, name: string) {
	return meta.find(
		(tag) =>
			("name" in tag && tag.name === name) ||
			("property" in tag && tag.property === name),
	)?.content;
}
const postRoute = "/{-$locale}/_main/user/$username/$tab/$postId";
const params = { username: "artist", tab: "portfolio", postId: "post-1" };

describe("SEO coverage and localization", () => {
	it("covers every HTML route, including layouts and redirects", () => {
		function walk(directory: string): string[] {
			return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
				entry.isDirectory()
					? walk(directory + "/" + entry.name)
					: entry.name.endsWith(".tsx")
						? [directory + "/" + entry.name]
						: [],
			);
		}
		const missing: string[] = [];
		for (const file of walk(
			resolve(process.cwd(), "src/routes"),
		)) {
			const source = ts.createSourceFile(
				file,
				readFileSync(file, "utf8"),
				ts.ScriptTarget.Latest,
				true,
				ts.ScriptKind.TSX,
			);
			function visit(node: ts.Node) {
				if (
					ts.isCallExpression(node) &&
					node.expression.getText(source) === "createFileRoute"
				) {
					const route = (node.arguments[0] as ts.StringLiteral)?.text;
					if (route && !route.startsWith("/api/") && !(route in ROUTE_SEO))
						missing.push(route);
				}
				ts.forEachChild(node, visit);
			}
			visit(source);
		}
		expect(missing).toEqual([]);
	});

	it.each([en, pl])(
		"has a title and description for every registered page",
		(dictionary) => {
			for (const { key } of Object.values(ROUTE_SEO)) {
				const copy = dictionary.seo[key as keyof typeof dictionary.seo];
				expect(copy?.title).toBeTruthy();
				expect(copy?.description).toBeTruthy();
			}
		},
	);

	it.each(["en", "pl"])(
		"produces complete metadata for every page in %s",
		(locale) => {
			for (const [routeId] of Object.entries(ROUTE_SEO)) {
				const result = getRouteSeo([
					{
						routeId,
						pathname: "/shop?tracking=test#anchor",
						params: { ...params, locale, slug: "character-art" },
					},
				]);
				const serialized = JSON.stringify(result);
				expect(serialized).not.toMatch(
					/\{\{|og-image\.vercel|tracking=test|#anchor/,
				);
				expect(result.meta.find((tag) => "title" in tag)?.title).toBeTruthy();
				expect(
					String(value(result.meta, "description")).length,
				).toBeGreaterThan(12);
				expect(value(result.meta, "og:title")).toBe(
					value(result.meta, "twitter:title"),
				);
				expect(value(result.meta, "og:description")).toBe(
					value(result.meta, "description"),
				);
				expect(value(result.meta, "og:locale")).toBe(
					locale === "pl" ? "pl_PL" : "en_US",
				);
				expect(
					result.links.filter((link) => link.rel === "canonical"),
				).toHaveLength(1);
			}
		},
	);

	it("uses the URL locale even if the shared i18n instance currently uses a different language", async () => {
		await i18n.changeLanguage("en");
		const result = getRouteSeo([
			{
				routeId: "/{-$locale}/create/folder",
				pathname: "/pl/create/folder",
				params: { locale: "pl" },
			},
		]);
		expect(result.meta[0]).toEqual({ title: "Utwórz folder | Familiar" });
		expect(value(result.meta, "description")).toBe(
			pl.seo.create_folder.description,
		);
	});

	it("preserves the explicit beta no-index policy", () => {
		const head = AppRoot.options.head!({
			matches: [
				{ routeId: "/{-$locale}/_main/shop", pathname: "/shop", params: {} },
			],
		} as never) as { meta: ReturnType<typeof seo> };
		expect(value(head.meta, "robots")).toBe("noindex, nofollow");
	});

	it("keeps sensitive account parameters out of canonical and sharing URLs", () => {
		const result = getRouteSeo([
			{
				routeId: "/{-$locale}/_main/auth/mollie/callback",
				pathname: "/auth/mollie/callback?code=secret&state=private",
				params: {},
			},
		]);
		expect(JSON.stringify(result)).not.toMatch(/secret|private|code=/);
		expect(value(result.meta, "robots")).toBe("noindex, nofollow");
	});

	it("adds language alternates and a real local sharing image without placeholder handles", () => {
		const links = getSeoLinks("/pl/shop?sort=latest#results", "pl");
		expect(
			links
				.filter((link) => "hrefLang" in link)
				.map((link) => "hrefLang" in link && link.hrefLang),
		).toEqual(["en", "pl", "x-default"]);
		expect(links[0].href).toBe(getLocalizedUrl("/shop", "pl"));
		const tags = seo({ title: "Already | Familiar", locale: "en" });
		expect(tags[0]).toEqual({ title: "Already | Familiar" });
		expect(value(tags, "og:image")).toMatch(/\/og-image\.png$/);
		expect(JSON.stringify(tags)).not.toContain('"content":"@"');
		const image = readFileSync(
			resolve(process.cwd(), "public/og-image.png"),
		);
		expect(image.subarray(1, 4).toString()).toBe("PNG");
		expect([image.readUInt32BE(16), image.readUInt32BE(20)]).toEqual([
			1200, 630,
		]);
	});

	it("uses the actual profile route and public bio", () => {
		const result = getRouteSeo([
			{
				routeId: "/{-$locale}/_main/user/$username",
				params: { username: "artist" },
				loaderData: {
					user: {
						bio: "Independent illustrator",
						avatarPath: "https://images.example/avatar.webp",
					},
				},
			},
			{
				routeId: "/{-$locale}/_main/user/$username/$tab",
				pathname: "/user/artist/portfolio",
				params,
			},
		]);
		expect(result.links[0].href).toBe(
			getLocalizedUrl("/user/artist/portfolio", "en"),
		);
		expect(value(result.meta, "description")).toBe("Independent illustrator");
		expect(value(result.meta, "og:image")).toBe(
			"https://images.example/avatar.webp",
		);
	});
});

describe("portfolio content previews", () => {
	it("uses verified public post data and gives folder aliases the same canonical URL", async () => {
		const client = new QueryClient();
		client.setQueryData(
			artistPortfolioPostQueryOptions("artist", "post-1").queryKey,
			{
				title: "Forest <b>study</b>",
				description: "A woodland painting",
				visibility: "PUBLIC",
				images: [{ fullSize: { path: "https://images.example/forest.webp" } }],
			},
		);
		const data = await loadPostSeo(client, params);
		const result = getRouteSeo([
			{
				routeId: postRoute,
				pathname: "/user/artist/portfolio/folder/sketches/post-1",
				params,
				loaderData: data,
			},
		]);
		expect(result.meta[0]).toEqual({ title: "Forest study | Familiar" });
		expect(value(result.meta, "og:description")).toBe("A woodland painting");
		expect(result.links[0].href).toBe(
			getLocalizedUrl("/user/artist/portfolio/post-1", "en"),
		);
		client.clear();
	});

	it.each([
		{ visibility: "PRIVATE" },
		{ visibility: "PUBLIC", contentWarnings: ["sensitive"] },
		{},
	])(
		"does not disclose private, sensitive, or unverified content",
		async (visibility) => {
			const client = new QueryClient();
			client.setQueryData(
				artistPortfolioPostQueryOptions("artist", "post-1").queryKey,
				{
					...visibility,
					title: "Secret title",
					description: "Secret description",
					images: [
						{ fullSize: { path: "https://images.example/secret.webp" } },
					],
				},
			);
			const data = await loadPostSeo(client, params);
			const result = getRouteSeo([
				{
					routeId: postRoute,
					pathname: "/user/artist/portfolio/post-1",
					params,
					loaderData: data,
				},
			]);
			expect(JSON.stringify(result)).not.toContain("Secret");
			expect(JSON.stringify(result)).not.toContain("secret.webp");
			expect(value(result.meta, "robots")).toBe("noindex, nofollow");
			client.clear();
		},
	);

	it("falls back without attributing an unavailable post to the requested artist", async () => {
		const client = new QueryClient();
		vi.spyOn(client, "ensureQueryData").mockRejectedValueOnce(
			new Error("Wrong artist"),
		);
		const data = await loadPostSeo(client, params);
		expect(data.seoMeta?.title).toBe(en.seo.post.title);
		expect(data.seoMeta?.description).not.toContain("@artist");
		client.clear();
	});

	it("uses a folder's name and description without fetching or previewing its images", async () => {
		const client = new QueryClient();
		client.setQueryData(artistCatalogsQueryOptions("artist").queryKey, [
			{
				id: "sketches",
				name: "Sketchbook",
				description: "Studies and sketches",
				fullSize: { path: "https://images.example/unreviewed.webp" },
			},
		]);
		const data = await loadFolderSeo(client, {
			...params,
			folderSlug: "sketches",
		});
		expect(data.seoMeta?.title).toBe("Sketchbook — @artist");
		expect(data.seoMeta?.description).toBe("Studies and sketches");
		expect(data.seoMeta?.image).toBeUndefined();
		client.clear();
	});
});

it("updates title, description, canonical, and share tags together on client navigation", async () => {
	const root = createRootRoute({
		head: AppRoot.options.head as never,
		component: () => (
			<>
				<HeadContent />
				<Outlet />
			</>
		),
	});
	const main = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}",
		component: Outlet,
	}).update({ id: "/{-$locale}/_main" } as never);
	const shop = createRoute({
		getParentRoute: () => main,
		path: "/shop",
		component: () => (
			<>
				<h1>Shop</h1>
				<Outlet />
			</>
		),
	});
	const category = createRoute({
		getParentRoute: () => shop,
		path: "/category/$slug",
		component: () => <h2>Category</h2>,
	});
	const create = createRoute({
		getParentRoute: () => root,
		path: "/{-$locale}/create",
		component: Outlet,
	});
	const post = createRoute({
		getParentRoute: () => create,
		path: "/post",
		component: () => <h1>Create post</h1>,
	});
	const router = createRouter({
		routeTree: root.addChildren([
			main.addChildren([shop.addChildren([category])]),
			create.addChildren([post]),
		]),
		history: createMemoryHistory({ initialEntries: ["/shop"] }),
		defaultPendingMinMs: 0,
	});
	render(<RouterProvider router={router as never} />);
	await screen.findByRole("heading", { name: "Shop" });
	expect(document.title).toContain("Shop");
	await act(async () => {
		await router.navigate({ to: "/pl/shop/category/character-art" as never });
	});
	await screen.findByRole("heading", { name: "Category" });
	expect(document.title).toBe("Zlecenia: character art | Familiar");
	expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(
		1,
	);
	expect(
		document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
	).toBe(getLocalizedUrl("/shop/category/character-art", "pl"));
	await act(async () => {
		await router.navigate({
			to: "/pl/create/post?returnTo=%2Fprivate" as never,
		});
	});
	await screen.findByRole("heading", { name: "Create post" });
	expect(document.title).toBe("Nowy post | Familiar");
	expect(
		document.head
			.querySelector('meta[name="description"]')
			?.getAttribute("content"),
	).toBe(pl.seo.create_post.description);
	expect(
		document.head
			.querySelector('meta[property="og:title"]')
			?.getAttribute("content"),
	).toBe(document.title);
	expect(
		document.head.querySelector('meta[name="robots"]')?.getAttribute("content"),
	).toBe("noindex, nofollow");
	expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(
		1,
	);
	expect(
		document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
	).toBe(getLocalizedUrl("/create/post", "pl"));
	await act(async () => {
		router.history.back();
	});
	await screen.findByRole("heading", { name: "Category" });
	expect(document.title).toBe("Zlecenia: character art | Familiar");
});
