export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Podcast Studio. Tous droits réservés.</p>
        <p>Propulsé par Next.js & Sanity</p>
      </div>
    </footer>
  );
}
