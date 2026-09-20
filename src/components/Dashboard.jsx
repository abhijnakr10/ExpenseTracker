import StatCard from "./StatCard";
import ExpenseCard from "./ExpenseCard";
import AddExpense from "./AddExpense";

function Dashboard({ expenses, setExpenses }) {
  // Calculate summary metrics
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryCounts = {};

  expenses.forEach((item) => {
    const amt = Number(item.amount) || 0;
    if (item.type === "income") {
      totalIncome += amt;
    } else {
      totalExpense += amt;
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + amt;
    }
  });

  const netBalance = totalIncome - totalExpense;

  // Determine top spending category
  let topCategory = "None";
  let maxSpent = 0;
  for (const [cat, spent] of Object.entries(categoryCounts)) {
    if (spent > maxSpent) {
      maxSpent = spent;
      topCategory = cat;
    }
  }

  // Add transaction callback
  const handleAddExpense = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  // Delete transaction callback
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

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Financial Overview</h1>
        <p>Real-time analytics and transaction tracking for college students</p>
      </div>

      {/* Metric Stat Cards */}
      <div className="stats-container">
        <StatCard
          title="Net Balance"
          value={`${netBalance >= 0 ? "₹" : "-₹"}${Math.abs(netBalance).toLocaleString()}`}
          type="balance"
          icon="💰"
          subtext={netBalance >= 0 ? "Healthy financial balance" : "Expenses exceed income"}
        />
        <StatCard
          title="Total Income"
          value={`+₹${totalIncome.toLocaleString()}`}
          type="income"
          icon="📈"
          subtext="Total earnings & allowances"
        />
        <StatCard
          title="Total Expenses"
          value={`-₹${totalExpense.toLocaleString()}`}
          type="expense"
          icon="📉"
          subtext="Total student spending"
        />
        <StatCard
          title="Highest Spending"
          value={topCategory}
          type="category"
          icon="🏷️"
          subtext={maxSpent > 0 ? `₹${maxSpent.toLocaleString()} spent` : "No expense recorded yet"}
        />
      </div>

      {/* Add Expense Form */}
      <AddExpense onAddExpense={handleAddExpense} />

      {/* Recent Transactions */}
      <div className="section-title">
        <h2>Recent Transactions</h2>
        <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "normal" }}>
          Showing {Math.min(expenses.length, 6)} of {expenses.length}
        </span>
      </div>

      <div className="expenses-container">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <h3>No Transactions Logged Yet</h3>
            <p>Use the form above to add your first expense or income stream!</p>
          </div>
        ) : (
          expenses.slice(0, 6).map((expense) => (
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

export default Dashboard;
