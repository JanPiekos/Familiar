type meta = {
	title: string;
	description?: string;
	imageAlt?: string;
	noIndex?: boolean;
	type?: "website" | "profile" | "article";
	image?: string;
	keywords?: string;
	url?: string;
	pathname?: string;
	locale?: string;
};

export type Meta = meta;
