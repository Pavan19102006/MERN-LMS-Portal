const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  content: {
    type: String,
    required: [true, 'Submission content is required']
  },
  attachments: [{
    name: String,
    url: String
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Submitted', 'Graded', 'Returned'],
    default: 'Submitted'
  }
});

/**
 * Compound unique index on assignment and student fields.
 * This ensures that a student can only submit one response per assignment,
 * preventing duplicate submissions while allowing the same student to submit
 * to different assignments and multiple students to submit to the same assignment.
 */
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
