import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { BookOpen, ImagePlus, Save, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAddBookMutation } from "../../../redux/features/books/booksApi";
import { useGetCategoriesQuery } from "../../../redux/features/categories/categoriesApi";
import { uploadToCloudinary } from "../../../utils/uploadService";
import baseUrl from "../../../utils/baseURL";

const selectStyles = {
  control: (base) => ({
    ...base,
    background: "rgba(255, 253, 248, 0.86)",
    border: "1px solid rgba(66, 4, 9, 0.14)",
    borderRadius: 0,
    boxShadow: "none",
    minHeight: 48,
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(66, 4, 9, 0.34)",
    fontStyle: "italic",
    fontFamily: '"Noto Serif", serif',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 0,
    overflow: "hidden",
  }),
};

export default function AddBook() {
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [language, setLanguage] = useState("Tiếng Việt");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [addBook, { isLoading }] = useAddBookMutation();
  const { data: categoriesData = [] } = useGetCategoriesQuery();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin");
    }
  }, [navigate]);

  const categories = useMemo(
    () =>
      categoriesData.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categoriesData]
  );

  const loadAuthorOptions = debounce(async (inputValue, callback) => {
    if (!inputValue) {
      callback([]);
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/authors/search?name=${inputValue}`);
      const options = Array.isArray(response.data)
        ? response.data.map((author) => ({ value: author._id, label: author.name }))
        : [];
      callback(options);
    } catch {
      callback([]);
    }
  }, 250);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng file ảnh");
      return;
    }

    setIsUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
        toast.success("Ảnh bìa đã được tải lên");
      }
    } catch {
      toast.error("Không thể tải ảnh bìa lên lúc này");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values) => {
    if (!selectedAuthor) {
      toast.error("Vui lòng chọn tác giả");
      return;
    }

    if (!coverImage) {
      toast.error("Vui lòng tải ảnh bìa trước khi lưu");
      return;
    }

    const payload = {
      title: values.title,
      description: values.description,
      author: selectedAuthor.value,
      category: values.category,
      publish: values.publish,
      language,
      coverImage,
      quantity: Number(values.quantity),
      trending: Boolean(values.trending),
      tags: (values.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      price: {
        oldPrice: Number(values.oldPrice) || 0,
        newPrice: Number(values.newPrice),
      },
    };

    try {
      await addBook(payload).unwrap();
      const result = await Swal.fire({
        title: "Đã lưu đầu sách mới",
        text: "Bạn muốn tiếp tục thêm sách hay quay về kho sách?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Thêm cuốn khác",
        cancelButtonText: "Về danh mục",
      });

      if (result.isConfirmed) {
        reset();
        setSelectedAuthor(null);
        setCoverImage("");
        setImagePreview("");
        setLanguage("Tiếng Việt");
      } else {
        navigate("/dashboard/manage-books");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Không thể lưu đầu sách mới");
    }
  };

  return (
    <div className="archivist-grid" style={{ gap: 24 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Biên mục đầu sách</p>
          <h2>Thêm sách mới</h2>
          <p>
            Giao diện này được rút về đúng tinh thần mẫu: một form biên mục rõ ràng,
            chia thành khối thông tin chính, metadata kho và ghi chú quản trị.
          </p>
        </div>
        <div className="archivist-page-actions">
          <button type="button" className="archivist-secondary-button" onClick={() => navigate("/dashboard/manage-books")}>
            <Save size={15} />
            Quay lại kho sách
          </button>
          <button type="submit" form="archivist-add-book-form" className="archivist-primary-button" disabled={isLoading}>
            <Send size={15} />
            {isLoading ? "Đang lưu..." : "Lưu đầu sách"}
          </button>
        </div>
      </section>

      <form id="archivist-add-book-form" onSubmit={handleSubmit(onSubmit)} className="archivist-form-grid">
        <div className="archivist-form-stack">
          <section className="archivist-admin-card archivist-form-section archivist-admin-card--strong">
            <h3 className="archivist-form-section__title">
              <BookOpen size={18} />
              Thông tin chung
            </h3>
            <div className="archivist-fields">
              <div className="archivist-field-group">
                <label className="archivist-field-label">Tên sách</label>
                <input className="archivist-field" placeholder="Ví dụ: Đắc Nhân Tâm" {...register("title", { required: true })} />
                {errors.title ? <span className="archivist-table-meta">Vui lòng nhập tên sách.</span> : null}
              </div>

              <div className="archivist-fields archivist-fields--two">
                <div className="archivist-field-group">
                  <label className="archivist-field-label">Tác giả</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    value={selectedAuthor}
                    loadOptions={loadAuthorOptions}
                    onChange={setSelectedAuthor}
                    placeholder="Tìm và chọn tác giả"
                    styles={selectStyles}
                  />
                </div>

                <div className="archivist-field-group">
                  <label className="archivist-field-label">Thể loại</label>
                  <select className="archivist-field" {...register("category", { required: true })}>
                    <option value="">Chọn thể loại</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="archivist-field-group">
                <label className="archivist-field-label">Mô tả sách</label>
                <textarea
                  className="archivist-textarea"
                  placeholder="Viết mô tả ngắn gọn, rõ ràng và đúng tinh thần đầu sách..."
                  {...register("description", { required: true })}
                />
              </div>
            </div>
          </section>

          <section className="archivist-admin-card archivist-form-section">
            <h3 className="archivist-form-section__title">Kho hàng và metadata</h3>
            <div className="archivist-fields archivist-fields--two">
              <div className="archivist-field-group">
                <label className="archivist-field-label">Nhà xuất bản</label>
                <input className="archivist-field" placeholder="Ví dụ: NXB Trẻ" {...register("publish")} />
              </div>
              <div className="archivist-field-group">
                <label className="archivist-field-label">Ngôn ngữ</label>
                <select className="archivist-field" value={language} onChange={(event) => setLanguage(event.target.value)}>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                </select>
              </div>
              <div className="archivist-field-group">
                <label className="archivist-field-label">Giá nhập</label>
                <input className="archivist-field" type="number" min="0" placeholder="0" {...register("oldPrice")} />
              </div>
              <div className="archivist-field-group">
                <label className="archivist-field-label">Giá bán</label>
                <input className="archivist-field" type="number" min="0" placeholder="0" {...register("newPrice", { required: true })} />
              </div>
              <div className="archivist-field-group">
                <label className="archivist-field-label">Số lượng tồn</label>
                <input className="archivist-field" type="number" min="0" placeholder="1" {...register("quantity", { required: true })} />
              </div>
              <div className="archivist-field-group">
                <label className="archivist-field-label">Từ khóa</label>
                <input className="archivist-field" placeholder="tiểu thuyết, kinh điển, bán chạy" {...register("tags")} />
              </div>
            </div>
            <label style={{ display: "inline-flex", marginTop: 18, alignItems: "center", gap: 10 }}>
              <input type="checkbox" {...register("trending")} />
              <span className="archivist-table-meta">Đánh dấu đầu sách này là tuyển chọn nổi bật</span>
            </label>
          </section>
        </div>

        <div className="archivist-form-stack">
          <section className="archivist-admin-card archivist-form-section archivist-admin-card--strong">
            <div className="archivist-upload-panel">
              {imagePreview ? (
                <img src={imagePreview} alt="Xem trước ảnh bìa" />
              ) : (
                <>
                  <ImagePlus size={28} />
                  <div>
                    <strong className="archivist-list-row__title" style={{ display: "block", marginBottom: 8 }}>
                      Tải ảnh bìa
                    </strong>
                    <span className="archivist-table-meta">Ưu tiên ảnh bìa dọc tỉ lệ 3:4, rõ nét</span>
                  </div>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              {isUploading ? <span className="archivist-table-meta">Đang tải ảnh lên...</span> : null}
            </div>
          </section>

          <section className="archivist-side-note archivist-admin-card--strong">
            <h4>Ghi chú quản trị</h4>
            <ul>
              <li>
                <span>•</span>
                <span>Đảm bảo giá bán, số lượng tồn và tác giả khớp với dữ liệu vận hành thực tế.</span>
              </li>
              <li>
                <span>•</span>
                <span>Phần mô tả nên giữ giọng văn bán sách rõ ràng, không dùng placeholder kỹ thuật.</span>
              </li>
              <li>
                <span>•</span>
                <span>Ảnh bìa nên rõ nét và đồng bộ với mặt bằng catalogue hiện tại.</span>
              </li>
            </ul>
          </section>
        </div>
      </form>
    </div>
  );
}
