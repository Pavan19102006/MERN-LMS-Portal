const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let courses;
    
    if (req.user.role === 'Admin') {
      courses = await Course.find().populate('instructor', 'name email');
    } else if (req.user.role === 'Instructor') {
      courses = await Course.find({ instructor: req.user._id }).populate('instructor', 'name email');
    } else {
      courses = await Course.find({ isPublished: true }).populate('instructor', 'name email');
    }
    
    res.json(courses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { title, description, instructor, category, duration, content, isPublished } = req.body;

    const course = await Course.create({
      title,
      description,
      instructor,
      category,
      duration,
      content,
      isPublished
    });

    const populatedCourse = await Course.findById(course._id).populate('instructor', 'name email');
    
    // Emit real-time update
    if (req.io) {
      req.io.emit('courseCreated', populatedCourse);
    }

    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private/Admin/Instructor
router.put('/:id', protect, authorize('Admin', 'Instructor'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Instructors can only update their own courses
    if (req.user.role === 'Instructor' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const { title, description, category, duration, content, isPublished } = req.body;

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.duration = duration || course.duration;
    course.content = content || course.content;
    course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;

    const updatedCourse = await course.save();
    const populatedCourse = await Course.findById(updatedCourse._id).populate('instructor', 'name email');

    // Emit real-time update
    if (req.io) {
      req.io.emit('courseUpdated', populatedCourse);
    }

    res.json(populatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await Course.deleteOne({ _id: req.params.id });

    // Emit real-time update
    if (req.io) {
      req.io.emit('courseDeleted', req.params.id);
    }

    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private/Student
router.post('/:id/enroll', protect, authorize('Student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: req.params.id
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'title description')
      .populate('student', 'name email');

    // Emit real-time update
    if (req.io) {
      req.io.emit('enrollmentCreated', populatedEnrollment);
    }

    res.status(201).json(populatedEnrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/courses/enrolled/my
// @desc    Get enrolled courses for current student
// @access  Private/Student
router.get('/enrolled/my', protect, authorize('Student'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email' }
      });
    res.json(enrollments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
