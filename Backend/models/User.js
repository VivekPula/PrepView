import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    targetRole: {
      type: String,
      default: 'Software Engineer',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Manager'],
      default: 'Mid Level',
    },
    bio: {
      type: String,
      default: '',
    },
    preferredTheme: {
      type: String,
      enum: ['cyberpunk', 'midnight', 'emerald', 'light'],
      default: 'cyberpunk',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;