import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Expenses from "./components/Expenses";
import ExpenseDetails from "./components/ExpenseDetails";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Fetch initial expenses from Backend API
  useEffect(() => {
    fetch("http://localhost:5000/api/expenses")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch expenses");
        return res.json();
      })
      .then((data) => {
        setExpenses(data);
      })
      .catch((err) => {
        console.log("Backend notice (ensure server is running on port 5000):", err.message);
      });
  }, []);

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route
          path="/"
          element={<Dashboard expenses={expenses} setExpenses={setExpenses} />}
        />
        <Route
          path="/expenses"
          element={<Expenses expenses={expenses} setExpenses={setExpenses} />}
        />
        <Route
          path="/expenses/:id"
          element={<ExpenseDetails expenses={expenses} setExpenses={setExpenses} />}
        />
        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
      </Routes>
    </div>
  );
}

export default App;
