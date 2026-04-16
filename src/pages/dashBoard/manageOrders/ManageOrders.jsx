import { useMemo, useState } from "react";
import {
  Eye,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useDeleteOrderMutation,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/features/orders/ordersApi";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
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

function renderStatusLabel(status) {
  const labels = {
    pending: "Chờ xử lý",
    processing: "Đang chuẩn bị",
    shipped: "Đang giao",
    delivered: "Đã giao",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
  };
  return labels[status] || status || "Chờ xử lý";
}

export default function ManageOrders() {
  const { data: ordersData = [], isLoading, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = Array.isArray(ordersData?.orders)
    ? ordersData.orders
    : Array.isArray(ordersData)
    ? ordersData
    : [];

  const paymentMethods = useMemo(
    () => [...new Set(orders.map((order) => order?.paymentMethod?.name).filter(Boolean))],
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !normalizedQuery ||
        order?._id?.toLowerCase().includes(normalizedQuery) ||
        order?.name?.toLowerCase().includes(normalizedQuery) ||
        order?.email?.toLowerCase().includes(normalizedQuery) ||
        order?.phone?.toLowerCase().includes(normalizedQuery);

      const matchesStatus = selectedStatus === "all" || order?.status === selectedStatus;
      const matchesPayment =
        selectedPayment === "all" || order?.paymentMethod?.name === selectedPayment;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchQuery, selectedStatus, selectedPayment]);

  const stats = useMemo(() => {
    return {
      total: filteredOrders.length,
      pending: filteredOrders.filter((order) => order?.status === "pending").length,
      inTransit: filteredOrders.filter((order) => ["processing", "shipped"].includes(order?.status)).length,
      revenue: filteredOrders.reduce((sum, order) => sum + (order?.totalPrice || 0), 0),
    };
  }, [filteredOrders]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus({ id: orderId, status }).unwrap();
      toast.success("Đã cập nhật trạng thái đơn hàng");
      refetch();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((current) => (current ? { ...current, status } : current));
      }
    } catch (error) {
      toast.error(error?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này không?")) {
      return;
    }
    try {
      await deleteOrder(orderId).unwrap();
      toast.success("Đơn hàng đã được xóa");
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Không thể xóa đơn hàng");
    }
  };

  return (
    <div className="archivist-grid" style={{ gap: 24 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Sổ đơn hàng</p>
          <h2>Quản lý đơn hàng</h2>
          <p>
            Theo dõi luồng đơn hàng theo dạng sổ quản trị, ưu tiên trạng thái xử lý,
            thanh toán và hồ sơ khách hàng ở cùng một màn hình.
          </p>
        </div>
        <div className="archivist-page-actions">
          <button type="button" className="archivist-secondary-button" onClick={refetch}>
            <RefreshCw size={15} />
            Làm mới
          </button>
        </div>
      </section>

      <section className="archivist-kpi-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <article className="archivist-admin-card archivist-kpi-card">
          <p className="archivist-kpi-card__eyebrow">Tổng đơn</p>
          <h3 className="archivist-kpi-card__value">{stats.total}</h3>
          <p className="archivist-kpi-card__detail">Khớp với bộ lọc hiện tại</p>
        </article>
        <article className="archivist-admin-card archivist-kpi-card">
          <p className="archivist-kpi-card__eyebrow">Chờ xử lý</p>
          <h3 className="archivist-kpi-card__value">{stats.pending}</h3>
          <p className="archivist-kpi-card__detail">Đơn hàng đang chờ xác nhận hoặc xử lý</p>
        </article>
        <article className="archivist-admin-card archivist-kpi-card">
          <p className="archivist-kpi-card__eyebrow">Đang vận chuyển</p>
          <h3 className="archivist-kpi-card__value">{stats.inTransit}</h3>
          <p className="archivist-kpi-card__detail">Đơn đã vào quá trình giao vận</p>
        </article>
        <article className="archivist-admin-card archivist-kpi-card">
          <p className="archivist-kpi-card__eyebrow">Doanh thu</p>
          <h3 className="archivist-kpi-card__value">{formatCurrency(stats.revenue)}</h3>
          <p className="archivist-kpi-card__detail">Tổng doanh thu của tập đơn đang xem</p>
        </article>
      </section>

      <section className="archivist-admin-card archivist-filterbar" style={{ gridTemplateColumns: "minmax(240px, 1.4fr) repeat(2, minmax(170px, 0.7fr)) auto" }}>
        <label className="archivist-searchbox" style={{ width: "100%", minWidth: 0 }}>
          <Search size={16} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo mã đơn, khách hàng, email hoặc số điện thoại..."
          />
        </label>

        <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang chuẩn bị</option>
          <option value="shipped">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select value={selectedPayment} onChange={(event) => setSelectedPayment(event.target.value)}>
          <option value="all">Tất cả thanh toán</option>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="archivist-secondary-button"
          onClick={() => {
            setSearchQuery("");
            setSelectedStatus("all");
            setSelectedPayment("all");
          }}
        >
          Xóa bộ lọc
        </button>
      </section>

      <section className="archivist-grid" style={{ gridTemplateColumns: selectedOrder ? "minmax(0, 1.45fr) minmax(320px, 0.75fr)" : "1fr", gap: 24 }}>
        <article className="archivist-admin-card archivist-table-card">
          <div className="archivist-panel" style={{ paddingBottom: 0 }}>
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Danh sách đơn hàng</p>
                <h3 className="archivist-panel__title">{filteredOrders.length} đơn phù hợp</h3>
              </div>
            </div>
          </div>
          <div className="archivist-table-scroll">
            <table className="archivist-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Mã đơn</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="archivist-empty" style={{ minHeight: 220 }}>Đang mở sổ đơn hàng...</div>
                    </td>
                  </tr>
                ) : filteredOrders.length ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="archivist-book-cell" style={{ alignItems: "center" }}>
                          <div className="archivist-avatar archivist-avatar--sm">
                            {(order.name || order.user?.fullName || "K").charAt(0).toUpperCase()}
                          </div>
                          <div className="archivist-book-cell__copy">
                            <strong>{order.name || order.user?.fullName || "Khách hàng"}</strong>
                            <p>{order.email || order.user?.email || "Không có email"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="archivist-table-meta">#{order._id?.slice(-8)}</div>
                        <div className="archivist-table-meta">{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "N/A"}</div>
                      </td>
                      <td>
                        <span className="archivist-status-pill" data-tone={getStatusTone(order.status)}>
                          {renderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td>
                        <div className="archivist-table-meta">{order?.paymentMethod?.name || "N/A"}</div>
                        <div className="archivist-table-meta">{order?.paymentStatus || "pending"}</div>
                      </td>
                      <td>
                        <div className="archivist-table-meta">{formatCurrency(order.totalPrice)}</div>
                        <div className="archivist-table-meta">{order?.productIds?.length || 0} sản phẩm</div>
                      </td>
                      <td>
                        <div className="archivist-cta-row">
                          <button type="button" className="archivist-icon-cta" onClick={() => setSelectedOrder(order)}>
                            <Eye size={16} />
                          </button>
                          <button type="button" className="archivist-icon-cta" onClick={() => handleDelete(order._id)}>
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="archivist-empty" style={{ minHeight: 220 }}>
                        Không có đơn hàng nào khớp với bộ lọc hiện tại.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {selectedOrder ? (
          <aside className="archivist-admin-card archivist-panel archivist-admin-card--strong">
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Hồ sơ đơn hàng</p>
                <h3 className="archivist-panel__title">#{selectedOrder._id?.slice(-8)}</h3>
              </div>
              <button type="button" className="archivist-secondary-button" onClick={() => setSelectedOrder(null)}>
                Đóng
              </button>
            </div>

            <div className="archivist-stack">
              <div className="archivist-admin-card" style={{ padding: 16 }}>
                <strong className="archivist-list-row__title">{selectedOrder.name || selectedOrder.user?.fullName || "Khách hàng"}</strong>
                <p className="archivist-panel__description">
                  {selectedOrder.email || selectedOrder.user?.email || "Không có email"}
                  <br />
                  {selectedOrder.phone || "Không có số điện thoại"}
                </p>
              </div>

              <div className="archivist-stack">
                <div className="archivist-list-row">
                  <strong className="archivist-list-row__title">Địa chỉ</strong>
                  <span className="archivist-list-row__meta">
                    {selectedOrder.address?.street || "N/A"}, {selectedOrder.address?.city || ""}
                  </span>
                </div>
                <div className="archivist-list-row">
                  <strong className="archivist-list-row__title">Vận chuyển</strong>
                  <span className="archivist-list-row__meta">{selectedOrder.trackingNumber || "Chưa có mã vận chuyển"}</span>
                </div>
                <div className="archivist-list-row">
                  <strong className="archivist-list-row__title">Tổng tiền</strong>
                  <span className="archivist-list-row__meta">{formatCurrency(selectedOrder.totalPrice)}</span>
                </div>
              </div>

              <div className="archivist-admin-card" style={{ padding: 16 }}>
                <p className="archivist-panel__eyebrow">Cập nhật trạng thái</p>
                <div className="archivist-page-actions" style={{ marginTop: 10 }}>
                  {["pending", "processing", "shipped", "delivered", "completed", "cancelled"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={selectedOrder.status === status ? "archivist-primary-button" : "archivist-secondary-button"}
                      onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                    >
                      {renderStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="archivist-admin-card" style={{ padding: 16 }}>
                <p className="archivist-panel__eyebrow">Sản phẩm trong đơn</p>
                <div className="archivist-stack">
                  {(selectedOrder.productIds || []).map((item, index) => (
                    <div key={`${selectedOrder._id}-${index}`} className="archivist-list-row">
                      <div className="archivist-list-row__leading">
                        <img
                          src={item.productId?.coverImage || item.productId?.image || "/placeholder.svg"}
                          alt={item.productId?.title || "Book"}
                          style={{ width: 48, height: 68, objectFit: "cover", border: "1px solid var(--archivist-line)" }}
                        />
                        <div>
                          <strong className="archivist-list-row__title">{item.productId?.title || "Không có tên"}</strong>
                          <span className="archivist-list-row__meta">Số lượng {item.quantity}</span>
                        </div>
                      </div>
                      <span className="archivist-list-row__meta">
                        {formatCurrency((item.productId?.price?.newPrice || item.productId?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
