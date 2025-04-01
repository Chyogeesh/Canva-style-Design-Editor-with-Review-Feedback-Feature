import mongoose from 'mongoose';

const DesignSchema = new mongoose.Schema({
  data: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Design || mongoose.model('Design', DesignSchema);
