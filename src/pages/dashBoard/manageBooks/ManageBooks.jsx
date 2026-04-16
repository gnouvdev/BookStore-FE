import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import baseUrl from "../../../utils/baseURL";

function formatCurrency(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
}

export default function ManageBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        navigate("/admin");
        return;
      }

      const response = await axios.get(`${baseUrl}/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh mục sách");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const categories = useMemo(
    () => [...new Set(books.map((book) => book?.category?.name).filter(Boolean))],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const nextBooks = books.filter((book) => {
      const matchesSearch =
        !normalizedQuery ||
        book?.title?.toLowerCase().includes(normalizedQuery) ||
        book?.author?.name?.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === "all" || book?.category?.name === selectedCategory;

      const stock = Number(book?.quantity || 0);
      const matchesStock =
        selectedStock === "all" ||
        (selectedStock === "available" && stock > 0) ||
        (selectedStock === "low" && stock > 0 && stock < 10) ||
        (selectedStock === "empty" && stock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });

    nextBooks.sort((left, right) => {
      if (sortBy === "price") {
        return (right?.price?.newPrice || 0) - (left?.price?.newPrice || 0);
      }
      if (sortBy === "stock") {
        return (right?.quantity || 0) - (left?.quantity || 0);
      }
      if (sortBy === "author") {
        return (left?.author?.name || "").localeCompare(right?.author?.name || "", "vi");
      }
      return (left?.title || "").localeCompare(right?.title || "", "vi");
    });

    return nextBooks;
  }, [books, searchQuery, selectedCategory, selectedStock, sortBy]);

  const stats = useMemo(() => {
    const totalInventoryValue = filteredBooks.reduce(
      (sum, book) => sum + (book?.price?.newPrice || 0) * (book?.quantity || 0),
      0
    );
    return {
      total: filteredBooks.length,
      lowStock: filteredBooks.filter((book) => Number(book?.quantity || 0) < 10).length,
      outOfStock: filteredBooks.filter((book) => Number(book?.quantity || 0) === 0).length,
      inventoryValue: totalInventoryValue,
    };
  }, [filteredBooks]);

  const handleDelete = async (bookId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa đầu sách này không?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseUrl}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa sách khỏi kho");
      setBooks((current) => current.filter((book) => book._id !== bookId));
      if (selectedBook?._id === bookId) {
        setSelectedBook(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa đầu sách này");
    }
  };

  return (
    <div className="archivist-grid" style={{ gap: 24 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Kho đầu sách</p>
          <h2>Quản lý sách</h2>
          <p>
            Theo dõi toàn bộ đầu sách trong kho, lọc nhanh theo thể loại và tình trạng
            tồn kho, đồng thời giữ giao diện rõ ràng và dễ thao tác.
          </p>
        </div>
        <div className="archivist-page-actions">
          <button type="button" className="archivist-secondary-button" onClick={fetchBooks}>
            <RefreshCw size={15} />
            Làm mới
          </button>
          <button
            type="button"
            className="archivist-primary-button"
            onClick={() => navigate("/dashboard/add-new-book")}
          >
            <Plus size={15} />
            Thêm sách
          </button>
        </div>
      </section>

      <section className="archivist-kpi-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <article className="archivist-admin-card archivist-kpi-card">
          <p className="archivist-kpi-card__eyebrow">Đầu sách hiển thị</p>
          <h3 className="archivist-kpi-card__value">{stats.total}</h3>
          <p className="archivist-kpi-card__detail">Khớp với bộ lọc hiện tại</p>
        </article>
        <article className="archivist-admin-card archivist-kpi-card">
          <p className="archivist-kpi-card__eyebrow">Sắp hết hàng</p>
          <h3 className="archivist-kpi-card__value">{stats.lowStock}</h3>
          <p className="archivist-kpi-card__detail">Cần ưu tiên nhập thêm</p>
        </article>
        <article className="archivist-admin-card archivist-kpi-card">
          <p className="archivist-kpi-card__eyebrow">Hết hàng</p>
          <h3 className="archivist-kpi-card__value">{stats.outOfStock}</h3>
          <p className="archivist-kpi-card__detail">Các tựa sách đang hết hàng</p>
        </article>
        <article className="archivist-admin-card archivist-kpi-card">
          <p className="archivist-kpi-card__eyebrow">Giá trị tồn kho</p>
          <h3 className="archivist-kpi-card__value">{formatCurrency(stats.inventoryValue)}</h3>
          <p className="archivist-kpi-card__detail">Ước tính theo giá bán hiện tại</p>
        </article>
      </section>

      <section className="archivist-admin-card archivist-filterbar">
        <label className="archivist-searchbox" style={{ width: "100%", minWidth: 0 }}>
          <Search size={16} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo tên sách, tác giả hoặc mô tả..."
          />
        </label>

        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
          <option value="all">Tất cả thể loại</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select value={selectedStock} onChange={(event) => setSelectedStock(event.target.value)}>
          <option value="all">Tất cả trạng thái kho</option>
          <option value="available">Còn hàng</option>
          <option value="low">Sắp hết hàng</option>
          <option value="empty">Hết hàng</option>
        </select>

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="title">Sắp theo tên sách</option>
          <option value="author">Sắp theo tác giả</option>
          <option value="price">Sắp theo giá bán</option>
          <option value="stock">Sắp theo tồn kho</option>
        </select>

        <button
          type="button"
          className="archivist-secondary-button"
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            setSelectedStock("all");
            setSortBy("title");
          }}
        >
          Xóa bộ lọc
        </button>
      </section>

      <section className="archivist-grid" style={{ gridTemplateColumns: selectedBook ? "minmax(0, 1.5fr) minmax(300px, 0.7fr)" : "1fr", gap: 24 }}>
        <article className="archivist-admin-card archivist-table-card">
          <div className="archivist-panel" style={{ paddingBottom: 0 }}>
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Danh sách đầu sách</p>
                <h3 className="archivist-panel__title">{filteredBooks.length} sách phù hợp</h3>
              </div>
            </div>
          </div>

          <div className="archivist-table-scroll">
            <table className="archivist-table">
              <thead>
                <tr>
                  <th>Sách</th>
                  <th>Tác giả</th>
                  <th>Thể loại</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="archivist-empty" style={{ minHeight: 220 }}>Đang mở hồ sơ kho sách...</div>
                    </td>
                  </tr>
                ) : filteredBooks.length ? (
                  filteredBooks.map((book) => {
                    const stock = Number(book?.quantity || 0);
                    return (
                      <tr key={book._id}>
                        <td>
                          <div className="archivist-book-cell">
                            <img src={book.coverImage || "/placeholder.svg"} alt={book.title} />
                            <div className="archivist-book-cell__copy">
                              <strong>{book.title}</strong>
                              <p>{book?.publish || book?.language || "Hồ sơ đầu sách"}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="archivist-table-meta">{book?.author?.name || "Chưa rõ tác giả"}</div>
                        </td>
                        <td>
                          <div className="archivist-table-meta">{book?.category?.name || "Chưa gán thể loại"}</div>
                        </td>
                        <td>
                          <div className="archivist-table-meta">{formatCurrency(book?.price?.newPrice || 0)}</div>
                          {book?.price?.oldPrice ? (
                            <div className="archivist-table-meta">Giá nhập {formatCurrency(book.price.oldPrice)}</div>
                          ) : null}
                        </td>
                        <td>
                          <span className="archivist-status-pill" data-tone={stock === 0 ? "danger" : stock < 10 ? "warning" : "success"}>
                            {stock} bản
                          </span>
                        </td>
                        <td>
                          <div className="archivist-cta-row">
                            <button type="button" className="archivist-icon-cta" onClick={() => setSelectedBook(book)}>
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className="archivist-icon-cta"
                              onClick={() => navigate(`/dashboard/edit-book/${book._id}`)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button type="button" className="archivist-icon-cta" onClick={() => handleDelete(book._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="archivist-empty" style={{ minHeight: 220 }}>
                        Không có đầu sách nào khớp với bộ lọc hiện tại.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {selectedBook ? (
          <aside className="archivist-admin-card archivist-panel archivist-admin-card--strong">
            <div className="archivist-panel__head">
              <div>
                <p className="archivist-panel__eyebrow">Đầu sách đang chọn</p>
                <h3 className="archivist-panel__title">Hồ sơ chi tiết</h3>
              </div>
              <button type="button" className="archivist-secondary-button" onClick={() => setSelectedBook(null)}>
                Đóng
              </button>
            </div>

            <div className="archivist-stack">
              <img
                src={selectedBook.coverImage || "/placeholder.svg"}
                alt={selectedBook.title}
                style={{ width: "100%", maxHeight: 320, objectFit: "cover", border: "1px solid var(--archivist-line)" }}
              />
              <div>
                <h4 className="archivist-panel__title" style={{ fontSize: "2rem" }}>{selectedBook.title}</h4>
                <p className="archivist-panel__description">
                  {selectedBook.description || "Chưa có bản mô tả dành cho cuốn sách này."}
                </p>
              </div>
              <div className="archivist-stack">
                <div className="archivist-list-row">
                  <strong className="archivist-list-row__title">Tác giả</strong>
                  <span className="archivist-list-row__meta">{selectedBook?.author?.name || "Chưa rõ"}</span>
                </div>
                <div className="archivist-list-row">
                  <strong className="archivist-list-row__title">Thể loại</strong>
                  <span className="archivist-list-row__meta">{selectedBook?.category?.name || "Chưa gán"}</span>
                </div>
                <div className="archivist-list-row">
                  <strong className="archivist-list-row__title">Ngôn ngữ</strong>
                  <span className="archivist-list-row__meta">{selectedBook?.language || "N/A"}</span>
                </div>
                <div className="archivist-list-row">
                  <strong className="archivist-list-row__title">Tồn kho</strong>
                  <span className="archivist-list-row__meta">{selectedBook?.quantity || 0} bản</span>
                </div>
                <div className="archivist-list-row">
                  <strong className="archivist-list-row__title">Giá bán</strong>
                  <span className="archivist-list-row__meta">{formatCurrency(selectedBook?.price?.newPrice || 0)}</span>
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
