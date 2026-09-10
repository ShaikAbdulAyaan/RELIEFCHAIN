import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Icon size={20} />
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          VERIFIED
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}