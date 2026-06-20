const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, "Username is required"], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false 
  },
  // Added back to handle your Cafe Owner vs Kitchen Staff routing
  role: {
    type: String,
    enum: ['owner', 'staff'],
    default: 'owner' 
  },
  restaurants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant' 
  }]
}, { 
  timestamps: true 
});

// ==========================================
// FIXED PRE-SAVE HOOK (Removed 'next' parameter)
// ==========================================
userSchema.pre('save', async function () {
  // If the password hasn't changed, stop and exit the hook naturally
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    // In modern async hooks, you throw errors directly instead of passing them to next(err)
    throw err; 
  }
});

// Helper Method: Compare password for Login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);