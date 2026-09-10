import { useMemo } from "react";

type ReportData = {
  label: string;
  value: number;
};

const fundData: ReportData[] = [
  { label: "Raised", value: 82 },
  { label: "Spent", value: 61 },
  { label: "Remaining", value: 21 },
];

const beneficiaryData: ReportData[] = [
  { label: "Week 1", value: 120 },
  { label: "Week 2", value: 280 },
  { label: "Week 3", value: 460 },
  { label: "Week 4", value: 720 },
];

const distributionData: ReportData[] = [
  { label: "Food", value: 84 },
  { label: "Water", value: 72 },
  { label: "Medicine", value: 48 },
  { label: "Shelter", value: 36 },
];

const riskData = [
  { label: "LOW", value: 64 },
  { label: "MEDIUM", value: 23 },
  { label: "HIGH", value: 13 },
];

export default function Reports() {
  const totalBeneficiaries = useMemo(
    () =>
      beneficiaryData.reduce(
        (total, item) => total + item.value,
        0
      ),
    []
  );

  const totalDistribution = useMemo(
    () =>
      distributionData.reduce(
        (total, item) => total + item.value,
        0
      ),
    []
  );

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              RELIEFCHAIN ANALYTICS
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Reports & Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor funds, beneficiaries, relief distribution and
              AI risk activity.
            </p>
          </div>

          <button
            type="button"
            onClick={printReport}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Print / Save PDF
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Funds Raised
            </p>

            <p className="mt-2 text-3xl font-bold">
              ₹82L
            </p>

            <p className="mt-2 text-xs text-emerald-600">
              +18.4% this period
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Spent
            </p>

            <p className="mt-2 text-3xl font-bold">
              ₹61L
            </p>

            <p className="mt-2 text-xs text-slate-400">
              74% of raised funds
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Beneficiaries Assisted
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalBeneficiaries.toLocaleString("en-IN")}
            </p>

            <p className="mt-2 text-xs text-emerald-600">
              Growing weekly
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Relief Items Distributed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalDistribution}K
            </p>

            <p className="mt-2 text-xs text-blue-600">
              Across active campaigns
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              Funds Overview
            </h2>

            <div className="mt-6 space-y-5">
              {fundData.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold">
                      {item.label}
                    </span>

                    <span className="font-bold">
                      {item.value}%
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              Beneficiary Growth
            </h2>

            <div className="mt-6 flex h-56 items-end gap-4">
              {beneficiaryData.map((item) => {
                const height =
                  (item.value / 720) * 100;

                return (
                  <div
                    key={item.label}
                    className="flex flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-2 text-xs font-bold">
                      {item.value}
                    </span>

                    <div
                      className="w-full rounded-t-xl bg-blue-500"
                      style={{
                        height: `${height}%`,
                      }}
                    />

                    <span className="mt-2 text-xs text-slate-500">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              Relief Distribution
            </h2>

            <div className="mt-6 space-y-5">
              {distributionData.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold">
                      {item.label}
                    </span>

                    <span className="font-bold">
                      {item.value}K
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-emerald-500"
                      style={{
                        width: `${item.value}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              AI Risk Distribution
            </h2>

            <div className="mt-6 space-y-4">
              {riskData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <span className="font-bold">
                    {item.label}
                  </span>

                  <span className="text-xl font-bold">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                AI risk scores help auditors prioritize
                suspicious expenses. Final decisions remain
                with authorized human auditors.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">
            Campaign Performance
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Raised</th>
                  <th className="px-4 py-3">Spent</th>
                  <th className="px-4 py-3">Beneficiaries</th>
                  <th className="px-4 py-3">Audit</th>
                </tr>
              </thead>

              <tbody>
                {[
                  ["Assam Flood Relief", "₹32L", "₹21L", "420", "Verified"],
                  ["Odisha Cyclone Relief", "₹28L", "₹23L", "310", "Verified"],
                  ["Himachal Landslide Relief", "₹22L", "₹17L", "210", "Under Review"],
                ].map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4 font-semibold">
                      {row[0]}
                    </td>

                    <td className="px-4 py-4">
                      {row[1]}
                    </td>

                    <td className="px-4 py-4">
                      {row[2]}
                    </td>

                    <td className="px-4 py-4">
                      {row[3]}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        {row[4]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}