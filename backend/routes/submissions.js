const express = require('express');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/submissions
// @desc    Get all submissions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let submissions;
    
    if (req.user.role === 'Admin') {
      submissions = await Submission.find()
        .populate('assignment', 'title dueDate totalPoints')
        .populate('student', 'name email')
        .populate('gradedBy', 'name');
    } else if (req.user.role === 'Instructor') {
      const assignments = await Assignment.find({ instructor: req.user._id });
      const assignmentIds = assignments.map(a => a._id);
      submissions = await Submission.find({ assignment: { $in: assignmentIds } })
        .populate('assignment', 'title dueDate totalPoints')
        .populate('student', 'name email')
        .populate('gradedBy', 'name');
    } else {
      submissions = await Submission.find({ student: req.user._id })
        .populate('assignment', 'title dueDate totalPoints')
        .populate('student', 'name email')
        .populate('gradedBy', 'name');
    }
    
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/submissions
// @desc    Submit an assignment
// @access  Private/Student
router.post('/', protect, authorize('Student'), async (req, res) => {
  try {
    const { assignment, content, attachments } = req.body;

    // Check if assignment exists
    const assignmentDoc = await Assignment.findById(assignment);
    if (!assignmentDoc) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: assignmentDoc.course
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in the course to submit' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment,
      student: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const submission = await Submission.create({
      assignment,
      student: req.user._id,
      content,
      attachments
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignment', 'title dueDate totalPoints')
      .populate('student', 'name email');

    // Emit real-time update
    if (req.io) {
      req.io.emit('submissionCreated', populatedSubmission);
    }

    res.status(201).json(populatedSubmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get submission by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignment', 'title dueDate totalPoints')
      .populate('student', 'name email')
      .populate('gradedBy', 'name');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Students can only view their own submissions
    if (req.user.role === 'Student' && submission.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/submissions/:id
// @desc    Update submission (Student can update before graded)
// @access  Private/Student
router.put('/:id', protect, authorize('Student'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Only the student who submitted can update
    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this submission' });
    }

    // Cannot update if already graded
    if (submission.status === 'Graded' || submission.status === 'Returned') {
      return res.status(400).json({ message: 'Cannot update a graded submission' });
    }

    const { content, attachments } = req.body;

    submission.content = content || submission.content;
    submission.attachments = attachments || submission.attachments;
    submission.submittedAt = Date.now();

    const updatedSubmission = await submission.save();
    const populatedSubmission = await Submission.findById(updatedSubmission._id)
      .populate('assignment', 'title dueDate totalPoints')
      .populate('student', 'name email');

    // Emit real-time update
    if (req.io) {
      req.io.emit('submissionUpdated', populatedSubmission);
    }

    res.json(populatedSubmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/submissions/:id/grade
// @desc    Grade a submission
// @access  Private/Instructor/Admin
router.put('/:id/grade', protect, authorize('Instructor', 'Admin'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if instructor owns the assignment
    if (req.user.role === 'Instructor') {
      const assignment = await Assignment.findById(submission.assignment);
      if (assignment.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to grade this submission' });
      }
    }

    const { grade, feedback } = req.body;

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user._id;
    submission.status = 'Graded';

    const updatedSubmission = await submission.save();
    const populatedSubmission = await Submission.findById(updatedSubmission._id)
      .populate('assignment', 'title dueDate totalPoints')
      .populate('student', 'name email')
      .populate('gradedBy', 'name');

    // Emit real-time update
    if (req.io) {
      req.io.emit('submissionGraded', populatedSubmission);
    }

    res.json(populatedSubmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Get all submissions for an assignment
// @access  Private/Instructor/Admin
router.get('/assignment/:assignmentId', protect, authorize('Instructor', 'Admin'), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('assignment', 'title dueDate totalPoints')
      .populate('student', 'name email')
      .populate('gradedBy', 'name');
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/submissions/my
// @desc    Get current student's submissions
// @access  Private/Student
router.get('/my/all', protect, authorize('Student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title dueDate totalPoints')
      .populate('gradedBy', 'name');
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
