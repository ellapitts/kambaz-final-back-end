import mongoose from "mongoose";
import { QuestionType, QuizType, AssignmentGroup, ShowCorrectAnswers } from "./enum.js";

// Question schema - embedded in quiz
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(QuestionType),
    required: true
  },
  title: { type: String, default: "" },
  points: { type: Number, default: 0 },
  question: { type: String, required: true },
  choices: [String], // For multiple-choice: ["Option 1", "Option 2", ...]
  correctAnswers: [String] // Correct answer(s)
});

// Main quiz schema
const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: "Untitled Quiz" },
    course: { 
      type: String || mongoose.Schema.Types.ObjectId, 
      ref: "CourseModel", 
      required: true 
    },
    description: { type: String, default: "" },
    
    // Quiz settings
    quizType: {
      type: String,
      enum: Object.values(QuizType),
      default: QuizType.GRADED_QUIZ
    },
    
    points: { type: Number, default: 0 },

     assignmentGroup: {
      type: String,
      enum: Object.values(AssignmentGroup),
      default: AssignmentGroup.QUIZZES
    },
    
    // Options
    shuffleAnswers: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 20 }, // minutes
    multipleAttempts: { type: Boolean, default: false },
    howManyAttempts: { type: Number, default: 1 },
    showCorrectAnswers: {
      type: String,
      enum: Object.values(ShowCorrectAnswers),
      default: ShowCorrectAnswers.IMMEDIATELY
    },
    accessCode: { type: String, default: "" },
    oneQuestionAtATime: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
     lockQuestionsAfterAnswering: { type: Boolean, default: false },
    
    // Dates
    dueDate: { type: Date, default: null },
    availableDate: { type: Date, default: null },
    untilDate: { type: Date, default: null },
    
    // Publishing
    published: { type: Boolean, default: false },
    
    // Questions array
    questions: [questionSchema]
  },
  { timestamps: true }
);

export default quizSchema;