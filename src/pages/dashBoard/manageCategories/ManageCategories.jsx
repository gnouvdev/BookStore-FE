import { useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, Pencil, Plus, RefreshCw, Search, Tag, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import baseUrl from "../../../utils/baseURL";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editor, setEditor] = useState({ name: "", description: "" });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh mục thể loại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return categories.filter((category) =>
      !keyword ||
      (category.name || "").toLowerCase().includes(keyword) ||
      (category.description || "").toLowerCase().includes(keyword)
    );
  }, [categories, searchQuery]);

  const syncEditor = (category) => {
    setSelectedCategory(category);
    setEditor({ name: category?.name || "", description: category?.description || "" });
  };

  const resetEditor = () => {
    setSelectedCategory(null);
    setEditor({ name: "", description: "" });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!editor.name.trim()) {
        toast.error("Vui lòng nhập tên thể loại");
        return;
      }
      if (selectedCategory?._id) {
        await axios.put(`${baseUrl}/categories/edit/${selectedCategory._id}`, editor, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        toast.success("Đã cập nhật thể loại");
      } else {
        await axios.post(`${baseUrl}/categories/create`, editor, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Đã thêm thể loại mới");
      }
      fetchCategories();
      resetEditor();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu thể loại");
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Bạn có chắc muốn xóa thể loại này không?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseUrl}/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa thể loại");
      fetchCategories();
      if (selectedCategory?._id === categoryId) resetEditor();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa thể loại");
    }
  };

  return (
    <div className="archivist-grid" style={{ gap: 24 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Danh mục phân loại</p>
          <h2>Quản lý thể loại</h2>
          <p>Sắp xếp lại cấu trúc thể loại để việc lọc sách, hiển thị danh mục và điều hướng trên storefront được nhất quán.</p>
        </div>
        <div className="archivist-page-actions">
          <button type="button" className="archivist-secondary-button" onClick={fetchCategories}><RefreshCw size={15} />Làm mới</button>
          <button type="button" className="archivist-primary-button" onClick={resetEditor}><Plus size={15} />Thêm thể loại</button>
        </div>
      </section>

      <section className="archivist-admin-card archivist-filterbar" style={{ gridTemplateColumns: "minmax(240px,1fr) auto" }}>
        <label className="archivist-searchbox" style={{ width: "100%", minWidth: 0 }}>
          <Search size={16} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm theo tên hoặc mô tả thể loại..." />
        </label>
        <button type="button" className="archivist-secondary-button" onClick={() => setSearchQuery("")}>Xóa tìm kiếm</button>
      </section>

      <section className="archivist-grid" style={{ gridTemplateColumns: "minmax(0,1.35fr) minmax(340px,.85fr)" }}>
        <article className="archivist-admin-card archivist-table-card">
          <div className="archivist-panel" style={{ paddingBottom: 0 }}><div className="archivist-panel__head"><div><p className="archivist-panel__eyebrow">Danh sách thể loại</p><h3 className="archivist-panel__title">{filteredCategories.length} thể loại</h3></div></div></div>
          <div className="archivist-table-scroll">
            <table className="archivist-table">
              <thead><tr><th>Thể loại</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={4}><div className="archivist-empty" style={{ minHeight: 220 }}>Đang tải dữ liệu thể loại...</div></td></tr> : filteredCategories.length ? filteredCategories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <div className="archivist-book-cell" style={{ alignItems: "center" }}>
                        <div className="archivist-avatar archivist-avatar--sm"><Tag size={16} /></div>
                        <div className="archivist-book-cell__copy"><strong>{category.name}</strong><p>{category._id}</p></div>
                      </div>
                    </td>
                    <td><div className="archivist-table-meta">{category.description || "Chưa có mô tả"}</div></td>
                    <td><span className="archivist-status-pill" data-tone={category.status === "inactive" ? "warning" : "success"}>{category.status || "active"}</span></td>
                    <td><div className="archivist-cta-row"><button type="button" className="archivist-icon-cta" onClick={() => syncEditor(category)}><Eye size={16} /></button><button type="button" className="archivist-icon-cta" onClick={() => syncEditor(category)}><Pencil size={16} /></button><button type="button" className="archivist-icon-cta" onClick={() => handleDelete(category._id)}><Trash2 size={16} /></button></div></td>
                  </tr>
                )) : <tr><td colSpan={4}><div className="archivist-empty" style={{ minHeight: 220 }}>Không có thể loại phù hợp.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="archivist-admin-card archivist-panel archivist-admin-card--strong">
          <div className="archivist-panel__head"><div><p className="archivist-panel__eyebrow">Biên tập thể loại</p><h3 className="archivist-panel__title">{selectedCategory ? "Cập nhật thể loại" : "Tạo thể loại mới"}</h3></div></div>
          <div className="archivist-fields">
            <div className="archivist-field-group"><label className="archivist-field-label">Tên thể loại</label><input className="archivist-field" value={editor.name} onChange={(e) => setEditor((prev) => ({ ...prev, name: e.target.value }))} placeholder="Ví dụ: Văn học Việt Nam" /></div>
            <div className="archivist-field-group"><label className="archivist-field-label">Mô tả</label><textarea className="archivist-textarea" value={editor.description} onChange={(e) => setEditor((prev) => ({ ...prev, description: e.target.value }))} placeholder="Mô tả ngắn về nhóm sách này" /></div>
            <div className="archivist-page-actions">
              <button type="button" className="archivist-secondary-button" onClick={resetEditor}>Hủy chọn</button>
              <button type="button" className="archivist-primary-button" onClick={handleSave}>Lưu thể loại</button>
            </div>
          </div>
          {selectedCategory ? (
            <div className="archivist-admin-card" style={{ padding: 16, marginTop: 18 }}>
              <p className="archivist-panel__eyebrow">Tóm tắt nhanh</p>
              <div className="archivist-list-row"><strong className="archivist-list-row__title">Mã thể loại</strong><span className="archivist-list-row__meta">{selectedCategory._id}</span></div>
              <div className="archivist-list-row"><strong className="archivist-list-row__title">Trạng thái</strong><span className="archivist-list-row__meta">{selectedCategory.status || "active"}</span></div>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
