import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

import {
  LifeBuoy,
  LayoutDashboard,
  HeartHandshake,
  Wallet,
  Users,
  Plus,
  Boxes,
  Truck,
  QrCode,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  FileCheck2,
  Activity,
  Bell,
  Menu,
  X,
  Search,
  CircleDollarSign,
  PackageCheck,
  ClipboardCheck,
  Globe2,
  CheckCircle2,
  Receipt,
  Heart,
  Droplets,
  Home,
  Stethoscope,
  TrendingUp,
  User,
  Mail,
  Phone,
  Building2,
  Save,
  Pencil,
  LogOut,
} from "lucide-react";

import AuthPage from "./AuthPage";
import AuthorizationPage from "./AuthorizationPage";
import DisasterMap from "./components/DisasterMap";
import Reports from "./pages/Reports";
import AdminDashboard from "./pages/AdminDashboard";
import TransparencyPage from "./pages/transparency";

type Role =
  | "donor"
  | "ngo"
  | "volunteer"
  | "government"
  | "auditor"
  | "admin";

type Donation = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  blockchainHash: string;
  date: string;
};

const campaigns = [
  {
    id: "RC-1001",
    title: "Assam Flood Relief 2026",
    location: "Dibrugarh, Assam",
    raised: 842000,
    target: 1200000,
    people: 4800,
    severity: "Critical",
  },
  {
    id: "RC-1002",
    title: "Himachal Landslide Response",
    location: "Mandi, Himachal Pradesh",
    raised: 615000,
    target: 900000,
    people: 2100,
    severity: "High",
  },
  {
    id: "RC-1003",
    title: "Odisha Cyclone Recovery",
    location: "Puri, Odisha",
    raised: 456000,
    target: 750000,
    people: 3300,
    severity: "High",
  },
];

const money = (n: number) =>
  "₹" + n.toLocaleString("en-IN");

const getDonations = (): Donation[] => {
  try {
    const saved = localStorage.getItem(
      "reliefchain-donations"
    );

    if (!saved) return [];

    return JSON.parse(saved);
  } catch {
    return [];
  }
};

const saveDonation = (donation: Donation) => {
  const existing = getDonations();

  localStorage.setItem(
    "reliefchain-donations",
    JSON.stringify([donation, ...existing])
  );
};

const nav: Record<
  Role,
  { name: string; path: string; icon: any }[]
> = {
  donor: [
    ["Dashboard", "/donor", LayoutDashboard],
    ["Campaigns", "/donor/campaigns", HeartHandshake],
    ["My Donations", "/donor/donations", Wallet],
    ["Impact", "/donor/impact", Activity],
    ["Profile", "/donor/profile", Users],
  ].map(([name, path, icon]) => ({
    name: String(name),
    path: String(path),
    icon,
  })),

  ngo: [
    ["Dashboard", "/ngo", LayoutDashboard],
    ["Create Campaign", "/ngo/campaign/create", Plus],
    ["My Campaigns", "/ngo/campaigns", HeartHandshake],
    ["Inventory", "/ngo/inventory", Boxes],
    ["Distribution", "/ngo/distribution", Truck],
    ["Invoice Tracking", "/ngo/invoices", Receipt],
  ].map(([name, path, icon]) => ({
    name: String(name),
    path: String(path),
    icon,
  })),

  volunteer: [
    ["Dashboard", "/volunteer", LayoutDashboard],
    ["Tasks", "/volunteer/tasks", ClipboardCheck],
    ["Scan QR", "/volunteer/scan", QrCode],
    ["Deliveries", "/volunteer/delivery", Truck],
    ["Distribution", "/volunteer/distribution", PackageCheck],
  ].map(([name, path, icon]) => ({
    name: String(name),
    path: String(path),
    icon,
  })),

  government: [
    ["Command Center", "/government", LayoutDashboard],
    ["Monitor", "/government/monitor", Activity],
    ["Disaster Map", "/government/map", MapPin],
    ["Emergency Requests", "/government/requests", AlertTriangle],
  ].map(([name, path, icon]) => ({
    name: String(name),
    path: String(path),
    icon,
  })),

  auditor: [
    ["Overview", "/auditor", LayoutDashboard],
    ["AI Monitor", "/auditor/monitor", AlertTriangle],
    ["Pending Reviews", "/auditor/pending", FileCheck2],
    ["Expenses", "/auditor/expenses", Wallet],
    ["Evidence", "/auditor/evidence", FileCheck2],
    ["Reviews", "/auditor/reviews", ClipboardCheck],
  ].map(([name, path, icon]) => ({
    name: String(name),
    path: String(path),
    icon,
  })),

  admin: [
    ["Dashboard", "/admin", LayoutDashboard],
    ["Users", "/admin/users", Users],
    ["NGOs", "/admin/ngos", ShieldCheck],
    ["Campaigns", "/admin/campaigns", HeartHandshake],
    ["Auditors", "/admin/auditors", FileCheck2],
    ["System Logs", "/admin/logs", Activity],
  ].map(([name, path, icon]) => ({
    name: String(name),
    path: String(path),
    icon,
  })),
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Icon size={20} />
        </div>

        <CheckCircle2
          size={17}
          className="text-emerald-500"
        />
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Layout({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-white transition lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b px-6">
          <div className="rounded-xl bg-blue-600 p-2 text-white">
            <LifeBuoy />
          </div>

          <b>ReliefChain</b>
        </div>

        <nav className="space-y-1 p-4">
          {nav[role].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                  loc.pathname === item.path
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}

          <Link
            to="/transparency/RC-1001"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600"
          >
            <Globe2 size={18} />
            Public Transparency
          </Link>
        </nav>

        <button
          onClick={() => navigate("/workspace")}
          className="absolute bottom-5 left-4 text-sm text-slate-500"
        >
          ← Switch role
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-white/90 px-5 backdrop-blur">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <span className="hidden text-sm capitalize text-slate-500 lg:block">
            {role} workspace
          </span>

          <div className="flex items-center gap-4">
            <Bell size={19} />

            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
              MM
            </div>
          </div>
        </header>

        <main className="p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Title({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {desc}
        </p>
      </div>

      {action}
    </div>
  );
}

function CampaignCard({
  c,
  onDonate,
  onDetails,
}: {
  c: any;
  onDonate?: () => void;
  onDetails?: () => void;
}) {
  const progress = Math.round(
    (c.raised / c.target) * 100
  );

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="flex h-24 justify-between bg-gradient-to-r from-blue-700 to-cyan-500 p-5 text-white">
        <b>{c.severity}</b>

        <span className="text-xs">
          {c.id}
        </span>
      </div>

      <div className="p-5">
        <button
          type="button"
          onClick={onDetails}
          className="text-left"
        >
          <b className="hover:text-blue-600">
            {c.title}
          </b>
        </button>

        <p className="mt-1 flex gap-1 text-xs text-slate-500">
          <MapPin size={13} />
          {c.location}
        </p>

        <div className="mt-4 flex justify-between text-xs">
          <b>{money(c.raised)}</b>

          <span>
            of {money(c.target)}
          </span>
        </div>

        <div className="mt-2 h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-blue-600"
            style={{
              width: progress + "%",
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {c.people.toLocaleString()} beneficiaries
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDetails}
              className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Details
            </button>

            <button
              type="button"
              onClick={onDonate}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Donate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Donor({
  campaignsPage = false,
}: {
  campaignsPage?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] =
    useState<any>(null);

  if (campaignsPage) {
    const filteredCampaigns =
      campaigns.filter((campaign) =>
        (
          campaign.title +
          campaign.location
        )
          .toLowerCase()
          .includes(search.toLowerCase())
      );

    return (
      <>
        <Title
          title="Browse Campaigns"
          desc="Discover verified disaster relief campaigns."
        />

        <div className="mb-6 flex max-w-xl items-center gap-2 rounded-xl border bg-white px-4 py-3">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            className="w-full outline-none"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search campaign or location"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCampaigns.map(
            (campaign) => (
              <CampaignCard
                key={campaign.id}
                c={campaign}
                onDetails={() =>
                  (window.location.href =
                    `/donor/campaign/${campaign.id}`)
                }
                onDonate={() =>
                  setSelectedCampaign(campaign)
                }
              />
            )
          )}
        </div>

        {selectedCampaign && (
          <DonationModal
            campaign={selectedCampaign}
            onClose={() =>
              setSelectedCampaign(null)
            }
          />
        )}
      </>
    );
  }

  return (
    <>
      <Title
        title="Donor Dashboard"
        desc="Track your contributions and verified impact."
        action={
          <button
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            onClick={() =>
              setSelectedCampaign(campaigns[0])
            }
          >
            Donate to a campaign
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          icon={CircleDollarSign}
          label="Total donated"
          value="₹17,500"
        />

        <Stat
          icon={Users}
          label="People supported"
          value="10,200+"
        />

        <Stat
          icon={ShieldCheck}
          label="Blockchain proofs"
          value="3"
        />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            c={campaign}
            onDetails={() =>
              (window.location.href =
                `/donor/campaign/${campaign.id}`)
            }
            onDonate={() =>
              setSelectedCampaign(campaign)
            }
          />
        ))}
      </div>

      {selectedCampaign && (
        <DonationModal
          campaign={selectedCampaign}
          onClose={() =>
            setSelectedCampaign(null)
          }
        />
      )}
    </>
  );
}

/* =========================
   CAMPAIGN DETAILS
========================= */

function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donateOpen, setDonateOpen] =
    useState(false);

  const campaign = campaigns.find(
    (item) => item.id === id
  );

  if (!campaign) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">
          Campaign not found
        </h1>

        <button
          type="button"
          onClick={() =>
            navigate("/donor/campaigns")
          }
          className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  const progress = Math.round(
    (campaign.raised / campaign.target) * 100
  );

  return (
    <>
      <button
        type="button"
        onClick={() =>
          navigate("/donor/campaigns")
        }
        className="mb-6 text-sm font-semibold text-blue-600"
      >
        ← Back to Campaigns
      </button>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="bg-gradient-to-r from-blue-700 to-cyan-500 p-8 text-white">
          <p className="text-sm text-blue-100">
            {campaign.id}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {campaign.title}
          </h1>

          <p className="mt-2 flex items-center gap-1 text-sm text-blue-100">
            <MapPin size={15} />
            {campaign.location}
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold">
              Campaign Overview
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              This verified disaster relief campaign is
              raising funds to support affected communities
              and provide essential relief resources.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Location
                </p>

                <p className="mt-1 font-semibold">
                  {campaign.location}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Beneficiaries
                </p>

                <p className="mt-1 font-semibold">
                  {campaign.people.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Severity
                </p>

                <p className="mt-1 font-semibold">
                  {campaign.severity}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Campaign ID
                </p>

                <p className="mt-1 font-mono font-semibold">
                  {campaign.id}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-bold">
              Funding Progress
            </h2>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Raised
                </p>

                <p className="text-2xl font-bold">
                  {money(campaign.raised)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">
                  Target
                </p>

                <p className="font-semibold">
                  {money(campaign.target)}
                </p>
              </div>
            </div>

            <div className="mt-5 h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-blue-600"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-sm text-slate-500">
              <span>
                {progress}% funded
              </span>

              <span>
                {money(
                  Math.max(
                    campaign.target -
                      campaign.raised,
                    0
                  )
                )}{" "}
                remaining
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setDonateOpen(true)
              }
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
            >
              Donate to this Campaign
            </button>
          </div>
        </div>

        <div className="border-t p-6">
          <h2 className="text-lg font-bold">
            Transparency & Verification
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <ShieldCheck className="text-emerald-600" />

              <p className="mt-3 font-semibold">
                Verified Campaign
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Campaign information is available for
                transparent review.
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <CircleDollarSign className="text-blue-600" />

              <p className="mt-3 font-semibold">
                Fund Tracking
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Contributions can be tracked through
                ReliefChain.
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <CheckCircle2 className="text-emerald-600" />

              <p className="mt-3 font-semibold">
                Blockchain Proof
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Blockchain proof will be attached to
                verified transactions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {donateOpen && (
        <DonationModal
          campaign={campaign}
          onClose={() =>
            setDonateOpen(false)
          }
        />
      )}
    </>
  );
}

/* =========================
   DONATION MODAL
========================= */

