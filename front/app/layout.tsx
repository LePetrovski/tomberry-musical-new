import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Lexend, Ubuntu_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { GlobalJsonLd } from "@/components/GlobalJsonLd";
import { getSiteSettings } from "@/lib/sanity/cached";
import { getSiteUrl, siteConfig, uniqueSameAs } from "@/lib/seo/site";
import "./globals.css";
import App from "./app";

const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
});

const ubuntuSans = Ubuntu_Sans({
	variable: "--font-ubuntu-sans",
	subsets: ["latin"],
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
	metadataBase: new URL(getSiteUrl()),
	title: {
		default: `${siteConfig.name} — ${siteConfig.tagline}`,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	keywords: [
		"podcast",
		"musique de jeux vidéo",
		"VGM",
		"bande originale",
		"OST",
		"jeux vidéo",
		"compositeurs",
		"Le Tomberry Musical",
	],
	authors: [{ name: siteConfig.host.name, url: getSiteUrl() }],
	creator: siteConfig.host.name,
	publisher: siteConfig.name,
	robots: { index: true, follow: true },
	openGraph: {
		type: "website",
		locale: siteConfig.locale,
		siteName: siteConfig.name,
		title: siteConfig.name,
		description: siteConfig.description,
	},
	twitter: {
		card: "summary_large_image",
		title: siteConfig.name,
		description: siteConfig.description,
	},
	...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	const siteSettings = await getSiteSettings();
	const socialLinks = siteSettings?.socialLinks ?? [];
	const sameAs = uniqueSameAs([
		...socialLinks.map((link) => link.url),
		...(siteSettings?.reviewLinks?.map((link) => link.url) ?? []),
		...(siteSettings?.featuredLinks?.map((link) => link.url) ?? []),
	]);

	return (
		<html
		lang="fr"
		className={`${lexend.variable} ${ubuntuSans.variable} h-full antialiased`}
		suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col" suppressHydrationWarning>
				<GlobalJsonLd sameAs={sameAs} />
				<App>
					<main className="flex-1 h-full">{children}</main>
				</App>
				<Footer socialLinks={socialLinks} />
				<Analytics />
			</body>
		</html>
	);
}
