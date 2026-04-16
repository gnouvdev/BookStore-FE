import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CircleAlert,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import baseUrl from "../../utils/baseURL";
import RevenueChart from "./RevenueChart";
import { useGetBusinessInsightsQuery } from "../../redux/features/dashboard/dashboardApi";

const emptyState = {
  totalBooks: 0,
  totalSales: 0,
  trendingBooks: 0,
  totalOrders: 0,
  totalUsers: 0,
  pendingOrders: 0,
  completedOrders: 0,
  averageOrderValue: 0,
  monthlySales: [],
  recentOrders: [],
  topSellingBooks: [],
  categoryStats: [],
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function getStatusTone(status) {
  switch (status) {
    case "completed":
    case "delivered":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [chartDateRange, setChartDateRange] = useState({ startDate: "", endDate: "" });
  const [data, setData] = useState(emptyState);
  const navigate = useNavigate();

  const { data: businessInsightsData, isLoading: insightsLoading } = useGetBusinessInsightsQuery();
  const businessInsights = businessInsightsData?.data || businessInsightsData;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        navigate("/admin");
        return;
      }

      let monthlySalesUrl = `${baseUrl}/admin/dashboard/monthly-sales`;
      const params = new URLSearchParams();
      if (chartDateRange.startDate) params.append("startDate", chartDateRange.startDate);
      if (chartDateRange.endDate) params.append("endDate", chartDateRange.endDate);
      if (params.toString()) monthlySalesUrl += `?${params.toString()}`;

      const [overviewRes, salesRes, ordersRes, booksRes] = await Promise.all([
        axios.get(`${baseUrl}/admin/dashboard/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(monthlySalesUrl, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/admin/dashboard/recent-orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/admin/dashboard/top-selling-books`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setData({
        totalBooks: overviewRes.data?.totalBooks || 0,
        totalSales: overviewRes.data?.totalSales || 0,
        trendingBooks: overviewRes.data?.trendingBooks || 0,
        totalOrders: overviewRes.data?.totalOrders || 0,
        totalUsers: overviewRes.data?.totalUsers || 0,
        pendingOrders: overviewRes.data?.pendingOrders || 0,
        completedOrders: overviewRes.data?.completedOrders || 0,
        averageOrderValue: overviewRes.data?.averageOrderValue || 0,
        monthlySales: Array.isArray(salesRes.data) ? salesRes.data : [],
        recentOrders: Array.isArray(ordersRes.data?.orders) ? ordersRes.data.orders : [],
        topSellingBooks: Array.isArray(booksRes.data?.books) ? booksRes.data.books : [],
        categoryStats: Array.isArray(booksRes.data?.categoryStats) ? booksRes.data.categoryStats : [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu tổng quan");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chartDateRange.startDate || chartDateRange.endDate) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartDateRange]);

  const kpis = useMemo(
    () => [
      {
        eyebrow: "Kho sách",
        value: data.totalBooks.toLocaleString("vi-VN"),
        detail: `${data.trendingBooks} đầu sách đang được đánh dấu nổi bật`,
        icon: BookOpen,
      },
      {
        eyebrow: "Doanh thu",
        value: formatCurrency(data.totalSales),
        detail: `Giá trị đơn trung bình ${formatCurrency(data.averageOrderValue)}`,
        icon: TrendingUp,
      },
      {
        eyebrow: "Đơn hàng",
        value: data.totalOrders.toLocaleString("vi-VN"),
        detail: `${data.pendingOrders} đơn đang chờ xử lý`,
        icon: ShoppingBag,
      },
      {
        eyebrow: "Khách hàng",
        value: data.totalUsers.toLocaleString("vi-VN"),
        detail: `${data.completedOrders} đơn đã hoàn tất`,
        icon: Users,
      },
    ],
    [data]
  );

  const spotlightBooks = useMemo(() => data.topSellingBooks.slice(0, 4), [data.topSellingBooks]);
  const topInsights = businessInsights?.topInsights?.slice(0, 3) || [];
  const stockUp = businessInsights?.recommendations?.stockUp?.slice(0, 3) || [];
  const drops = businessInsights?.recommendations?.drop?.slice(0, 3) || [];

  return (
    <div className="archivist-grid" style={{ gap: 28 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Sổ điều hành</p>
          <h2>Tổng quan quản trị</h2>
          <p>
            Theo dõi kho sách, doanh thu, đơn hàng và những tín hiệu quan trọng từ
            hành vi mua sắm để điều phối vận hành mỗi ngày.
          </p>
        </div>

        <div className="archivist-page-actions">
          <button type="button" className="archivist-secondary-button" onClick={fetchDashboardData}>
            <RefreshCw size={15} />
            Làm mới dữ liệu
          </button>
          <Link to="/dashboard/manage-orders" className="archivist-primary-button">
            Mở sổ đơn hàng
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="archivist-kpi-grid">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.eyebrow} className="archivist-admin-card archivist-kpi-card">
              <p className="archivist-kpi-card__eyebrow">{item.eyebrow}</p>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="archivist-kpi-card__value">{loading ? "..." : item.value}</h3>
                  <p className="archivist-kpi-card__detail">{item.detail}</p>
                </div>
                <div className="archivist-avatar archivist-avatar--md">
                  <Icon size={22} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="archivist-grid archivist-grid--dashboard">
        <div className="archivist-grid" style={{ gap: 24 }}>
          <article className="archivist-admin-card archivist-panel archivist-admin-card--strong">
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Biểu đồ doanh thu</p>
                <h3 className="archivist-panel__title">Dòng chảy doanh thu và đơn hàng</h3>
                <p className="archivist-panel__description">
                  Biểu đồ đang lấy trực tiếp dữ liệu thật từ API tổng quan, cho phép lọc theo ngày
                  và chuyển kiểu hiển thị mà không dùng dữ liệu mẫu.
                </p>
              </div>
            </div>
            <RevenueChart data={data.monthlySales} dateRange={chartDateRange} onDateRangeChange={setChartDateRange} />
          </article>

          <article className="archivist-admin-card archivist-panel archivist-table-card">
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Đơn hàng gần đây</p>
                <h3 className="archivist-panel__title">Những đơn mới nhất trong hệ thống</h3>
              </div>
              <Link to="/dashboard/manage-orders" className="archivist-secondary-button">
                Xem tất cả
              </Link>
            </div>

            <div className="archivist-stack">
              {data.recentOrders.length ? (
                data.recentOrders.slice(0, 6).map((order) => (
                  <div key={order._id} className="archivist-list-row">
                    <div className="archivist-list-row__leading">
                      <div className="archivist-avatar archivist-avatar--sm">
                        {(order.user?.fullName || "K").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong className="archivist-list-row__title">{order.user?.fullName || "Khách hàng"}</strong>
                        <span className="archivist-list-row__meta">
                          #{order._id?.slice(-6)} · {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="archivist-status-pill" data-tone={getStatusTone(order.status)}>
                        {order.status || "pending"}
                      </span>
                      <div className="archivist-list-row__meta" style={{ marginTop: 10 }}>
                        {formatCurrency(order.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="archivist-empty">Chưa có dữ liệu đơn hàng gần đây.</div>
              )}
            </div>
          </article>
        </div>

        <div className="archivist-grid" style={{ gap: 24 }}>
          <article className="archivist-admin-card archivist-panel archivist-admin-card--strong">
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Trợ lý AI</p>
                <h3 className="archivist-panel__title">Tín hiệu từ hành vi người dùng</h3>
              </div>
              <div className="archivist-avatar archivist-avatar--sm">
                <Brain size={16} />
              </div>
            </div>

            {insightsLoading ? (
              <div className="archivist-empty" style={{ minHeight: 220 }}>Đang tổng hợp insight...</div>
            ) : (
              <div className="archivist-stack">
                {topInsights.length ? (
                  topInsights.map((insight) => (
                    <div key={insight} className="archivist-admin-card" style={{ padding: 16 }}>
                      <div className="flex items-start gap-3">
                        <Sparkles size={16} style={{ marginTop: 3 }} />
                        <p className="archivist-panel__description" style={{ margin: 0 }}>{insight}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="archivist-empty" style={{ minHeight: 140 }}>Chưa đủ dữ liệu để sinh insight.</div>
                )}

                {stockUp.length ? (
                  <div className="archivist-admin-card" style={{ padding: 18 }}>
                    <p className="archivist-panel__eyebrow">Cần nhập thêm</p>
                    <div className="archivist-stack">
                      {stockUp.map((item) => (
                        <div key={item.title} className="archivist-list-row">
                          <div>
                            <strong className="archivist-list-row__title">{item.title}</strong>
                            <span className="archivist-list-row__meta">{item.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </article>

          <article className="archivist-admin-card archivist-panel">
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Sách bán chạy</p>
                <h3 className="archivist-panel__title">Những tựa sách nổi bật nhất</h3>
              </div>
            </div>

            <div className="archivist-stack">
              {spotlightBooks.length ? (
                spotlightBooks.map((book) => (
                  <div key={book._id} className="archivist-list-row">
                    <div className="archivist-list-row__leading">
                      <img
                        src={book.coverImage || "/placeholder.svg"}
                        alt={book.title}
                        style={{ width: 62, height: 88, objectFit: "cover", border: "1px solid var(--archivist-line)" }}
                      />
                      <div>
                        <strong className="archivist-list-row__title">{book.title}</strong>
                        <span className="archivist-list-row__meta">{book.author || "Chưa rõ tác giả"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="archivist-list-row__meta">{book.totalSold || 0} bản</div>
                      <div className="archivist-list-row__meta">{formatCurrency(book.totalRevenue)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="archivist-empty" style={{ minHeight: 180 }}>Chưa có dữ liệu sách bán chạy.</div>
              )}
            </div>
          </article>

          <article className="archivist-admin-card archivist-panel">
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Cảnh báo</p>
                <h3 className="archivist-panel__title">Những nhóm cần chú ý</h3>
              </div>
              <CircleAlert size={16} />
            </div>

            <div className="archivist-stack">
              {drops.length ? (
                drops.map((item) => (
                  <div key={item.title} className="archivist-admin-card" style={{ padding: 16 }}>
                    <strong className="archivist-list-row__title">{item.title}</strong>
                    <p className="archivist-panel__description">{item.reason}</p>
                  </div>
                ))
              ) : (
                <div className="archivist-admin-card" style={{ padding: 16 }}>
                  <strong className="archivist-list-row__title">Không có cảnh báo lớn</strong>
                  <p className="archivist-panel__description">
                    Hệ thống hiện chưa ghi nhận nhóm sách hoặc hành vi giảm mạnh cần xử lý gấp.
                  </p>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
