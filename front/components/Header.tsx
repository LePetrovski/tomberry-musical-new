import Link from "next/link";

// const links = [
// 	{ href: "/podcasts", label: "Podcasts" },
// 	{ href: "/blog", label: "Blog" },
// ];

export function Header() {
	return (
		<header className="fixed mx-auto top-2 left-0 right-0 z-50 rounded-full bg-primary-500/60 backdrop-blur-sm w-fit">
			<nav className="mx-auto flex gap-12 max-w-6xl items-center justify-between px-6 py-5 text-secondary-500">
				<Link
				href="/podcasts"
				className="text-xl"
				>
					podcasts
				</Link>

				<Link href="/" className="text-3xl font-black tracking-tight uppercase">
					Le Tomberry Musical
				</Link>
		
				<Link
				href="/blog"
				className="text-xl"
				>
					blog
				</Link>
			</nav>
		</header>
	);
}
