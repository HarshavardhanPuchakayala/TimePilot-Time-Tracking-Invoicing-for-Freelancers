import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutDashboard, Users, FileText, Timer as TimerIcon, Search, Plus, Play, Pause,
  Square, ChevronRight, ChevronLeft, Check, CheckCircle2, Clock, DollarSign,
  AlertCircle, Mail, Phone, X, Download, Send, Moon, Sun, Menu, PlusCircle,
  ArrowUpRight, Building2, FolderKanban, CalendarClock, Inbox, UserPlus,
  MoreHorizontal, Pencil,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

const CLIENTS = [
  { id: "c1", name: "Sarah Chen", company: "Nimbus Studio", email: "sarah@nimbusstudio.co", phone: "+1 (415) 555-0142", initials: "SC", color: "bg-indigo-600", totalBilled: 18400 },
  { id: "c2", name: "Marcus Webb", company: "Foundry & Co.", email: "marcus@foundryco.com", phone: "+1 (212) 555-0193", initials: "MW", color: "bg-teal-600", totalBilled: 9200 },
  { id: "c3", name: "Priya Anand", company: "Loop Health", email: "priya@loophealth.io", phone: "+1 (628) 555-0177", initials: "PA", color: "bg-amber-600", totalBilled: 27650 },
  { id: "c4", name: "Tomasz Kowalski", company: "Vector Freight", email: "tomasz@vectorfreight.eu", phone: "+48 22 555 0110", initials: "TK", color: "bg-rose-600", totalBilled: 4100 },
];

const PROJECTS = [
  { id: "p1", clientId: "c1", name: "Brand Refresh — Web", rate: 95, status: "active", totalHours: 62.5, unbilledHours: 8.25 },
  { id: "p2", clientId: "c1", name: "Marketing Site Rebuild", rate: 95, status: "active", totalHours: 21, unbilledHours: 0 },
  { id: "p3", clientId: "c2", name: "Q3 Product Launch", rate: 120, status: "active", totalHours: 40, unbilledHours: 5.5 },
  { id: "p4", clientId: "c3", name: "Patient Portal — Phase 2", rate: 140, status: "active", totalHours: 128, unbilledHours: 14 },
  { id: "p5", clientId: "c4", name: "Logistics Dashboard", rate: 85, status: "paused", totalHours: 12, unbilledHours: 0 },
];

const TIME_ENTRIES = [
  { id: "t1", projectId: "p1", date: "2026-08-22", desc: "Homepage hero layout + responsive breakpoints", hours: 3.25, billed: false },
  { id: "t2", projectId: "p1", date: "2026-08-21", desc: "Client feedback round — nav revisions", hours: 1.5, billed: false },
  { id: "t3", projectId: "p1", date: "2026-08-19", desc: "Component library setup in Figma", hours: 3.5, billed: false },
  { id: "t4", projectId: "p1", date: "2026-08-10", desc: "Kickoff call + discovery notes", hours: 1, billed: true },
  { id: "t5", projectId: "p3", date: "2026-08-20", desc: "Launch checklist + QA pass on pricing page", hours: 2.5, billed: false },
  { id: "t6", projectId: "p3", date: "2026-08-18", desc: "Analytics events wiring", hours: 3, billed: false },
  { id: "t7", projectId: "p4", date: "2026-08-23", desc: "Appointment reminders — edge cases", hours: 4, billed: false },
  { id: "t8", projectId: "p4", date: "2026-08-22", desc: "Accessibility audit — forms", hours: 3.5, billed: false },
  { id: "t9", projectId: "p4", date: "2026-08-15", desc: "Patient intake flow redesign", hours: 6.5, billed: false },
];

const INVOICES = [
  { id: "inv1", number: "INV-1042", clientId: "c3", amount: 4200, status: "paid", issueDate: "2026-07-01", dueDate: "2026-07-15", paidDate: "2026-07-10" },
  { id: "inv2", number: "INV-1043", clientId: "c1", amount: 1187.5, status: "pending", issueDate: "2026-08-10", dueDate: "2026-08-24" },
  { id: "inv3", number: "INV-1041", clientId: "c2", amount: 2640, status: "overdue", issueDate: "2026-07-20", dueDate: "2026-08-03" },
  { id: "inv4", number: "INV-1040", clientId: "c3", amount: 5600, status: "paid", issueDate: "2026-06-01", dueDate: "2026-06-15", paidDate: "2026-06-12" },
];

