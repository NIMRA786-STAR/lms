const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateId: { type: String, required: true, unique: true },
  score: { type: Number, default: 0 },         // quiz percentage
  issuedAt: { type: Date, default: Date.now }
});

certificateSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);