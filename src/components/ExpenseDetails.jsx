import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

function ExpenseDetails({ expenses, setExpenses }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [editType, setEditType] = useState("expense");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    // Check if item exists in props first for instant response
    const localMatch = expenses?.find((item) => item._id === id);
    if (localMatch) {
      setExpense(localMatch);
      populateEditForm(localMatch);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    fetch(`http://localhost:5000/api/expenses/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Transaction Not Found");
        }
        return response.json();
      })
      .then((data) => {
        setExpense(data);
        populateEditForm(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, expenses]);

  const populateEditForm = (item) => {
    setEditTitle(item.title);
    setEditAmount(item.amount);
    setEditCategory(item.category);
    setEditType(item.type || "expense");
    setEditDate(item.date);
    setEditDescription(item.description || "");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          amount: parseFloat(editAmount),
          category: editCategory,
          type: editType,
          date: editDate,
          description: editDescription
        })
      });

      if (!response.ok) throw new Error("Failed to update transaction");

      const updated = await response.json();
      setExpense(updated);
      setIsEditing(false);

      // Update in parent state
      if (setExpenses) {
        setExpenses(expenses.map((item) => (item._id === id ? updated : item)));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this transaction permanently?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete transaction");

      if (setExpenses) {
        setExpenses(expenses.filter((item) => item._id !== id));
      }
      navigate("/");
    } catch (err) {
      alert("Failed to delete. Ensure backend is running.");
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <h3>Loading Transaction Details...</h3>
        </div>
      </main>
    );
  }

  if (error || !expense) {
    return (
      <main className="main-content">
        <div className="details-card">
          <Link to="/" className="details-back-link">
            ← Back to Overview
          </Link>
          <h2>Transaction Not Found</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>
            The requested transaction record ID does not exist or has been removed.
          </p>
        </div>
      </main>
    );
  }

  const isIncome = expense.type === "income";

  return (
    <main className="main-content">
      <div className="details-card">
        <Link to="/" className="details-back-link">
          ← Back to Overview
        </Link>

        {!isEditing ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={`badge ${isIncome ? "alert-success" : "alert-error"}`}>
                {isIncome ? "📈 Income" : "📉 Expense"}
              </span>
              <span className="badge badge-category">{expense.category}</span>
            </div>

            <h1 style={{ marginTop: "16px", marginBottom: "8px", fontSize: "26px" }}>
              {expense.title}
            </h1>

            <div
              className={`stat-value ${isIncome ? "positive" : "negative"}`}
              style={{ fontSize: "36px", margin: "16px 0" }}
            >
              {isIncome ? `+₹${Number(expense.amount).toLocaleString()}` : `-₹${Number(expense.amount).toLocaleString()}`}
            </div>

            <div className="details-meta-grid">
              <div className="details-meta-item">
                <label>Date Recorded</label>
                <span>{expense.date}</span>
              </div>
              <div className="details-meta-item">
                <label>Category</label>
                <span>{expense.category}</span>
              </div>
              <div className="details-meta-item">
                <label>Transaction Type</label>
                <span style={{ textTransform: "capitalize" }}>{expense.type || "Expense"}</span>
              </div>
              <div className="details-meta-item">
                <label>Internal ID</label>
                <span style={{ fontSize: "12px", fontFamily: "monospace" }}>{expense._id}</span>
              </div>
            </div>

            <div style={{ margin: "24px 0" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Notes / Description</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6, background: "var(--bg-subtle)", padding: "12px", borderRadius: "8px" }}>
                {expense.description || "No specific notes provided for this transaction."}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                className="btn-submit"
                onClick={() => setIsEditing(true)}
                style={{ flex: 1 }}
              >
                ✏️ Edit Transaction
              </button>
              <button
                className="btn-action-delete"
                onClick={handleDelete}
                style={{ padding: "10px 20px" }}
              >
                🗑️ Delete
              </button>
            </div>
          </>
        ) : (
          /* Edit Form */
          <form onSubmit={handleUpdate}>
            <h2>Edit Transaction</h2>
            <div className="form-group" style={{ margin: "16px 0" }}>
              <label>Title</label>
              <input
                type="text"
                className="form-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: "16px 0" }}>
              <label>Amount (₹)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: "16px 0" }}>
              <label>Category</label>
              <select
                className="form-select"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="Food">Food & Dining</option>
                <option value="Travel">Travel & Transport</option>
                <option value="Utilities">Utilities & Bills</option>
                <option value="Education">Education & Books</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health & Medicine</option>
                <option value="Salary">Salary & Income</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: "16px 0" }}>
              <label>Date</label>
              <input
                type="date"
                className="form-input"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: "16px 0" }}>
              <label>Notes</label>
              <input
                type="text"
                className="form-input"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                Save Changes
              </button>
              <button
                type="button"
                className="btn-action-delete"
                onClick={() => setIsEditing(false)}
                style={{ padding: "10px 20px" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default ExpenseDetails;
