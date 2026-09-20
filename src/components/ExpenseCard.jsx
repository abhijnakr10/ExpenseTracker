import { Link } from "react-router-dom";

// Helper function to return relevant emoji icon for category
const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case "food":
      return "🍔";
    case "travel":
    case "transport":
      return "🚗";
    case "utilities":
    case "bills":
      return "💡";
    case "education":
      return "🎓";
    case "entertainment":
      return "🎬";
    case "health":
      return "💊";
    case "salary":
      return "💼";
    case "shopping":
      return "🛍️";
    default:
      return "🏷️";
  }
};

function ExpenseCard({ id, title, amount, category, type = "expense", date, description, onDelete }) {
  const isIncome = type === "income";

  return (
    <div className={`expense-card ${isIncome ? "income" : "expense"}`}>
      <div className="expense-card-left">
        <div className="expense-category-icon">
          {getCategoryIcon(category)}
        </div>
        <div className="expense-info">
          <h3>{title}</h3>
          <p>{description || "No notes provided"}</p>
          <div className="expense-badges">
            <span className="badge badge-category">{category}</span>
            <span className="badge-date">📅 {date}</span>
          </div>
        </div>
      </div>

      <div className="expense-card-right">
        <div className={`expense-amount ${isIncome ? "income" : "expense"}`}>
          {isIncome ? `+₹${Number(amount).toLocaleString()}` : `-₹${Number(amount).toLocaleString()}`}
        </div>
        <div className="expense-actions">
          <Link to={`/expenses/${id}`} className="btn-action-view">
            Details
          </Link>
          <button onClick={onDelete} className="btn-action-delete" title="Delete Transaction">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCard;
