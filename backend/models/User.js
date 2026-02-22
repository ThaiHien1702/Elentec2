// models User
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
    idCompany: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false, 
    }, 
        email: {
        type: String,
        unique: true,
        lowercase: true,
    },
    deptName: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    businessName: { 
        type: String,
         default: "" 
    },
    address: {
         type: String,
         default: "" 
        },
    phone: {
         type: String,
          default: "" 
        },    
    }, 
    { timestamps: true }
);
/// Hash password before saving
    
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();     
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
// Method to compare password    
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
