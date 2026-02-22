// models User
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        idCompany: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },
        email: {type: String, default: ''},
        dept: { type: String, default: ''},
        phone: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Users', userSchema);
