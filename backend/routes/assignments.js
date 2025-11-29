const express = require('express');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let assignments;
    
    if (req.user.role === 'Admin') {
      assignments = await Assignment.find()
        .populate('course', 'title')
        .populate('instructor', 'name email');
    } else if (req.user.role === 'Instructor') {
      assignments = await Assignment.find({ instructor: req.user._id })
        .populate('course', 'title')
        .populate('instructor', 'name email');
    } else {
      // Students can see assignments for courses they're enrolled in
      const enrollments = await Enrollment.find({ student: req.user._id });
      const courseIds = enrollments.map(e => e.course);
      assignments = await Assignment.find({ course: { $in: courseIds } })
        .populate('course', 'title')
        .populate('instructor', 'name email');
    }
    
    res.json(assignments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private/Instructor/Admin
router.post('/', protect, authorize('Instructor', 'Admin'), async (req, res) => {
  try {
    const { title, description, course, dueDate, totalPoints, attachments } = req.body;

    // Verify instructor owns the course (unless Admin)
    if (req.user.role === 'Instructor') {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return res.status(404).json({ message: 'Course not found' });
      }
      if (courseDoc.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to create assignment for this course' });
      }
    }

    const assignment = await Assignment.create({
      title,
      description,
      course,
      instructor: req.user._id,
      dueDate,
      totalPoints,
      attachments
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title')
      .populate('instructor', 'name email');

    // Emit real-time update
    if (req.io) {
      req.io.emit('assignmentCreated', populatedAssignment);
    }

    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title')
      .populate('instructor', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private/Instructor/Admin
router.put('/:id', protect, authorize('Instructor', 'Admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Instructors can only update their own assignments
    if (req.user.role === 'Instructor' && assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const { title, description, dueDate, totalPoints, attachments } = req.body;

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.totalPoints = totalPoints || assignment.totalPoints;
    assignment.attachments = attachments || assignment.attachments;

    const updatedAssignment = await assignment.save();
    const populatedAssignment = await Assignment.findById(updatedAssignment._id)
      .populate('course', 'title')
      .populate('instructor', 'name email');

    // Emit real-time update
    if (req.io) {
      req.io.emit('assignmentUpdated', populatedAssignment);
    }

    res.json(populatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private/Instructor/Admin
router.delete('/:id', protect, authorize('Instructor', 'Admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Instructors can only delete their own assignments
    if (req.user.role === 'Instructor' && assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await Assignment.deleteOne({ _id: req.params.id });

    // Emit real-time update
    if (req.io) {
      req.io.emit('assignmentDeleted', req.params.id);
    }

    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/assignments/course/:courseId
// @desc    Get all assignments for a course
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('course', 'title')
      .populate('instructor', 'name email');
    res.json(assignments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
