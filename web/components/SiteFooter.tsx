export default function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto max-w-6xl px-4 text-xs text-neutral-500">
        {new Date().getFullYear()} Loan Dashboard
      </div>
    </footer>
  );
}
