import { useMemo, useState, useEffect, type ReactNode } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  ExternalLink,
  Filter,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SmartLinkShell } from "@/components/SmartLinkShell";
import { api, type UrlItem, type DashboardStats, type AnalyticsOverview, type ClickPoint } from "@/lib/api";
import { toast, Toaster } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease },
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function App() {
  const [dark, setDark] = useState(true);
  return (
    <SmartLinkShell dark={dark} setDark={setDark}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/links" element={<LinksPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <Toaster theme="dark" position="bottom-right" richColors />
    </SmartLinkShell>
  );
}

// -------------------------------------------------------------
// OVERVIEW / DASHBOARD PAGE
// -------------------------------------------------------------
function Overview() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_links: 0,
    total_clicks: 0,
    active_links: 0,
    avg_clicks: 0,
    active_percentage: 0,
    trends: {
      total_links: "Real-time sync",
      total_clicks: "Across all links",
      active_links: "Active destinations",
      avg_clicks: "Per shortened link",
    },
  });
  const [recentLinks, setRecentLinks] = useState<UrlItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;
    api.getDashboardStats()
      .then((data) => {
        if (mounted) setStats(data);
      })
      .catch((err) => console.error("Failed to load dashboard stats", err));

    api.getDashboardRecent()
      .then((data) => {
        if (mounted) setRecentLinks(data);
      })
      .catch((err) => console.error("Failed to load recent links", err));

    return () => {
      mounted = false;
    };
  }, [refreshTrigger]);

  const shorten = async () => {
    if (!url.trim()) {
      return toast.error("Please enter a destination URL");
    }
    let target = url.trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `https://${target}`;
    }

    try {
      setLoading(true);
      const created = await api.createUrl(target);
      setCopied(true);
      toast.success("Short link created successfully", {
        description: created.short_url,
      });
      setUrl("");
      setRefreshTrigger((prev) => prev + 1);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to create short link");
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <motion.div
        {...fade}
        className="relative overflow-hidden rounded-2xl border border-[#38352f] bg-[#1b1b18] px-6 py-8 sm:px-10 sm:py-10"
      >
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#c6a66b]/[0.08] blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#c6a66b]">
            <span className="h-px w-7 bg-[#c6a66b]" /> {todayStr}
          </p>
          <h1 className="max-w-xl font-serif text-4xl leading-[1.08] tracking-[-0.02em] text-[#f4efe5] sm:text-5xl">
            Your links.
            <br />
            <em className="font-normal text-[#c6a66b]">
              Your reach. Your insights.
            </em>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[#b7ad9d]">
            Manage your digital presence with intelligent link analytics and real-time tracking.
          </p>
          <div className="mt-8 flex max-w-xl flex-col gap-2 rounded-xl border border-[#4b463b] bg-[#151513] p-2 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <Link2 size={18} className="shrink-0 text-[#817b70]" />
              <input
                data-testid="overview-url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && shorten()}
                placeholder="Paste a long URL to make it smarter"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[#f4efe5] outline-none placeholder:text-[#817b70]"
              />
            </div>
            <button
              data-testid="overview-shorten-button"
              onClick={shorten}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#c6a66b] px-5 py-3 text-sm font-semibold text-[#171611] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : copied ? (
                <Check size={16} />
              ) : (
                <Zap size={16} />
              )}
              {copied ? "Created" : "Shorten link"}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total links"
          value={stats.total_links.toLocaleString()}
          detail={stats.trends.total_links}
          icon={Link2}
        />
        <Stat
          label="Total clicks"
          value={stats.total_clicks.toLocaleString()}
          detail={stats.trends.total_clicks}
          icon={TrendingUp}
        />
        <Stat
          label="Active links"
          value={stats.active_links.toLocaleString()}
          detail={stats.trends.active_links}
          icon={Zap}
        />
        <Stat
          label="Avg. clicks"
          value={stats.avg_clicks.toString()}
          detail={stats.trends.avg_clicks}
          icon={Users}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard totalClicks={stats.total_clicks} />
        <RecentLinks
          links={recentLinks}
          onDeleted={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Link2;
}) {
  return (
    <motion.div
      {...fade}
      className="border border-[#38352f] bg-[#191917] p-5 transition-transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.14em] text-[#817b70]">
          {label}
        </p>
        <Icon size={16} className="text-[#c6a66b]" />
      </div>
      <p className="mt-4 font-mono text-3xl tracking-tight text-[#f4efe5]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[#738b6b]">↑ {detail}</p>
    </motion.div>
  );
}

// -------------------------------------------------------------
// DYNAMIC CLICK ACTIVITY CHART
// -------------------------------------------------------------
function ChartCard({ full = false, totalClicks = 0 }: { full?: boolean; totalClicks?: number }) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [data, setData] = useState<ClickPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getAnalyticsClicks(period)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => console.error("Failed to load chart data", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [period]);

  const periodSum = useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  }, [data]);

  return (
    <motion.div
      {...fade}
      className={`border border-[#38352f] bg-[#191917] p-5 sm:p-6 ${full ? "w-full" : ""}`}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#817b70]">
            Click activity
          </p>
          <div className="mt-2 flex items-end gap-3">
            <p className="font-mono text-2xl text-[#f4efe5]">
              {periodSum.toLocaleString()}
            </p>
            <span className="mb-1 text-xs text-[#738b6b]">
              ↑ {period} summary
            </span>
          </div>
        </div>
        <div className="flex rounded-lg border border-[#38352f] p-1">
          {(["daily", "weekly", "monthly"] as const).map((item) => (
            <button
              key={item}
              data-testid={`chart-${item}-filter`}
              onClick={() => setPeriod(item)}
              className={`rounded-md px-3 py-1.5 text-xs capitalize transition-colors ${
                period === item
                  ? "bg-[#c6a66b] text-[#171611] font-semibold"
                  : "text-[#817b70] hover:text-[#f4efe5]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[220px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-[#817b70]">
            <Loader2 size={18} className="animate-spin text-[#c6a66b] mr-2" />
            Loading trend data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 2, left: -28, bottom: 0 }}
            >
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c6a66b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#c6a66b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#38352f"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#817b70", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#817b70", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#22221f",
                  border: "1px solid #4b463b",
                  borderRadius: 8,
                  color: "#f4efe5",
                  fontSize: 12,
                }}
                cursor={{ stroke: "#c6a66b", strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#c6a66b"
                strokeWidth={2}
                fill="url(#goldFill)"
                dot={{ r: 3, fill: "#c6a66b", strokeWidth: 0 }}
                activeDot={{
                  r: 5,
                  fill: "#f4efe5",
                  stroke: "#c6a66b",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// RECENT LINKS COMPONENT
// -------------------------------------------------------------
function RecentLinks({
  links,
  onDeleted,
}: {
  links: UrlItem[];
  onDeleted: () => void;
}) {
  const copy = (shortUrl: string) => {
    navigator.clipboard?.writeText(shortUrl).catch(() => undefined);
    toast.success("Copied to clipboard");
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteUrl(id);
      toast.success("Link removed");
      onDeleted();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete link");
    }
  };

  return (
    <motion.div {...fade} className="border border-[#38352f] bg-[#191917] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#817b70]">
            Recent links
          </p>
          <p className="mt-2 text-lg font-serif text-[#f4efe5]">
            Your latest work
          </p>
        </div>
        <Link
          to="/links"
          data-testid="view-all-links"
          className="flex items-center gap-1 text-xs text-[#c6a66b] hover:text-[#f4efe5]"
        >
          View all <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="space-y-1">
        {links.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#817b70]">
            No recent links. Create your first link above!
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="group flex items-center gap-3 border-t border-[#302e29] py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[#f4efe5]">
                  {link.short_url || `/s/${link.short_code}`}
                </p>
                <p className="mt-1 truncate text-xs text-[#817b70]">
                  {link.original_url}
                </p>
              </div>
              <span className="hidden font-mono text-xs text-[#b7ad9d] sm:block">
                {link.click_count.toLocaleString()}
              </span>
              <button
                data-testid={`copy-recent-${link.id}`}
                onClick={() => copy(link.short_url)}
                title="Copy link"
                className="grid h-8 w-8 place-items-center text-[#817b70] hover:text-[#c6a66b]"
              >
                <Copy size={14} />
              </button>
              <button
                data-testid={`delete-recent-${link.id}`}
                onClick={() => handleDelete(link.id)}
                title="Delete link"
                className="grid h-8 w-8 place-items-center text-[#817b70] opacity-0 transition-opacity hover:text-[#d27c6a] group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <motion.div
      {...fade}
      className="mb-8 flex flex-wrap items-end justify-between gap-5"
    >
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#c6a66b]">
          {eyebrow}
        </p>
        <h1 className="font-serif text-4xl text-[#f4efe5]">{title}</h1>
      </div>
      {children}
    </motion.div>
  );
}

// -------------------------------------------------------------
// MY LINKS PAGE (WITH FULL CRUD: READ, UPDATE, DELETE)
// -------------------------------------------------------------
function LinksPage() {
  const [query, setQuery] = useState("");
  const [links, setLinks] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<UrlItem | null>(null);
  const [deletingLink, setDeletingLink] = useState<UrlItem | null>(null);

  const fetchLinks = (searchTerm = "") => {
    setLoading(true);
    api.getUrls(searchTerm)
      .then((data) => setLinks(data))
      .catch((err) => toast.error("Failed to load links"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinks(query);
  }, [query]);

  const copy = (shortUrl: string) => {
    navigator.clipboard?.writeText(shortUrl).catch(() => undefined);
    toast.success("Short URL copied to clipboard");
  };

  const handleUpdateSuccess = (updatedItem: UrlItem) => {
    setLinks((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    setEditingLink(null);
  };

  const handleDeleteSuccess = (id: number) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
    setDeletingLink(null);
  };

  return (
    <div>
      <PageHeading
        eyebrow={`Library / ${links.length} total`}
        title="My links"
      >
        <Link
          to="/create"
          data-testid="links-create-button"
          className="flex items-center gap-2 bg-[#c6a66b] px-4 py-2.5 text-sm font-semibold text-[#171611] hover:bg-[#d6b77c] transition-colors"
        >
          <Plus size={16} /> Create link
        </Link>
      </PageHeading>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 border border-[#38352f] bg-[#191917] px-4">
          <Search size={16} className="text-[#817b70]" />
          <input
            data-testid="links-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by URL or alias..."
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#817b70]"
          />
        </div>
        <button
          data-testid="links-filter-button"
          onClick={() => fetchLinks(query)}
          className="flex items-center justify-center gap-2 border border-[#38352f] px-4 py-3 text-sm text-[#b7ad9d] hover:border-[#c6a66b]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="overflow-hidden border border-[#38352f] bg-[#191917]">
        <div className="hidden grid-cols-[1.8fr_1fr_0.65fr_0.7fr_110px] gap-4 border-b border-[#38352f] px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-[#817b70] sm:grid">
          <span>Destination</span>
          <span>Short link</span>
          <span>Clicks</span>
          <span>Created</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-[#817b70]">
            <Loader2 className="mx-auto mb-2 animate-spin text-[#c6a66b]" size={24} />
            Loading links...
          </div>
        ) : links.length ? (
          links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              copy={copy}
              onEdit={() => setEditingLink(link)}
              onDelete={() => setDeletingLink(link)}
            />
          ))
        ) : (
          <div className="px-6 py-16 text-center">
            <Link2 className="mx-auto mb-3 text-[#c6a66b]" size={24} />
            <p className="font-serif text-xl">No links found</p>
            <p className="mt-2 text-sm text-[#817b70]">
              {query ? "Try a different search term" : "Create your first shortened link to get started."}
            </p>
          </div>
        )}
      </div>

      {/* EDIT LINK MODAL (UPDATE) */}
      <AnimatePresence>
        {editingLink && (
          <EditLinkModal
            link={editingLink}
            onClose={() => setEditingLink(null)}
            onUpdated={handleUpdateSuccess}
          />
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG (DELETE) */}
      <AnimatePresence>
        {deletingLink && (
          <DeleteConfirmModal
            link={deletingLink}
            onClose={() => setDeletingLink(null)}
            onConfirmed={handleDeleteSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LinkRow({
  link,
  copy,
  onEdit,
  onDelete,
}: {
  link: UrlItem;
  copy: (v: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <div className="relative grid gap-3 border-b border-[#302e29] px-5 py-4 last:border-0 sm:grid-cols-[1.8fr_1fr_0.65fr_0.7fr_110px] sm:items-center sm:gap-4">
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm text-[#f4efe5] font-medium">{link.original_url}</p>
          <a
            href={link.original_url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open destination in new tab"
            className="text-[#817b70] hover:text-[#c6a66b] shrink-0"
          >
            <ExternalLink size={13} />
          </a>
        </div>
        <p className="mt-1 truncate text-xs text-[#817b70] sm:hidden">
          {link.short_url} · {link.click_count.toLocaleString()} clicks
        </p>
      </div>

      <button
        data-testid={`copy-link-${link.id}`}
        onClick={() => copy(link.short_url)}
        title="Click to copy shortened link"
        className="hidden truncate text-left text-sm text-[#c6a66b] hover:underline sm:block font-mono"
      >
        {link.short_url}
      </button>

      <span className="hidden font-mono text-sm text-[#b7ad9d] sm:block">
        {link.click_count.toLocaleString()}
      </span>

      <span className="hidden text-xs text-[#817b70] sm:block">
        {formatDate(link.created_at)}
      </span>

      <div className="absolute right-4 top-4 flex items-center gap-1 sm:static sm:justify-end">
        {/* Desktop inline action buttons */}
        <button
          data-testid={`edit-link-btn-${link.id}`}
          onClick={onEdit}
          title="Edit URL record"
          className="hidden sm:grid h-8 w-8 place-items-center rounded text-[#817b70] hover:text-[#c6a66b] hover:bg-[#22221f] transition-colors"
        >
          <Pencil size={14} />
        </button>

        <button
          data-testid={`copy-link-action-${link.id}`}
          onClick={() => copy(link.short_url)}
          title="Copy shortened link"
          className="hidden sm:grid h-8 w-8 place-items-center rounded text-[#817b70] hover:text-[#c6a66b] hover:bg-[#22221f] transition-colors"
        >
          <Copy size={14} />
        </button>

        <button
          data-testid={`delete-link-btn-${link.id}`}
          onClick={onDelete}
          title="Delete URL"
          className="hidden sm:grid h-8 w-8 place-items-center rounded text-[#817b70] hover:text-[#d27c6a] hover:bg-[#22221f] transition-colors"
        >
          <Trash2 size={14} />
        </button>

        {/* Mobile dropdown menu trigger */}
        <button
          data-testid={`link-menu-${link.id}`}
          onClick={() => setMenu(!menu)}
          className="grid h-8 w-8 place-items-center text-[#817b70] hover:text-[#f4efe5] sm:hidden"
        >
          <MoreHorizontal size={16} />
        </button>

        {menu && (
          <div className="absolute right-0 top-9 z-10 w-36 border border-[#4b463b] bg-[#22221f] p-1 shadow-xl rounded">
            <button
              onClick={() => {
                setMenu(false);
                copy(link.short_url);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#b7ad9d] hover:bg-[#302e29]"
            >
              <Copy size={13} /> Copy link
            </button>
            <button
              onClick={() => {
                setMenu(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#c6a66b] hover:bg-[#302e29]"
            >
              <Pencil size={13} /> Edit link
            </button>
            <button
              onClick={() => {
                setMenu(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#d27c6a] hover:bg-[#302e29]"
            >
              <Trash2 size={13} /> Delete link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// EDIT LINK MODAL (UPDATE OPERATION)
// -------------------------------------------------------------
function EditLinkModal({
  link,
  onClose,
  onUpdated,
}: {
  link: UrlItem;
  onClose: () => void;
  onUpdated: (item: UrlItem) => void;
}) {
  const [url, setUrl] = useState(link.original_url);
  const [shortCode, setShortCode] = useState(link.short_code);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      return toast.error("Destination URL is required");
    }
    if (!shortCode.trim()) {
      return toast.error("Short code is required");
    }

    let target = url.trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `https://${target}`;
    }

    try {
      setLoading(true);
      const updated = await api.updateUrl(link.id, {
        url: target,
        short_code: shortCode.trim(),
      });
      toast.success("Link updated successfully");
      onUpdated(updated);
    } catch (err: any) {
      toast.error(err.message || "Failed to update link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg border border-[#38352f] bg-[#191917] p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#38352f] pb-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#c6a66b]">Update Link</p>
            <h2 className="font-serif text-2xl text-[#f4efe5] mt-1">Edit link details</h2>
          </div>
          <button
            data-testid="edit-modal-close"
            onClick={onClose}
            className="text-[#817b70] hover:text-[#f4efe5] p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#b7ad9d] mb-2">
              Destination URL
            </label>
            <input
              data-testid="edit-url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/target"
              className="w-full border border-[#38352f] bg-[#151513] px-3.5 py-3 text-sm text-[#f4efe5] outline-none focus:border-[#c6a66b]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#b7ad9d] mb-2">
              Custom Short Code (Alias)
            </label>
            <div className="flex items-center border border-[#38352f] bg-[#151513] focus-within:border-[#c6a66b]">
              <span className="border-r border-[#38352f] px-3.5 py-3 text-xs text-[#817b70] select-none">
                /s/
              </span>
              <input
                data-testid="edit-shortcode-input"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="custom-slug"
                className="w-full bg-transparent px-3 py-3 text-sm text-[#f4efe5] outline-none font-mono"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#817b70]">
              Changing the code redirects future visitors to the new short URL.
            </p>
          </div>

          <div className="rounded-lg border border-[#38352f] bg-[#151513] p-3 text-xs text-[#817b70]">
            <span className="text-[#c6a66b] font-medium">Data Integrity Notice:</span> The record ID (#{link.id}), existing click count ({link.click_count} clicks), and visitor history will be fully preserved.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302e29]">
            <button
              type="button"
              data-testid="edit-cancel-button"
              onClick={onClose}
              disabled={loading}
              className="border border-[#38352f] px-4 py-2.5 text-xs text-[#b7ad9d] hover:bg-[#22221f] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="edit-save-button"
              disabled={loading}
              className="flex items-center gap-2 bg-[#c6a66b] px-5 py-2.5 text-xs font-semibold text-[#171611] hover:bg-[#d6b77c] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// -------------------------------------------------------------
// DELETE CONFIRMATION DIALOG (DELETE OPERATION)
// -------------------------------------------------------------
function DeleteConfirmModal({
  link,
  onClose,
  onConfirmed,
}: {
  link: UrlItem;
  onClose: () => void;
  onConfirmed: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await api.deleteUrl(link.id);
      toast.success("Link deleted successfully");
      onConfirmed(link.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md border border-[#4b352f] bg-[#191917] p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3d2320] text-[#d27c6a]">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-serif text-xl text-[#f4efe5]">Delete short link?</h3>
            <p className="mt-2 text-xs text-[#b7ad9d] leading-relaxed">
              Are you sure you want to delete this link? This action permanently removes the shortened URL and all of its associated click tracking history from MySQL.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#38352f] bg-[#151513] p-3 text-xs">
          <p className="truncate text-[#f4efe5]">
            <span className="text-[#817b70]">Destination:</span> {link.original_url}
          </p>
          <p className="mt-1 font-mono text-[#c6a66b]">
            <span className="text-[#817b70]">Short link:</span> {link.short_url}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            data-testid="delete-cancel-btn"
            onClick={onClose}
            disabled={loading}
            className="border border-[#38352f] px-4 py-2.5 text-xs text-[#b7ad9d] hover:bg-[#22221f] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="delete-confirm-btn"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-2 bg-[#d27c6a] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#b86150] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Delete permanently
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// -------------------------------------------------------------
// CREATE SHORT LINK PAGE
// -------------------------------------------------------------
function CreatePage() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!url.trim()) {
      return toast.error("Please enter a destination URL");
    }
    let target = url.trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `https://${target}`;
    }

    try {
      setLoading(true);
      const res = await api.createUrl(target, alias);
      setResult(res.short_url);
      toast.success("Your short link is ready!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create short link");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(result).catch(() => undefined);
    toast.success("Generated URL copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading eyebrow="Create / New link" title="Make it memorable." />
      <motion.div
        {...fade}
        className="border border-[#38352f] bg-[#191917] p-6 sm:p-9"
      >
        <div className="mb-8 border-b border-[#38352f] pb-6">
          <p className="font-serif text-2xl text-[#f4efe5]">
            Create a short link
          </p>
          <p className="mt-2 text-sm text-[#817b70]">
            Turn a long URL into an intelligent, trackable link.
          </p>
        </div>

        <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-[#b7ad9d]">
          Destination URL
        </label>
        <div className="flex items-center gap-3 border border-[#38352f] bg-[#151513] px-4 focus-within:border-[#c6a66b]">
          <ExternalLink size={16} className="text-[#817b70]" />
          <input
            data-testid="create-url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com/long-page-path"
            className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-[#817b70]"
          />
        </div>

        <label className="mb-2 mt-7 block text-xs uppercase tracking-[0.15em] text-[#b7ad9d]">
          Custom alias{" "}
          <span className="normal-case tracking-normal text-[#817b70]">
            (optional, alphanumeric or dashes)
          </span>
        </label>
        <div className="flex items-center border border-[#38352f] bg-[#151513] focus-within:border-[#c6a66b]">
          <span className="border-r border-[#38352f] px-4 text-sm text-[#817b70]">
            /s/
          </span>
          <input
            data-testid="create-alias-input"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="custom-slug"
            className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-[#817b70]"
          />
        </div>

        <button
          data-testid="generate-link-button"
          onClick={generate}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 bg-[#c6a66b] py-3.5 text-sm font-semibold text-[#171611] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Zap size={16} />
          )}
          Generate short link
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-7 border border-[#697053] bg-[#1e281c] p-5"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#a9bd8b]">
              <Check size={14} /> Link generated
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span
                data-testid="generated-link-result"
                className="font-mono text-lg text-[#f4efe5] break-all"
              >
                {result}
              </span>
              <button
                data-testid="copy-generated-link-button"
                onClick={copy}
                className="flex shrink-0 items-center gap-2 border border-[#697053] px-3 py-2 text-xs text-[#d6e5bd] hover:bg-[#2b3a28]"
              >
                <Clipboard size={14} /> Copy
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// -------------------------------------------------------------
// ANALYTICS PAGE
// -------------------------------------------------------------
function AnalyticsPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [overview, setOverview] = useState<AnalyticsOverview>({
    total_clicks: 0,
    unique_visitors: 0,
    click_through_rate: "0.0%",
    total_links: 0,
    trends: {
      clicks: "Verified database records",
      visitors: "Distinct visitors",
      ctr: "Efficiency ratio",
    },
  });
  const [topLinks, setTopLinks] = useState<UrlItem[]>([]);

  useEffect(() => {
    let mounted = true;
    api.getAnalyticsOverview()
      .then((data) => {
        if (mounted) setOverview(data);
      })
      .catch((err) => console.error("Failed to load analytics overview", err));

    api.getTopLinks(4)
      .then((data) => {
        if (mounted) setTopLinks(data);
      })
      .catch((err) => console.error("Failed to load top links", err));

    return () => {
      mounted = false;
    };
  }, []);

  const maxClicks = useMemo(() => {
    if (!topLinks.length) return 1;
    return Math.max(...topLinks.map((l) => l.click_count), 1);
  }, [topLinks]);

  return (
    <div>
      <PageHeading eyebrow="Insights / Performance" title="Know your reach.">
        <div className="flex rounded-lg border border-[#38352f] p-1">
          {(["daily", "weekly", "monthly"] as const).map((item) => (
            <button
              key={item}
              data-testid={`analytics-${item}-filter`}
              onClick={() => setPeriod(item)}
              className={`px-3 py-2 text-xs capitalize ${
                period === item
                  ? "bg-[#c6a66b] text-[#171611] font-semibold"
                  : "text-[#817b70]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </PageHeading>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total clicks"
          value={overview.total_clicks.toLocaleString()}
          detail={overview.trends.clicks}
          icon={TrendingUp}
        />
        <Stat
          label="Unique visitors"
          value={overview.unique_visitors.toLocaleString()}
          detail={overview.trends.visitors}
          icon={Users}
        />
        <Stat
          label="Click-through rate"
          value={overview.click_through_rate}
          detail={overview.trends.ctr}
          icon={ArrowUpRight}
        />
      </div>

      <ChartCard full totalClicks={overview.total_clicks} />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="border border-[#38352f] bg-[#191917] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[#817b70]">
            Top performing links
          </p>
          <div className="mt-4 space-y-1">
            {topLinks.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#817b70]">
                No click records found yet. Share your links to track clicks!
              </p>
            ) : (
              topLinks.map((link, i) => {
                const percent = Math.round((link.click_count / maxClicks) * 100);
                return (
                  <div
                    className="flex items-center gap-4 border-t border-[#302e29] py-3"
                    key={link.id}
                  >
                    <span className="font-mono text-xs text-[#817b70]">
                      0{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[#f4efe5]">
                        {link.short_url}
                      </p>
                      <div className="mt-2 h-1 bg-[#302e29]">
                        <div
                          className="h-1 bg-[#c6a66b] transition-all duration-500"
                          style={{ width: `${Math.max(percent, 8)}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#b7ad9d]">
                      {link.click_count.toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="border border-[#38352f] bg-[#191917] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[#817b70]">
            Activity history
          </p>
          <div className="mt-4 space-y-5">
            {[
              "Database connection active",
              "URL click tracking operational",
              "Real-time analytics engine ready",
              "Docker container cluster synchronized",
            ].map((item, i) => (
              <div className="flex gap-3" key={item}>
                <div className="mt-1 h-2 w-2 rounded-full bg-[#c6a66b]" />
                <div>
                  <p className="text-sm text-[#f4efe5]">{item}</p>
                  <p className="mt-1 text-xs text-[#817b70]">
                    {i === 0 ? "Just now" : `${i * 2} minutes ago`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SETTINGS PAGE
// -------------------------------------------------------------
function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl">
      <PageHeading eyebrow="Workspace / Preferences" title="Settings" />
      <div className="space-y-4">
        <section className="border border-[#38352f] bg-[#191917] p-6">
          <p className="font-serif text-xl">Profile information</p>
          <p className="mt-1 text-sm text-[#817b70]">
            The details attached to your workspace.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs text-[#817b70]">
                Full name
              </label>
              <input
                data-testid="settings-name-input"
                defaultValue="Olivia Stone"
                className="w-full border border-[#38352f] bg-[#151513] px-3 py-3 text-sm outline-none focus:border-[#c6a66b]"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs text-[#817b70]">
                Email address
              </label>
              <input
                data-testid="settings-email-input"
                defaultValue="olivia@northstar.studio"
                className="w-full border border-[#38352f] bg-[#151513] px-3 py-3 text-sm outline-none focus:border-[#c6a66b]"
              />
            </div>
          </div>
        </section>

        <section className="border border-[#38352f] bg-[#191917] p-6">
          <p className="font-serif text-xl">Preferences</p>
          <div className="mt-5 flex items-center justify-between border-t border-[#302e29] py-4">
            <div>
              <p className="text-sm">Weekly insights</p>
              <p className="mt-1 text-xs text-[#817b70]">
                Receive a concise performance summary.
              </p>
            </div>
            <button
              data-testid="notifications-toggle"
              onClick={() => setNotifications(!notifications)}
              className={`h-6 w-11 rounded-full p-1 transition-colors ${
                notifications ? "bg-[#c6a66b]" : "bg-[#38352f]"
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-[#171611] transition-transform ${
                  notifications ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        <button
          data-testid="save-settings-button"
          onClick={() => {
            setSaved(true);
            toast.success("Preferences saved successfully");
            setTimeout(() => setSaved(false), 1800);
          }}
          className="bg-[#c6a66b] px-5 py-3 text-sm font-semibold text-[#171611] hover:bg-[#d6b77c] transition-colors"
        >
          {saved ? "Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