function DonationModal({
  campaign,
  onClose,
}: {
  campaign: any;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("5000");
  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [completedDonation, setCompletedDonation] =
    useState<Donation | null>(null);

  const donationAmount =
    Number(amount) || 0;

  const continueToPayment = () => {
    if (donationAmount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    setStep(2);
  };

  const completeDonation = () => {
    if (donationAmount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    const now = new Date();

    const newDonation: Donation = {
      id: "DON-" + Date.now(),
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      amount: donationAmount,
      paymentMethod,
      status: "SUCCESS",
      transactionId:
        "RC-TX-" +
        Math.floor(
          100000 + Math.random() * 900000
        ),
      blockchainHash:
        "0x" +
        Math.random()
          .toString(16)
          .substring(2, 18) +
        "91cd",
      date: now.toLocaleDateString("en-IN"),
    };

    saveDonation(newDonation);

    setCompletedDonation(newDonation);

    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-bold">
              Make a Donation
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {campaign.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 font-bold text-white">
                1
              </div>

              <div>
                <p className="font-bold">
                  Donation Amount
                </p>

                <p className="text-xs text-slate-500">
                  Choose how much you want to contribute.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">
                Campaign
              </p>

              <p className="mt-1 font-bold">
                {campaign.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {campaign.location}
              </p>
            </div>

            <label className="mt-6 block text-sm font-semibold">
              Donation Amount

              <div className="mt-2 flex items-center rounded-xl border">
                <span className="px-4 text-lg font-bold text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  className="w-full rounded-xl p-4 text-lg font-semibold outline-none"
                  placeholder="5000"
                />
              </div>
            </label>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {["1000", "5000", "10000"].map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setAmount(value)
                    }
                    className="rounded-xl border p-3 text-sm font-semibold hover:border-blue-500 hover:bg-blue-50"
                  >
                    ₹
                    {Number(value).toLocaleString(
                      "en-IN"
                    )}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={continueToPayment}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
            >
              Continue to Payment →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 font-bold text-white">
                2
              </div>

              <div>
                <p className="font-bold">
                  Payment Method
                </p>

                <p className="text-xs text-slate-500">
                  Select your preferred payment method.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-sm text-blue-700">
                Donation Amount
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-900">
                {money(donationAmount)}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {[
                [
                  "UPI",
                  "📱",
                  "Google Pay • PhonePe • Paytm",
                ],
                [
                  "Card",
                  "💳",
                  "Credit / Debit Card",
                ],
                [
                  "Net Banking",
                  "🏦",
                  "Secure bank transfer",
                ],
                [
                  "Wallet",
                  "👛",
                  "Digital wallet",
                ],
              ].map(
                ([method, icon, description]) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() =>
                      setPaymentMethod(method)
                    }
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left ${
                      paymentMethod === method
                        ? "border-blue-600 bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl">
                      {icon}
                    </span>

                    <div>
                      <p className="font-semibold">
                        {method}
                      </p>

                      <p className="text-xs text-slate-500">
                        {description}
                      </p>
                    </div>

                    {paymentMethod === method && (
                      <CheckCircle2 className="ml-auto text-blue-600" />
                    )}
                  </button>
                )
              )}
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-700">
                <b>Demo Payment:</b> No real money will
                be charged. This simulates the ReliefChain
                donation process.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-xl border px-4 py-3 font-semibold"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={completeDonation}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
              >
                Simulate Payment
              </button>
            </div>
          </div>
        )}

        {step === 3 &&
          completedDonation && (
            <div className="p-6">
              <div className="py-5 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
                  <CheckCircle2
                    size={48}
                    className="text-emerald-600"
                  />
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                  Donation Successful!
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Your donation has been recorded
                  successfully.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border bg-slate-50 p-5">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Campaign
                  </span>

                  <span className="text-right text-sm font-semibold">
                    {completedDonation.campaignTitle}
                  </span>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="text-sm text-slate-500">
                    Amount
                  </span>

                  <span className="font-bold">
                    {money(
                      completedDonation.amount
                    )}
                  </span>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="text-sm text-slate-500">
                    Payment Method
                  </span>

                  <span className="font-semibold">
                    {
                      completedDonation.paymentMethod
                    }
                  </span>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    SUCCESS
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={20}
                    className="text-blue-600"
                  />

                  <p className="font-bold text-blue-900">
                    Blockchain Transaction
                  </p>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Transaction Hash
                </p>

                <p className="mt-1 break-all rounded-lg bg-white p-3 font-mono text-xs text-blue-700">
                  {
                    completedDonation.blockchainHash
                  }
                </p>

                <p className="mt-3 text-xs text-blue-700">
                  ✓ Transaction proof generated
                </p>
              </div>

              <div className="mt-4 rounded-2xl border p-5">
                <div className="flex items-center gap-2">
                  <Receipt
                    size={19}
                    className="text-blue-600"
                  />

                  <p className="font-bold">
                    Donation Receipt
                  </p>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Transaction ID
                    </span>

                    <span className="font-mono text-xs">
                      {
                        completedDonation.transactionId
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Campaign ID
                    </span>

                    <span className="font-mono text-xs">
                      {
                        completedDonation.campaignId
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Date
                    </span>

                    <span>
                      {completedDonation.date}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
              >
                Done
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

/* =========================
   DONATION HISTORY
========================= */

function DonationHistory() {
  const navigate = useNavigate();

  const [donations] = useState<Donation[]>(
    getDonations()
  );

  const total = donations.reduce(
    (sum, donation) =>
      sum + donation.amount,
    0
  );

  return (
    <>
      <Title
        title="My Donations"
        desc="View your contribution history and blockchain receipts."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          icon={CircleDollarSign}
          label="Total donated"
          value={money(total)}
        />

        <Stat
          icon={HeartHandshake}
          label="Campaigns supported"
          value={String(
            new Set(
              donations.map(
                (donation) =>
                  donation.campaignId
              )
            ).size
          )}
        />

        <Stat
          icon={ShieldCheck}
          label="Blockchain proofs"
          value={String(donations.length)}
        />
      </div>

      {donations.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-10 text-center">
          <Wallet
            size={48}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-bold">
            No donations yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your completed donations will appear here.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/donor/campaigns")
            }
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
          >
            Browse Campaigns
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-4">
                    Transaction
                  </th>

                  <th className="px-5 py-4">
                    Campaign
                  </th>

                  <th className="px-5 py-4">
                    Amount
                  </th>

                  <th className="px-5 py-4">
                    Payment
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {donations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="border-t"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold">
                        {donation.transactionId}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {donation.date}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {donation.campaignTitle}
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {money(donation.amount)}
                    </td>

                    <td className="px-5 py-4">
                      {donation.paymentMethod}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {donation.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/donor/donation/${donation.id}`
                          )
                        }
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================
   DONATION DETAILS
========================= */

function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const donation = getDonations().find(
    (item) => item.id === id
  );

  if (!donation) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <FileCheck2
          size={50}
          className="mx-auto text-slate-300"
        />

        <h1 className="mt-4 text-2xl font-bold">
          Donation not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          This donation record could not be found.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/donor/donations")
          }
          className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
        >
          Back to My Donations
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          navigate("/donor/donations")
        }
        className="mb-6 text-sm font-semibold text-blue-600"
      >
        ← Back to My Donations
      </button>

      <Title
        title="Donation Details"
        desc="Complete transaction and blockchain verification record."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Donation ID
              </p>

              <p className="mt-1 font-mono font-semibold">
                {donation.id}
              </p>
            </div>

            <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700">
              ✓ {donation.status}
            </span>
          </div>

          <div className="mt-8">
            <p className="text-sm text-slate-500">
              Campaign
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {donation.campaignTitle}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Campaign ID: {donation.campaignId}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Donation Amount
              </p>

              <p className="mt-1 text-2xl font-bold">
                {money(donation.amount)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Payment Method
              </p>

              <p className="mt-1 text-lg font-bold">
                {donation.paymentMethod}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Transaction Date
              </p>

              <p className="mt-1 font-bold">
                {donation.date}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Transaction ID
              </p>

              <p className="mt-1 break-all font-mono text-sm font-bold">
                {donation.transactionId}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ShieldCheck />
            </div>

            <div>
              <p className="font-bold">
                Blockchain Verified
              </p>

              <p className="text-xs text-slate-500">
                Tamper-evident proof
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Blockchain Transaction Hash
          </p>

          <div className="mt-2 rounded-xl bg-slate-950 p-4">
            <code className="break-all text-xs text-blue-300">
              {donation.blockchainHash}
            </code>
          </div>

          <div className="mt-5 rounded-xl bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">
              ✓ Transaction proof generated
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              This donation has a blockchain reference for
              transparency verification.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <Receipt className="text-blue-600" />

          <h2 className="text-xl font-bold">
            Donation Receipt
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">
              Donor
            </p>

            <p className="mt-1 font-semibold">
              ReliefChain Donor
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Campaign
            </p>

            <p className="mt-1 font-semibold">
              {donation.campaignTitle}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Amount
            </p>

            <p className="mt-1 font-semibold">
              {money(donation.amount)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Payment
            </p>

            <p className="mt-1 font-semibold">
              {donation.paymentMethod}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            alert(
              `Receipt generated for ${donation.transactionId}`
            )
          }
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
        >
          Generate Receipt
        </button>
      </div>
    </>
  );
}

/* =========================
   DONOR IMPACT
========================= */

function DonorImpact() {
  const donations = getDonations();

  const successfulDonations =
    donations.filter(
      (donation) =>
        donation.status === "SUCCESS"
    );

  const totalDonated =
    successfulDonations.reduce(
      (sum, donation) =>
        sum + donation.amount,
      0
    );

  const campaignCount = new Set(
    successfulDonations.map(
      (donation) =>
        donation.campaignId
    )
  ).size;

  const peopleSupported =
    Math.floor(totalDonated / 250);

  const foodMeals =
    Math.floor(totalDonated / 50);

  const medicalSupport =
    Math.floor(totalDonated / 500);

  const shelterSupport =
    Math.floor(totalDonated / 1000);

  const waterUnits =
    Math.floor(totalDonated / 25);

  const campaignTotals =
    campaigns.map((campaign) => {
      const amount =
        successfulDonations
          .filter(
            (donation) =>
              donation.campaignId ===
              campaign.id
          )
          .reduce(
            (sum, donation) =>
              sum + donation.amount,
            0
          );

      return {
        ...campaign,
        donated: amount,
      };
    });

  const maxCampaignDonation = Math.max(
    ...campaignTotals.map(
      (campaign) => campaign.donated
    ),
    1
  );

  return (
    <>
      <Title
        title="My Impact"
        desc="See how your contributions are supporting disaster relief."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          icon={CircleDollarSign}
          label="Total contribution"
          value={money(totalDonated)}
        />

        <Stat
          icon={Users}
          label="People supported"
          value={peopleSupported.toLocaleString(
            "en-IN"
          )}
        />

        <Stat
          icon={HeartHandshake}
          label="Campaigns supported"
          value={String(campaignCount)}
        />

        <Stat
          icon={ShieldCheck}
          label="Verified donations"
          value={String(
            successfulDonations.length
          )}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-7 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
              Your contribution matters
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Every verified donation creates measurable impact.
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-100">
              ReliefChain connects your contribution with
              transparent campaign records and blockchain
              transaction proofs.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
            <Heart
              size={40}
              className="mx-auto"
            />

            <p className="mt-3 text-3xl font-bold">
              {money(totalDonated)}
            </p>

            <p className="text-sm text-blue-100">
              contributed
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold">
          Estimated Relief Impact
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Prototype impact estimates based on your verified
          contributions.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5">
            <div className="w-fit rounded-xl bg-orange-50 p-3 text-orange-600">
              <HeartHandshake />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Food & Meals
            </p>

            <p className="mt-1 text-2xl font-bold">
              {foodMeals.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              estimated meal support
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="w-fit rounded-xl bg-red-50 p-3 text-red-600">
              <Stethoscope />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Medical Support
            </p>

            <p className="mt-1 text-2xl font-bold">
              {medicalSupport.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              estimated support units
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="w-fit rounded-xl bg-blue-50 p-3 text-blue-600">
              <Droplets />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Clean Water
            </p>

            <p className="mt-1 text-2xl font-bold">
              {waterUnits.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              estimated water units
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="w-fit rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Home />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Shelter Support
            </p>

            <p className="mt-1 text-2xl font-bold">
              {shelterSupport.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              estimated shelter units
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-blue-600" />

          <div>
            <h2 className="font-bold">
              Campaign-wise Contribution
            </h2>

            <p className="text-sm text-slate-500">
              See where your donations were directed.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {campaignTotals.map(
            (campaign) => {
              const percentage = Math.round(
                (campaign.donated /
                  maxCampaignDonation) *
                  100
              );

              return (
                <div key={campaign.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {campaign.title}
                      </p>

                      <p className="text-xs text-slate-500">
                        {campaign.location}
                      </p>
                    </div>

                    <p className="font-bold">
                      {money(
                        campaign.donated
                      )}
                    </p>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-blue-600"
                      style={{
                        width:
                          percentage + "%",
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <ShieldCheck />
            </div>

            <div>
              <h2 className="font-bold">
                Blockchain Verification
              </h2>

              <p className="text-sm text-slate-500">
                Your successful donations have blockchain
                transaction references.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
            <p className="text-xl font-bold text-emerald-700">
              {successfulDonations.length}
            </p>

            <p className="text-xs text-emerald-600">
              verified proofs
            </p>
          </div>
        </div>

        {successfulDonations.length > 0 ? (
          <div className="mt-6 space-y-3">
            {successfulDonations
              .slice(0, 5)
              .map((donation) => (
                <div
                  key={donation.id}
                  className="rounded-xl border bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">
                        {donation.campaignTitle}
                      </p>

                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {
                          donation.transactionId
                        }
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-bold">
                        {money(
                          donation.amount
                        )}
                      </p>

                      <p className="mt-1 break-all font-mono text-xs text-blue-600">
                        {
                          donation.blockchainHash
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
            <ShieldCheck
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold">
              No blockchain proofs yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Complete a donation to generate a demo
              blockchain proof.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

/* =========================
   DONOR PROFILE
========================= */

function DonorProfile() {
  const savedUser = (() => {
    try {
      const user =
        localStorage.getItem(
          "reliefchain-user"
        );

      return user
        ? JSON.parse(user)
        : null;
    } catch {
      return null;
    }
  })();

  const donations = getDonations();

  const [editing, setEditing] =
    useState(false);

  const [name, setName] = useState(
    savedUser?.name || "Mohammed Maroof"
  );

  const [email, setEmail] = useState(
    savedUser?.email ||
      "donor@reliefchain.demo"
  );

  const [phone, setPhone] = useState(
    savedUser?.phone ||
      "+91 98765 43210"
  );

  const [organization, setOrganization] =
    useState(
      savedUser?.organization ||
        "Independent Donor"
    );

  const totalDonated =
    donations.reduce(
      (sum, donation) =>
        sum + donation.amount,
      0
    );

  const saveProfile = () => {
    const existingUser =
      savedUser || {};

    localStorage.setItem(
      "reliefchain-user",
      JSON.stringify({
        ...existingUser,
        name,
        email,
        phone,
        organization,
      })
    );

    setEditing(false);

    alert("Profile updated successfully.");
  };

  return (
    <>
      <Title
        title="My Profile"
        desc="Manage your ReliefChain donor account and personal information."
        action={
          !editing ? (
            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={saveProfile}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
            >
              <Save size={16} />
              Save Changes
            </button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* PROFILE CARD */}

        <div className="rounded-2xl border bg-white p-6">
          <div className="text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-3xl font-bold text-white">
              {name
                .split(" ")
                .map((part: string) =>
                  part[0]
                )
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <h2 className="mt-4 text-xl font-bold">
              {name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Donor
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={15} />
              Verified Account
            </div>
          </div>

          <div className="mt-7 border-t pt-5">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={18}
                className="text-blue-600"
              />

              <div>
                <p className="text-sm font-semibold">
                  Account Security
                </p>

                <p className="text-xs text-slate-500">
                  Your account is protected.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-emerald-600"
              />

              <div>
                <p className="text-sm font-semibold">
                  Email Verified
                </p>

                <p className="text-xs text-slate-500">
                  Email verification completed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}

        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <User size={20} />
            </div>

            <div>
              <h2 className="font-bold">
                Personal Information
              </h2>

              <p className="text-sm text-slate-500">
                Your account details.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold">
              Full Name

              <div className="relative mt-2">
                <User
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  value={name}
                  disabled={!editing}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className={`w-full rounded-xl border py-3 pl-10 pr-3 outline-none ${
                    editing
                      ? "bg-white focus:border-blue-500"
                      : "bg-slate-50"
                  }`}
                />
              </div>
            </label>

            <label className="block text-sm font-semibold">
              Email Address

              <div className="relative mt-2">
                <Mail
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  value={email}
                  disabled={!editing}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className={`w-full rounded-xl border py-3 pl-10 pr-3 outline-none ${
                    editing
                      ? "bg-white focus:border-blue-500"
                      : "bg-slate-50"
                  }`}
                />
              </div>
            </label>

            <label className="block text-sm font-semibold">
              Phone Number

              <div className="relative mt-2">
                <Phone
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  value={phone}
                  disabled={!editing}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  className={`w-full rounded-xl border py-3 pl-10 pr-3 outline-none ${
                    editing
                      ? "bg-white focus:border-blue-500"
                      : "bg-slate-50"
                  }`}
                />
              </div>
            </label>

            <label className="block text-sm font-semibold">
              Organization

              <div className="relative mt-2">
                <Building2
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  value={organization}
                  disabled={!editing}
                  onChange={(e) =>
                    setOrganization(
                      e.target.value
                    )
                  }
                  className={`w-full rounded-xl border py-3 pl-10 pr-3 outline-none ${
                    editing
                      ? "bg-white focus:border-blue-500"
                      : "bg-slate-50"
                  }`}
                />
              </div>
            </label>
          </div>

          {editing && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">
                Editing Profile
              </p>

              <p className="mt-1 text-xs text-blue-600">
                Update your information and click
                "Save Changes" to store it.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DONOR STATISTICS */}

      <div className="mt-6">
        <h2 className="text-xl font-bold">
          Donation Statistics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your contribution activity on ReliefChain.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Stat
            icon={CircleDollarSign}
            label="Total donated"
            value={money(totalDonated)}
          />

          <Stat
            icon={HeartHandshake}
            label="Donations made"
            value={String(
              donations.length
            )}
          />

          <Stat
            icon={Users}
            label="Campaigns supported"
            value={String(
              new Set(
                donations.map(
                  (donation) =>
                    donation.campaignId
                )
              ).size
            )}
          />

          <Stat
            icon={ShieldCheck}
            label="Verified transactions"
            value={String(
              donations.filter(
                (donation) =>
                  donation.status ===
                  "SUCCESS"
              ).length
            )}
          />
        </div>
      </div>

      {/* ACCOUNT INFORMATION */}

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-3">
            <ShieldCheck />
          </div>

          <div>
            <h2 className="font-bold">
              ReliefChain Account
            </h2>

            <p className="text-sm text-slate-500">
              Account and platform information.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">
              Account Type
            </p>

            <p className="mt-1 font-semibold">
              Donor
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Access
            </p>

            <p className="mt-1 font-semibold">
              Public Donor Access
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Verification
            </p>

            <p className="mt-1 flex items-center gap-2 font-semibold text-emerald-600">
              <CheckCircle2 size={16} />
              Verified
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================
   GENERIC TABLE
========================= */

function Table({
  title,
  desc,
  items,
}: {
  title: string;
  desc: string;
  items: string[];
}) {
  return (
    <>
      <Title title={title} desc={desc} />

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-4">
                ID
              </th>

              <th className="px-5 py-4">
                Record
              </th>

              <th className="px-5 py-4">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr
                className="border-t"
                key={item}
              >
                <td className="px-5 py-4 font-mono text-xs">
                  RC-{2000 + index}
                </td>

                <td className="px-5 py-4 font-semibold">
                  {item}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* =========================
   DASHBOARDS
========================= */

function Dashboard({
  role,
}: {
  role: Role;
}) {
  if (role === "donor") {
    return <Donor />;
  }

  if (role === "ngo") {
    const ngoCampaigns = [
      { id: "NGO-1001", title: "Assam Flood Relief 2026", location: "Dibrugarh, Assam", status: "ACTIVE", raised: 842000, target: 1200000, spent: 576000, beneficiaries: 4800 },
      { id: "NGO-1002", title: "Himachal Landslide Response", location: "Mandi, Himachal Pradesh", status: "ACTIVE", raised: 615000, target: 900000, spent: 318000, beneficiaries: 2100 },
      { id: "NGO-1003", title: "Odisha Cyclone Recovery", location: "Puri, Odisha", status: "UNDER_REVIEW", raised: 456000, target: 750000, spent: 246000, beneficiaries: 3300 },
    ];
    const totalRaised = ngoCampaigns.reduce((s,c)=>s+c.raised,0);
    const totalSpent = ngoCampaigns.reduce((s,c)=>s+c.spent,0);
    const totalTarget = ngoCampaigns.reduce((s,c)=>s+c.target,0);
    const totalBeneficiaries = ngoCampaigns.reduce((s,c)=>s+c.beneficiaries,0);
    const remainingFunds = totalRaised-totalSpent;
    const overallProgress = Math.round((totalRaised/totalTarget)*100);
    return (<>
      <Title title="NGO Dashboard" desc="Manage campaigns, funds and relief operations." action={<button type="button" onClick={()=>window.location.href="/ngo/campaign/create"} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"><Plus size={17}/>Create Campaign</button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat icon={HeartHandshake} label="Active campaigns" value={String(ngoCampaigns.filter(c=>c.status==="ACTIVE").length)} />
        <Stat icon={CircleDollarSign} label="Total raised" value={money(totalRaised)} />
        <Stat icon={Wallet} label="Total spent" value={money(totalSpent)} />
        <Stat icon={CircleDollarSign} label="Remaining funds" value={money(remainingFunds)} />
        <Stat icon={Users} label="Beneficiaries" value={totalBeneficiaries.toLocaleString("en-IN")} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Campaign Performance</h2><p className="mt-1 text-sm text-slate-500">Track fundraising progress across your campaigns.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{overallProgress}% overall funded</span></div>
          <div className="mt-6 space-y-6">{ngoCampaigns.map(c=>{const progress=Math.min(Math.round((c.raised/c.target)*100),100); return <div key={c.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">{c.title}</p><p className="mt-1 text-xs text-slate-500">{c.location} • {c.id}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${c.status==="ACTIVE"?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{c.status}</span></div>
            <div className="mt-3 flex justify-between text-xs"><span className="font-semibold">{money(c.raised)}</span><span className="text-slate-500">Target {money(c.target)}</span></div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-blue-600" style={{width:`${progress}%`}} /></div>
            <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{progress}% funded</span><span>{money(c.spent)} spent • {c.beneficiaries.toLocaleString("en-IN")} beneficiaries</span></div>
          </div>})}</div>
        </div>
        <div className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-3 text-amber-600"><AlertTriangle/></div><div><h2 className="font-bold">AI Risk Alerts</h2><p className="text-xs text-slate-500">Automated monitoring insights.</p></div></div>
          <div className="mt-5 space-y-3"><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold text-amber-900">MEDIUM RISK</p><span className="text-xs font-bold text-amber-700">56/100</span></div><p className="mt-2 text-xs leading-5 text-amber-800">Transport expense is 34% above the campaign baseline.</p></div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold text-emerald-900">LOW RISK</p><span className="text-xs font-bold text-emerald-700">18/100</span></div><p className="mt-2 text-xs leading-5 text-emerald-800">Campaign spending is currently within the expected range.</p></div>
          <button type="button" onClick={()=>window.location.href="/ngo/inventory"} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">View Inventory →</button></div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Wallet/></div><div><p className="text-sm text-slate-500">Fund utilization</p><p className="text-2xl font-bold">{totalRaised>0?Math.round(totalSpent/totalRaised*100):0}%</p></div></div><p className="mt-4 text-xs text-slate-500">Total spending compared with funds raised.</p></div>
        <div className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><PackageCheck/></div><div><p className="text-sm text-slate-500">Relief operations</p><p className="text-2xl font-bold">1,248</p></div></div><p className="mt-4 text-xs text-slate-500">Relief item batches currently tracked.</p></div>
        <div className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-purple-50 p-3 text-purple-600"><ClipboardCheck/></div><div><p className="text-sm text-slate-500">Pending expenses</p><p className="text-2xl font-bold">14</p></div></div><p className="mt-4 text-xs text-slate-500">Expenses awaiting evidence or verification.</p></div>
      </div>
      <div className="mt-6 rounded-2xl border bg-white p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Quick Actions</h2><p className="mt-1 text-sm text-slate-500">Continue managing your relief operations.</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={()=>window.location.href="/ngo/campaign/create"} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">+ New Campaign</button><button type="button" onClick={()=>window.location.href="/ngo/campaigns"} className="rounded-xl border px-4 py-3 text-sm font-semibold">Manage Campaigns</button><button type="button" onClick={()=>window.location.href="/ngo/distribution"} className="rounded-xl border px-4 py-3 text-sm font-semibold">Track Distribution</button></div></div></div>
    </>);
  }

  if (role === "volunteer") {
    return (
      <>
        <Title
          title="Volunteer Dashboard"
          desc="Your assigned field operations."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Stat
            icon={ClipboardCheck}
            label="Assigned tasks"
            value="12"
          />

          <Stat
            icon={Truck}
            label="Deliveries completed"
            value="28"
          />

          <Stat
            icon={QrCode}
            label="Verified scans"
            value="76"
          />
        </div>
      </>
    );
  }

  if (role === "government") {
    return (
      <>
        <Title
          title="Government Command Center"
          desc="Operational overview across disaster relief activity."
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Stat
            icon={AlertTriangle}
            label="Active disasters"
            value="8"
          />

          <Stat
            icon={CircleDollarSign}
            label="Funds tracked"
            value="₹8.42Cr"
          />

          <Stat
            icon={Users}
            label="People assisted"
            value="2.8L"
          />

          <Stat
            icon={Boxes}
            label="Relief items"
            value="1.24L"
          />
        </div>

        <div className="mt-6 grid h-80 place-items-center rounded-2xl bg-slate-900 text-white">
          <div className="text-center">
            <MapPin
              size={50}
              className="mx-auto text-blue-400"
            />

            <b>
              Interactive disaster map placeholder
            </b>
          </div>
        </div>
      </>
    );
  }

  if (role === "auditor") {
    return (
      <>
        <Title
          title="Auditor Dashboard"
          desc="Review expenses, evidence and blockchain proofs."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Stat
            icon={FileCheck2}
            label="Pending reviews"
            value="24"
          />

          <Stat
            icon={ShieldCheck}
            label="Verified expenses"
            value="1,842"
          />

          <Stat
            icon={AlertTriangle}
            label="Flagged records"
            value="17"
          />
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6">
          <h2 className="font-bold">
            Pending verification
          </h2>

          <div className="mt-4 space-y-3">
            {[
              "Transport — ₹18,500 — no receipt",
              "Medical supplies — ₹42,000",
              "Food distribution — ₹27,600",
            ].map((item) => (
              <div
                key={item}
                className="flex justify-between rounded-xl border p-4"
              >
                <span>{item}</span>

                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                  VERIFY
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Title
        title="Admin Dashboard"
        desc="Platform governance and system activity."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          icon={Users}
          label="Users"
          value="12,840"
        />

        <Stat
          icon={ShieldCheck}
          label="Verified NGOs"
          value="284"
        />

        <Stat
          icon={HeartHandshake}
          label="Campaigns"
          value="1,204"
        />

        <Stat
          icon={Activity}
          label="System health"
          value="99.9%"
        />
      </div>
    </>
  );
}

/* =========================
   NGO INVENTORY MANAGEMENT
========================= */

type InventoryBatch = {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  status: "IN_WAREHOUSE" | "IN_TRANSIT" | "DELIVERED" | "LOW_STOCK";
  campaignId: string;
  createdAt: string;
  updatedAt: string;
};

const defaultInventory: InventoryBatch[] = [
  {
    id: "BATCH-RC-2048",
    item: "Food & Water Kits",
    quantity: 2400,
    unit: "kits",
    origin: "Guwahati Warehouse",
    destination: "Camp A, Dibrugarh",
    status: "IN_TRANSIT",
    campaignId: "RC-1001",
    createdAt: "2026-09-08",
    updatedAt: "2026-09-09",
  },
  {
    id: "BATCH-RC-2049",
    item: "Medical Kits",
    quantity: 850,
    unit: "kits",
    origin: "Guwahati Medical Store",
    destination: "Camp B, Dibrugarh",
    status: "IN_WAREHOUSE",
    campaignId: "RC-1001",
    createdAt: "2026-09-07",
    updatedAt: "2026-09-09",
  },
  {
    id: "BATCH-RC-2050",
    item: "Shelter Kits",
    quantity: 420,
    unit: "kits",
    origin: "Guwahati Warehouse",
    destination: "Mandi Relief Camp",
    status: "DELIVERED",
    campaignId: "RC-1002",
    createdAt: "2026-09-05",
    updatedAt: "2026-09-08",
  },
];

function getInventory(): InventoryBatch[] {
  try {
    const saved = localStorage.getItem("reliefchain-ngo-inventory");
    if (!saved) {
      localStorage.setItem(
        "reliefchain-ngo-inventory",
        JSON.stringify(defaultInventory)
      );
      return defaultInventory;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultInventory;
  } catch {
    return defaultInventory;
  }
}

function NgoInventory() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    item: "",
    quantity: "",
    unit: "kits",
    origin: "",
    destination: "",
    campaignId: "",
    status: "IN_WAREHOUSE" as InventoryBatch["status"],
  });

  useEffect(() => {
    setBatches(getInventory());
  }, []);

  const persist = (next: InventoryBatch[]) => {
    setBatches(next);
    localStorage.setItem("reliefchain-ngo-inventory", JSON.stringify(next));
  };

  const addBatch = () => {
    if (
      !form.item.trim() ||
      !form.quantity ||
      Number(form.quantity) <= 0 ||
      !form.origin.trim() ||
      !form.destination.trim()
    ) {
      setMessage("Please complete item, quantity, origin and destination.");
      return;
    }

    const now = new Date().toISOString();
    const batch: InventoryBatch = {
      id: `BATCH-RC-${Math.floor(3000 + Math.random() * 6000)}`,
      item: form.item.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      status: form.status,
      campaignId: form.campaignId.trim() || "UNASSIGNED",
      createdAt: now.slice(0, 10),
      updatedAt: now.slice(0, 10),
    };

    persist([batch, ...batches]);
    setForm({
      item: "",
      quantity: "",
      unit: "kits",
      origin: "",
      destination: "",
      campaignId: "",
      status: "IN_WAREHOUSE",
    });
    setShowForm(false);
    setMessage(`Inventory batch ${batch.id} created successfully.`);
  };

  const updateStatus = (id: string, nextStatus: InventoryBatch["status"]) => {
    const next = batches.map((batch) =>
      batch.id === id
        ? { ...batch, status: nextStatus, updatedAt: new Date().toISOString().slice(0, 10) }
        : batch
    );
    persist(next);
    setSelectedBatch((current) =>
      current && current.id === id
        ? { ...current, status: nextStatus }
        : current
    );
    setMessage(`Batch ${id} status updated to ${nextStatus.replace(/_/g, " ")}.`);
  };

  const filtered = batches.filter((batch) => {
    const haystack = `${batch.id} ${batch.item} ${batch.origin} ${batch.destination} ${batch.campaignId}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuantity = batches.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0);
  const delivered = batches.filter((batch) => batch.status === "DELIVERED").length;
  const inTransit = batches.filter((batch) => batch.status === "IN_TRANSIT").length;
  const lowStock = batches.filter((batch) => batch.status === "LOW_STOCK").length;

  const statusClass = (value: string) => {
    switch (value) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_TRANSIT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "LOW_STOCK":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <>
      <Title
        title="Inventory Management"
        desc="Track relief batches from origin to destination with QR-ready batch records."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/ngo/distribution")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Distribution
            </button>
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={17} />
              Add Batch
            </button>
          </div>
        }
      />

      {message && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")} className="font-bold">×</button>
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Create Inventory Batch</h2>
              <p className="mt-1 text-sm text-slate-500">Register relief stock before it moves into distribution.</p>
            </div>
            <Boxes className="text-blue-600" />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-semibold">Item
              <input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="Food kits" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-blue-500" />
            </label>
            <label className="text-sm font-semibold">Quantity
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="500" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-blue-500" />
            </label>
            <label className="text-sm font-semibold">Unit
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-blue-500">
                <option>kits</option><option>boxes</option><option>kg</option><option>litres</option><option>units</option>
              </select>
            </label>
            <label className="text-sm font-semibold">Origin
              <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Guwahati Warehouse" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-blue-500" />
            </label>
            <label className="text-sm font-semibold">Destination
              <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Camp A, Dibrugarh" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-blue-500" />
            </label>
            <label className="text-sm font-semibold">Campaign ID
              <input value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })} placeholder="RC-1001" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-blue-500" />
            </label>
            <label className="text-sm font-semibold">Initial Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InventoryBatch["status"] })} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-blue-500">
                <option value="IN_WAREHOUSE">In Warehouse</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="LOW_STOCK">Low Stock</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button type="button" onClick={addBatch} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Create Batch</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-5 py-3 text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Boxes} label="Total batches" value={String(batches.length)} />
        <Stat icon={PackageCheck} label="Total quantity" value={totalQuantity.toLocaleString("en-IN")} />
        <Stat icon={Truck} label="In transit" value={String(inTransit)} />
        <Stat icon={AlertTriangle} label="Low stock" value={String(lowStock)} />
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search batch, item, origin, destination..." className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500">
            <option value="ALL">All Statuses</option>
            <option value="IN_WAREHOUSE">In Warehouse</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="LOW_STOCK">Low Stock</option>
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-4">Batch ID</th>
                <th className="px-5 py-4">Item</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Origin</th>
                <th className="px-5 py-4">Destination</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">QR</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((batch) => (
                <tr key={batch.id} className="border-t hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-mono text-xs font-bold">{batch.id}</td>
                  <td className="px-5 py-4 font-semibold">{batch.item}</td>
                  <td className="px-5 py-4">{batch.quantity.toLocaleString("en-IN")} {batch.unit}</td>
                  <td className="px-5 py-4 text-slate-600">{batch.origin}</td>
                  <td className="px-5 py-4 text-slate-600">{batch.destination}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass(batch.status)}`}>
                      {batch.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => { setSelectedBatch(batch); setShowQr(true); }} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold hover:bg-slate-50">
                      <QrCode size={16} /> QR
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => setSelectedBatch(batch)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <Boxes className="mx-auto text-slate-300" size={40} />
            <p className="mt-3 font-semibold">No inventory batches found.</p>
            <p className="mt-1 text-sm text-slate-500">Try another search or add a new batch.</p>
          </div>
        )}
      </div>

      {selectedBatch && !showQr && (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs text-slate-400">{selectedBatch.id}</p>
              <h2 className="mt-1 text-xl font-bold">{selectedBatch.item}</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedBatch.quantity.toLocaleString("en-IN")} {selectedBatch.unit} · {selectedBatch.origin} → {selectedBatch.destination}</p>
            </div>
            <button type="button" onClick={() => setSelectedBatch(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold">Close</button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {(["IN_WAREHOUSE", "IN_TRANSIT", "DELIVERED", "LOW_STOCK"] as InventoryBatch["status"][]).map((value) => (
              <button key={value} type="button" onClick={() => updateStatus(selectedBatch.id, value)} className={`rounded-xl border p-3 text-xs font-bold ${selectedBatch.status === value ? statusClass(value) : "bg-white text-slate-600"}`}>
                Mark {value.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Campaign</p><p className="mt-1 font-semibold">{selectedBatch.campaignId}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Created</p><p className="mt-1 font-semibold">{selectedBatch.createdAt}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Last Updated</p><p className="mt-1 font-semibold">{selectedBatch.updatedAt}</p></div>
          </div>

          <button type="button" onClick={() => setShowQr(true)} className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">
            <QrCode size={18} /> Generate / Display QR
          </button>
        </div>
      )}

      {showQr && selectedBatch && (() => {
        const qrPayload = JSON.stringify({
          type: "RELIEFCHAIN_INVENTORY_BATCH",
          batchId: selectedBatch.id,
          item: selectedBatch.item,
          quantity: selectedBatch.quantity,
          unit: selectedBatch.unit,
          origin: selectedBatch.origin,
          destination: selectedBatch.destination,
          campaignId: selectedBatch.campaignId,
          status: selectedBatch.status,
        });

        const qrUrl =
          "https://quickchart.io/qr?text=" +
          encodeURIComponent(qrPayload) +
          "&size=280&margin=2";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Inventory QR</p>
                  <h2 className="text-xl font-bold">{selectedBatch.id}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mx-auto mt-6 flex h-64 w-64 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white p-3">
                <img
                  src={qrUrl}
                  alt={`QR code for ${selectedBatch.id}`}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                <p><strong>Batch ID:</strong> {selectedBatch.id}</p>
                <p className="mt-1"><strong>Item:</strong> {selectedBatch.item}</p>
                <p className="mt-1">
                  <strong>Quantity:</strong>{" "}
                  {selectedBatch.quantity.toLocaleString("en-IN")} {selectedBatch.unit}
                </p>
                <p className="mt-1"><strong>Origin:</strong> {selectedBatch.origin}</p>
                <p className="mt-1"><strong>Destination:</strong> {selectedBatch.destination}</p>
                <p className="mt-1"><strong>Campaign:</strong> {selectedBatch.campaignId}</p>
                <p className="mt-1">
                  <strong>Status:</strong>{" "}
                  {selectedBatch.status.replace(/_/g, " ")}
                </p>
              </div>

              <details className="mt-4 rounded-xl border p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  View QR payload
                </summary>
                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3 text-[10px] text-emerald-300">
                  {qrPayload}
                </pre>
              </details>

              <p className="mt-4 text-center text-xs text-emerald-600">
                ✓ This is a real QR code containing this batch's data.
              </p>

              <button
                type="button"
                onClick={() => setShowQr(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}

/* =========================
   NGO CAMPAIGN
========================= */


function NgoCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const loadCampaigns = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("reliefchain-ngo-campaigns") || "[]"
      );
      setCampaigns(Array.isArray(saved) ? saved : []);
    } catch {
      setCampaigns([]);
    }
  };

  useEffect(() => {
    loadCampaigns();
    const handleStorage = () => loadCampaigns();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateCampaignStatus = (id: string, nextStatus: string) => {
    const updated = campaigns.map((campaign) =>
      campaign.id === id
        ? { ...campaign, status: nextStatus, updatedAt: new Date().toISOString() }
        : campaign
    );
    setCampaigns(updated);
    localStorage.setItem("reliefchain-ngo-campaigns", JSON.stringify(updated));
  };

  const filtered = campaigns.filter((campaign) => {
    const matchesSearch = `${campaign.title} ${campaign.id} ${campaign.location} ${campaign.disasterType}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = status === "ALL" || campaign.status === status;
    return matchesSearch && matchesStatus;
  });

  const statusClasses = (value: string) => {
    switch (value) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "APPROVED":
      case "VERIFIED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const progress = (campaign: any) => {
    const target = Number(campaign.targetAmount || campaign.target || 0);
    const raised = Number(campaign.raised || 0);
    return target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  };

  return (
    <>
      <Title
        title="My Campaigns"
        desc="Manage campaigns created by your NGO and track their verification status."
        action={
          <button
            type="button"
            onClick={() => navigate("/ngo/campaign/create")}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={17} />
            Create Campaign
          </button>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <Stat icon={HeartHandshake} label="Total campaigns" value={String(campaigns.length)} />
        <Stat icon={Activity} label="Active" value={String(campaigns.filter((c) => c.status === "ACTIVE").length)} />
        <Stat icon={FileCheck2} label="Under review" value={String(campaigns.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length)} />
        <Stat icon={Wallet} label="Total raised" value={money(campaigns.reduce((sum, c) => sum + Number(c.raised || 0), 0))} />
      </div>

      <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by campaign, ID, disaster or location..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center shadow-sm">
          <HeartHandshake className="mx-auto text-slate-300" size={42} />
          <h3 className="mt-4 text-lg font-bold">No campaigns found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {campaigns.length === 0
              ? "You have not created a campaign yet. Create your first disaster relief campaign to get started."
              : "Try changing your search or status filter."}
          </p>
          {campaigns.length === 0 && (
            <button
              type="button"
              onClick={() => navigate("/ngo/campaign/create")}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Create Your First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((campaign) => {
            const target = Number(campaign.targetAmount || campaign.target || 0);
            const raised = Number(campaign.raised || 0);
            const spent = Number(campaign.spent || 0);
            const remaining = Math.max(0, raised - spent);
            const pct = progress(campaign);

            return (
              <div key={campaign.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{campaign.title}</h2>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses(campaign.status)}`}>
                        {(campaign.status || "DRAFT").replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-400">Campaign ID: {campaign.id}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {campaign.disasterType || "Disaster"} • {campaign.location || "Location not specified"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/ngo/campaign/${campaign.id}`)}
                      className="rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/ngo/campaign/${campaign.id}/edit`)}
                      className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      <Pencil size={15} /> Edit
                    </button>
                    {campaign.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => updateCampaignStatus(campaign.id, "SUBMITTED")}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <p className="text-xs text-slate-500">Target</p>
                    <p className="mt-1 font-bold">{money(target)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Raised</p>
                    <p className="mt-1 font-bold text-emerald-700">{money(raised)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Spent</p>
                    <p className="mt-1 font-bold">{money(spent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Remaining</p>
                    <p className="mt-1 font-bold">{money(remaining)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Beneficiaries</p>
                    <p className="mt-1 font-bold">{Number(campaign.beneficiaries || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                    <span>Fundraising progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  {campaign.deadline && <span className="rounded-lg bg-slate-50 px-3 py-2">Deadline: {campaign.deadline}</span>}
                  {campaign.severity && <span className="rounded-lg bg-slate-50 px-3 py-2">Severity: {campaign.severity}</span>}
                  {campaign.aiRiskScore !== undefined && <span className="rounded-lg bg-slate-50 px-3 py-2">AI Risk: {campaign.aiRiskScore}/100</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}


function NgoCampaignDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("reliefchain-ngo-campaigns") || "[]"
      );
      const found = Array.isArray(saved)
        ? saved.find((item) => item.id === id)
        : null;
      setCampaign(found || null);
    } catch {
      setCampaign(null);
    }
  }, [id]);

  if (!campaign) {
    return (
      <>
        <Title
          title="Campaign Not Found"
          desc="The requested NGO campaign could not be found."
          action={
            <button
              type="button"
              onClick={() => navigate("/ngo/campaigns")}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Back to My Campaigns
            </button>
          }
        />
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center shadow-sm">
          <HeartHandshake className="mx-auto text-slate-300" size={48} />
          <h2 className="mt-4 text-lg font-bold">Campaign unavailable</h2>
          <p className="mt-2 text-sm text-slate-500">
            Check My Campaigns and select a valid campaign.
          </p>
        </div>
      </>
    );
  }

  const target = Number(campaign.targetAmount || campaign.target || 0);
  const raised = Number(campaign.raised || 0);
  const spent = Number(campaign.spent || 0);
  const remaining = Math.max(0, raised - spent);
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const risk = Number(campaign.aiRiskScore ?? 0);
  const riskLevel = risk <= 30 ? "LOW" : risk <= 70 ? "MEDIUM" : "HIGH";

  const statusClass = (value: string) => {
    switch (value) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "APPROVED":
      case "VERIFIED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <>
      <Title
        title={campaign.title}
        desc={`${campaign.disasterType || "Disaster"} • ${campaign.location || "Location not specified"}`}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/ngo/campaigns")}
              className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              ← My Campaigns
            </button>
            <button
              type="button"
              onClick={() => navigate(`/ngo/campaign/${campaign.id}/edit`)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Pencil size={16} /> Edit
            </button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass(campaign.status)}`}>
          {(campaign.status || "DRAFT").replace(/_/g, " ")}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          Campaign ID: {campaign.id}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          Severity: {campaign.severity || "Not specified"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={CircleDollarSign} label="Target" value={money(target)} />
        <Stat icon={Wallet} label="Raised" value={money(raised)} />
        <Stat icon={Receipt} label="Spent" value={money(spent)} />
        <Stat icon={TrendingUp} label="Remaining" value={money(remaining)} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold">Campaign Overview</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
            {campaign.description || "No campaign description provided."}
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span>Fundraising progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {money(raised)} raised of {money(target)} target
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Campaign Information</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div><p className="text-xs text-slate-500">Location</p><p className="mt-1 font-semibold">{campaign.location || "—"}</p></div>
            <div><p className="text-xs text-slate-500">Disaster</p><p className="mt-1 font-semibold">{campaign.disasterType || "—"}</p></div>
            <div><p className="text-xs text-slate-500">Deadline</p><p className="mt-1 font-semibold">{campaign.deadline || "—"}</p></div>
            <div><p className="text-xs text-slate-500">Beneficiaries</p><p className="mt-1 font-semibold">{Number(campaign.beneficiaries || 0).toLocaleString("en-IN")}</p></div>
            <div><p className="text-xs text-slate-500">Payment Account</p><p className="mt-1 break-all font-semibold">{campaign.paymentAccount || "—"}</p></div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Required Resources</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Array.isArray(campaign.resources) ? campaign.resources : []).length > 0 ? (
              campaign.resources.map((resource: string, index: number) => (
                <span key={`${resource}-${index}`} className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                  {resource}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No resources listed.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Supporting Documents</h2>
          <div className="mt-4 space-y-2">
            {(Array.isArray(campaign.documents) ? campaign.documents : []).length > 0 ? (
              campaign.documents.map((document: string, index: number) => (
                <div key={`${document}-${index}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                  <FileCheck2 size={17} className="text-blue-600" />
                  <span>{document}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No supporting documents listed.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">AI Risk Assessment</h2>
            <p className="mt-1 text-sm text-slate-500">Current campaign risk score for auditor review.</p>
          </div>
          <span className={`rounded-full border px-4 py-2 text-sm font-bold ${riskLevel === "LOW" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : riskLevel === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {riskLevel} · {risk}/100
          </span>
        </div>
      </div>
    </>
  );
}

function NgoCampaignEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    disasterType: "",
    location: "",
    severity: "High",
    targetAmount: "",
    deadline: "",
    beneficiaries: "",
    resources: "",
    documents: "",
    paymentAccount: "",
  });
  const [campaign, setCampaign] = useState<any | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedCampaigns = JSON.parse(localStorage.getItem("reliefchain-ngo-campaigns") || "[]");
      const found = Array.isArray(savedCampaigns) ? savedCampaigns.find((item) => item.id === id) : null;
      if (found) {
        setCampaign(found);
        setForm({
          title: found.title || "",
          description: found.description || "",
          disasterType: found.disasterType || "",
          location: found.location || "",
          severity: found.severity || "High",
          targetAmount: String(found.targetAmount ?? found.target ?? ""),
          deadline: found.deadline || "",
          beneficiaries: String(found.beneficiaries ?? ""),
          resources: Array.isArray(found.resources) ? found.resources.join(", ") : (found.resources || ""),
          documents: Array.isArray(found.documents) ? found.documents.join(", ") : (found.documents || ""),
          paymentAccount: found.paymentAccount || "",
        });
      }
    } catch {
      setCampaign(null);
    }
  }, [id]);

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSaved(false);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Campaign title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.disasterType) next.disasterType = "Select a disaster type.";
    if (!form.location.trim()) next.location = "Location is required.";
    if (!form.targetAmount || Number(form.targetAmount) <= 0) next.targetAmount = "Enter a valid target amount.";
    if (!form.deadline) next.deadline = "Deadline is required.";
    if (!form.beneficiaries || Number(form.beneficiaries) <= 0) next.beneficiaries = "Enter a valid beneficiary count.";
    if (!form.resources.trim()) next.resources = "Required resources are required.";
    if (!form.paymentAccount.trim()) next.paymentAccount = "Payment account is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveChanges = (submit = false) => {
    if (!campaign) return;
    if (!validate()) return;

    try {
      const existing = JSON.parse(localStorage.getItem("reliefchain-ngo-campaigns") || "[]");
      const updated = existing.map((item: any) => {
        if (item.id !== id) return item;
        return {
          ...item,
          title: form.title.trim(),
          description: form.description.trim(),
          disasterType: form.disasterType,
          location: form.location.trim(),
          severity: form.severity,
          targetAmount: Number(form.targetAmount),
          deadline: form.deadline,
          beneficiaries: Number(form.beneficiaries),
          resources: form.resources.split(",").map((x) => x.trim()).filter(Boolean),
          documents: form.documents.split(",").map((x) => x.trim()).filter(Boolean),
          paymentAccount: form.paymentAccount.trim(),
          status: submit ? "SUBMITTED" : item.status,
          updatedAt: new Date().toISOString(),
        };
      });
      localStorage.setItem("reliefchain-ngo-campaigns", JSON.stringify(updated));
      setSaved(true);
      setCampaign(updated.find((item: any) => item.id === id) || campaign);
      if (submit || true) setTimeout(() => navigate(`/ngo/campaign/${id}`), 700);
    } catch {
      setErrors({ title: "Unable to save changes. Please try again." });
    }
  };

  if (!campaign) {
    return (
      <>
        <Title title="Campaign Not Found" desc="The campaign you are trying to edit could not be found." />
        <button type="button" onClick={() => navigate("/ngo/campaigns")} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
          Back to My Campaigns
        </button>
      </>
    );
  }

  const inputClass = (field: string) =>
    `mt-2 w-full rounded-xl border p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${errors[field] ? "border-red-400 bg-red-50" : "border-slate-200"}`;

  return (
    <>
      <Title
        title="Edit Campaign"
        desc={`Update ${campaign.title} and keep its relief information accurate.`}
        action={
          <button type="button" onClick={() => navigate(`/ngo/campaign/${id}`)} className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-slate-50">
            View Campaign
          </button>
        }
      />

      {saved && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={20} /> Campaign updated successfully.
        </div>
      )}

      <div className="max-w-5xl rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold">{campaign.id}</span>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{String(campaign.status || "DRAFT").replace(/_/g, " ")}</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold">Campaign title *<input value={form.title} onChange={(e) => updateField("title", e.target.value)} className={inputClass("title")} />{errors.title && <span className="text-xs text-red-600">{errors.title}</span>}</label>
          <label className="text-sm font-semibold">Disaster type *<select value={form.disasterType} onChange={(e) => updateField("disasterType", e.target.value)} className={inputClass("disasterType")}><option value="">Select disaster</option><option>Flood</option><option>Cyclone</option><option>Landslide</option><option>Earthquake</option><option>Drought</option><option>Fire</option><option>Other</option></select>{errors.disasterType && <span className="text-xs text-red-600">{errors.disasterType}</span>}</label>
          <label className="text-sm font-semibold">Location *<input value={form.location} onChange={(e) => updateField("location", e.target.value)} className={inputClass("location")} />{errors.location && <span className="text-xs text-red-600">{errors.location}</span>}</label>
          <label className="text-sm font-semibold">Severity<select value={form.severity} onChange={(e) => updateField("severity", e.target.value)} className={inputClass("severity")}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
          <label className="text-sm font-semibold">Target amount (₹) *<input type="number" min="1" value={form.targetAmount} onChange={(e) => updateField("targetAmount", e.target.value)} className={inputClass("targetAmount")} />{errors.targetAmount && <span className="text-xs text-red-600">{errors.targetAmount}</span>}</label>
          <label className="text-sm font-semibold">Deadline *<input type="date" value={form.deadline} onChange={(e) => updateField("deadline", e.target.value)} className={inputClass("deadline")} />{errors.deadline && <span className="text-xs text-red-600">{errors.deadline}</span>}</label>
          <label className="text-sm font-semibold">Expected beneficiaries *<input type="number" min="1" value={form.beneficiaries} onChange={(e) => updateField("beneficiaries", e.target.value)} className={inputClass("beneficiaries")} />{errors.beneficiaries && <span className="text-xs text-red-600">{errors.beneficiaries}</span>}</label>
          <label className="text-sm font-semibold">Payment / receiving account *<input value={form.paymentAccount} onChange={(e) => updateField("paymentAccount", e.target.value)} className={inputClass("paymentAccount")} />{errors.paymentAccount && <span className="text-xs text-red-600">{errors.paymentAccount}</span>}</label>
          <label className="text-sm font-semibold md:col-span-2">Description *<textarea rows={5} value={form.description} onChange={(e) => updateField("description", e.target.value)} className={inputClass("description")} />{errors.description && <span className="text-xs text-red-600">{errors.description}</span>}</label>
          <label className="text-sm font-semibold md:col-span-2">Required resources *<input value={form.resources} onChange={(e) => updateField("resources", e.target.value)} className={inputClass("resources")} placeholder="Food kits, water, medicines, blankets" />{errors.resources && <span className="text-xs text-red-600">{errors.resources}</span>}<span className="mt-1 block text-xs font-normal text-slate-500">Separate multiple resources with commas.</span></label>
          <label className="text-sm font-semibold md:col-span-2">Supporting documents<input value={form.documents} onChange={(e) => updateField("documents", e.target.value)} className={inputClass("documents")} placeholder="Registration certificate, disaster notification" /><span className="mt-1 block text-xs font-normal text-slate-500">Separate document names with commas.</span></label>
        </div>

        <div className="mt-7 flex flex-wrap justify-end gap-3 border-t pt-5">
          <button type="button" onClick={() => navigate(`/ngo/campaign/${id}`)} className="rounded-xl border px-5 py-3 text-sm font-semibold">Cancel</button>
          <button type="button" onClick={() => saveChanges(false)} className="rounded-xl border px-5 py-3 text-sm font-semibold">Save Changes</button>
          {campaign.status === "DRAFT" && <button type="button" onClick={() => saveChanges(true)} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save & Submit</button>}
        </div>
      </div>
    </>
  );
}

function CreateCampaign() {
  const navigate = useNavigate();

  type CampaignForm = {
    title: string;
    description: string;
    disasterType: string;
    location: string;
    severity: string;
    targetAmount: string;
    deadline: string;
    beneficiaries: string;
    resources: string;
    documents: string;
    paymentAccount: string;
  };

  const emptyForm: CampaignForm = {
    title: "",
    description: "",
    disasterType: "",
    location: "",
    severity: "High",
    targetAmount: "",
    deadline: "",
    beneficiaries: "",
    resources: "",
    documents: "",
    paymentAccount: "",
  };

  const [form, setForm] = useState<CampaignForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const updateField = (field: keyof CampaignForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSaved(false);
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.title.trim()) next.title = "Campaign title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.disasterType.trim()) next.disasterType = "Select a disaster type.";
    if (!form.location.trim()) next.location = "Location is required.";
    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      next.targetAmount = "Enter a valid target amount.";
    }
    if (!form.deadline) next.deadline = "Deadline is required.";
    if (!form.beneficiaries || Number(form.beneficiaries) <= 0) {
      next.beneficiaries = "Enter the expected number of beneficiaries.";
    }
    if (!form.resources.trim()) next.resources = "Required resources are required.";
    if (!form.paymentAccount.trim()) next.paymentAccount = "Payment account is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveCampaign = (status: "DRAFT" | "SUBMITTED") => {
    if (status === "SUBMITTED" && !validate()) return;

    const existing = JSON.parse(
      localStorage.getItem("reliefchain-ngo-campaigns") || "[]"
    );

    const campaign = {
      id: `NGO-${Date.now().toString().slice(-6)}`,
      title: form.title.trim() || "Untitled Campaign",
      description: form.description.trim(),
      disasterType: form.disasterType,
      location: form.location.trim(),
      severity: form.severity,
      targetAmount: Number(form.targetAmount || 0),
      raised: 0,
      spent: 0,
      deadline: form.deadline,
      beneficiaries: Number(form.beneficiaries || 0),
      resources: form.resources
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      documents: form.documents
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      paymentAccount: form.paymentAccount.trim(),
      status,
      createdAt: new Date().toISOString(),
      aiRiskScore: 0,
      aiRiskLevel: "LOW",
    };

    localStorage.setItem(
      "reliefchain-ngo-campaigns",
      JSON.stringify([campaign, ...existing])
    );

    setSaved(true);

    if (status === "SUBMITTED") {
      setTimeout(() => navigate("/ngo/campaigns"), 700);
    }
  };

  const inputClass = (field: string) =>
    `mt-2 w-full rounded-xl border p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
      errors[field] ? "border-red-400 bg-red-50" : "border-slate-200"
    }`;

  return (
    <>
      <Title
        title="Create Campaign"
        desc="Create and submit a disaster relief campaign for verification."
        action={
          <button
            type="button"
            onClick={() => navigate("/ngo/campaigns")}
            className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            My Campaigns
          </button>
        }
      />

      <div className="max-w-5xl">
        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={20} />
            {form.title ? `${form.title} saved successfully.` : "Campaign saved successfully."}
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Campaign Information</h2>
            <p className="mt-1 text-sm text-slate-500">
              Provide accurate information so auditors and donors can verify how relief funds will be used.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Campaign title <span className="text-red-500">*</span>
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={inputClass("title")}
                placeholder="e.g. Assam Flood Relief 2026"
              />
              {errors.title && <span className="mt-1 block text-xs text-red-600">{errors.title}</span>}
            </label>

            <label className="text-sm font-semibold">
              Disaster type <span className="text-red-500">*</span>
              <select
                value={form.disasterType}
                onChange={(e) => updateField("disasterType", e.target.value)}
                className={inputClass("disasterType")}
              >
                <option value="">Select disaster</option>
                <option>Flood</option>
                <option>Cyclone</option>
                <option>Landslide</option>
                <option>Earthquake</option>
                <option>Drought</option>
                <option>Fire</option>
                <option>Other</option>
              </select>
              {errors.disasterType && <span className="mt-1 block text-xs text-red-600">{errors.disasterType}</span>}
            </label>

            <label className="text-sm font-semibold">
              Location <span className="text-red-500">*</span>
              <input
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className={inputClass("location")}
                placeholder="District, State"
              />
              {errors.location && <span className="mt-1 block text-xs text-red-600">{errors.location}</span>}
            </label>

            <label className="text-sm font-semibold">
              Severity
              <select
                value={form.severity}
                onChange={(e) => updateField("severity", e.target.value)}
                className={inputClass("severity")}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>

            <label className="text-sm font-semibold">
              Target amount (₹) <span className="text-red-500">*</span>
              <input
                type="number"
                min="1"
                value={form.targetAmount}
                onChange={(e) => updateField("targetAmount", e.target.value)}
                className={inputClass("targetAmount")}
                placeholder="1200000"
              />
              {errors.targetAmount && <span className="mt-1 block text-xs text-red-600">{errors.targetAmount}</span>}
            </label>

            <label className="text-sm font-semibold">
              Deadline <span className="text-red-500">*</span>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => updateField("deadline", e.target.value)}
                className={inputClass("deadline")}
              />
              {errors.deadline && <span className="mt-1 block text-xs text-red-600">{errors.deadline}</span>}
            </label>

            <label className="text-sm font-semibold">
              Expected beneficiaries <span className="text-red-500">*</span>
              <input
                type="number"
                min="1"
                value={form.beneficiaries}
                onChange={(e) => updateField("beneficiaries", e.target.value)}
                className={inputClass("beneficiaries")}
                placeholder="5000"
              />
              {errors.beneficiaries && <span className="mt-1 block text-xs text-red-600">{errors.beneficiaries}</span>}
            </label>

            <label className="text-sm font-semibold">
              Payment / receiving account <span className="text-red-500">*</span>
              <input
                value={form.paymentAccount}
                onChange={(e) => updateField("paymentAccount", e.target.value)}
                className={inputClass("paymentAccount")}
                placeholder="NGO bank / UPI account"
              />
              {errors.paymentAccount && <span className="mt-1 block text-xs text-red-600">{errors.paymentAccount}</span>}
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Description <span className="text-red-500">*</span>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={`${inputClass("description")} min-h-32 resize-y`}
                placeholder="Explain the disaster situation, relief plan, beneficiaries and expected impact."
              />
              {errors.description && <span className="mt-1 block text-xs text-red-600">{errors.description}</span>}
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Required resources
              <input
                value={form.resources}
                onChange={(e) => updateField("resources", e.target.value)}
                className={inputClass("resources")}
                placeholder="Food kits, drinking water, medicines, blankets"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Separate resources with commas.
              </span>
              {errors.resources && <span className="mt-1 block text-xs text-red-600">{errors.resources}</span>}
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Supporting documents / evidence
              <input
                value={form.documents}
                onChange={(e) => updateField("documents", e.target.value)}
                className={inputClass("documents")}
                placeholder="Government approval, assessment report, quotation"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Demo field for now; real file upload/API integration will be connected later.
              </span>
            </label>
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => saveCampaign("DRAFT")}
              className="rounded-xl border px-5 py-3 font-semibold hover:bg-slate-50"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => saveCampaign("SUBMITTED")}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              <FileCheck2 size={18} />
              Submit for Verification
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border bg-blue-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={21} />
            <div>
              <h3 className="font-bold text-slate-900">Verification workflow</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Draft → Submitted → Under Review → Verified → Approved → Active. Auditors can request evidence or reject a campaign during review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================
   TRANSPARENCY
========================= */

function Transparency() {
  return (
    <div className="mx-auto max-w-6xl p-5">
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="flex gap-2 font-bold"
        >
          <LifeBuoy className="text-blue-600" />
          ReliefChain
        </Link>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          Public verified record
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="bg-slate-950 p-8 text-white">
          <p className="text-sm text-blue-300">
            CAMPAIGN RC-1001
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Assam Flood Relief 2026
          </h1>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-4">
          <Stat
            icon={CircleDollarSign}
            label="Funds raised"
            value="₹8.42L"
          />

          <Stat
            icon={Wallet}
            label="Funds spent"
            value="₹5.76L"
          />

          <Stat
            icon={Users}
            label="Beneficiaries assisted"
            value="4,800"
          />

          <Stat
            icon={ShieldCheck}
            label="Audit status"
            value="Verified"
          />
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <h2 className="font-bold">
              Verified expenses
            </h2>

            <p className="mt-4">
              Food & water — ₹2.45L
            </p>

            <p className="mt-3">
              Medical supplies — ₹1.72L
            </p>

            <p className="mt-3">
              Transport — ₹96,000
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="font-bold">
              Blockchain proofs
            </h2>

            <p className="mt-4 font-mono text-xs text-blue-600">
              0x7a3f...91cd
            </p>

            <p className="mt-3 font-mono text-xs text-blue-600">
              0x1b82...6fe2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   WORKSPACE
========================= */

function Login() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem(
      "reliefchain-authenticated"
    );

    navigate("/");
  };

  const publicRoles = [
    {
      role: "donor" as Role,
      title: "Donor",
      icon: "💳",
      description:
        "Donate to verified disaster relief campaigns and track your contribution impact.",
      color: "from-blue-600 to-cyan-500",
    },
  ];

  const authorizedRoles = [
    {
      role: "ngo" as Role,
      title: "NGO",
      icon: "🏢",
      description:
        "Create and manage relief campaigns, funds, inventory and beneficiaries.",
      color: "from-emerald-600 to-green-500",
    },
    {
      role: "volunteer" as Role,
      title: "Volunteer",
      icon: "🤝",
      description:
        "Handle relief tasks, deliveries, QR scanning and field operations.",
      color: "from-orange-600 to-amber-500",
    },
    {
      role: "government" as Role,
      title: "Government",
      icon: "🏛️",
      description:
        "Monitor disasters, funds, NGOs, emergency requests and relief operations.",
      color: "from-purple-600 to-violet-500",
    },
    {
      role: "auditor" as Role,
      title: "Auditor",
      icon: "🔍",
      description:
        "Review expenses, evidence and verify transparent relief records.",
      color: "from-pink-600 to-rose-500",
    },
    {
      role: "admin" as Role,
      title: "Admin",
      icon: "⚙️",
      description:
        "Manage users, NGOs, campaigns, auditors and system activity.",
      color: "from-slate-600 to-slate-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl">
              🛡️
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                ReliefChain
              </h1>

              <p className="text-sm text-slate-400">
                Disaster Relief Transparency Platform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800"
          >
            Sign Out
          </button>
        </div>

        <div className="mb-10 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-8 shadow-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-200">
            Secure Workspace
          </p>

          <h2 className="text-3xl font-bold sm:text-4xl">
            Welcome to ReliefChain
          </h2>

          <p className="mt-3 max-w-2xl text-blue-100">
            Choose the workspace you want to access.
            Public roles are available immediately, while
            sensitive operational roles require authorization.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Available Workspaces
          </h2>

          <p className="mt-1 text-slate-400">
            These workspaces are available for regular
            ReliefChain accounts.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {publicRoles.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() =>
                navigate(`/${item.role}`)
              }
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left transition hover:-translate-y-1 hover:border-blue-500"
            >
              <div
                className={`bg-gradient-to-r ${item.color} p-6`}
              >
                <div className="text-4xl">
                  {item.icon}
                </div>

                <h3 className="mt-5 text-2xl font-bold">
                  {item.title}
                </h3>
              </div>

              <div className="p-6">
                <p className="text-sm leading-6 text-slate-400">
                  {item.description}
                </p>

                <div className="mt-5 border-t border-slate-800 pt-4 text-sm font-semibold text-blue-400">
                  Open workspace →
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-6 mt-12">
          <h2 className="text-2xl font-bold">
            Authorized Workspaces
          </h2>

          <p className="mt-1 text-slate-400">
            These roles require identity or organizational
            authorization.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {authorizedRoles.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() =>
                navigate(
                  `/authorize/${item.role}`
                )
              }
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left transition hover:-translate-y-1 hover:border-amber-500/60"
            >
              <div
                className={`relative bg-gradient-to-r ${item.color} p-6`}
              >
                <div className="absolute right-5 top-5 rounded-full bg-black/30 px-3 py-1 text-xs font-bold">
                  🔒 AUTHORIZATION
                </div>

                <div className="text-4xl">
                  {item.icon}
                </div>

                <h3 className="mt-5 text-2xl font-bold">
                  {item.title}
                </h3>
              </div>

              <div className="p-6">
                <p className="text-sm leading-6 text-slate-400">
                  {item.description}
                </p>

                <div className="mt-5 border-t border-slate-800 pt-4 text-sm font-semibold text-amber-400">
                  Request authorization 🔐
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold">
                Public Transparency
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                View publicly verifiable campaign funding,
                impact and blockchain proofs.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/transparency/RC-1001"
                )
              }
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold hover:bg-emerald-500"
            >
              View Transparency
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          Secure • Transparent • Accountable
        </div>
      </div>
    </div>
  );
}

/* =========================
   APP ROUTES
========================= */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

/* =========================
   VOLUNTEER OPERATIONS
========================= */

type VolunteerTask = {
  id: string;
  title: string;
  type: "DELIVERY" | "VERIFICATION" | "DISTRIBUTION" | "EVIDENCE";
  batchId?: string;
  location: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  due: string;
  notes: string;
};

type VolunteerDelivery = {
  id: string;
  batchId: string;
  item: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  volunteer: string;
  status: "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  gps?: string;
  evidence?: string;
};

type DistributionRecord = {
  id: string;
  batchId: string;
  beneficiaryCode: string;
  item: string;
  quantity: number;
  unit: string;
  location: string;
  volunteer: string;
  timestamp: string;
  evidence: string;
};

const defaultVolunteerTasks: VolunteerTask[] = [
  { id: "TASK-501", title: "Food & water delivery", type: "DELIVERY", batchId: "BATCH-RC-2048", location: "Camp A, Dibrugarh", priority: "HIGH", status: "IN_PROGRESS", due: "Today, 4:30 PM", notes: "Deliver the assigned food and water kits and confirm handover." },
  { id: "TASK-502", title: "Medical kit verification", type: "VERIFICATION", batchId: "BATCH-RC-2049", location: "Camp B, Dibrugarh", priority: "HIGH", status: "ASSIGNED", due: "Today, 6:00 PM", notes: "Scan the batch QR and verify quantity before dispatch." },
  { id: "TASK-503", title: "Shelter kit distribution", type: "DISTRIBUTION", batchId: "BATCH-RC-2050", location: "Mandi Relief Camp", priority: "MEDIUM", status: "COMPLETED", due: "Completed", notes: "Record beneficiary distribution without storing private beneficiary information." },
  { id: "TASK-504", title: "Upload delivery evidence", type: "EVIDENCE", batchId: "BATCH-RC-2048", location: "Camp A, Dibrugarh", priority: "LOW", status: "ASSIGNED", due: "Today, 7:00 PM", notes: "Attach photo/GPS evidence after the handover." },
];

const defaultVolunteerDeliveries: VolunteerDelivery[] = [
  { id: "DEL-701", batchId: "BATCH-RC-2048", item: "Food & Water Kits", quantity: 2400, unit: "kits", origin: "Guwahati Warehouse", destination: "Camp A, Dibrugarh", volunteer: "Field Volunteer", status: "IN_TRANSIT", assignedAt: "2026-09-09 09:10", pickedUpAt: "2026-09-09 10:05", gps: "23.3541, 94.8723" },
  { id: "DEL-702", batchId: "BATCH-RC-2049", item: "Medical Kits", quantity: 850, unit: "kits", origin: "Guwahati Medical Store", destination: "Camp B, Dibrugarh", volunteer: "Field Volunteer", status: "ASSIGNED", assignedAt: "2026-09-09 11:30" },
  { id: "DEL-703", batchId: "BATCH-RC-2050", item: "Shelter Kits", quantity: 420, unit: "kits", origin: "Guwahati Warehouse", destination: "Mandi Relief Camp", volunteer: "Field Volunteer", status: "DELIVERED", assignedAt: "2026-09-08 08:20", pickedUpAt: "2026-09-08 09:00", deliveredAt: "2026-09-08 15:40", gps: "31.7081, 76.9320", evidence: "Photo + GPS + supervisor confirmation" },
];

function readVolunteerTasks(): VolunteerTask[] {
  try {
    const saved = localStorage.getItem("reliefchain-volunteer-tasks");
    if (!saved) {
      localStorage.setItem("reliefchain-volunteer-tasks", JSON.stringify(defaultVolunteerTasks));
      return defaultVolunteerTasks;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultVolunteerTasks;
  } catch {
    return defaultVolunteerTasks;
  }
}

function readVolunteerDeliveries(): VolunteerDelivery[] {
  try {
    const saved = localStorage.getItem("reliefchain-volunteer-deliveries");
    if (!saved) {
      localStorage.setItem("reliefchain-volunteer-deliveries", JSON.stringify(defaultVolunteerDeliveries));
      return defaultVolunteerDeliveries;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultVolunteerDeliveries;
  } catch {
    return defaultVolunteerDeliveries;
  }
}

function VolunteerDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [deliveries, setDeliveries] = useState<VolunteerDelivery[]>([]);

  useEffect(() => {
    setTasks(readVolunteerTasks());
    setDeliveries(readVolunteerDeliveries());
  }, []);

  const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED").length;
  const completedDeliveries = deliveries.filter((d) => d.status === "DELIVERED").length;
  const inTransit = deliveries.filter((d) => d.status === "IN_TRANSIT").length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <>
      <Title title="Volunteer Dashboard" desc="Coordinate field tasks, QR verification, deliveries and relief distribution." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ClipboardCheck} label="Pending tasks" value={String(pendingTasks)} />
        <Stat icon={Truck} label="Deliveries completed" value={String(completedDeliveries)} />
        <Stat icon={QrCode} label="QR verified batches" value="76" />
        <Stat icon={PackageCheck} label="Tasks completed" value={String(completedTasks)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-bold">Today's assignments</h2><p className="mt-1 text-sm text-slate-500">Your highest-priority field operations.</p></div>
            <button type="button" onClick={() => navigate("/volunteer/tasks")} className="rounded-xl border px-4 py-2 text-sm font-semibold">View all tasks</button>
          </div>
          <div className="mt-5 space-y-3">
            {tasks.filter((t) => t.status !== "COMPLETED").slice(0, 3).map((task) => (
              <button key={task.id} type="button" onClick={() => navigate("/volunteer/tasks")} className="w-full rounded-xl border p-4 text-left hover:bg-slate-50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-semibold">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.id} • {task.location} {task.batchId ? `• ${task.batchId}` : ""}</p></div>
                  <div className="flex gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${task.priority === "HIGH" ? "bg-red-50 text-red-700" : task.priority === "MEDIUM" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{task.priority}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{task.status}</span></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">Field actions</h2>
          <p className="mt-1 text-sm text-slate-500">Quick access for on-site operations.</p>
          <div className="mt-5 space-y-3">
            <button type="button" onClick={() => navigate("/volunteer/scan")} className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"><QrCode size={18}/>Scan batch QR</button>
            <button type="button" onClick={() => navigate("/volunteer/delivery")} className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold"><Truck size={18}/>Update delivery</button>
            <button type="button" onClick={() => navigate("/volunteer/distribution")} className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold"><PackageCheck size={18}/>Record distribution</button>
          </div>
          <div className="mt-5 rounded-xl bg-blue-50 p-4"><p className="text-xs font-bold text-blue-800">Live field status</p><p className="mt-1 text-sm text-blue-900">{inTransit} batch{inTransit === 1 ? " is" : "es are"} currently in transit.</p></div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><MapPin /></div><div><h2 className="font-bold">GPS & evidence policy</h2><p className="text-xs text-slate-500">Field evidence supports the audit trail.</p></div></div>
        <p className="mt-4 text-sm leading-6 text-slate-600">Delivery records can capture GPS coordinates, timestamp, photo evidence and supervisor confirmation. These records support verification; they do not by themselves prove that an event is truthful.</p>
      </div>
    </>
  );
}

function VolunteerTasks() {
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");

  useEffect(() => setTasks(readVolunteerTasks()), []);

  const updateTask = (id: string, status: VolunteerTask["status"]) => {
    const next = tasks.map((task) => task.id === id ? { ...task, status } : task);
    setTasks(next);
    localStorage.setItem("reliefchain-volunteer-tasks", JSON.stringify(next));
    setMessage(`Task ${id} updated to ${status.replace("_", " ")}.`);
  };

  const filtered = tasks.filter((task) => filter === "ALL" || task.status === filter);

  return (
    <>
      <Title title="My Tasks" desc="Assigned field operations and verification activities." />
      <div className="mb-5 flex flex-wrap gap-2">
        {["ALL", "ASSIGNED", "IN_PROGRESS", "COMPLETED"].map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === value ? "bg-slate-900 text-white" : "border bg-white text-slate-600"}`}>{value.replace("_", " ")}</button>)}
      </div>
      {message && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
      <div className="space-y-4">
        {filtered.map((task) => (
          <div key={task.id} className="rounded-2xl border bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{task.title}</h2><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${task.priority === "HIGH" ? "bg-red-50 text-red-700" : task.priority === "MEDIUM" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{task.priority}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{task.status}</span></div><p className="mt-2 text-xs text-slate-500">{task.id} • {task.type} • {task.location} • Due: {task.due}</p><p className="mt-3 text-sm leading-6 text-slate-600">{task.notes}</p>{task.batchId && <p className="mt-2 text-xs font-bold text-slate-700">Batch: {task.batchId}</p>}</div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {task.status === "ASSIGNED" && <button type="button" onClick={() => updateTask(task.id, "IN_PROGRESS")} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">Start task</button>}
                {task.status === "IN_PROGRESS" && <button type="button" onClick={() => updateTask(task.id, "COMPLETED")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Complete task</button>}
                {task.status === "COMPLETED" && <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700">Completed ✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function VolunteerScan() {
  const [batchId, setBatchId] = useState("");
  const [scannedBatch, setScannedBatch] = useState<InventoryBatch | null>(null);
  const [message, setMessage] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const findBatch = (rawValue: string) => {
    const raw = rawValue.trim();
    if (!raw) return;
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch { parsed = null; }
    const candidateId = parsed?.batchId || parsed?.id || raw;
    const inventory = getInventory();
    const found = inventory.find((batch) => batch.id === candidateId);
    if (!found) {
      setScannedBatch(null);
      setMessage(`No inventory batch found for: ${candidateId}`);
      return;
    }
    setScannedBatch(found);
    setBatchId(found.id);
    setMessage(`Verified ${found.id}. QR data matches the ReliefChain inventory record.`);
    localStorage.setItem("reliefchain-last-scanned-batch", JSON.stringify(found));
    localStorage.setItem("reliefchain-qr-scan-history", JSON.stringify([
      { id: found.id, scannedAt: new Date().toISOString(), item: found.item },
      ...JSON.parse(localStorage.getItem("reliefchain-qr-scan-history") || "[]"),
    ].slice(0, 20)));
  };

  const stopCamera = () => {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  };

  const startCamera = async () => {
    const Detector = (window as any).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setMessage("Live QR scanning is not supported by this browser. Use Chrome/Edge on HTTPS or localhost, or verify the QR payload manually.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const video = videoRef.current;
      if (!video) { stopCamera(); return; }
      video.srcObject = stream;
      await video.play();
      const detector = new Detector({ formats: ["qr_code"] });
      scanningRef.current = true;
      setMessage("Camera is active. Point it at a ReliefChain QR code.");

      const scanLoop = async () => {
        if (!scanningRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.length && codes[0].rawValue) {
            findBatch(codes[0].rawValue);
            stopCamera();
            return;
          }
        } catch {
          // Continue scanning; camera frames can occasionally fail detection.
        }
        requestAnimationFrame(scanLoop);
      };
      scanLoop();
    } catch (error: any) {
      stopCamera();
      setMessage(error?.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access and try again." : "Unable to start the camera. Check that another app is not using it.");
    }
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <>
      <Title title="Real QR Scanner" desc="Use the device camera to scan relief-batch QR codes and verify inventory records." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><QrCode /></div><div><h2 className="font-bold">Camera scanner</h2><p className="text-xs text-slate-500">Uses the browser BarcodeDetector API.</p></div></div>
          {cameraOpen ? (
            <div className="mt-5 overflow-hidden rounded-2xl bg-black">
              <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
              <div className="flex items-center justify-between p-3 text-xs text-white"><span>Scanning…</span><button type="button" onClick={stopCamera} className="rounded-lg bg-white/10 px-3 py-2 font-bold">Stop</button></div>
            </div>
          ) : (
            <div className="mt-5 flex aspect-square max-h-80 items-center justify-center rounded-2xl border-2 border-dashed bg-slate-50"><div className="text-center"><QrCode size={88} className="mx-auto text-slate-400"/><p className="mt-4 text-sm font-semibold">Camera ready</p><p className="mt-1 text-xs text-slate-500">Works on localhost or HTTPS when camera access is allowed.</p></div></div>
          )}
          <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={startCamera} disabled={cameraOpen} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Open camera</button><button type="button" onClick={() => findBatch("BATCH-RC-2048")} className="rounded-xl border px-4 py-3 text-sm font-semibold">Demo scan</button></div>
          <div className="mt-5 border-t pt-5"><label className="text-sm font-bold">Manual fallback</label><textarea value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="BATCH-RC-2048 or QR JSON payload" className="mt-2 min-h-24 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-400"/><button type="button" onClick={() => findBatch(batchId)} className="mt-3 w-full rounded-xl border px-4 py-3 text-sm font-bold">Verify batch</button></div>
          {message && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{message}</div>}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">Verified batch</h2>
          <p className="mt-1 text-sm text-slate-500">Only operational batch information is shown to the volunteer.</p>
          {!scannedBatch ? <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center"><QrCode size={48} className="mx-auto text-slate-300"/><p className="mt-3 text-sm font-semibold text-slate-500">No QR scan yet</p></div> : <div className="mt-5 space-y-4"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 size={20}/><span className="text-sm font-bold">QR verified</span></div><p className="mt-2 text-2xl font-black text-emerald-900">{scannedBatch.id}</p></div><div className="grid gap-3 sm:grid-cols-2"><Info label="Item" value={scannedBatch.item}/><Info label="Quantity" value={`${scannedBatch.quantity.toLocaleString("en-IN")} ${scannedBatch.unit}`}/><Info label="Origin" value={scannedBatch.origin}/><Info label="Destination" value={scannedBatch.destination}/><Info label="Campaign" value={scannedBatch.campaignId}/><Info label="Status" value={scannedBatch.status.replace("_", " ")}/></div><button type="button" onClick={() => window.location.href = "/volunteer/delivery"} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Continue to delivery</button></div>}
        </div>
      </div>
    </>
  );
}

function VolunteerDelivery() {
  const [deliveries, setDeliveries] = useState<VolunteerDelivery[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => setDeliveries(readVolunteerDeliveries()), []);

  const updateDelivery = (id: string, status: VolunteerDelivery["status"]) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const next = deliveries.map((delivery) => {
      if (delivery.id !== id) return delivery;
      return {
        ...delivery,
        status,
        pickedUpAt: status === "PICKED_UP" ? now : delivery.pickedUpAt,
        deliveredAt: status === "DELIVERED" ? now : delivery.deliveredAt,
        gps: status === "DELIVERED" || status === "IN_TRANSIT" ? (delivery.gps || "23.3541, 94.8723") : delivery.gps,
        evidence: status === "DELIVERED" ? "Photo + GPS + volunteer confirmation" : delivery.evidence,
      };
    });
    setDeliveries(next);
    localStorage.setItem("reliefchain-volunteer-deliveries", JSON.stringify(next));
    setMessage(`${id} updated to ${status.replace("_", " ")}.`);
  };

  const statusStyle = (status: VolunteerDelivery["status"]) => status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : status === "IN_TRANSIT" ? "bg-blue-50 text-blue-700" : status === "PICKED_UP" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700";

  return (
    <>
      <Title title="Delivery Tracking" desc="Move relief batches through pickup, transit and confirmed delivery." />
      {message && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
      <div className="space-y-4">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="rounded-2xl border bg-white p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{delivery.batchId}</h2><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusStyle(delivery.status)}`}>{delivery.status.replace("_", " ")}</span></div><p className="mt-1 text-sm font-semibold text-slate-700">{delivery.item} • {delivery.quantity.toLocaleString("en-IN")} {delivery.unit}</p><div className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><Info label="Origin" value={delivery.origin}/><Info label="Destination" value={delivery.destination}/><Info label="Volunteer" value={delivery.volunteer}/><Info label="Assigned" value={delivery.assignedAt}/>{delivery.pickedUpAt && <Info label="Picked up" value={delivery.pickedUpAt}/>} {delivery.deliveredAt && <Info label="Delivered" value={delivery.deliveredAt}/>} {delivery.gps && <Info label="GPS" value={delivery.gps}/>} {delivery.evidence && <Info label="Evidence" value={delivery.evidence}/>}</div></div>
              <div className="flex flex-wrap gap-2 xl:w-64 xl:justify-end">
                {delivery.status === "ASSIGNED" && <button type="button" onClick={() => updateDelivery(delivery.id, "PICKED_UP")} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">Mark picked up</button>}
                {delivery.status === "PICKED_UP" && <button type="button" onClick={() => updateDelivery(delivery.id, "IN_TRANSIT")} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Start transit</button>}
                {delivery.status === "IN_TRANSIT" && <button type="button" onClick={() => updateDelivery(delivery.id, "DELIVERED")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Confirm delivery</button>}
                {delivery.status === "DELIVERED" && <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700">Delivery confirmed ✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function VolunteerDistribution() {
  const [batchId, setBatchId] = useState("");
  const [beneficiaryCode, setBeneficiaryCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("Camp A, Dibrugarh");
  const [evidence, setEvidence] = useState("GPS + timestamp + volunteer confirmation");
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [records, setRecords] = useState<DistributionRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("reliefchain-volunteer-distributions");
      if (saved) setRecords(JSON.parse(saved));
    } catch { setRecords([]); }
    const last = localStorage.getItem("reliefchain-last-scanned-batch");
    if (last) { try { setSelectedBatch(JSON.parse(last)); setBatchId(JSON.parse(last).id); } catch { /* ignore */ } }
  }, []);

  const loadBatch = () => {
    const found = getInventory().find((batch) => batch.id === batchId.trim());
    setSelectedBatch(found || null);
    setMessage(found ? `Batch ${found.id} loaded for distribution.` : "Batch not found. Scan or enter a valid inventory batch ID.");
  };

  const scanBeneficiary = () => {
    const code = `BEN-${Math.floor(100000 + Math.random() * 899999)}`;
    setBeneficiaryCode(code);
    setMessage(`Beneficiary QR verified: ${code}. No private beneficiary details are displayed.`);
  };

  const recordDistribution = () => {
    if (!selectedBatch || !beneficiaryCode.trim() || !quantity || Number(quantity) <= 0 || !location.trim()) {
      setMessage("Select a batch, scan a beneficiary QR, enter quantity and location.");
      return;
    }
    if (Number(quantity) > selectedBatch.quantity) {
      setMessage("Distribution quantity cannot exceed the scanned batch quantity.");
      return;
    }
    const record: DistributionRecord = {
      id: `DIST-${Date.now()}`,
      batchId: selectedBatch.id,
      beneficiaryCode: beneficiaryCode.trim(),
      item: selectedBatch.item,
      quantity: Number(quantity),
      unit: selectedBatch.unit,
      location: location.trim(),
      volunteer: "Field Volunteer",
      timestamp: new Date().toISOString(),
      evidence: evidence.trim() || "GPS + timestamp + volunteer confirmation",
    };
    const next = [record, ...records];
    setRecords(next);
    localStorage.setItem("reliefchain-volunteer-distributions", JSON.stringify(next));
    setQuantity("");
    setMessage(`Distribution ${record.id} recorded successfully.`);
  };

  return (
    <>
      <Title title="Relief Distribution" desc="Scan the batch, verify the beneficiary QR and record the handover." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">Create distribution record</h2>
          <p className="mt-1 text-sm text-slate-500">Only a beneficiary reference code is stored in this frontend demo.</p>
          <div className="mt-5 space-y-4">
            <div><label className="text-sm font-bold">Batch ID</label><div className="mt-2 flex gap-2"><input value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="BATCH-RC-2048" className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm"/><button type="button" onClick={loadBatch} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">Load</button></div></div>
            {selectedBatch && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs font-bold text-blue-700">Selected batch</p><p className="mt-1 font-bold text-blue-950">{selectedBatch.id} • {selectedBatch.item}</p><p className="mt-1 text-xs text-blue-800">Available: {selectedBatch.quantity.toLocaleString("en-IN")} {selectedBatch.unit} • Destination: {selectedBatch.destination}</p></div>}
            <div><label className="text-sm font-bold">Beneficiary QR</label><div className="mt-2 flex gap-2"><input value={beneficiaryCode} onChange={(e) => setBeneficiaryCode(e.target.value)} placeholder="Scan beneficiary QR" className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm"/><button type="button" onClick={scanBeneficiary} className="rounded-xl border px-4 py-3 text-sm font-bold"><QrCode size={17}/></button></div><p className="mt-1 text-xs text-slate-500">Demo scan creates a non-identifying beneficiary reference.</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-sm font-bold">Quantity distributed</label><input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"/></div><div><label className="text-sm font-bold">Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"/></div></div>
            <div><label className="text-sm font-bold">Evidence</label><input value={evidence} onChange={(e) => setEvidence(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"/><p className="mt-1 text-xs text-slate-500">GPS, timestamp, photo and supervisor confirmation can be attached later through the backend.</p></div>
            <button type="button" onClick={recordDistribution} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white">Confirm distribution</button>
            {message && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{message}</div>}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">Recent distributions</h2>
          <p className="mt-1 text-sm text-slate-500">Immutable blockchain proof will be added during backend/blockchain integration.</p>
          <div className="mt-5 space-y-3">
            {records.length === 0 ? <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No distribution records yet.</div> : records.slice(0, 6).map((record) => <div key={record.id} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">{record.item}</p><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">RECORDED</span></div><p className="mt-1 text-xs text-slate-500">{record.id} • {record.batchId}</p><div className="mt-3 grid gap-2 text-xs sm:grid-cols-2"><Info label="Quantity" value={`${record.quantity} ${record.unit}`}/><Info label="Beneficiary ref" value={record.beneficiaryCode}/><Info label="Location" value={record.location}/><Info label="Evidence" value={record.evidence}/></div></div>)}
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================
   NGO INVOICE TRACKING
========================= */

type InvoiceStatus = "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "REQUEST_EVIDENCE";
type InvoiceRecord = {
  id: string;
  campaignId: string;
  vendor: string;
  category: string;
  amount: number;
  invoiceNo: string;
  date: string;
  status: InvoiceStatus;
  riskScore: number;
  reasons: string[];
  evidence: string;
};

const defaultInvoices: InvoiceRecord[] = [
  { id: "INV-2026-1042", campaignId: "RC-1001", vendor: "NorthEast Transport Co.", category: "Transport", amount: 18500, invoiceNo: "NET-8841", date: "2026-09-08", status: "REQUEST_EVIDENCE", riskScore: 74, reasons: ["Missing receipt/evidence", "Amount above campaign baseline"], evidence: "GPS available; receipt pending" },
  { id: "INV-2026-1043", campaignId: "RC-1001", vendor: "MedSupply Assam", category: "Medical supplies", amount: 42000, invoiceNo: "MSA-4421", date: "2026-09-07", status: "UNDER_REVIEW", riskScore: 48, reasons: ["Unusual quantity", "Vendor verification pending"], evidence: "Invoice uploaded" },
  { id: "INV-2026-1044", campaignId: "RC-1002", vendor: "Himalayan Shelter Works", category: "Shelter kits", amount: 27600, invoiceNo: "HSW-2109", date: "2026-09-06", status: "VERIFIED", riskScore: 18, reasons: ["Evidence complete"], evidence: "Invoice + delivery proof" },
];

function getInvoices(): InvoiceRecord[] {
  try {
    const saved = localStorage.getItem("reliefchain-invoices");
    if (!saved) { localStorage.setItem("reliefchain-invoices", JSON.stringify(defaultInvoices)); return defaultInvoices; }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultInvoices;
  } catch { return defaultInvoices; }
}

function riskMeta(score: number) {
  if (score <= 30) return { label: "LOW", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score <= 70) return { label: "MEDIUM", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "HIGH", cls: "bg-red-50 text-red-700 border-red-200" };
}

function NgoInvoices() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vendor: "", category: "Transport", amount: "", invoiceNo: "", campaignId: "RC-1001", evidence: "" });
  useEffect(() => setInvoices(getInvoices()), []);

  const persist = (next: InvoiceRecord[]) => { setInvoices(next); localStorage.setItem("reliefchain-invoices", JSON.stringify(next)); };
  const updateStatus = (id: string, status: InvoiceStatus) => { persist(invoices.map(i => i.id === id ? { ...i, status } : i)); setMessage(`${id} updated to ${status.replace("_", " ")}.`); };
  const addInvoice = () => {
    const amount = Number(form.amount);
    if (!form.vendor.trim() || !form.invoiceNo.trim() || !amount || amount <= 0) { setMessage("Vendor, invoice number and a valid amount are required."); return; }
    const risk = amount > 35000 ? 62 : form.evidence.trim() ? 18 : 74;
    const invoice: InvoiceRecord = { id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 8999)}`, campaignId: form.campaignId, vendor: form.vendor.trim(), category: form.category, amount, invoiceNo: form.invoiceNo.trim(), date: new Date().toISOString().slice(0,10), status: "SUBMITTED", riskScore: risk, reasons: form.evidence.trim() ? ["Evidence supplied"] : ["Missing receipt/evidence"], evidence: form.evidence.trim() || "Evidence pending" };
    persist([invoice, ...invoices]); setForm({ vendor:"", category:"Transport", amount:"", invoiceNo:"", campaignId:"RC-1001", evidence:"" }); setShowForm(false); setMessage(`${invoice.id} submitted for verification.`);
  };
  const filtered = invoices.filter(i => filter === "ALL" || i.status === filter);
  const total = invoices.reduce((s,i)=>s+i.amount,0);
  const pending = invoices.filter(i=>!['VERIFIED','REJECTED'].includes(i.status)).length;

  return <>
    <Title title="Invoice Tracking" desc="Submit, monitor and verify campaign expense invoices with AI risk context." action={<button type="button" onClick={()=>setShowForm(v=>!v)} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"><Receipt className="mr-2 inline" size={17}/>New Invoice</button>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Receipt} label="Invoices" value={String(invoices.length)}/><Stat icon={Wallet} label="Invoice value" value={money(total)}/><Stat icon={FileCheck2} label="Pending review" value={String(pending)}/><Stat icon={AlertTriangle} label="High risk" value={String(invoices.filter(i=>i.riskScore>=71).length)}/></div>
    {showForm && <div className="mt-6 rounded-2xl border bg-white p-6"><h2 className="text-lg font-bold">Submit expense invoice</h2><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3"><label className="text-sm font-semibold">Vendor<input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="Vendor name"/></label><label className="text-sm font-semibold">Invoice number<input value={form.invoiceNo} onChange={e=>setForm({...form,invoiceNo:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="INV-8841"/></label><label className="text-sm font-semibold">Amount<input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="18500"/></label><label className="text-sm font-semibold">Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"><option>Transport</option><option>Medical supplies</option><option>Food</option><option>Shelter</option><option>Other</option></select></label><label className="text-sm font-semibold">Campaign ID<input value={form.campaignId} onChange={e=>setForm({...form,campaignId:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"/></label><label className="text-sm font-semibold">Evidence / receipt reference<input value={form.evidence} onChange={e=>setForm({...form,evidence:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="Receipt uploaded / GPS / photo"/></label></div><button type="button" onClick={addInvoice} className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">Submit Invoice</button></div>}
    <div className="mt-6 flex flex-wrap gap-2">{["ALL","SUBMITTED","UNDER_REVIEW","REQUEST_EVIDENCE","VERIFIED","REJECTED"].map(v=><button key={v} type="button" onClick={()=>setFilter(v)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter===v?"bg-slate-900 text-white":"border bg-white text-slate-600"}`}>{v.replace("_"," ")}</button>)}</div>
    {message && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{message}</div>}
    <div className="mt-5 space-y-4">{filtered.map(i=>{const r=riskMeta(i.riskScore);return <div key={i.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{i.vendor}</h2><span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${r.cls}`}>{r.label} • {i.riskScore}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{i.status}</span></div><p className="mt-2 text-xs text-slate-500">{i.id} • {i.invoiceNo} • {i.campaignId} • {i.date}</p></div><p className="text-xl font-black">{money(i.amount)}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Info label="Category" value={i.category}/><Info label="Evidence" value={i.evidence}/><Info label="AI reasons" value={i.reasons.join(" • ")}/></div><div className="mt-4 flex flex-wrap gap-2">{i.status !== "VERIFIED" && <button type="button" onClick={()=>updateStatus(i.id,"UNDER_REVIEW")} className="rounded-xl border px-4 py-2 text-xs font-bold">Send to review</button>}{i.status !== "VERIFIED" && <button type="button" onClick={()=>updateStatus(i.id,"REQUEST_EVIDENCE")} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">Request evidence</button>}{i.status !== "VERIFIED" && <button type="button" onClick={()=>updateStatus(i.id,"VERIFIED")} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Mark verified</button>}</div></div>})}</div>
  </>;
}

/* =========================
   NGO DISTRIBUTION MONITOR
========================= */

function NgoDistribution() {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [message, setMessage] = useState("");
  useEffect(()=>setBatches(getInventory()),[]);
  const update = (id:string,status:InventoryBatch["status"]) => { const next=batches.map(b=>b.id===id?{...b,status,updatedAt:new Date().toISOString().slice(0,10)}:b); setBatches(next); localStorage.setItem("reliefchain-ngo-inventory",JSON.stringify(next)); setMessage(`${id} marked ${status.replace("_"," ")}.`); };
  return <>
    <Title title="Distribution Control" desc="Monitor batch movement from warehouse to relief camps and verify handovers." />
    {message && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Boxes} label="Batches" value={String(batches.length)}/><Stat icon={Truck} label="In transit" value={String(batches.filter(b=>b.status==="IN_TRANSIT").length)}/><Stat icon={PackageCheck} label="Delivered" value={String(batches.filter(b=>b.status==="DELIVERED").length)}/><Stat icon={AlertTriangle} label="Low stock" value={String(batches.filter(b=>b.status==="LOW_STOCK").length)}/></div>
    <div className="mt-6 space-y-4">{batches.map(b=><div key={b.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{b.item}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold">{b.id}</span></div><p className="mt-2 text-xs text-slate-500">{b.origin} → {b.destination} • {b.quantity.toLocaleString("en-IN")} {b.unit}</p></div><span className="rounded-full border bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{b.status.replace("_"," ")}</span></div><div className="mt-4 flex flex-wrap gap-2">{b.status==="IN_WAREHOUSE"&&<button type="button" onClick={()=>update(b.id,"IN_TRANSIT")} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">Dispatch batch</button>}{b.status==="IN_TRANSIT"&&<button type="button" onClick={()=>update(b.id,"DELIVERED")} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Confirm delivery</button>}{b.status!=="LOW_STOCK"&&<button type="button" onClick={()=>update(b.id,"LOW_STOCK")} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">Flag low stock</button>}</div></div>)}</div>
  </>;
}

/* =========================
   GOVERNMENT MONITOR / COMMAND CENTER
========================= */

function GovernmentMonitor() {
  const requests = [
    { id:"REQ-301", camp:"Dibrugarh Camp A", item:"Drinking water", qty:"10,000 L", priority:"CRITICAL", status:"MATCHED", warehouse:"Warehouse B", vehicle:"TRUCK-09" },
    { id:"REQ-302", camp:"Mandi Camp 4", item:"Medical kits", qty:"850 kits", priority:"HIGH", status:"PENDING", warehouse:"Guwahati Medical Store", vehicle:"TRUCK-14" },
    { id:"REQ-303", camp:"Puri Camp 2", item:"Shelter kits", qty:"420 kits", priority:"MEDIUM", status:"DISPATCHED", warehouse:"Odisha Hub", vehicle:"TRUCK-21" },
  ];
  const suspicious = [
    { id:"TX-8841", campaign:"RC-1001", issue:"Repeated transaction pattern", risk:87 },
    { id:"EXP-1042", campaign:"RC-1001", issue:"Missing evidence", risk:74 },
    { id:"DIST-712", campaign:"RC-1002", issue:"Distribution quantity mismatch", risk:79 },
  ];
  return <>
    <Title title="ReliefChain Command Center" desc="Live operational monitoring for disasters, funds, relief movement and risk alerts." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><Stat icon={AlertTriangle} label="Active disasters" value="3"/><Stat icon={CircleDollarSign} label="Total funds" value="₹19.13L"/><Stat icon={Users} label="People assisted" value="10,200"/><Stat icon={Boxes} label="Relief items" value="3,670"/><Stat icon={ShieldCheck} label="Active NGOs" value="28"/><Stat icon={AlertTriangle} label="Suspicious records" value={String(suspicious.length)}/></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-3"><div className="rounded-2xl border bg-white p-6 xl:col-span-2"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Operational Monitor</h2><p className="mt-1 text-sm text-slate-500">Disaster zones, camps, warehouses, hospitals and field resources.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">LIVE</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Dibrugarh","Flood","12 camps","8 volunteers"],["Mandi","Landslide","6 camps","14 volunteers"],["Puri","Cyclone","9 camps","11 volunteers"],["Guwahati","Logistics Hub","4 warehouses","21 vehicles"]].map(([a,b,c,d])=><div key={a} className="rounded-2xl border p-4"><div className="flex items-center gap-2 text-blue-600"><MapPin size={17}/><span className="text-xs font-bold">{b}</span></div><p className="mt-3 font-bold">{a}</p><p className="mt-1 text-xs text-slate-500">{c}</p><p className="mt-1 text-xs text-slate-500">{d}</p></div>)}</div><div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center gap-2"><Globe2 size={18}/><p className="font-bold">Live field network</p></div><div className="mt-4 grid gap-3 sm:grid-cols-4"><div><p className="text-2xl font-black">42</p><p className="text-xs text-slate-300">Camps</p></div><div><p className="text-2xl font-black">17</p><p className="text-xs text-slate-300">Warehouses</p></div><div><p className="text-2xl font-black">63</p><p className="text-xs text-slate-300">Volunteers</p></div><div><p className="text-2xl font-black">21</p><p className="text-xs text-slate-300">Vehicles</p></div></div></div></div>
      <div className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-red-50 p-3 text-red-600"><AlertTriangle/></div><div><h2 className="font-bold">AI Risk Monitor</h2><p className="text-xs text-slate-500">Records requiring human review.</p></div></div><div className="mt-5 space-y-3">{suspicious.map(x=>{const r=riskMeta(x.risk);return <div key={x.id} className="rounded-xl border p-4"><div className="flex items-center justify-between"><p className="font-bold text-sm">{x.id}</p><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${r.cls}`}>{r.label} {x.risk}</span></div><p className="mt-2 text-xs text-slate-600">{x.issue}</p><p className="mt-1 text-[11px] text-slate-400">Campaign {x.campaign}</p></div>})}</div></div></div>
    <div className="mt-6 rounded-2xl border bg-white p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-3 text-amber-600"><AlertTriangle/></div><div><h2 className="text-lg font-bold">Emergency Resource Matching</h2><p className="text-sm text-slate-500">Warehouse → vehicle → volunteer matching for priority camp requests.</p></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b text-xs text-slate-500"><th className="px-3 py-3">Request</th><th className="px-3 py-3">Camp</th><th className="px-3 py-3">Need</th><th className="px-3 py-3">Warehouse</th><th className="px-3 py-3">Vehicle</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{requests.map(r=><tr key={r.id} className="border-b last:border-0"><td className="px-3 py-4 font-bold">{r.id}</td><td className="px-3 py-4">{r.camp}</td><td className="px-3 py-4">{r.item} • {r.qty}</td><td className="px-3 py-4">{r.warehouse}</td><td className="px-3 py-4">{r.vehicle}</td><td className="px-3 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{r.status}</span></td></tr>)}</tbody></table></div></div>
  </>;
}

/* =========================
   AUDITOR AI MONITOR
========================= */

function AuditorMonitor() {
  const records = [
    { id:"EXP-1042", type:"Expense", score:87, reasons:["Missing receipt/evidence","Amount 60% above normal","Location mismatch","Unusual transaction time"], status:"PENDING" },
    { id:"DIST-712", type:"Distribution", score:79, reasons:["Distribution exceeds expected quantity","Camp capacity mismatch"], status:"PENDING" },
    { id:"BEN-9921", type:"Beneficiary", score:54, reasons:["Possible duplicate registration","Similar aid history"], status:"REQUEST_EVIDENCE" },
    { id:"EXP-1039", type:"Expense", score:22, reasons:["Evidence complete","Amount within normal range"], status:"VERIFIED" },
  ];
  const [items,setItems]=useState(records);
  const decide=(id:string,status:string)=>setItems(items.map(x=>x.id===id?{...x,status}:x));
  return <>
    <Title title="AI Audit Monitor" desc="AI-assisted risk scoring with reasons for every flagged record. Human auditors make the final decision." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Stat icon={Activity} label="Total analyzed" value="1,284"/><Stat icon={CheckCircle2} label="Low risk" value="1,104"/><Stat icon={AlertTriangle} label="Medium risk" value="143"/><Stat icon={AlertTriangle} label="High risk" value="37"/><Stat icon={Users} label="Possible duplicates" value="19"/></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-3"><div className="rounded-2xl border bg-white p-6 lg:col-span-2"><h2 className="text-lg font-bold">Risk distribution</h2><div className="mt-6 space-y-5"><div><div className="flex justify-between text-sm"><span>LOW · 0–30</span><b>86%</b></div><div className="mt-2 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500" style={{width:"86%"}}/></div></div><div><div className="flex justify-between text-sm"><span>MEDIUM · 31–70</span><b>11%</b></div><div className="mt-2 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-amber-400" style={{width:"11%"}}/></div></div><div><div className="flex justify-between text-sm"><span>HIGH · 71–100</span><b>3%</b></div><div className="mt-2 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-red-500" style={{width:"3%"}}/></div></div></div></div><div className="rounded-2xl border bg-white p-6"><h2 className="font-bold">AI signals</h2><div className="mt-4 space-y-3">{["Missing evidence","Quantity anomaly","Location mismatch","Timing anomaly","Distribution mismatch"].map(x=><div key={x} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs"><span>{x}</span><b>{Math.floor(8+Math.random()*30)}</b></div>)}</div></div></div>
    <div className="mt-6 space-y-4">{items.map(item=>{const r=riskMeta(item.score);return <div key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{item.id}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold">{item.type}</span><span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${r.cls}`}>Risk {item.score} · {r.label}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{item.status}</span></div><div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-700">Why AI flagged this</p><ul className="mt-2 space-y-1 text-xs text-slate-600">{item.reasons.map(reason=><li key={reason}>• {reason}</li>)}</ul></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>decide(item.id,"VERIFIED")} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">VERIFY</button><button type="button" onClick={()=>decide(item.id,"REJECTED")} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">REJECT</button><button type="button" onClick={()=>decide(item.id,"REQUEST_EVIDENCE")} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">REQUEST EVIDENCE</button></div></div></div>})}</div>
  </>;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<AuthPage />}
      />

      <Route
        path="/workspace"
        element={<Login />}
      />

      <Route
        path="/authorize/:role"
        element={<AuthorizationPage />}
      />

      <Route
        path="/transparency/:id"
        element={<TransparencyPage />} 
      />

      {(
        [
          "donor",
          "ngo",
          "volunteer",
          "government",
          "auditor",
          "admin",
        ] as Role[]
      ).map((role) => (
        <Route
          key={role}
          path={`/${role}`}
          element={
            <Layout role={role}>
              {role === "volunteer" ? <VolunteerDashboard /> : <Dashboard role={role} />}
            </Layout>
          }
        />
      ))}

      <Route
        path="/donor/campaign/:id"
        element={
          <Layout role="donor">
            <CampaignDetails />
          </Layout>
        }
      />

      <Route
        path="/donor/campaigns"
        element={
          <Layout role="donor">
            <Donor campaignsPage />
          </Layout>
        }
      />

      <Route
        path="/donor/donations"
        element={
          <Layout role="donor">
            <DonationHistory />
          </Layout>
        }
      />

      <Route
        path="/donor/donation/:id"
        element={
          <Layout role="donor">
            <DonationDetails />
          </Layout>
        }
      />

      <Route
        path="/donor/impact"
        element={
          <Layout role="donor">
            <DonorImpact />
          </Layout>
        }
      />

      <Route
        path="/donor/profile"
        element={
          <Layout role="donor">
            <DonorProfile />
          </Layout>
        }
      />

      <Route
        path="/ngo/campaign/create"
        element={
          <Layout role="ngo">
            <CreateCampaign />
          </Layout>
        }
      />

      <Route
        path="/ngo/campaigns"
        element={
          <Layout role="ngo">
            <NgoCampaigns />
          </Layout>
        }
      />

      <Route
        path="/ngo/campaign/:id"
        element={
          <Layout role="ngo">
            <NgoCampaignDetails />
          </Layout>
        }
      />

      <Route
        path="/ngo/campaign/:id/edit"
        element={
          <Layout role="ngo">
            <NgoCampaignEdit />
          </Layout>
        }
      />

      <Route
        path="/ngo/inventory"
        element={
          <Layout role="ngo">
            <NgoInventory />
          </Layout>
        }
      />

      <Route path="/ngo/distribution" element={<Layout role="ngo"><NgoDistribution /></Layout>} />
      <Route path="/ngo/invoices" element={<Layout role="ngo"><NgoInvoices /></Layout>} />

      <Route
        path="/volunteer/tasks"
        element={
          <Layout role="volunteer">
            <VolunteerTasks />
          </Layout>
        }
      />

      <Route
        path="/volunteer/scan"
        element={
          <Layout role="volunteer">
            <VolunteerScan />
          </Layout>
        }
      />

      <Route
        path="/volunteer/delivery"
        element={
          <Layout role="volunteer">
            <VolunteerDelivery />
          </Layout>
        }
      />

      <Route
        path="/volunteer/distribution"
        element={
          <Layout role="volunteer">
            <VolunteerDistribution />
          </Layout>
        }
      />

      <Route path="/reports" element={<Reports />} />

      <Route path="/admin" element={<Layout role="admin"><AdminDashboard /></Layout>} />

      <Route path="/government" element={<Layout role="government"><GovernmentMonitor /></Layout>} />
      <Route path="/government/monitor" element={<Layout role="government"><GovernmentMonitor /></Layout>} />
      <Route path="/government/map" element={<Layout role="government"><DisasterMap /></Layout>} />

      <Route
        path="/government/requests"
        element={
          <Layout role="government">
            <Table
              title="Emergency Requests"
              desc="Priority requests."
              items={[
                "Mandi medical supplies",
                "Dibrugarh drinking water",
                "Puri shelter kits",
              ]}
            />
          </Layout>
        }
      />

      <Route path="/auditor" element={<Layout role="auditor"><AuditorMonitor /></Layout>} />
      <Route path="/auditor/monitor" element={<Layout role="auditor"><AuditorMonitor /></Layout>} />
      <Route path="/auditor/pending" element={<Layout role="auditor"><AuditorMonitor /></Layout>} />

      <Route
        path="/auditor/expenses"
        element={
          <Layout role="auditor">
            <Table
              title="Expenses"
              desc="Campaign expense records."
              items={[
                "Transport — ₹18,500",
                "Medical supplies — ₹42,000",
                "Food distribution — ₹27,600",
              ]}
            />
          </Layout>
        }
      />

      <Route
        path="/auditor/evidence"
        element={
          <Layout role="auditor">
            <Table
              title="Evidence"
              desc="GPS, photos and supporting records."
              items={[
                "Expense E-102",
                "Delivery E-881",
                "Distribution E-712",
              ]}
            />
          </Layout>
        }
      />

      <Route
        path="/auditor/reviews"
        element={
          <Layout role="auditor">
            <Table
              title="Reviews"
              desc="Completed audit decisions."
              items={[
                "RC-1001",
                "RC-1002",
                "RC-1003",
              ]}
            />
          </Layout>
        }
      />

      {[
        "users",
        "ngos",
        "campaigns",
        "auditors",
        "logs",
      ].map((item) => (
        <Route
          key={item}
          path={`/admin/${item}`}
          element={
            <Layout role="admin">
              <Table
                title={
                  item === "ngos"
                    ? "NGOs"
                    : item[0].toUpperCase() +
                      item.slice(1)
                }
                desc="Administration and governance."
                items={[
                  "Record 1",
                  "Record 2",
                  "Record 3",
                ]}
              />
            </Layout>
          }
        />
      ))}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;