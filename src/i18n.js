import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEN from "./locales/en/translation.json";
import translationVI from "./locales/vi/translation.json";

const resources = {
  en: { translation: translationEN },
  vi: { translation: translationVI },
};

const runtimeOverrides = {
  en: {
    common: {
      new_arrivals: "New arrivals",
      collections: "Curated picks",
      view_all: "View all",
    },
    bookeco: {
      home: {
        hero_line_one: "A library for",
        hero_line_two: "readers who choose carefully",
        quote_1: "Some books do not need to be rushed, only kept close long enough to make an ordinary day feel deeper.",
        quote_2: "A beautiful library is not measured by volume alone, but by the desire to return to each book you chose.",
        quote_3: "Each time you open a meaningful book, you learn to see the world with steadier eyes.",
        quote_4: "Read to slow down, to understand more clearly, and to keep what matters on your own shelves.",
        quote_5: "Some books enter life quietly, yet stay longer than anything loud ever could.",
        cta_newest: "View newest book",
        newest_badge: "Recently added title",
        updating: "Updating the catalogue",
        for_you: "For you",
        personalized_title: "Selections tailored to your reading taste",
        show_more_suggestions: "Show more suggestions",
        curated_title: "Most loved titles",
        latest_title: "Freshly placed on the shelf",
        categories_label: "Browse by category",
        categories_title: "Find books by interest",
        book_titles: "titles",
      },
      catalog: {
        hero: "Browse recent releases, high-rated books, and carefully arranged titles for different reading needs.",
        subtitle: "The list below follows your left-side filters and selected sorting option.",
      },
      footer: {
        about: "About",
        contact: "Contact",
        terms: "Terms",
        collection: "All books",
        copy: "Preserving the value of every page.",
        rights: "All rights reserved.",
      },
      related: {
        loading: "Finding related books...",
        label: "Related picks",
        title: "Books you may want to explore next",
      },
    },
  },
  vi: {
    common: {
      new_arrivals: "Mới cập nhật",
      collections: "Tuyển chọn",
      view_all: "Xem tất cả",
    },
    bookeco: {
      home: {
        hero_line_one: "Tủ sách dành cho",
        hero_line_two: "người thích chọn kỹ",
        quote_1: "Có những cuốn sách không cần đọc thật nhanh, chỉ cần ở lại đủ lâu để khiến một ngày bình thường trở nên sâu hơn.",
        quote_2: "Một tủ sách đẹp không chỉ nằm ở số lượng đầu sách, mà ở cảm giác muốn quay lại với từng cuốn đã chọn.",
        quote_3: "Mỗi lần mở một cuốn sách hay là thêm một lần nhìn thế giới bằng đôi mắt bình tĩnh hơn.",
        quote_4: "Đọc để chậm lại, để hiểu kỹ hơn, và để giữ lại những điều đáng nhớ trên giá sách của riêng mình.",
        quote_5: "Có những cuốn sách bước vào đời sống rất khẽ, nhưng ở lại lâu hơn bất kỳ điều gì ồn ào.",
        cta_newest: "Xem sách mới nhất",
        newest_badge: "Tựa sách vừa cập nhật",
        updating: "Đang cập nhật kho sách",
        for_you: "Dành cho bạn",
        personalized_title: "Những lựa chọn hợp với gu đọc của bạn",
        show_more_suggestions: "Xem thêm gợi ý",
        curated_title: "Những tựa sách được yêu thích nhất",
        latest_title: "Sách vừa có mặt trên kệ",
        categories_label: "Duyệt theo danh mục",
        categories_title: "Tìm sách theo mối quan tâm của bạn",
        book_titles: "đầu sách",
      },
      catalog: {
        hero: "Khám phá những đầu sách mới, được đánh giá cao và được sắp lại gọn theo từng nhu cầu tìm đọc.",
        subtitle: "Danh sách được làm gọn theo bộ lọc bên trái và cách sắp xếp bạn đang chọn.",
      },
      footer: {
        about: "Giới thiệu",
        contact: "Liên hệ",
        terms: "Điều khoản",
        collection: "Tất cả sách",
        copy: "Lưu giữ giá trị của từng trang sách.",
        rights: "Đã đăng ký mọi quyền.",
      },
      related: {
        loading: "Đang tìm sách liên quan...",
        label: "Gợi ý tương đồng",
        title: "Những cuốn sách có thể bạn sẽ muốn xem tiếp",
      },
    },
  },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  debug: true,
  interpolation: { escapeValue: false },
});

Object.entries(runtimeOverrides).forEach(([lng, bundle]) => {
  i18n.addResourceBundle(lng, "translation", bundle, true, true);
});

export default i18n;
