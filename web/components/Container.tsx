import { ReactNode } from "react";

export default function Container({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-6xl px-4 py-8">{children}</section>;
}
