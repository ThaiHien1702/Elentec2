import mongoose from "mongoose";

const computerInfoSchema = new mongoose.Schema(
  {
    employeeNo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    macAddress: {
      type: String,
      trim: true,
    },
    computerName: {
      type: String,
      required: true,
    },
    userNamePc: {
      type: String,
    },
    categories: {
      type: String,
      enum: ["Desktop", "Laptop", "Workstation", "Server"],
      default: "Laptop",
    },
    manufacturer: {
      type: String,
    },
    serviceTag: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    systemModel: {
      type: String,
    },
    cpu: {
      type: String,
    },
    ram: {
      type: String,
    },
    hdd: {
      type: String,
    },
    ssd: {
      type: String,
    },
    vga: {
      type: String,
    },
    other: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Under Maintenance", "Retired"],
      default: "Active",
    },
    notes: {
      type: String,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Indexes for efficient querying
computerInfoSchema.index({ department: 1 });
computerInfoSchema.index({ employeeNo: 1 });
computerInfoSchema.index({ computerName: 1 });
computerInfoSchema.index({ email: 1 });

const ComputerInfo = mongoose.model("ComputerInfo", computerInfoSchema);

export default ComputerInfo;
