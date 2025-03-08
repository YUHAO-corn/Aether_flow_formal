const mongoose = require('mongoose');

const optimizationHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalPrompt: {
    type: String,
    required: true
  },
  optimizedPrompt: {
    type: String,
    required: true
  },
  improvements: String,
  expectedBenefits: String,
  category: {
    type: String,
    default: 'general'
  },
  provider: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  iterations: [{
    optimizedPrompt: String,
    improvements: String,
    expectedBenefits: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 索引
optimizationHistorySchema.index({ user: 1, createdAt: -1 });
optimizationHistorySchema.index({ user: 1, category: 1 });
optimizationHistorySchema.index({ originalPrompt: 'text', optimizedPrompt: 'text' });

const OptimizationHistory = mongoose.model('OptimizationHistory', optimizationHistorySchema);

module.exports = OptimizationHistory; 