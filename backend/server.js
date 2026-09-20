require("dotenv").config();

// Bring Express in Node.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dns = require("dns");

// Set DNS servers for MongoDB Atlas SRV resolution reliability
try {
    dns.setServers(["8.8.8.8"]);
} catch (e) {
    // Ignore if system restricts dns.setServers
}

const Expense = require("./models/Expense");
const User = require("./models/User");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Use Middleware
app.use(cors());
app.use(express.json());

// In-memory fallback dataset for offline/mock demo support if MongoDB is not running
let isDbConnected = false;
let inMemoryExpenses = [
    {
        _id: "demo-1",
        title: "Monthly Stipend / Salary",
        amount: 25000,
        category: "Salary",
        type: "income",
        date: new Date().toISOString().split("T")[0],
        description: "Monthly college internship stipend",
        createdAt: new Date()
    },
    {
        _id: "demo-2",
        title: "Campus Cafeteria & Snacks",
        amount: 850,
        category: "Food",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        description: "Lunch with study group",
        createdAt: new Date()
    },
    {
        _id: "demo-3",
        title: "Metro Card Recharge",
        amount: 500,
        category: "Travel",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        description: "Monthly travel pass",
        createdAt: new Date()
    },
    {
        _id: "demo-4",
        title: "Engineering Textbooks",
        amount: 1400,
        category: "Education",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        description: "Reference books for semester 6",
        createdAt: new Date()
    }
];
let inMemoryUsers = [];

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expense_tracker";
mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 2500 })
    .then(() => {
        isDbConnected = true;
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        isDbConnected = false;
        console.log("MongoDB Connection Notice: Using in-memory store for immediate demo. (" + error.message + ")");
    });

// API Route (Healthcheck)
app.get("/", (req, res) => {
    res.send("Expense Tracker Backend is Working!!");
});

// GET all expenses
app.get("/api/expenses", async (req, res) => {
    try {
        const { category, type } = req.query;

        if (isDbConnected && mongoose.connection.readyState === 1) {
            let filter = {};
            if (category && category !== "All") filter.category = category;
            if (type && type !== "all") filter.type = type;

            const expenses = await Expense.find(filter).sort({ createdAt: -1 });
            return res.json(expenses);
        }

        // Fallback store
        let results = [...inMemoryExpenses];
        if (category && category !== "All") {
            results = results.filter((item) => item.category === category);
        }
        if (type && type !== "all") {
            results = results.filter((item) => item.type === type);
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch expenses" });
    }
});

// GET expense statistics (Total Balance, Total Income, Total Expenses, Category Breakdown)
app.get("/api/stats", async (req, res) => {
    try {
        let items = [];
        if (isDbConnected && mongoose.connection.readyState === 1) {
            items = await Expense.find();
        } else {
            items = inMemoryExpenses;
        }

        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals = {};

        items.forEach((item) => {
            const amt = Number(item.amount) || 0;
            if (item.type === "income") {
                totalIncome += amt;
            } else {
                totalExpense += amt;
                categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amt;
            }
        });

        const netBalance = totalIncome - totalExpense;

        // Determine highest spending category
        let topCategory = "None";
        let maxCategoryAmount = 0;
        for (const [cat, amt] of Object.entries(categoryTotals)) {
            if (amt > maxCategoryAmount) {
                maxCategoryAmount = amt;
                topCategory = cat;
            }
        }

        res.json({
            totalIncome,
            totalExpense,
            netBalance,
            topCategory,
            categoryTotals,
            count: items.length
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to calculate stats" });
    }
});

// GET single expense by ID
app.get("/api/expenses/:id", async (req, res) => {
    try {
        if (isDbConnected && mongoose.connection.readyState === 1) {
            const expense = await Expense.findById(req.params.id);
            if (!expense) {
                return res.status(404).json({ message: "Expense Not Found!" });
            }
            return res.json(expense);
        }

        const item = inMemoryExpenses.find((e) => e._id === req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Expense Not Found!" });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch expense!" });
    }
});

// POST new expense
app.post("/api/expenses", async (req, res) => {
    try {
        const { title, amount, category, type, date, description } = req.body;

        if (!title || !amount) {
            return res.status(400).json({ message: "Title and Amount are required!" });
        }

        if (isDbConnected && mongoose.connection.readyState === 1) {
            const newExpense = await Expense.create({
                title,
                amount: Number(amount),
                category: category || "Other",
                type: type || "expense",
                date: date || new Date().toISOString().split("T")[0],
                description: description || ""
            });
            return res.status(201).json(newExpense);
        }

        const newExpense = {
            _id: "demo-" + Date.now(),
            title,
            amount: Number(amount),
            category: category || "Other",
            type: type || "expense",
            date: date || new Date().toISOString().split("T")[0],
            description: description || "",
            createdAt: new Date()
        };
        inMemoryExpenses.unshift(newExpense);
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: "Failed to create expense!" });
    }
});

