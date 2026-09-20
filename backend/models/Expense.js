const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        default: "Other"
    },
    type: {
        type: String,
        enum: ["expense", "income"],
        default: "expense"
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split("T")[0]
    },
    description: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Expense", expenseSchema);
