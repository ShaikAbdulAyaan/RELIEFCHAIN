import { useMemo } from "react";

type Expense = {
  id: string;
  description: string;
  amount: number;
  status: "VERIFIED" | "UNDER_REVIEW";
  proof: string;
};

const expenses: Expense[] = [
  {
    id: "EXP-001",
    description: "Drinking water",
    amount: 420000,
    status: "VERIFIED",
    proof: "0x8f31...a91c",
  },
  {
    id: "EXP-002",
    description: "Medical supplies",
    amount: 680000,
    status: "VERIFIED",
    proof: "0x91bc...c821",
  },
  {
    id: "EXP-003",
    description: "Temporary shelter",
    amount: 510000,
    status: "UNDER_REVIEW",
    proof: "Pending audit",
  },
];

export default function Transparency() {
  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + expense.amount,
        0
      ),
    []
  );

  const verifiedExpenses = expenses.filter(
    (expense) => expense.status === "VERIFIED"
  );

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-slate-900 p-7 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                PUBLIC VERIFICATION
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                ReliefChain Transparency
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Publicly inspect campaign funding, verified
                expenses, impact and blockchain proofs without
                exposing private beneficiary information.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <p className="text-xs text-slate-400">
                Campaign
              </p>

              <p className="mt-1 font-mono font-bold">
                RC-1001
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Funds Raised
            </p>

            <p className="mt-2 text-2xl font-bold">
              ₹32,00,000
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Funds Spent
            </p>

            <p className="mt-2 text-2xl font-bold">
              ₹{totalSpent.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Remaining
            </p>

            <p className="mt-2 text-2xl font-bold">
              ₹{(
                3200000 - totalSpent
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Beneficiaries
            </p>

            <p className="mt-2 text-2xl font-bold">
              420
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Anonymous aggregate count
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Verified Expenses
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Public audit trail for campaign spending.
                </p>
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {verifiedExpenses.length} VERIFIED
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-2xl border p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        {expense.id}
                      </p>

                      <h3 className="mt-1 font-bold">
                        {expense.description}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        ₹
                        {expense.amount.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        expense.status === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {expense.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Blockchain / Audit Proof
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-slate-600">
                      {expense.proof}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Campaign Impact
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">
                    People assisted
                  </span>

                  <strong>420</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">
                    Food kits
                  </span>

                  <strong>840</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">
                    Water units
                  </span>

                  <strong>1,240</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">
                    Medical kits
                  </span>

                  <strong>320</strong>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Audit Status
              </h2>

              <div className="mt-5 rounded-2xl bg-emerald-50 p-5">
                <p className="font-bold text-emerald-700">
                  Audit trail active
                </p>

                <p className="mt-2 text-sm text-emerald-700">
                  Verified records have corresponding
                  blockchain proof references.
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-blue-50 p-5">
                <p className="font-bold text-blue-700">
                  Privacy protected
                </p>

                <p className="mt-2 text-sm text-blue-700">
                  No private beneficiary identity information
                  is displayed publicly.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Verification Principle
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Blockchain provides a tamper-evident record of
                submitted proofs and transactions. It does not
                independently prove that an off-chain event is
                truthful.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}