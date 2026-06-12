const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const otpSchema = new mongoose.Schema({

  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    index: true,
  },

  otp: {
    type: String,
    required: [true, "OTP is required"],
  },

  attempts: {
    type: Number,
    default: 0,
  },

  maxAttempts: {
    type: Number,
    default: 3,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // TTL — auto-delete after 5 minutes (300 seconds)
  },
});


// Pre-save hook — hash OTP before storing
otpSchema.pre("save", async function () {
  if (!this.isModified("otp")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
});


// Instance method — compare candidate OTP with stored hash
otpSchema.methods.compareOtp = async function (candidateOtp) {
  return bcrypt.compare(candidateOtp, this.otp);
};


module.exports = mongoose.model("Otp", otpSchema);
