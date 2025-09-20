export default function MetaGrid({ metadata }: { metadata: Record<string, any> }) {
  if (!metadata) return null;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 text-sm">
      {Object.entries(metadata).map(([k, v]) => (
        <div key={k} className="rounded-xl border p-3">
          <div className="text-xs uppercase tracking-wide text-neutral-500">{k}</div>
          <div className="mt-1 font-medium break-words">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
        </div>
      ))}
    </div>
  );
}