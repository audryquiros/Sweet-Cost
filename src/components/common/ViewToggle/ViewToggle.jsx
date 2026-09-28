import Icon from "../Icon/Icon";
import "./ViewToggle.css";

function ViewToggle({ value, onChange }) {
  return (
    <div className="view-toggle" aria-label="Cambiar vista">
      <button
        type="button"
        className={value === "cards" ? "view-toggle-active" : ""}
        onClick={() => onChange("cards")}
        aria-pressed={value === "cards"}
      >
        <Icon type="grid" size={15} />
        <span>Tarjetas</span>
      </button>
      <button
        type="button"
        className={value === "lista" ? "view-toggle-active" : ""}
        onClick={() => onChange("lista")}
        aria-pressed={value === "lista"}
      >
        <Icon type="list" size={15} />
        <span>Lista</span>
      </button>
    </div>
  );
}

export default ViewToggle;
