import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Pencil, Plus, RefreshCw, Search, TicketPercent, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useCreateVoucherMutation,
  useDeleteVoucherMutation,
  useGetAllVouchersQuery,
  useUpdateVoucherMutation,
} from "@/redux/features/voucher/voucherApi";

const initialForm = {
  code: "",
  type: "percentage",
  value: 0,
  minOrderValue: 0,
  maxDiscount: null,
  startDate: "",
  endDate: "",
  usageLimit: null,
  description: "",
  isActive: true,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
}

export default function ManageVoucher() {
  const { data: vouchersData, isLoading, refetch } = useGetAllVouchersQuery();
  const [createVoucher] = useCreateVoucherMutation();
  const [updateVoucher] = useUpdateVoucherMutation();
  const [deleteVoucher] = useDeleteVoucherMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editor, setEditor] = useState(initialForm);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const vouchers = vouchersData?.data || [];

  const filteredVouchers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    const now = new Date();
    return vouchers.filter((voucher) => {
      const matchesSearch =
        !keyword ||
        (voucher.code || "").toLowerCase().includes(keyword) ||
        (voucher.description || "").toLowerCase().includes(keyword);

      if (!matchesSearch) return false;
      if (filterStatus === "all") return true;
      if (filterStatus === "active") return voucher.isActive && new Date(voucher.endDate) > now;
      if (filterStatus === "inactive") return !voucher.isActive;
      if (filterStatus === "expired") return new Date(voucher.endDate) <= now;
      return true;
    });
  }, [vouchers, searchQuery, filterStatus]);

  const stats = useMemo(() => ({
    total: vouchers.length,
    active: vouchers.filter((voucher) => voucher.isActive).length,
    expired: vouchers.filter((voucher) => new Date(voucher.endDate) <= new Date()).length,
    used: vouchers.reduce((sum, voucher) => sum + (voucher.usedCount || 0), 0),
  }), [vouchers]);

  const resetEditor = () => {
    setEditor(initialForm);
    setEditingVoucher(null);
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setEditor({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minOrderValue: voucher.minOrderValue,
      maxDiscount: voucher.maxDiscount || null,
      startDate: new Date(voucher.startDate).toISOString().slice(0, 16),
      endDate: new Date(voucher.endDate).toISOString().slice(0, 16),
      usageLimit: voucher.usageLimit || null,
      description: voucher.description || "",
      isActive: voucher.isActive,
    });
  };

  const handleSave = async () => {
    try {
      if (!editor.code.trim()) {
        toast.error("Vui lòng nhập mã voucher");
        return;
      }
      if (editingVoucher?._id) {
        await updateVoucher({ voucherId: editingVoucher._id, ...editor }).unwrap();
        toast.success("Đã cập nhật voucher");
      } else {
        await createVoucher(editor).unwrap();
        toast.success("Đã tạo voucher mới");
      }
      refetch();
      resetEditor();
    } catch (error) {
      toast.error(error?.data?.message || "Không thể lưu voucher");
    }
  };

  const handleDelete = async (voucherId) => {
    if (!window.confirm("Bạn có chắc muốn xóa voucher này không?")) return;
    try {
      await deleteVoucher(voucherId).unwrap();
      toast.success("Đã xóa voucher");
      refetch();
      if (editingVoucher?._id === voucherId) resetEditor();
    } catch (error) {
      toast.error(error?.data?.message || "Không thể xóa voucher");
    }
  };

  const toggleStatus = async (voucher) => {
    try {
      await updateVoucher({ voucherId: voucher._id, isActive: !voucher.isActive }).unwrap();
      toast.success("Đã cập nhật trạng thái voucher");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  return (
    <div className="archivist-grid" style={{ gap: 24 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Khuyến mại & chiến dịch</p>
          <h2>Quản lý voucher</h2>
          <p>Tạo mã giảm giá, giới hạn điều kiện sử dụng và theo dõi trạng thái hoạt động ngay trong một màn hình.</p>
        </div>
        <div className="archivist-page-actions">
          <button type="button" className="archivist-secondary-button" onClick={refetch}><RefreshCw size={15} />Làm mới</button>
          <button type="button" className="archivist-primary-button" onClick={resetEditor}><Plus size={15} />Tạo voucher</button>
        </div>
      </section>

      <section className="archivist-kpi-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <article className="archivist-admin-card archivist-kpi-card"><p className="archivist-kpi-card__eyebrow">Tổng voucher</p><h3 className="archivist-kpi-card__value">{stats.total}</h3><p className="archivist-kpi-card__detail">Tất cả mã khuyến mại trong hệ thống</p></article>
        <article className="archivist-admin-card archivist-kpi-card"><p className="archivist-kpi-card__eyebrow">Đang hoạt động</p><h3 className="archivist-kpi-card__value">{stats.active}</h3><p className="archivist-kpi-card__detail">Voucher có thể áp dụng ngay</p></article>
        <article className="archivist-admin-card archivist-kpi-card"><p className="archivist-kpi-card__eyebrow">Đã hết hạn</p><h3 className="archivist-kpi-card__value">{stats.expired}</h3><p className="archivist-kpi-card__detail">Voucher không còn khả dụng</p></article>
        <article className="archivist-admin-card archivist-kpi-card"><p className="archivist-kpi-card__eyebrow">Lượt sử dụng</p><h3 className="archivist-kpi-card__value">{stats.used}</h3><p className="archivist-kpi-card__detail">Tổng số lần voucher đã được dùng</p></article>
      </section>

      <section className="archivist-admin-card archivist-filterbar" style={{ gridTemplateColumns: "minmax(240px,1fr) minmax(180px,.45fr) auto" }}>
        <label className="archivist-searchbox" style={{ width: "100%", minWidth: 0 }}>
          <Search size={16} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm theo mã voucher hoặc mô tả..." />
        </label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm dừng</option>
          <option value="expired">Đã hết hạn</option>
        </select>
        <button type="button" className="archivist-secondary-button" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>Xóa bộ lọc</button>
      </section>

      <section className="archivist-grid" style={{ gridTemplateColumns: "minmax(0,1.35fr) minmax(360px,.9fr)" }}>
        <article className="archivist-admin-card archivist-table-card">
          <div className="archivist-panel" style={{ paddingBottom: 0 }}><div className="archivist-panel__head"><div><p className="archivist-panel__eyebrow">Danh sách voucher</p><h3 className="archivist-panel__title">{filteredVouchers.length} mã phù hợp</h3></div></div></div>
          <div className="archivist-table-scroll">
            <table className="archivist-table">
              <thead><tr><th>Mã voucher</th><th>Giá trị</th><th>Điều kiện</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={5}><div className="archivist-empty" style={{ minHeight: 220 }}>Đang tải dữ liệu voucher...</div></td></tr> : filteredVouchers.length ? filteredVouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td><div className="archivist-book-cell" style={{ alignItems: "center" }}><div className="archivist-avatar archivist-avatar--sm"><TicketPercent size={16} /></div><div className="archivist-book-cell__copy"><strong>{voucher.code}</strong><p>{voucher.description || "Chưa có mô tả"}</p></div></div></td>
                    <td><div className="archivist-table-meta">{voucher.type === "percentage" ? `${voucher.value}%` : formatCurrency(voucher.value)}</div></td>
                    <td><div className="archivist-table-meta">Đơn tối thiểu {formatCurrency(voucher.minOrderValue)}</div><div className="archivist-table-meta">{voucher.usageLimit ? `${voucher.usedCount || 0}/${voucher.usageLimit} lượt` : "Không giới hạn lượt"}</div></td>
                    <td><span className="archivist-status-pill" data-tone={voucher.isActive ? "success" : "warning"}>{voucher.isActive ? "Đang hoạt động" : "Tạm dừng"}</span></td>
                    <td><div className="archivist-cta-row"><button type="button" className="archivist-icon-cta" onClick={() => handleEdit(voucher)}><Pencil size={16} /></button><button type="button" className="archivist-icon-cta" onClick={() => toggleStatus(voucher)}><BadgePercent size={16} /></button><button type="button" className="archivist-icon-cta" onClick={() => handleDelete(voucher._id)}><Trash2 size={16} /></button></div></td>
                  </tr>
                )) : <tr><td colSpan={5}><div className="archivist-empty" style={{ minHeight: 220 }}>Không có voucher phù hợp.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="archivist-admin-card archivist-panel archivist-admin-card--strong">
          <div className="archivist-panel__head"><div><p className="archivist-panel__eyebrow">Biên tập voucher</p><h3 className="archivist-panel__title">{editingVoucher ? "Cập nhật voucher" : "Tạo voucher mới"}</h3></div></div>
          <div className="archivist-fields">
            <div className="archivist-field-group"><label className="archivist-field-label">Mã voucher</label><input className="archivist-field" value={editor.code} onChange={(e) => setEditor((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} placeholder="Ví dụ: BOOKECO10" /></div>
            <div className="archivist-fields archivist-fields--two">
              <div className="archivist-field-group"><label className="archivist-field-label">Loại</label><select className="archivist-field" value={editor.type} onChange={(e) => setEditor((prev) => ({ ...prev, type: e.target.value }))}><option value="percentage">Phần trăm</option><option value="fixed">Số tiền cố định</option></select></div>
              <div className="archivist-field-group"><label className="archivist-field-label">Giá trị</label><input className="archivist-field" type="number" value={editor.value} onChange={(e) => setEditor((prev) => ({ ...prev, value: Number(e.target.value) }))} /></div>
            </div>
            <div className="archivist-fields archivist-fields--two">
              <div className="archivist-field-group"><label className="archivist-field-label">Đơn tối thiểu</label><input className="archivist-field" type="number" value={editor.minOrderValue} onChange={(e) => setEditor((prev) => ({ ...prev, minOrderValue: Number(e.target.value) }))} /></div>
              <div className="archivist-field-group"><label className="archivist-field-label">Giảm tối đa</label><input className="archivist-field" type="number" value={editor.maxDiscount || ""} onChange={(e) => setEditor((prev) => ({ ...prev, maxDiscount: e.target.value ? Number(e.target.value) : null }))} /></div>
            </div>
            <div className="archivist-fields archivist-fields--two">
              <div className="archivist-field-group"><label className="archivist-field-label">Bắt đầu</label><input className="archivist-field" type="datetime-local" value={editor.startDate} onChange={(e) => setEditor((prev) => ({ ...prev, startDate: e.target.value }))} /></div>
              <div className="archivist-field-group"><label className="archivist-field-label">Kết thúc</label><input className="archivist-field" type="datetime-local" value={editor.endDate} onChange={(e) => setEditor((prev) => ({ ...prev, endDate: e.target.value }))} /></div>
            </div>
            <div className="archivist-field-group"><label className="archivist-field-label">Mô tả</label><textarea className="archivist-textarea" value={editor.description} onChange={(e) => setEditor((prev) => ({ ...prev, description: e.target.value }))} placeholder="Mô tả ngắn về chiến dịch giảm giá" /></div>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={editor.isActive} onChange={(e) => setEditor((prev) => ({ ...prev, isActive: e.target.checked }))} /><span className="archivist-table-meta">Kích hoạt voucher ngay sau khi lưu</span></label>
            <div className="archivist-page-actions"><button type="button" className="archivist-secondary-button" onClick={resetEditor}>Hủy chọn</button><button type="button" className="archivist-primary-button" onClick={handleSave}>Lưu voucher</button></div>
          </div>
        </aside>
      </section>
    </div>
  );
}
