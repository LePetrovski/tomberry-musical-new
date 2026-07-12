import type { Metadata } from "next";
import { Lexend, Ubuntu_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { GlobalJsonLd } from "@/components/GlobalJsonLd";
import { getSiteSettings } from "@/lib/sanity/cached";
import { getSiteUrl, siteConfig } from "@/lib/seo/site";
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

export const metadata: Metadata = {
	metadataBase: new URL(getSiteUrl()),
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	robots: { index: true, follow: true },
	openGraph: {
		type: "website",
		locale: siteConfig.locale,
		siteName: siteConfig.name,
	},
	twitter: {
		card: "summary_large_image",
	},
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	const siteSettings = await getSiteSettings();
	const socialLinks = siteSettings?.socialLinks ?? [];

	return (
		<html
		lang="fr"
		className={`${lexend.variable} ${ubuntuSans.variable} h-full antialiased`}
		suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col" suppressHydrationWarning>
				<GlobalJsonLd />
				<App>
					<main className="flex-1 h-full">{children}</main>
				</App>
				<Footer socialLinks={socialLinks} />
			</body>
		</html>
	);
}
