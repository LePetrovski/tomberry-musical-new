export function Footer() {
  return (
    <footer className="fixed rounded-full bottom-4 left-0 right-0 z-50 mx-auto border-t border-zinc-200 bg-primary-500 w-fit">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Le Tomberry Musical. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
