/**
 * QUIZ ATTEMPT SCHEMA - Tracks student quiz submissions
 * 
 * @purpose
 * - Records each time a student takes a quiz
 * - Stores their answers and scores
 * - Allows multiple attempts (if enabled)
 * 
 * @relationship
 * - One quiz can have many attempts (from different students)
 * - One student can have multiple attempts (if multipleAttempts enabled)
 */
import mongoose from "mongoose";

// Individual answer within an attempt
const answerSchema = new mongoose.Schema({
  questionId: {  // Which question this answer belongs to
    type: String, 
    required: true 
  },
  answer: [String], // Student's answer(s)
  isCorrect: {  // Whether the answer is correct
    type: Boolean, 
    default: false 
  },
  pointsEarned: {  // Points earned for this answer
    type: Number, 
    default: 0 
  }
});

// Quiz attempt schema
const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { 
      type: String,
      ref: "QuizModel", // Links to the quiz being attempted
      required: true 
    },
    student: { 
      type: String,
      ref: "UserModel", // Links to the student making the attempt
      required: true 
    },
    course: { 
      type: String, 
      ref: "CourseModel", // Course context
      required: true 
    },
    attemptNumber: { // Sequential attempt number for this student on this quiz
      type: Number, 
      required: true 
    },
    answers: [answerSchema],
    score: { 
      type: Number, 
      default: 0 
    },
    totalPoints: { 
      type: Number, 
      default: 0 
    },
    submittedAt: { 
      type: Date, 
      default: Date.now 
    },
    completed: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Prevent duplicate attempt numbers
quizAttemptSchema.index(
  { quiz: 1, student: 1, attemptNumber: 1 }, 
  { unique: true }
);

export default quizAttemptSchema;