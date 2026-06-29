import Link from "next/link";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/podcasts", label: "Podcasts" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
          Podcast Studio
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
