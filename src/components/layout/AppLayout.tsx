import { BarChart3, Bolt, Code2, History, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/generate", label: "Generate", icon: Bolt },
  { to: "/problem/seed_two_sum", label: "Workspace", icon: Code2 },
  { to: "/history", label: "History", icon: History },
];

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-palette-dark text-palette-light">
      <aside className={`fixed inset-y-0 left-0 z-20 hidden flex-col bg-palette-dark px-4 py-5 lg:flex shadow-md transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
        <NavLink to="/dashboard" className="mb-6 flex items-center gap-3 rounded-md px-3 transition-transform hover:scale-[1.02]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-palette-teal/20 bg-palette-teal/10">
            <Code2 className="h-4 w-4 text-palette-teal" aria-hidden="true" />
          </span>
          {!isCollapsed && (
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-heading font-bold text-palette-light tracking-wide truncate">DSA Studio AI</span>
              <span className="block text-[11px] text-palette-muted truncate">Focused practice workspace</span>
            </span>
          )}
        </NavLink>

        <nav className="grid gap-1" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-all duration-300 ${
                    isActive
                      ? "bg-palette-surface text-palette-teal font-medium shadow-sm"
                      : "text-palette-muted hover:bg-palette-surfaceHover hover:text-palette-light"
                  } ${isCollapsed ? "justify-center px-0" : ""}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={`flex h-9 w-full items-center rounded-md text-palette-muted hover:bg-palette-surfaceHover hover:text-palette-light transition-colors ${isCollapsed ? "justify-center" : "px-3"}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
            {!isCollapsed && <span className="ml-3 text-sm">Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <header className="sticky top-0 z-10 bg-palette-dark px-4 py-3 lg:hidden shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-accent-blue" />
            <span className="font-heading font-bold text-palette-light tracking-wide">DSA Studio AI</span>
          </div>
          <nav className="grid grid-cols-5 gap-1" aria-label="Mobile primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `grid min-h-10 place-items-center rounded-md transition-all duration-300 ${
                      isActive
                        ? "bg-palette-surfaceHover text-palette-teal shadow-glow-sm"
                        : "text-palette-muted hover:bg-palette-surface hover:text-palette-light hover:scale-110"
                    }`
                  }
                  aria-label={item.label}
                >
                  <Icon className="h-4 w-4" />
                </NavLink>
              );
            })}
          </nav>
        </header>

        <main className="w-full px-4 py-5 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