const RECENT_ACTIVITY = [
  { id: "a1", type: "entry", text: "Logged 4h on Patient Portal — Phase 2", client: "Loop Health", time: "2h ago" },
  { id: "a2", type: "invoice", text: "INV-1043 sent to Nimbus Studio", client: "Nimbus Studio", time: "yesterday" },
  { id: "a3", type: "paid", text: "INV-1042 marked as paid — $4,200.00", client: "Loop Health", time: "2 days ago" },
  { id: "a4", type: "entry", text: "Logged 2.5h on Q3 Product Launch", client: "Foundry & Co.", time: "3 days ago" },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const money = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const clientById = (id) => CLIENTS.find((c) => c.id === id);
const projectsForClient = (id) => PROJECTS.filter((p) => p.clientId === id);
const entriesForProject = (id) => TIME_ENTRIES.filter((t) => t.projectId === id);
const unbilledFor = (id) => entriesForProject(id).filter((t) => !t.billed);

function formatTimer(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/*  SMALL UI PRIMITIVES                                                */
/* ------------------------------------------------------------------ */

function Badge({ status }) {
  const map = {
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    overdue: "bg-red-50 text-red-700 ring-red-600/20",
    active: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    paused: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };
  const label = { paid: "Paid", pending: "Pending", overdue: "Overdue", active: "Active", paused: "Paused" }[status] || status;
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors duration-300", map[status])}>
      <span className={cx("h-1.5 w-1.5 rounded-full", {
        paid: "bg-emerald-500", pending: "bg-amber-500", overdue: "bg-red-500", active: "bg-indigo-500", paused: "bg-slate-400",
      }[status])} />
      {label}
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", className = "", icon: Icon, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-5 py-3 text-base" };
  const variants = {
    primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5",
    secondary: "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:-translate-y-0.5",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-white text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50",
  };
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function Card({ children, className = "", hoverable = false, ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm transition-all duration-200",
        hoverable && "hover:shadow-lg hover:-translate-y-0.5 hover:ring-slate-300 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={cx("animate-pulse rounded-lg bg-slate-200/80", className)} />;
}

function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
        <Icon className="h-8 w-8 text-indigo-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{subtitle}</p>
      {actionLabel && (
        <Button className="mt-5" icon={Plus} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/** Fades + slides content in whenever transKey changes — used for route transitions */
function PageFade({ children, transKey }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, [transKey]);
  return (
    <div className={cx("transition-all duration-300 ease-out", show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      {children}
    </div>
  );
}

/** Small celebratory overlay for success moments — checkmark + a few soft bursts */
function SuccessBurst({ show, label }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 -m-8 flex items-center justify-center">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-emerald-400 animate-ping"
              style={{
                transform: `rotate(${i * 60}deg) translateY(-38px)`,
                animationDelay: `${i * 40}ms`,
                animationDuration: "700ms",
              }}
            />
          ))}
        </div>
        <div className="flex h-16 w-16 scale-100 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-[ping_1s_ease-out_1]" style={{ animationIterationCount: 1 }}>
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </div>
        {label && <p className="mt-3 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-white">{label}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LIVING TIMER — the app's signature element                        */
/* ------------------------------------------------------------------ */

function LivePulse({ size = "sm" }) {
  const dim = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";
  return (
    <span className={cx("relative inline-flex", dim)}>
      <span className={cx("absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75")} />
      <span className={cx("relative inline-flex rounded-full bg-emerald-500", dim)} />
    </span>
  );
}

function GlobalTimerPill({ timer, onToggle }) {
  const project = timer.projectId ? PROJECTS.find((p) => p.id === timer.projectId) : null;
  if (!timer.running && !timer.seconds) {
    return (
      <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-400 md:flex">
        <TimerIcon className="h-4 w-4" />
        <span>No timer running</span>
      </div>
    );
  }
  return (
    <button
      onClick={onToggle}
      className={cx(
        "flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium ring-1 ring-inset transition-all duration-300",
        timer.running ? "bg-indigo-600 text-white ring-indigo-600 shadow-sm shadow-indigo-600/30" : "bg-white text-slate-700 ring-slate-200"
      )}
    >
      {timer.running ? <LivePulse /> : <span className="h-2 w-2 rounded-full bg-slate-300" />}
      <span className="hidden max-w-[10rem] truncate sm:inline">{project?.name || "Untitled session"}</span>
      <span className="font-mono tabular-nums">{formatTimer(timer.seconds)}</span>
      {timer.running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  SIDEBAR + TOPBAR                                                   */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clients", label: "Clients", icon: Users },
  { key: "invoices", label: "Invoices", icon: FileText },
];

function Sidebar({ view, go, mobileOpen, setMobileOpen }) {
  const content = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm shadow-indigo-600/30">
          <TimerIcon className="h-5 w-5 text-white" strokeWidth={2.25} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">TimePilot</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const activeGroup =
            item.key === view ||
            (item.key === "clients" && ["clientDetail", "projectDetail", "invoiceBuilder"].includes(view)) ||
            (item.key === "invoices" && view === "invoiceDetail");
          return (
            <button
              key={item.key}
              onClick={() => {
                go(item.key);
                setMobileOpen(false);
              }}
              className={cx(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                activeGroup ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {activeGroup && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />}
              <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={activeGroup ? 2.25 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mx-3 mb-4 mt-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">AK</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">Alex Kim</p>
            <p className="truncate text-xs text-slate-500">Freelance Designer</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white/80 backdrop-blur md:flex">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            <button className="absolute right-3 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

function TopBar({ title, timer, onToggleTimer, isDark, setIsDark, setMobileOpen }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search…"
            className="w-56 rounded-lg border-0 bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <GlobalTimerPill timer={timer} onToggle={onToggleTimer} />
        <button
          onClick={() => setIsDark((d) => !d)}
          className="rounded-lg p-2.5 text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-100"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  STAT CARD                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value, trend, tint, loading }) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="mt-4 h-3 w-20" />
        <Skeleton className="mt-2 h-7 w-28" />
      </Card>
    );
  }
  return (
    <Card className="p-5" hoverable>
      <div className={cx("flex h-9 w-9 items-center justify-center rounded-xl", tint.bg)}>
        <Icon className={cx("h-4.5 w-4.5 h-[18px] w-[18px]", tint.text)} />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
        {trend && (
          <span className="mb-0.5 flex items-center gap-0.5 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  SCREEN 1 — DASHBOARD                                               */
/* ------------------------------------------------------------------ */

function Dashboard({ go, timer, startQuickTimer }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const unbilledHours = PROJECTS.reduce((s, p) => s + p.unbilledHours, 0);
  const outstanding = INVOICES.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const monthEarnings = INVOICES.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  const activityIcon = { entry: Clock, invoice: Send, paid: CheckCircle2 };
  const activityTint = { entry: "text-indigo-500 bg-indigo-50", invoice: "text-slate-500 bg-slate-100", paid: "text-emerald-500 bg-emerald-50" };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Good afternoon, Alex</h2>
          <p className="mt-1 text-sm text-slate-500">Tuesday, August 25 — here's where things stand.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={UserPlus} onClick={() => go("clients")}>New client</Button>
          <Button icon={Play} onClick={() => startQuickTimer("p1")}>Start timer</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard loading={loading} icon={Clock} label="Unbilled hours" value={`${unbilledHours.toFixed(2)}h`} tint={{ bg: "bg-indigo-50", text: "text-indigo-600" }} />
        <StatCard loading={loading} icon={AlertCircle} label="Outstanding invoices" value={money(outstanding)} tint={{ bg: "bg-amber-50", text: "text-amber-600" }} />
        <StatCard loading={loading} icon={DollarSign} label="This month, earned" value={money(monthEarnings)} trend="12.4%" tint={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View all</button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {RECENT_ACTIVITY.map((a) => {
                const Icon = activityIcon[a.type];
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <div className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", activityTint[a.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-700">{a.text}</p>
                      <p className="text-xs text-slate-400">{a.client}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{a.time}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Active timer</h3>
          {timer.running ? (
            <div className="flex flex-col items-center rounded-xl bg-indigo-50 py-6">
              <LivePulse size="md" />
              <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-indigo-700">{formatTimer(timer.seconds)}</p>
              <p className="mt-1 text-xs text-indigo-500">{PROJECTS.find((p) => p.id === timer.projectId)?.name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-xl bg-slate-50 py-8 text-center">
              <TimerIcon className="h-6 w-6 text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">Nothing tracking right now</p>
              <Button size="sm" className="mt-3" icon={Play} onClick={() => startQuickTimer("p1")}>Start a session</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SCREEN 2 — CLIENTS LIST                                            */
/* ------------------------------------------------------------------ */

function ClientsList({ go, select }) {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = CLIENTS.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.company.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Clients</h2>
          <p className="mt-1 text-sm text-slate-500">{CLIENTS.length} clients, {PROJECTS.length} active projects</p>
        </div>
        <Button icon={Plus}>Add client</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients…"
          className="w-full rounded-lg border-0 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="mt-4 h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients match your search"
          subtitle="Try a different name or company, or add a new client to get started."
          actionLabel="Add client"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const projects = projectsForClient(c.id);
            const unbilled = projects.reduce((s, p) => s + p.unbilledHours, 0);
            return (
              <Card key={c.id} className="p-5" hoverable onClick={() => { select(c.id); go("clientDetail"); }}>
                <div className="flex items-start justify-between">
                  <div className={cx("flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white", c.color)}>{c.initials}</div>
                  {unbilled > 0 && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      {unbilled}h unbilled
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{c.name}</h3>
                <p className="text-sm text-slate-500">{c.company}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-400">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
                  <span className="font-mono font-medium tabular-nums text-slate-700">{money(c.totalBilled)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SCREEN 3 — CLIENT DETAIL                                           */
/* ------------------------------------------------------------------ */

function ClientDetail({ clientId, go, select }) {
  const client = clientById(clientId);
  if (!client) return null;
  const projects = projectsForClient(clientId);
  const clientInvoices = INVOICES.filter((i) => i.clientId === clientId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => go("clients")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ChevronLeft className="h-4 w-4" /> All clients
      </button>

      <Card className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className={cx("flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white", client.color)}>{client.initials}</div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">{client.name}</h2>
              <p className="flex items-center gap-1.5 text-sm text-slate-500"><Building2 className="h-3.5 w-3.5" /> {client.company}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Pencil}>Edit</Button>
            <Button size="sm" icon={FileText} onClick={() => go("invoiceBuilder")}>Create invoice</Button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700"><Mail className="h-3.5 w-3.5 text-slate-400" />{client.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Phone</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700"><Phone className="h-3.5 w-3.5 text-slate-400" />{client.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Total billed</p>
            <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900">{money(client.totalBilled)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Active projects</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{projects.filter((p) => p.status === "active").length}</p>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Projects</h3>
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id} className="flex items-center justify-between p-4" hoverable onClick={() => { select(p.id); go("projectDetail"); }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <FolderKanban className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">${p.rate}/hr · {p.totalHours}h logged</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.unbilledHours > 0 && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">{p.unbilledHours}h unbilled</span>
                )}
                <Badge status={p.status} />
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {clientInvoices.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Invoices</h3>
          <Card className="divide-y divide-slate-100">
            {clientInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.number}</p>
                  <p className="text-xs text-slate-400">Issued {inv.issueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm tabular-nums text-slate-700">{money(inv.amount)}</span>
                  <Badge status={inv.status} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SCREEN 4 — PROJECT DETAIL (timer + entries + manual entry)         */
/* ------------------------------------------------------------------ */

function ProjectDetail({ projectId, timer, onToggleTimer, go, select }) {
  const project = PROJECTS.find((p) => p.id === projectId);
  const [showManual, setShowManual] = useState(false);
  const [entries, setEntries] = useState(entriesForProject(projectId));
  const [form, setForm] = useState({ date: "2026-08-25", hours: "", desc: "" });

  if (!project) return null;
  const client = clientById(project.clientId);
  const isThisRunning = timer.running && timer.projectId === project.id;
  const unbilled = entries.filter((e) => !e.billed);
  const unbilledAmount = unbilled.reduce((s, e) => s + e.hours, 0) * project.rate;

  function addManualEntry() {
    if (!form.hours || !form.desc) return;
    setEntries([{ id: `m${Date.now()}`, projectId, date: form.date, desc: form.desc, hours: parseFloat(form.hours), billed: false }, ...entries]);
    setForm({ date: "2026-08-25", hours: "", desc: "" });
    setShowManual(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => go("clientDetail")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ChevronLeft className="h-4 w-4" /> {client?.name}
      </button>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{project.name}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{client?.company} · ${project.rate}/hr</p>
        </div>
        <Badge status={project.status} />
      </div>

      {/* Timer widget — the signature "living" element, large form */}
      <Card className={cx("p-8 text-center transition-colors duration-500", isThisRunning ? "bg-indigo-600" : "bg-white")}>
        <div className="mx-auto max-w-sm">
          {isThisRunning && (
            <div className="mb-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide text-indigo-200">
              <LivePulse /> Tracking now
            </div>
          )}
          <p className={cx("font-mono text-5xl font-semibold tabular-nums tracking-tight", isThisRunning ? "text-white" : "text-slate-900")}>
            {isThisRunning ? formatTimer(timer.seconds) : "00:00:00"}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              size="lg"
              icon={isThisRunning ? Pause : Play}
              onClick={() => onToggleTimer(project.id)}
              className={isThisRunning ? "bg-white text-indigo-700 hover:bg-indigo-50" : ""}
            >
              {isThisRunning ? "Pause" : "Start timer"}
            </Button>
            {isThisRunning && (
              <Button size="lg" variant="secondary" icon={Square} className="bg-indigo-500 text-white ring-0 hover:bg-indigo-400" onClick={() => onToggleTimer(null, true)}>
                Stop &amp; save
              </Button>
            )}
          </div>
          {!isThisRunning && (
            <button onClick={() => setShowManual((s) => !s)} className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-700">
              or add time manually
            </button>
          )}
        </div>
      </Card>

      {showManual && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Add time manually</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg border-0 bg-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="number" step="0.25" placeholder="Hours" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="rounded-lg border-0 bg-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="rounded-lg border-0 bg-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:col-span-2" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowManual(false)}>Cancel</Button>
            <Button size="sm" icon={Plus} onClick={addManualEntry}>Add entry</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total hours</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-900">{project.totalHours}h</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Unbilled hours</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-amber-600">{unbilled.reduce((s, e) => s + e.hours, 0)}h</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Unbilled value</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-900">{money(unbilledAmount)}</p>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Time entries</h3>
        {entries.length === 0 ? (
          <EmptyState icon={Clock} title="No time logged yet" subtitle="Start the timer above or add a manual entry to begin tracking this project." />
        ) : (
          <Card className="divide-y divide-slate-100">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-700">{e.desc}</p>
                  <p className="text-xs text-slate-400">{e.date}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono text-sm tabular-nums text-slate-600">{e.hours.toFixed(2)}h</span>
                  <span className={cx("rounded-full px-2 py-0.5 text-xs font-medium", e.billed ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700")}>
                    {e.billed ? "Billed" : "Unbilled"}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SCREEN 5 — UNBILLED SUMMARY / INVOICE BUILDER                      */
/* ------------------------------------------------------------------ */

function InvoiceBuilder({ clientId, go, onGenerated }) {
  const client = clientById(clientId) || CLIENTS[0];
  const projects = projectsForClient(client.id);
  const groups = projects.map((p) => ({ project: p, entries: unbilledFor(p.id) })).filter((g) => g.entries.length > 0);

  const allIds = groups.flatMap((g) => g.entries.map((e) => e.id));
  const [selected, setSelected] = useState(new Set(allIds));
  const [generating, setGenerating] = useState(false);

  const rateOf = (projectId) => PROJECTS.find((p) => p.id === projectId).rate;
  const total = groups.reduce(
    (sum, g) => sum + g.entries.filter((e) => selected.has(e.id)).reduce((s, e) => s + e.hours * rateOf(g.project.id), 0),
    0
  );
  const count = groups.reduce((s, g) => s + g.entries.filter((e) => selected.has(e.id)).length, 0);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleGroup(g) {
    const ids = g.entries.map((e) => e.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  function generate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onGenerated(total);
    }, 900);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-28">
      <button onClick={() => go("clientDetail")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ChevronLeft className="h-4 w-4" /> {client.name}
      </button>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">New invoice for {client.company}</h2>
        <p className="mt-1 text-sm text-slate-500">Select the unbilled sessions to include.</p>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={Inbox} title="No unbilled sessions" subtitle="Every session for this client has already been invoiced." />
      ) : (
        <div className="space-y-5">
          {groups.map((g) => {
            const ids = g.entries.map((e) => e.id);
            const allOn = ids.every((id) => selected.has(id));
            return (
              <Card key={g.project.id} className="overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={allOn} onChange={() => toggleGroup(g)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-semibold text-slate-800">{g.project.name}</span>
                  </label>
                  <span className="text-xs text-slate-400">${g.project.rate}/hr</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {g.entries.map((e) => (
                    <label key={e.id} className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <div>
                          <p className="text-sm text-slate-700">{e.desc}</p>
                          <p className="text-xs text-slate-400">{e.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-mono tabular-nums text-slate-500">{e.hours.toFixed(2)}h</span>
                        <span className="font-mono w-16 text-right tabular-nums font-medium text-slate-800">{money(e.hours * g.project.rate)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {groups.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur md:left-60">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs text-slate-400">{count} session{count !== 1 ? "s" : ""} selected</p>
              <p className="font-mono text-xl font-semibold tabular-nums text-slate-900">{money(total)}</p>
            </div>
            <Button size="lg" icon={FileText} disabled={count === 0 || generating} onClick={generate}>
              {generating ? "Generating…" : "Generate invoice"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SCREEN 6 — INVOICE DETAIL                                          */
/* ------------------------------------------------------------------ */

function InvoiceDetail({ invoiceId, go, onMarkPaid }) {
  const invoice = INVOICES.find((i) => i.id === invoiceId) || INVOICES[0];
  const client = clientById(invoice.clientId);
  const [status, setStatus] = useState(invoice.status);
  const lineItems = projectsForClient(client.id).slice(0, 2).map((p) => ({
    project: p.name,
    hours: (invoice.amount / p.rate / 2).toFixed(2),
    rate: p.rate,
  }));

  function markPaid() {
    setStatus("paid");
    onMarkPaid();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => go("invoices")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ChevronLeft className="h-4 w-4" /> All invoices
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Download}>Download PDF</Button>
          <Button variant="secondary" size="sm" icon={Send}>Send</Button>
          {status !== "paid" && <Button size="sm" icon={CheckCircle2} onClick={markPaid}>Mark as paid</Button>}
        </div>
      </div>

      <Card className="p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <TimerIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">TimePilot</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{invoice.number}</p>
            <div className="mt-1"><Badge status={status} /></div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Billed to</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{client.company}</p>
            <p className="text-sm text-slate-500">{client.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Issue date</p>
            <p className="mt-1 text-sm text-slate-700">{invoice.issueDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Due date</p>
            <p className="mt-1 text-sm text-slate-700">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Invoice total</p>
            <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900">{money(invoice.amount)}</p>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 font-medium">Project</th>
              <th className="pb-2 font-medium text-right">Hours</th>
              <th className="pb-2 font-medium text-right">Rate</th>
              <th className="pb-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lineItems.map((li, i) => (
              <tr key={i}>
                <td className="py-3 text-slate-700">{li.project}</td>
                <td className="py-3 text-right font-mono tabular-nums text-slate-600">{li.hours}h</td>
                <td className="py-3 text-right font-mono tabular-nums text-slate-600">${li.rate}/hr</td>
                <td className="py-3 text-right font-mono tabular-nums text-slate-800">{money(li.hours * li.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span className="font-mono tabular-nums">{money(invoice.amount)}</span></div>
            <div className="flex justify-between text-base font-semibold text-slate-900"><span>Total due</span><span className="font-mono tabular-nums">{money(invoice.amount)}</span></div>
          </div>
        </div>
      </Card>
      <p className="text-center text-xs text-slate-400">Thank you for the opportunity to work together.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SCREEN 7 — INVOICE LIST                                            */
/* ------------------------------------------------------------------ */

function InvoiceList({ go, select, invoices }) {
  const [filter, setFilter] = useState("all");
  const filtered = invoices.filter((i) => filter === "all" || i.status === filter);
  const counts = {
    all: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "pending").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };
  const tabs = [
    { key: "all", label: "All" },
    { key: "paid", label: "Paid" },
    { key: "pending", label: "Pending" },
    { key: "overdue", label: "Overdue" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Invoices</h2>
        <Button icon={Plus} onClick={() => go("clients")}>New invoice</Button>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cx(
              "rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
              filter === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label} <span className="text-slate-400">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices here" subtitle="Nothing matches this filter yet — generated invoices will show up here." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Issued</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Due</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => {
                const client = clientById(inv.clientId);
                return (
                  <tr
                    key={inv.id}
                    onClick={() => { select(inv.id); go("invoiceDetail"); }}
                    className="cursor-pointer transition-colors duration-150 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-800">{inv.number}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cx("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white", client.color)}>{client.initials}</div>
                        <span className="text-slate-600">{client.company}</span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 text-slate-500 sm:table-cell">{inv.issueDate}</td>
                    <td className="hidden px-5 py-4 text-slate-500 sm:table-cell">{inv.dueDate}</td>
                    <td className="px-5 py-4 text-right font-mono tabular-nums text-slate-800">{money(inv.amount)}</td>
                    <td className="px-5 py-4 text-right"><Badge status={inv.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  APP SHELL                                                          */
/* ------------------------------------------------------------------ */

export default function TimePilotApp() {
  const [view, setView] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState("c1");
  const [selectedProjectId, setSelectedProjectId] = useState("p1");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("inv2");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [invoices, setInvoices] = useState(INVOICES);
  const [burst, setBurst] = useState({ show: false, label: "" });

  const [timer, setTimer] = useState({ running: false, seconds: 0, projectId: null });

  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => setTimer((t) => ({ ...t, seconds: t.seconds + 1 })), 1000);
    return () => clearInterval(id);
  }, [timer.running]);

  function go(v) {
    setView(v);
  }

  function toggleProjectTimer(projectId, stop = false) {
    if (stop) {
      setTimer({ running: false, seconds: 0, projectId: null });
      return;
    }
    setTimer((t) => {
      if (t.projectId === projectId) return { ...t, running: !t.running };
      return { running: true, seconds: 0, projectId };
    });
  }

  function fireBurst(label) {
    setBurst({ show: true, label });
    setTimeout(() => setBurst({ show: false, label: "" }), 1100);
  }

  const titles = {
    dashboard: "Dashboard",
    clients: "Clients",
    clientDetail: clientById(selectedClientId)?.name || "Client",
    projectDetail: PROJECTS.find((p) => p.id === selectedProjectId)?.name || "Project",
    invoiceBuilder: "New invoice",
    invoiceDetail: invoices.find((i) => i.id === selectedInvoiceId)?.number || "Invoice",
    invoices: "Invoices",
  };

  return (
    <div className={cx("flex h-screen font-sans antialiased", isDark ? "bg-slate-950" : "bg-slate-50")}>
      <Sidebar view={view} go={go} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={titles[view]}
          timer={timer}
          onToggleTimer={() => timer.projectId && toggleProjectTimer(timer.projectId)}
          isDark={isDark}
          setIsDark={setIsDark}
          setMobileOpen={setMobileOpen}
        />
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <PageFade transKey={view + selectedClientId + selectedProjectId + selectedInvoiceId}>
            {view === "dashboard" && (
              <Dashboard go={go} timer={timer} startQuickTimer={(pid) => toggleProjectTimer(pid)} />
            )}
            {view === "clients" && (
              <ClientsList go={go} select={setSelectedClientId} />
            )}
            {view === "clientDetail" && (
              <ClientDetail clientId={selectedClientId} go={go} select={setSelectedProjectId} />
            )}
            {view === "projectDetail" && (
              <ProjectDetail
                projectId={selectedProjectId}
                timer={timer}
                onToggleTimer={toggleProjectTimer}
                go={go}
                select={setSelectedProjectId}
              />
            )}
            {view === "invoiceBuilder" && (
              <InvoiceBuilder
                clientId={selectedClientId}
                go={go}
                onGenerated={(amount) => {
                  const newInv = {
                    id: `inv${Date.now()}`,
                    number: `INV-${1044 + invoices.length}`,
                    clientId: selectedClientId,
                    amount,
                    status: "pending",
                    issueDate: "2026-08-25",
                    dueDate: "2026-09-08",
                  };
                  setInvoices([newInv, ...invoices]);
                  setSelectedInvoiceId(newInv.id);
                  fireBurst("Invoice generated");
                  setTimeout(() => go("invoiceDetail"), 500);
                }}
              />
            )}
            {view === "invoiceDetail" && (
              <InvoiceDetail
                invoiceId={selectedInvoiceId}
                go={go}
                onMarkPaid={() => {
                  setInvoices((prev) => prev.map((i) => (i.id === selectedInvoiceId ? { ...i, status: "paid" } : i)));
                  fireBurst("Marked as paid");
                }}
              />
            )}
            {view === "invoices" && (
              <InvoiceList go={go} select={setSelectedInvoiceId} invoices={invoices} />
            )}
          </PageFade>
        </main>
      </div>
      <SuccessBurst show={burst.show} label={burst.label} />
    </div>
  );
}
