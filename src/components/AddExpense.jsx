import { useState } from "react";

function AddExpense({ onAddExpense }) {
  const [type, setType] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      alert("Please provide both a title and amount!");
      return;
    }

    const newExpense = {
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      type,
      date,
      description: description.trim()
    };

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newExpense)
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      const data = await response.json();
      onAddExpense(data);

      // Reset form fields
      setTitle("");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Could not connect to backend server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-expense-card">
      <h2>Add New Transaction</h2>

      {/* Type Toggle: Expense vs Income */}
      <div className="type-toggle-group">
        <button
          type="button"
          className={`type-btn ${type === "expense" ? "active expense" : ""}`}
          onClick={() => {
            setType("expense");
            if (category === "Salary") setCategory("Food");
          }}
        >
          <span>📉</span> Expense
        </button>
        <button
          type="button"
          className={`type-btn ${type === "income" ? "active income" : ""}`}
          onClick={() => {
            setType("income");
            setCategory("Salary");
          }}
        >
          <span>📈</span> Income
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Title / Description</label>
            <input
              type="text"
              className="form-input"
              placeholder={type === "expense" ? "e.g. Grocery Shopping, Metro Pass" : "e.g. Monthly Stipend, Freelance"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              step="any"
              min="1"
              className="form-input"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {type === "expense" ? (
                <>
                  <option value="Food">Food & Dining</option>
                  <option value="Travel">Travel & Transport</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Education">Education & Books</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health & Medicine</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Salary">Salary & Stipend</option>
                  <option value="Allowance">Pocket Money / Allowance</option>
                  <option value="Freelance">Freelance / Gig</option>
                  <option value="Investment">Savings & Investment</option>
                  <option value="Other">Other Income</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>Optional Notes</label>
          <input
            type="text"
            className="form-input"
            placeholder="Add additional context or transaction details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Saving..." : `+ Add ${type === "income" ? "Income" : "Expense"}`}
        </button>
      </form>
    </div>
  );
}

export default AddExpense;