// PUT update expense
app.put("/api/expenses/:id", async (req, res) => {
    try {
        const { title, amount, category, type, date, description } = req.body;

        if (isDbConnected && mongoose.connection.readyState === 1) {
            const updated = await Expense.findByIdAndUpdate(
                req.params.id,
                { title, amount: Number(amount), category, type, date, description },
                { new: true }
            );
            if (!updated) {
                return res.status(404).json({ message: "Expense Not Found!" });
            }
            return res.json(updated);
        }

        const index = inMemoryExpenses.findIndex((e) => e._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: "Expense Not Found!" });
        }
        inMemoryExpenses[index] = {
            ...inMemoryExpenses[index],
            title: title !== undefined ? title : inMemoryExpenses[index].title,
            amount: amount !== undefined ? Number(amount) : inMemoryExpenses[index].amount,
            category: category !== undefined ? category : inMemoryExpenses[index].category,
            type: type !== undefined ? type : inMemoryExpenses[index].type,
            date: date !== undefined ? date : inMemoryExpenses[index].date,
            description: description !== undefined ? description : inMemoryExpenses[index].description
        };
        res.json(inMemoryExpenses[index]);
    } catch (error) {
        res.status(500).json({ message: "Failed to update expense!" });
    }
});

// DELETE expense
app.delete("/api/expenses/:id", async (req, res) => {
    try {
        if (isDbConnected && mongoose.connection.readyState === 1) {
            const deleted = await Expense.findByIdAndDelete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: "Expense Not Found!" });
            }
            return res.json(deleted);
        }

        const index = inMemoryExpenses.findIndex((e) => e._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: "Expense Not Found!" });
        }
        const removed = inMemoryExpenses.splice(index, 1)[0];
        res.json(removed);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete expense!" });
    }
});

// POST Register
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (isDbConnected && mongoose.connection.readyState === 1) {
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(400).json({ message: "User already exists with this email" });
            }
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword
            });
            return res.status(201).json({
                message: "User Registered Successfully",
                user: { id: newUser._id, name: newUser.name, email: newUser.email }
            });
        }

        // In-memory user registration
        const existing = inMemoryUsers.find((u) => u.email === email);
        if (existing) {
            return res.status(400).json({ message: "User already exists with this email" });
        }
        const newUser = {
            _id: "user-" + Date.now(),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };
        inMemoryUsers.push(newUser);
        res.status(201).json({
            message: "User Registered Successfully",
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Registration Failed" });
    }
});

// POST Login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        let user;

        if (isDbConnected && mongoose.connection.readyState === 1) {
            user = await User.findOne({ email });
        } else {
            user = inMemoryUsers.find((u) => u.email === email);
        }

        if (!user) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: "24h"
        });

        res.json({
            message: "Login Successful!",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Login Failed!" });
    }
});

// Start the server and listen on port
app.listen(PORT, () => {
    console.log(`Expense Tracker Backend is Running on port ${PORT}`);
});
