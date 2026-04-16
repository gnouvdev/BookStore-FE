import { useMemo, useState } from "react";
import { BookOpen, Eye, Pencil, Plus, RefreshCw, Search, Trash2, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useAddAuthorMutation,
  useDeleteAuthorMutation,
  useGetAuthorsQuery,
  useUpdateAuthorMutation,
} from "@/redux/features/authors/authorsApi";
import { useGetBooksByAuthorQuery } from "@/redux/features/books/booksApi";

export default function ManageAuthors() {
  const { data: authors = [], isLoading, refetch } = useGetAuthorsQuery();
  const [addAuthor] = useAddAuthorMutation();
  const [updateAuthor] = useUpdateAuthorMutation();
  const [deleteAuthor] = useDeleteAuthorMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [editor, setEditor] = useState({ name: "", bio: "" });
  const { data: authorBooks = [] } = useGetBooksByAuthorQuery(selectedAuthor?._id, { skip: !selectedAuthor?._id });

  const filteredAuthors = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return authors.filter((author) => !keyword || (author.name || "").toLowerCase().includes(keyword));
  }, [authors, searchQuery]);

  const syncEditor = (author) => {
    setSelectedAuthor(author);
    setEditor({
      name: author?.name || "",
      bio: author?.bio || author?.biography || "",
    });
  };

  const resetEditor = () => {
    setSelectedAuthor(null);
    setEditor({ name: "", bio: "" });
  };

  const handleSave = async () => {
    try {
      if (!editor.name.trim()) {
        toast.error("Vui lòng nhập tên tác giả");
        return;
      }
      if (selectedAuthor?._id) {
        await updateAuthor({ id: selectedAuthor._id, name: editor.name, bio: editor.bio }).unwrap();
        toast.success("Đã cập nhật tác giả");
      } else {
        await addAuthor({ name: editor.name, bio: editor.bio }).unwrap();
        toast.success("Đã thêm tác giả mới");
      }
      refetch();
      resetEditor();
    } catch (error) {
      toast.error(error?.data?.message || "Không thể lưu tác giả");
    }
  };

  const handleDelete = async (authorId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tác giả này không?")) return;
    try {
      await deleteAuthor(authorId).unwrap();
      toast.success("Đã xóa tác giả");
      refetch();
      if (selectedAuthor?._id === authorId) resetEditor();
    } catch (error) {
      toast.error(error?.data?.message || "Không thể xóa tác giả");
    }
  };

  return (
    <div className="archivist-grid" style={{ gap: 24 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Hồ sơ tác giả</p>
          <h2>Quản lý tác giả</h2>
          <p>Theo dõi hồ sơ tác giả, chỉnh sửa tiểu sử và đối chiếu nhanh với các đầu sách đã xuất hiện trong kho.</p>
        </div>
        <div className="archivist-page-actions">
          <button type="button" className="archivist-secondary-button" onClick={refetch}><RefreshCw size={15} />Làm mới</button>
          <button type="button" className="archivist-primary-button" onClick={resetEditor}><Plus size={15} />Tạo hồ sơ mới</button>
        </div>
      </section>

      <section className="archivist-admin-card archivist-filterbar" style={{ gridTemplateColumns: "minmax(240px,1fr) auto" }}>
        <label className="archivist-searchbox" style={{ width: "100%", minWidth: 0 }}>
          <Search size={16} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm theo tên tác giả..." />
        </label>
        <button type="button" className="archivist-secondary-button" onClick={() => setSearchQuery("")}>Xóa tìm kiếm</button>
      </section>

      <section className="archivist-grid" style={{ gridTemplateColumns: "minmax(0,1.35fr) minmax(340px,.85fr)" }}>
        <article className="archivist-admin-card archivist-table-card">
          <div className="archivist-panel" style={{ paddingBottom: 0 }}><div className="archivist-panel__head"><div><p className="archivist-panel__eyebrow">Danh sách tác giả</p><h3 className="archivist-panel__title">{filteredAuthors.length} hồ sơ</h3></div></div></div>
          <div className="archivist-table-scroll">
            <table className="archivist-table">
              <thead><tr><th>Tác giả</th><th>Tiểu sử</th><th>Đầu sách</th><th>Thao tác</th></tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={4}><div className="archivist-empty" style={{ minHeight: 220 }}>Đang tải dữ liệu tác giả...</div></td></tr> : filteredAuthors.length ? filteredAuthors.map((author) => (
                  <tr key={author._id}>
                    <td>
                      <div className="archivist-book-cell" style={{ alignItems: "center" }}>
                        <div className="archivist-avatar archivist-avatar--sm">{(author.name || "A").charAt(0).toUpperCase()}</div>
                        <div className="archivist-book-cell__copy"><strong>{author.name}</strong><p>{author.country || "Hồ sơ tác giả"}</p></div>
                      </div>
                    </td>
                    <td><div className="archivist-table-meta">{author.bio || author.biography || "Chưa có tiểu sử"}</div></td>
                    <td><div className="archivist-table-meta">{author.booksCount || author.books?.length || 0} đầu sách</div></td>
                    <td><div className="archivist-cta-row"><button type="button" className="archivist-icon-cta" onClick={() => syncEditor(author)}><Eye size={16} /></button><button type="button" className="archivist-icon-cta" onClick={() => syncEditor(author)}><Pencil size={16} /></button><button type="button" className="archivist-icon-cta" onClick={() => handleDelete(author._id)}><Trash2 size={16} /></button></div></td>
                  </tr>
                )) : <tr><td colSpan={4}><div className="archivist-empty" style={{ minHeight: 220 }}>Không tìm thấy tác giả phù hợp.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="archivist-admin-card archivist-panel archivist-admin-card--strong">
          <div className="archivist-panel__head"><div><p className="archivist-panel__eyebrow">Biên tập hồ sơ</p><h3 className="archivist-panel__title">{selectedAuthor ? "Cập nhật tác giả" : "Thêm tác giả mới"}</h3></div></div>
          <div className="archivist-fields">
            <div className="archivist-field-group"><label className="archivist-field-label">Tên tác giả</label><input className="archivist-field" value={editor.name} onChange={(e) => setEditor((prev) => ({ ...prev, name: e.target.value }))} placeholder="Ví dụ: Nguyễn Nhật Ánh" /></div>
            <div className="archivist-field-group"><label className="archivist-field-label">Tiểu sử</label><textarea className="archivist-textarea" value={editor.bio} onChange={(e) => setEditor((prev) => ({ ...prev, bio: e.target.value }))} placeholder="Giới thiệu ngắn về tác giả" /></div>
            <div className="archivist-page-actions">
              <button type="button" className="archivist-secondary-button" onClick={resetEditor}>Hủy chọn</button>
              <button type="button" className="archivist-primary-button" onClick={handleSave}>Lưu hồ sơ</button>
            </div>
          </div>
          {selectedAuthor ? (
            <div className="archivist-admin-card" style={{ padding: 16, marginTop: 18 }}>
              <p className="archivist-panel__eyebrow">Tác phẩm liên quan</p>
              <div className="archivist-stack">
                {(authorBooks || []).slice(0, 5).map((book) => (
                  <div key={book._id} className="archivist-list-row">
                    <div className="archivist-list-row__leading">
                      <img src={book.coverImage || "/placeholder.svg"} alt={book.title} style={{ width: 42, height: 58, objectFit: "cover", border: "1px solid var(--archivist-line)" }} />
                      <div>
                        <strong className="archivist-list-row__title">{book.title}</strong>
                        <span className="archivist-list-row__meta">{book.category?.name || "Không rõ thể loại"}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!authorBooks || !authorBooks.length) ? <div className="archivist-table-meta">Chưa có đầu sách nào liên kết.</div> : null}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
