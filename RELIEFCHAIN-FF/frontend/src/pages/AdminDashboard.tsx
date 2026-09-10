import { useState } from "react";

type User = {
  id: string;
  name: string;
  role: string;
  organization: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
};

const initialUsers: User[] = [
  {
    id: "USR-001",
    name: "Rahul Sharma",
    role: "NGO",
    organization: "Assam Relief Foundation",
    status: "ACTIVE",
  },
  {
    id: "USR-002",
    name: "Aisha Khan",
    role: "VOLUNTEER",
    organization: "ReliefChain Volunteers",
    status: "ACTIVE",
  },
  {
    id: "USR-003",
    name: "Government Officer",
    role: "GOVERNMENT",
    organization: "State Disaster Authority",
    status: "ACTIVE",
  },
  {
    id: "USR-004",
    name: "Audit Officer",
    role: "AUDITOR",
    organization: "Independent Audit Cell",
    status: "PENDING",
  },
];

const logs = [
  "Campaign RC-1001 submitted for verification.",
  "Volunteer VOL-204 scanned batch BATCH-RC-2048.",
  "Expense INV-1008 requested additional evidence.",
  "Government emergency request ER-019 created.",
  "Blockchain transaction proof recorded.",
];

export default function AdminDashboard() {
  const [users, setUsers] =
    useState<User[]>(initialUsers);

  const updateStatus = (
    id: string,
    status: User["status"]
  ) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? { ...user, status }
          : user
      )
    );
  };

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const pendingUsers = users.filter(
    (user) => user.status === "PENDING"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            RELIEFCHAIN ADMINISTRATION
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage users, NGOs, campaigns, auditors and
            system activity.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              {users.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activeUsers}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Verification
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingUsers}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              System Status
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              OPERATIONAL
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  User Management
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review and control role access.
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">
                      Organization
                    </th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold">
                          {user.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {user.id}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {user.organization}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : user.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {user.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                user.id,
                                "ACTIVE"
                              )
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                user.id,
                                "SUSPENDED"
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              System Logs
            </h2>

            <div className="mt-5 space-y-3">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="rounded-xl border bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-700">
                    {log}
                  </p>

                  <p className="mt-2 text-[10px] uppercase text-slate-400">
                    Audit event · Recent
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-bold">
              NGO Management
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Review registered NGOs and verification
              status.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl border px-4 py-2 text-sm font-bold"
            >
              Manage NGOs
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-bold">
              Campaign Management
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Review campaign lifecycle and approvals.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl border px-4 py-2 text-sm font-bold"
            >
              Manage Campaigns
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-bold">
              Auditor Management
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Control auditor authorization and access.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl border px-4 py-2 text-sm font-bold"
            >
              Manage Auditors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}