import "./EmptyState.css";

function EmptyState({
  illustration,
  title,
  description,
  className = "",
}) {
  return (
    <div className={`sc-empty-state ${className}`.trim()}>
      {illustration && (
        <div className="sc-empty-state-illustration" aria-hidden="true">
          <img src={`/illustrations/${illustration}.png`} alt="" />
        </div>
      )}
      <div className="sc-empty-state-content">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export default EmptyState;
