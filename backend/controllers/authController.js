const crypto = require("crypto");
const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/emailService");


// Helper — generate signed JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// Helper — sanitize user object for response
const sanitizeUser = (user) => {
  const { _id, name, email, role, createdAt, updatedAt } = user;
  return { _id, name, email, role, createdAt, updatedAt };
};


// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // 2. Find the most recent OTP record
    const otpRecord = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP has expired or does not exist. Please request a new one.",
      });
    }

    // 3. Check attempts limit
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      });
    }

    // 4. Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save({ validateBeforeSave: false });

    // 5. Verify the code
    const isValid = await otpRecord.compareOtp(otp.toString());

    if (!isValid) {
      const remaining = otpRecord.maxAttempts - otpRecord.attempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      });
    }

    // 6. Delete OTP on success to prevent reuse
    await Otp.deleteOne({ _id: otpRecord._id });

    // 7. Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // 8. Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: sanitizeUser(user),
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed. Please try again later.",
    });
  }
};


// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password using model method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed. Please try again later.",
    });
  }
};


// LOGOUT — invalidate current token by incrementing tokenVersion
const logoutUser = async (req, res) => {
  try {

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { tokenVersion: 1 },
    });

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Logout failed. Please try again later.",
    });
  }
};


// GET CURRENT USER — lightweight endpoint to verify token & return user
const getCurrentUser = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: sanitizeUser(user),
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user data",
    });
  }
};



// SEND OTP — for registration (rejects existing users)
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists — this OTP is for registration only
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists. Please login instead.",
      });
    }

    // Delete any existing OTPs for this email to prevent stale codes
    await Otp.deleteMany({ email: normalizedEmail });

    // Generate a cryptographically secure 4-digit OTP
    const otpCode = crypto.randomInt(0, 10000).toString().padStart(4, "0");

    // Store OTP — the pre-save hook will hash it automatically
    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
    });

    // Send email with the plaintext OTP
    await sendOtpEmail(normalizedEmail, otpCode);

    res.status(200).json({
      message: "OTP sent successfully. Please check your email.",
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      message: "Failed to send OTP. Please try again later.",
    });
  }
};



// FORGOT PASSWORD — send OTP to an existing user for password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if the user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address.",
      });
    }

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // Generate a cryptographically secure 4-digit OTP
    const otpCode = crypto.randomInt(0, 10000).toString().padStart(4, "0");

    // Store OTP — the pre-save hook will hash it automatically
    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
    });

    // Send email with the plaintext OTP
    await sendOtpEmail(normalizedEmail, otpCode);

    res.status(200).json({
      message: "Password reset code sent to your email.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Failed to send reset code. Please try again later.",
    });
  }
};


// RESET PASSWORD — verify OTP and update user password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the most recent OTP document for this email
    const otpRecord = await Otp.findOne({ email: normalizedEmail })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP has expired or does not exist. Please request a new one.",
      });
    }

    // Check if max verification attempts have been reached
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      });
    }

    // Increment attempt counter
    otpRecord.attempts += 1;
    await otpRecord.save({ validateBeforeSave: false });

    // Compare the provided OTP against the stored hash
    const isValid = await otpRecord.compareOtp(otp.toString());

    if (!isValid) {
      const remaining = otpRecord.maxAttempts - otpRecord.attempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      });
    }

    // OTP is valid — delete it to prevent reuse
    await Otp.deleteOne({ _id: otpRecord._id });

    // Find the user and update their password
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.status(200).json({
      message: "Password reset successfully. You can now login with your new password.",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Password reset failed. Please try again later.",
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  sendOtp,
  forgotPassword,
  resetPassword,
};