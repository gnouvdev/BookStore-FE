import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <button
      type="button"
      className="bookeco-action-link"
      onClick={() => i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi")}
      aria-label="Switch language"
      title={i18n.language === "vi" ? "English" : "Tiếng Việt"}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: 0, cursor: "pointer" }}
    >
      <Globe size={16} />
      <span style={{ fontFamily: '"Work Sans", sans-serif', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {i18n.language === "vi" ? "VI" : "EN"}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
