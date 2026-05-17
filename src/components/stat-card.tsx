import { formatCount } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  helper: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{formatCount(value)}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{helper}</p>
    </div>
  );
}
