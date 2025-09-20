import { ReactNode } from "react";

export default function Card({ title, children, actions, className }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white p-4 shadow-sm dark:bg-neutral-900 min-w-0 ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between">
          {title ? <h3 className="text-sm font-semibold">{title}</h3> : <span />}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
