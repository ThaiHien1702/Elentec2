const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    uniPice: { type: Number, required: true },
    texPercent: { type: Number, default: 0 },
    total: { type: Number, required: true },
});


const invoiceSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        invoiceNumber: { 
            type: String,
            required: true 
        },
        invoiceDate: { 
            type: Date,
            default: Date.now 
        },
        dueDate: {
            type: Date,
        },
        billFrom: {
            businessName: String,
            email: String,
            address: String,
            phone: String,
        },
        billTo: {
            clientName: String,
            email: String,
            address: String,
            phone: String,
        },
        items: [itemSchema],
        note: {
            type: String,
        },
        paymentTerms: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Paid", "Unpaid"],
            default: "Unpaid",
        },
        subtotal: Number,
        taxAmount: Number,
        total: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);