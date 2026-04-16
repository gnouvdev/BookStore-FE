import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Bookmark,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShoppingBag,
  Ticket,
  UserRound,
  UserSquare2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "@/styles/archivist-admin.css";

const menuGroups = [
  [
    { title: "Tổng quan", path: "/dashboard", icon: LayoutDashboard },
    { title: "Thêm sách", path: "/dashboard/add-new-book", icon: Plus },
    { title: "Quản lý sách", path: "/dashboard/manage-books", icon: BookOpen },
    { title: "Thể loại", path: "/dashboard/manage-categories", icon: Bookmark },
    { title: "Tác giả", path: "/dashboard/manage-authors", icon: UserSquare2 },
    { title: "Người dùng", path: "/dashboard/manage-users", icon: Users },
    { title: "Đơn hàng", path: "/dashboard/manage-orders", icon: ShoppingBag },
    { title: "Hỗ trợ chat", path: "/dashboard/chat", icon: MessageCircle },
    { title: "Voucher", path: "/dashboard/manage-voucher", icon: Ticket },
  ],
  [{ title: "Về trang bán hàng", path: "/", icon: ChevronLeft }],
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function matchesPath(currentPath, itemPath) {
  if (itemPath === "/dashboard") {
    return currentPath === "/dashboard";
  }
  return currentPath.startsWith(itemPath);
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const user = useMemo(() => {
    const storedUser = getStoredUser();
    return {
      name: storedUser.fullName || storedUser.displayName || storedUser.name || "Quản trị viên",
      role: storedUser.role || "admin",
      avatar: storedUser.photoURL || storedUser.avatar || "",
    };
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = getStoredUser();

    if (!token || !storedUser?.role || storedUser.role !== "admin") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/admin");
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin");
  };

  return (
    <div className="archivist-admin-shell">
      {sidebarOpen ? (
        <button
          aria-label="Đóng thanh điều hướng"
          className="archivist-mobile-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside className={`archivist-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="archivist-sidebar__brand">
          <Link to="/dashboard" className="archivist-brand-link">
            <h1>The Archivist</h1>
            <p>Cổng quản trị</p>
          </Link>
        </div>

        <nav className="archivist-nav">
          <div className="archivist-nav__group">
            {menuGroups[0].map((item) => {
              const Icon = item.icon;
              const active = matchesPath(location.pathname, item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`archivist-nav-link ${active ? "is-active" : ""}`}
                >
                  <Icon size={17} className="archivist-nav-link__icon" />
                  <span className="archivist-nav-link__label">{item.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="archivist-nav__spacer" />

          <div className="archivist-nav__group">
            {menuGroups[1].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} className="archivist-nav-link">
                  <Icon size={17} className="archivist-nav-link__icon" />
                  <span className="archivist-nav-link__label">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="archivist-sidebar__footer">
          <div className="archivist-admin-card archivist-user-chip">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-[rgba(66,4,9,0.12)] text-[var(--archivist-ink)]">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="archivist-user-chip__copy">
              <strong>{user.name}</strong>
              <span>Quản trị viên</span>
            </div>
          </div>

          <button type="button" className="archivist-secondary-button" onClick={handleLogout}>
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="archivist-main">
        <header className="archivist-topbar">
          <div className="archivist-topbar__left">
            <button
              type="button"
              aria-label="Mở thanh điều hướng"
              className="archivist-menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div className="archivist-searchbox">
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm trong kho quản trị..."
              />
            </div>
          </div>

          <div className="archivist-topbar__right">
            <button type="button" className="archivist-icon-button" aria-label="Thông báo">
              <Bell size={16} />
            </button>
            <Link to="/dashboard/add-new-book" className="archivist-primary-button">
              Thêm mới
            </Link>

            <div className="archivist-topbar__profile">
              <div className="archivist-topbar__profile-copy">
                <strong>{user.name}</strong>
                <span>Khu quản trị</span>
              </div>
              <Avatar className="h-11 w-11">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-[rgba(66,4,9,0.12)] text-[var(--archivist-ink)]">
                  <UserRound size={16} />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="archivist-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
