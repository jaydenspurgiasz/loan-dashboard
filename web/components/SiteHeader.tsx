import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur dark:bg-black/40">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">Loan Dashboard</Link>
      </div>
    </header>
  );
}
