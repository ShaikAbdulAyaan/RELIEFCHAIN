import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ProtectedRole =
  | "ngo"
  | "volunteer"
  | "government"
  | "auditor"
  | "admin";

const roleInfo: Record<
  ProtectedRole,
  {
    title: string;
    icon: string;
    description: string;
    code: string;
  }
> = {
  ngo: {
    title: "NGO",
    icon: "🏢",
    description:
      "NGO workspace requires verified organizational identity and authorization.",
    code: "RC-NGO-2026",
  },

  volunteer: {
    title: "Volunteer",
    icon: "🤝",
    description:
      "Volunteer workspace requires verified identity and authorization.",
    code: "RC-VOL-2026",
  },

  government: {
    title: "Government",
    icon: "🏛️",
    description:
      "Government workspace requires authorized institutional access.",
    code: "RC-GOV-2026",
  },

  auditor: {
    title: "Auditor",
    icon: "🔍",
    description:
      "Auditor workspace requires authorized audit credentials.",
    code: "RC-AUD-2026",
  },

  admin: {
    title: "Admin",
    icon: "⚙️",
    description:
      "Admin workspace requires privileged ReliefChain authorization.",
    code: "RC-ADM-2026",
  },
};

export default function AuthorizationPage() {
  const { role } = useParams();
  const nav = useNavigate();

  const selectedRole = role as ProtectedRole;
  const info = roleInfo[selectedRole];

  const [method, setMethod] = useState<"code" | "employee">("code");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [officialId, setOfficialId] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  if (!info) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Invalid Role</h1>

          <button
            type="button"
            onClick={() => nav("/workspace")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold"
          >
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  const verifyCode = () => {
    setMessage("");
    setSuccess(false);

    if (code.trim() === info.code) {
      localStorage.setItem(
        `reliefchain-authorized-${selectedRole}`,
        "true"
      );

      setSuccess(true);
      setMessage(
        `${info.title} authorization successful. You can now enter the workspace.`
      );
    } else {
      setMessage("Invalid authorization code. Please try again.");
    }
  };

  const submitEmployeeVerification = () => {
    setMessage("");
    setSuccess(false);

    if (!name || !organization || !officialId || !officialEmail) {
      setMessage("Please complete all verification fields.");
      return;
    }

    setMessage(
      "Verification request submitted. An authorized ReliefChain administrator must review this request."
    );
  };

  const enterWorkspace = () => {
    nav(`/${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-5 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => nav("/workspace")}
          className="mb-8 text-sm font-semibold text-slate-400 hover:text-white"
        >
          ← Back to Workspace
        </button>

        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl">
              {info.icon}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                Protected Workspace
              </p>

              <h1 className="text-3xl font-bold">
                {info.title} Authorization
              </h1>
            </div>
          </div>

          <p className="mt-5 text-slate-400">
            {info.description}
          </p>

          {/* Method Selection */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">

            <button
              type="button"
              onClick={() => {
                setMethod("code");
                setMessage("");
                setSuccess(false);
              }}
              className={`rounded-xl border p-4 text-left transition ${
                method === "code"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700 bg-slate-950"
              }`}
            >
              <div className="text-xl">🔑</div>

              <div className="mt-2 font-bold">
                Authorized Access Code
              </div>

              <div className="mt-1 text-sm text-slate-400">
                For authorized ReliefChain personnel.
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod("employee");
                setMessage("");
                setSuccess(false);
              }}
              className={`rounded-xl border p-4 text-left transition ${
                method === "employee"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700 bg-slate-950"
              }`}
            >
              <div className="text-xl">🪪</div>

              <div className="mt-2 font-bold">
                Employee Verification
              </div>

              <div className="mt-1 text-sm text-slate-400">
                Submit official identity and organization details.
              </div>
            </button>

          </div>

          {/* CODE METHOD */}
          {method === "code" && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-6">

              <h2 className="text-xl font-bold">
                Enter Authorization Code
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Enter the code provided to authorized ReliefChain personnel.
              </p>

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter authorization code"
                className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={verifyCode}
                className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500"
              >
                Verify Authorization
              </button>

            </div>
          )}

          {/* EMPLOYEE METHOD */}
          {method === "employee" && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-6">

              <h2 className="text-xl font-bold">
                Employee Verification
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Submit your official details for authorization review.
              </p>

              <div className="mt-5 space-y-4">

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Organization / Department"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="text"
                  value={officialId}
                  onChange={(e) => setOfficialId(e.target.value)}
                  placeholder="Official ID / Employee ID"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="email"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="Official email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

              </div>

              <button
                type="button"
                onClick={submitEmployeeVerification}
                className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold hover:bg-emerald-500"
              >
                Submit Verification Request
              </button>

            </div>
          )}

          {/* MESSAGE */}
          {message && (
            <div
              className={`mt-6 rounded-xl border p-4 text-sm ${
                success
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* ENTER AFTER SUCCESS */}
          {success && (
            <button
              type="button"
              onClick={enterWorkspace}
              className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-4 font-bold hover:bg-emerald-500"
            >
              Enter {info.title} Workspace →
            </button>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          ReliefChain role-based authorization • Hackathon prototype
        </p>

      </div>
    </div>
  );
}