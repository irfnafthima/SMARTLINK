import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { BarChart3, ChevronDown, CircleHelp, Command, ExternalLink, FilePlus2, Home, Link2, Menu, Moon, Search, Settings, Sparkles, Sun, X } from "lucide-react";

const nav = [
  { label: "Overview", path: "/", icon: Home }, { label: "My Links", path: "/links", icon: Link2 },
  { label: "Create Short Link", path: "/create", icon: FilePlus2 }, { label: "Analytics", path: "/analytics", icon: BarChart3 },
];

export function SmartLinkShell({ children, dark, setDark }: { children: ReactNode; dark: boolean; setDark: (v: boolean) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const active = nav.find((item) => item.path === location.pathname)?.label || "Settings";
  return <div className="min-h-screen bg-[#111110] text-[#f4efe5] selection:bg-[#c6a66b] selection:text-[#111110]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-[#38352f] bg-[#151513] px-5 py-6 lg:flex">
      <Brand />
      <Nav active={active} />
      <div className="mt-auto">
        <div className="mb-5 rounded-xl border border-[#38352f] bg-[#1b1b18] p-4"><div className="flex items-center gap-2 text-xs text-[#b7ad9d]"><Sparkles size={14} className="text-[#c6a66b]" /> Pro workspace</div><p className="mt-2 text-sm text-[#f4efe5]">Your links are working harder.</p></div>
        <div className="flex items-center gap-3 border-t border-[#38352f] pt-5"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#c6a66b] font-serif text-sm text-[#111110]">OS</div><div className="min-w-0"><p className="truncate text-sm font-medium">Olivia Stone</p><p className="text-xs text-[#817b70]">Personal workspace</p></div><ChevronDown size={15} className="ml-auto text-[#817b70]" /></div>
      </div>
    </aside>
    <AnimatePresence>{mobileOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobileOpen(false)}><motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 28 }} className="h-full w-[280px] border-r border-[#38352f] bg-[#151513] p-5" onClick={(e) => e.stopPropagation()}><div className="mb-8 flex items-center justify-between"><Brand /><button data-testid="mobile-nav-close-button" onClick={() => setMobileOpen(false)}><X size={20} /></button></div><Nav active={active} onNavigate={() => setMobileOpen(false)} /></motion.aside></motion.div>}</AnimatePresence>
    <main className="lg:pl-[250px]"><header className="sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b border-[#38352f] bg-[#111110]/90 px-5 backdrop-blur-md sm:px-8"><button data-testid="mobile-menu-button" onClick={() => setMobileOpen(true)} className="text-[#b7ad9d] lg:hidden"><Menu size={21} /></button><div className="hidden items-center gap-2 text-sm text-[#817b70] sm:flex"><span>Workspace</span><span>/</span><span className="text-[#f4efe5]">{active}</span></div><div className="ml-auto flex items-center gap-2"><button data-testid="global-search-button" className="hidden items-center gap-3 rounded-lg border border-[#38352f] px-3 py-2 text-sm text-[#817b70] transition-colors hover:border-[#615a4f] md:flex"><Search size={15} /><span>Search</span><kbd className="ml-8 rounded border border-[#38352f] px-1.5 py-0.5 text-[10px]">⌘ K</kbd></button><button data-testid="theme-toggle-button" onClick={() => setDark(!dark)} className="grid h-9 w-9 place-items-center rounded-lg text-[#b7ad9d] transition-colors hover:bg-[#22221f] hover:text-[#f4efe5]">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button data-testid="help-button" className="hidden h-9 w-9 place-items-center rounded-lg text-[#b7ad9d] hover:bg-[#22221f] md:grid"><CircleHelp size={17} /></button><div className="ml-2 grid h-9 w-9 place-items-center rounded-full border border-[#c6a66b]/50 bg-[#24221b] text-xs text-[#c6a66b]">OS</div></div></header><div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">{children}</div></main>
  </div>;
}

function Brand() { return <Link to="/" className="flex items-center gap-3" data-testid="brand-link"><div className="grid h-9 w-9 place-items-center rounded-lg border border-[#c6a66b]/60 text-[#c6a66b]"><Command size={18} strokeWidth={1.5} /></div><div><span className="font-serif text-xl tracking-wide text-[#f4efe5]">smart<span className="text-[#c6a66b]">link</span></span><span className="block text-[9px] uppercase tracking-[0.26em] text-[#817b70]">Intelligence, linked</span></div></Link>; }
function Nav({ active, onNavigate }: { active: string; onNavigate?: () => void }) { return <nav className="mt-12 space-y-1">{nav.map(({ label, path, icon: Icon }) => <Link key={path} to={path} onClick={onNavigate} data-testid={`nav-${label.toLowerCase().replaceAll(" ", "-")}-link`} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active === label ? "bg-[#2b2923] text-[#f4efe5]" : "text-[#817b70] hover:bg-[#211f1b] hover:text-[#f4efe5]"}`}><Icon size={17} className={active === label ? "text-[#c6a66b]" : "text-[#817b70] group-hover:text-[#b7ad9d]"} />{label}{active === label && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c6a66b]" />}</Link>)}<Link to="/settings" onClick={onNavigate} data-testid="nav-settings-link" className={`group mt-6 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active === "Settings" ? "bg-[#2b2923] text-[#f4efe5]" : "text-[#817b70] hover:bg-[#211f1b] hover:text-[#f4efe5]"}`}><Settings size={17} className="text-[#817b70]" />Settings</Link></nav>; }