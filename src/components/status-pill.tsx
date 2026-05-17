import { cn } from "@/lib/utils";

const toneClassName = {
  ready: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  scaffolded: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  planned: "border-amber-500/30 bg-amber-500/10 text-amber-200",
} as const;

type StatusPillProps = {
  tone: keyof typeof toneClassName;
  children: React.ReactNode;
};

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.18em]",
        toneClassName[tone],
      )}
    >
      {children}
    </span>
  );
}
