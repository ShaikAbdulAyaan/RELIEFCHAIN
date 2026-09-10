import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  apiService,
  getApiErrorMessage,
} from "./services/api";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState<Mode>("signin");

  const [showPassword, setShowPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  /* ======================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (mode === "signup") {
      if (!cleanName) {
        setError("Please enter your full name.");
        return;
      }

      if (!cleanEmail) {
        setError("Please enter your email address.");
        return;
      }

      if (!password) {
        setError("Please enter a password.");
        return;
      }

      if (password.length < 6) {
        setError(
          "Password must contain at least 6 characters."
        );
        return;
      }

      try {
        setLoading(true);

        await apiService.register({
          name: cleanName,
          email: cleanEmail,
          password,
        });

        setMode("signin");
        setPassword("");

        setMessage(
          "Account created successfully. Please sign in."
        );
      } catch (error) {
        setError(
          getApiErrorMessage(error)
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    /* ====================================================
       SIGN IN
    ==================================================== */

    if (!cleanEmail || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await apiService.login({
          email: cleanEmail,
          password,
        });

      if (!result?.token) {
        throw new Error(
          "Login succeeded but no authentication token was returned."
        );
      }

      localStorage.setItem(
        "reliefchain-authenticated",
        "true"
      );

      localStorage.setItem(
        "reliefchain-user",
        JSON.stringify(result.user)
      );

      navigate("/workspace", {
        replace: true,
      });
    } catch (error) {
      setError(
        getApiErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">

        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <div className="hidden lg:flex bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 text-white p-12 flex-col justify-between">

          <div>

            <div className="flex items-center gap-3 mb-10">

              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>

              <div>

                <h1 className="text-2xl font-bold">
                  ReliefChain
                </h1>

                <p className="text-sm text-blue-200">
                  Transparent Disaster Relief
                </p>

              </div>

            </div>

            <h2 className="text-4xl font-bold leading-tight">

              Transparent relief.
              <br />
              Trusted impact.

            </h2>

            <p className="mt-6 text-blue-100 leading-relaxed max-w-md">

              Track donations, relief campaigns,
              expenses and impact through a
              transparent and trusted platform.

            </p>

            <div className="mt-8 space-y-3 text-sm text-blue-100">

              <div>✓ PostgreSQL-backed records</div>
              <div>✓ AI-assisted auditing</div>
              <div>✓ Blockchain transaction proofs</div>

            </div>

          </div>

          <p className="text-sm text-blue-200">
            Secure • Transparent • Accountable
          </p>

        </div>

        {/* =================================================
            RIGHT PANEL
        ================================================= */}

        <div className="p-8 sm:p-10">

          <h2 className="text-3xl font-bold text-slate-900">

            {mode === "signin"
              ? "Welcome back"
              : "Create your account"}

          </h2>

          <p className="text-slate-500 mt-2 mb-8">

            {mode === "signin"
              ? "Sign in to continue to ReliefChain."
              : "Create a real ReliefChain account."}

          </p>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">

              {message}

            </div>
          )}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">

              {error}

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}

            {mode === "signup" && (
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />

                </div>

              </div>
            )}

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                  autoComplete="email"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                  autoComplete={
                    mode === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  disabled={loading}
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
            >

              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}

              {!loading && (
                <ArrowRight size={18} />
              )}

            </button>

          </form>

          {/* =================================================
              MODE SWITCH
          ================================================= */}

          <div className="text-center mt-8 text-sm text-slate-500">

            {mode === "signin" ? (
              <>
                Don't have an account?{" "}

                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setMessage("");
                    setError("");
                    setPassword("");
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                  disabled={loading}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}

                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setMessage("");
                    setError("");
                    setPassword("");
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                  disabled={loading}
                >
                  Sign In
                </button>
              </>
            )}

          </div>

          <p className="text-center text-xs text-slate-400 mt-6">

            Authentication is connected to the
            RELIEFCHAIN backend.

          </p>

        </div>

      </div>

    </div>
  );
}