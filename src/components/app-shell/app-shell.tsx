"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Folders,
  ChartNoAxesCombined,
  Paintbrush,
  Settings2,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  CircleHelp,
  ArrowUpLeft,
  Sun,
  Focus,
} from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import { useFocusStore } from "@/stores/focus-store";
import { persianDate } from "@/domain/calculations";
import { SearchDialog } from "./search-dialog";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ActivityList } from "@/components/office/activity-list";
import { IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const links = [
  { href: "/office", label: "دفتر کار", icon: LayoutDashboard },
  { href: "/planner", label: "پلنر روزانه", icon: CalendarDays },
  { href: "/projects", label: "پروژه‌ها", icon: Folders },
  { href: "/analytics", label: "تحلیل و مرور", icon: ChartNoAxesCombined },
  { href: "/customize", label: "سفارشی‌سازی", icon: Paintbrush },
  { href: "/settings", label: "تنظیمات", icon: Settings2 },
];

function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar" aria-label={name}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="16" fill="#e9edf8" />
        <path d="M10 48v-8c0-9 28-9 28 0v8" fill="#6687bd" />
        <rect x="19" y="28" width="10" height="10" rx="4" fill="#d5a27f" />
        <ellipse cx="24" cy="22" rx="10" ry="12" fill="#edc5a5" />
        <path
          d="M14 20c-2-12 8-14 11-12 11-1 12 9 9 14l-4-8-15 3"
          fill="#333b4b"
        />
        <path
          d="M18 24h3m6 0h3"
          stroke="#35415a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M21 29q3 3 6 0"
          fill="none"
          stroke="#b67d68"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname().replace(/\/$/, "") || "/";
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [help, setHelp] = useState(false);
  const name = useSettingsStore((s) => s.settings.userName);
  const active = useFocusStore((s) => s.active);
  return (
    <div
      className={cn(
        "app-shell",
        (path.startsWith("/office") || path === "/customize") &&
          "spatial-shell",
      )}
    >
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="بستن منو"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        className={cn("sidebar", mobile && "sidebar-open")}
        aria-label="ناوبری اصلی"
      >
        <Link className="brand" href="/office" onClick={() => setMobile(false)}>
          <span className="brand-symbol">
            <LayoutDashboard size={24} />
          </span>
          <span>
            <b dir="ltr">
              Personal Office<span className="brand-period">.</span>
            </b>
            <small>فضای شخصی برای ساختن</small>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="بستن منو"
          onClick={() => setMobile(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-switch">
          <span className="workspace-icon">س</span>
          <div>
            <strong>دفتر شخصی {name}</strong>
            <small>
              <span className="live-dot" /> فضای خصوصی
            </small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">فضای کاری</div>
        <nav>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              onClick={() => setMobile(false)}
              key={href}
              href={href}
              className={cn(
                "nav-item",
                (path === href ||
                  (href === "/projects" && path.startsWith("/projects/")) ||
                  (href === "/office" && path.startsWith("/office/"))) &&
                  "active",
              )}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
              {href === "/office" && <span className="nav-new">خانه</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="office-note">
            <Sparkles size={20} />
            <strong>یک قدم، هر روز.</strong>
            <p>دفترت جایی برای ایده‌هاست؛ هر کار کوچک، یک پیشرفت.</p>
            <Link href="/planner">
              پلن امروز را بچین
              <ArrowUpLeft size={16} />
            </Link>
          </div>
          <button className="help-button" onClick={() => setHelp(true)}>
            <CircleHelp size={18} /> راهنمای دفتر
          </button>
          <div className="sidebar-user">
            <Avatar name={name} />
            <div>
              <strong>{name}</strong>
              <small>دفتر شخصی</small>
            </div>
            <Link href="/settings" aria-label="تنظیمات کاربر">
              <Settings2 size={17} />
            </Link>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-start">
            <IconButton
              label="باز کردن منو"
              className="icon-button menu-trigger"
              onClick={() => setMobile(true)}
            >
              <Menu size={23} />
            </IconButton>
            <Sun size={20} className="sun-icon" />
            <span>{persianDate(new Date(), true)}</span>
          </div>
          <div className="topbar-end">
            <button
              className="global-search"
              aria-label="جست‌وجو در دفتر"
              onClick={() => setSearch(true)}
            >
              <Search size={17} />
              <span>جست‌وجو در دفتر…</span>
              <kbd dir="ltr">⌘ K</kbd>
            </button>
            {active && (
              <Link className="header-focus" href="/office">
                <Focus size={17} />
                <span>در حال تمرکز</span>
              </Link>
            )}
            <IconButton
              label="فعالیت‌های اخیر"
              onClick={() => setNotifications(true)}
            >
              <Bell size={20} />
              <i className="notification-dot" />
            </IconButton>
            <span className="topbar-divider" />
            <Link href="/settings">
              <Avatar name={name} />
            </Link>
          </div>
        </header>
        <main id="main-content" className="page-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>یک فضای آرام برای کارهای مهم.</span>
          <span dir="ltr">
            Personal Office · v{process.env.NEXT_PUBLIC_APP_VERSION}
          </span>
        </footer>
      </div>
      <SearchDialog open={search} setOpen={setSearch} />
      <Dialog open={notifications} onOpenChange={setNotifications}>
        <DialogContent>
          <DialogHeader
            title="فعالیت‌های اخیر"
            description="آخرین اتفاق‌های دفترت"
          />
          <ActivityList limit={12} />
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent>
          <DialogHeader
            title="از اینجا شروع کن"
            description="از برنامه‌ریزی تا پیشرفت، در یک دفتر."
          />
          <ol className="help-steps">
            <li>
              <strong>یک پروژه بساز.</strong>
              <p>هر پروژه به یک اتاق تعلق دارد و فضای مخصوص خودش را دارد.</p>
            </li>
            <li>
              <strong>کارها را به امروز اضافه کن.</strong>
              <p>در پلنر کارها را بین سه ستون جابه‌جا کن.</p>
            </li>
            <li>
              <strong>روی یک کار تمرکز کن.</strong>
              <p>
                تایمر حتی پس از Refresh ادامه پیدا می‌کند. Pause و پایان را خودت
                کنترل می‌کنی.
              </p>
            </li>
            <li>
              <strong>پیشرفت را مرور کن.</strong>
              <p>
                تحلیل از کارها و جلسه‌های ثبت‌شده محاسبه می‌شود. داده‌ها در همین
                مرورگر می‌مانند.
              </p>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
