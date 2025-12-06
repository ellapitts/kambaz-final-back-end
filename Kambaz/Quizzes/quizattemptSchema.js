import mongoose from "mongoose";

// Individual answer within an attempt
const answerSchema = new mongoose.Schema({
  questionId: { 
    type: String, 
    required: true 
  },
  answer: [String], // Student's answer(s)
  isCorrect: { 
    type: Boolean, 
    default: false 
  },
  pointsEarned: { 
    type: Number, 
    default: 0 
  }
});

// Quiz attempt schema
const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { 
      type: String,
      ref: "QuizModel",
      required: true 
    },
    student: { 
      type: String,
      ref: "UserModel",
      required: true 
    },
    course: { 
      type: String, 
      ref: "CourseModel",
      required: true 
    },
    attemptNumber: { 
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