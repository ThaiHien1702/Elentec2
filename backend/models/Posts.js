// const mongoose = require('mongoose');
// const itemSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//         },
//         quantity: {
//             type: Number,
//             required: true,
//         },
//         uniPice: {
//             type: Number,
//             required: true,
//         },
//         texPercent: {
//             type: Number,
//             default: 0,
//         },
//         total: {
//             type: Number,
//             required: true,
//         }
//     });
//     const postSchema = new mongoose.Schema(
//     {
//      user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//         },
//         PostNunber: {
//             type: String,
//             required: true,
//         },
//         PostDate: {
//             type: Date,
//             default: Date.now,
//         },
//         dueDate: {
//             type: Date,
//         },
//         billFrom: {
//             businessName: String,
//             email: String,
//             address: String,
//             phone: String,
//         },
//         billTo: {
//             clientName: String,
//             email: String,
//             address: String,
//             phone: String,
//         },
//         items: [itemSchema],
//         note: {
//             type: String,
//             default: "",
//         },
//         paymentTerms: {
//             type: String,
//             default: "",
//         },
//         status: {
//             type: String,
//             enum: ["Paid", "Unpaid"],
//             default: 'Unpaid',
//         },
//         subTotal: {
//             type: Number,
//             required: true,
//         },
//         taxTotal: {
//             type: Number,
//             required: true,
//         },
//         total: {
//             type: Number,
//             required: true,
//         },
//     },
//     { timestamps: true }
// );
// module.exports = mongoose.model("Post", postSchema)
// ;