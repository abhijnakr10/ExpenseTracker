import { useState } from "react";
import ExpenseCard from "./ExpenseCard";

function Expenses({ expenses, setExpenses }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("all");

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      setExpenses(expenses.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete transaction. Ensure backend is running.");
    }
  };

  // Filter logic
  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesType =
      selectedType === "all" || item.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>All Transactions</h1>
        <p>Search, filter, and inspect your full transaction history</p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search">
          <input
            type="text"
            className="form-input"
            style={{ width: "100%" }}
            placeholder="🔍 Search transactions by name or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Food">Food & Dining</option>
            <option value="Travel">Travel & Transport</option>
            <option value="Utilities">Utilities & Bills</option>
            <option value="Education">Education & Books</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Health">Health</option>
            <option value="Salary">Salary & Income</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="expense">Only Expenses</option>
            <option value="income">Only Income</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="expenses-container">
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No Transactions Match Your Filter</h3>
            <p>Try searching for a different term or clearing your category filters.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense._id}
              id={expense._id}
              title={expense.title}
              amount={expense.amount}
              category={expense.category}
              type={expense.type}
              date={expense.date}
              description={expense.description}
              onDelete={() => handleDeleteExpense(expense._id)}
            />
          ))
        )}
      </div>
    </main>
  );
}

export default Expenses;
