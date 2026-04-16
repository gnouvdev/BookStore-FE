import { useMemo, useState } from "react";
import {
  Download,
  Eye,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/redux/features/users/userApi";

export default function ManageUsers() {
  const { data: usersData = [], isLoading, refetch } = useGetUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const users = Array.isArray(usersData) ? usersData : [];

  const filteredUsers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      const name = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const matchesSearch =
        !keyword ||
        name.toLowerCase().includes(keyword) ||
        (user.email || "").toLowerCase().includes(keyword) ||
        (user._id || "").toLowerCase().includes(keyword);
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesStatus = selectedStatus === "all" || (user.status || "active") === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const stats = useMemo(() => ({
    total: filteredUsers.length,
    admins: filteredUsers.filter((user) => user.role === "admin").length,
    active: filteredUsers.filter((user) => (user.status || "active") === "active").length,
    inactive: filteredUsers.filter((user) => (user.status || "active") !== "active").length,
  }), [filteredUsers]);

  const handleUpdate = async (userId, payload) => {
    try {
      await updateUser({ id: userId, ...payload }).unwrap();
      toast.success("Đã cập nhật tài khoản người dùng");
      refetch();
      if (selectedUser?._id === userId) {
        setSelectedUser((current) => (current ? { ...current, ...payload } : current));
      }
    } catch (error) {
      toast.error(error?.data?.message || "Không thể cập nhật người dùng");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này không?")) return;
    try {
      await deleteUser(userId).unwrap();
      toast.success("Đã xóa người dùng");
      refetch();
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (error) {
      toast.error(error?.data?.message || "Không thể xóa người dùng");
    }
  };

  return (
    <div className="archivist-grid" style={{ gap: 24 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Quản trị tài khoản</p>
          <h2>Quản lý người dùng</h2>
          <p>Kiểm soát vai trò, trạng thái và hồ sơ của toàn bộ tài khoản trong hệ thống.</p>
        </div>
        <div className="archivist-page-actions">
          <button type="button" className="archivist-secondary-button" onClick={refetch}>
            <RefreshCw size={15} />
            Làm mới
          </button>
        </div>
      </section>

      <section className="archivist-kpi-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <article className="archivist-admin-card archivist-kpi-card"><p className="archivist-kpi-card__eyebrow">Tổng tài khoản</p><h3 className="archivist-kpi-card__value">{stats.total}</h3><p className="archivist-kpi-card__detail">Số người dùng trong bộ lọc hiện tại</p></article>
        <article className="archivist-admin-card archivist-kpi-card"><p className="archivist-kpi-card__eyebrow">Quản trị viên</p><h3 className="archivist-kpi-card__value">{stats.admins}</h3><p className="archivist-kpi-card__detail">Tài khoản có quyền cao nhất</p></article>
        <article className="archivist-admin-card archivist-kpi-card"><p className="archivist-kpi-card__eyebrow">Đang hoạt động</p><h3 className="archivist-kpi-card__value">{stats.active}</h3><p className="archivist-kpi-card__detail">Tài khoản có thể sử dụng bình thường</p></article>
        <article className="archivist-admin-card archivist-kpi-card"><p className="archivist-kpi-card__eyebrow">Đã khóa / tạm dừng</p><h3 className="archivist-kpi-card__value">{stats.inactive}</h3><p className="archivist-kpi-card__detail">Cần kiểm tra lại trạng thái</p></article>
      </section>

      <section className="archivist-admin-card archivist-filterbar" style={{ gridTemplateColumns: "minmax(240px,1.4fr) repeat(2,minmax(170px,.7fr)) auto" }}>
        <label className="archivist-searchbox" style={{ width: "100%", minWidth: 0 }}>
          <Search size={16} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm theo tên, email hoặc ID..." />
        </label>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Quản trị viên</option>
          <option value="user">Người dùng</option>
          <option value="customer">Khách hàng</option>
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm dừng</option>
          <option value="banned">Đã khóa</option>
        </select>
        <button type="button" className="archivist-secondary-button" onClick={() => { setSearchQuery(""); setSelectedRole("all"); setSelectedStatus("all"); }}>
          Đặt lại bộ lọc
        </button>
      </section>

      <section className="archivist-grid" style={{ gridTemplateColumns: selectedUser ? "minmax(0,1.45fr) minmax(320px,.75fr)" : "1fr" }}>
        <article className="archivist-admin-card archivist-table-card">
          <div className="archivist-panel" style={{ paddingBottom: 0 }}>
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Danh sách tài khoản</p>
                <h3 className="archivist-panel__title">{filteredUsers.length} tài khoản</h3>
              </div>
            </div>
          </div>
          <div className="archivist-table-scroll">
            <table className="archivist-table">
              <thead><tr><th>Người dùng</th><th>Vai trò</th><th>Trạng thái</th><th>Liên hệ</th><th>Thao tác</th></tr></thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5}><div className="archivist-empty" style={{ minHeight: 220 }}>Đang tải dữ liệu người dùng...</div></td></tr>
                ) : filteredUsers.length ? filteredUsers.map((user) => {
                  const name = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Người dùng";
                  return (
                    <tr key={user._id}>
                      <td>
                        <div className="archivist-book-cell" style={{ alignItems: "center" }}>
                          <div className="archivist-avatar archivist-avatar--sm">{name.charAt(0).toUpperCase()}</div>
                          <div className="archivist-book-cell__copy">
                            <strong>{name}</strong>
                            <p>{user._id}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="archivist-status-pill" data-tone={user.role === "admin" ? "info" : "success"}>{user.role || "user"}</span></td>
                      <td><span className="archivist-status-pill" data-tone={(user.status || "active") === "active" ? "success" : "warning"}>{user.status || "active"}</span></td>
                      <td><div className="archivist-table-meta">{user.email || "Không có email"}</div></td>
                      <td>
                        <div className="archivist-cta-row">
                          <button type="button" className="archivist-icon-cta" onClick={() => setSelectedUser(user)}><Eye size={16} /></button>
                          <button type="button" className="archivist-icon-cta" onClick={() => handleDelete(user._id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={5}><div className="archivist-empty" style={{ minHeight: 220 }}>Không tìm thấy người dùng phù hợp.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {selectedUser ? (
          <aside className="archivist-admin-card archivist-panel archivist-admin-card--strong">
            <div className="archivist-panel__head"><div><p className="archivist-panel__eyebrow">Hồ sơ tài khoản</p><h3 className="archivist-panel__title">{selectedUser.fullName || selectedUser.email || "Người dùng"}</h3></div><button type="button" className="archivist-secondary-button" onClick={() => setSelectedUser(null)}>Đóng</button></div>
            <div className="archivist-stack">
              <div className="archivist-admin-card" style={{ padding: 16 }}>
                <div className="archivist-list-row"><strong className="archivist-list-row__title">Email</strong><span className="archivist-list-row__meta">{selectedUser.email || "N/A"}</span></div>
                <div className="archivist-list-row"><strong className="archivist-list-row__title">Điện thoại</strong><span className="archivist-list-row__meta">{selectedUser.phone || "Chưa cập nhật"}</span></div>
                <div className="archivist-list-row"><strong className="archivist-list-row__title">Địa chỉ</strong><span className="archivist-list-row__meta">{selectedUser.address?.street || "Chưa cập nhật"}</span></div>
              </div>
              <div className="archivist-admin-card" style={{ padding: 16 }}>
                <p className="archivist-panel__eyebrow">Cập nhật nhanh</p>
                <div className="archivist-fields">
                  <div className="archivist-field-group">
                    <label className="archivist-field-label">Vai trò</label>
                    <select className="archivist-field" value={selectedUser.role || "user"} onChange={(e) => handleUpdate(selectedUser._id, { role: e.target.value })}>
                      <option value="admin">Quản trị viên</option>
                      <option value="user">Người dùng</option>
                      <option value="customer">Khách hàng</option>
                    </select>
                  </div>
                  <div className="archivist-field-group">
                    <label className="archivist-field-label">Trạng thái</label>
                    <select className="archivist-field" value={selectedUser.status || "active"} onChange={(e) => handleUpdate(selectedUser._id, { status: e.target.value })}>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm dừng</option>
                      <option value="banned">Đã khóa</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="archivist-admin-card" style={{ padding: 16 }}>
                <div className="archivist-list-row"><strong className="archivist-list-row__title">Ngày tạo</strong><span className="archivist-list-row__meta">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString("vi-VN") : "N/A"}</span></div>
                <div className="archivist-list-row"><strong className="archivist-list-row__title">Cập nhật gần nhất</strong><span className="archivist-list-row__meta">{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString("vi-VN") : "N/A"}</span></div>
              </div>
            </div>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
