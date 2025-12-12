/**
 * QUIZ SCHEMA - Defines the structure of quiz documents in MongoDB
 * 
 * @purpose
 * - Tells MongoDB what fields a quiz should have
 * - Defines data types and validation rules
 * - Nested questionSchema defines question structure
 * 
 * @analogy
 * Think of this as a blueprint for building a house
 * - It specifies what rooms (fields) the house should have
 * - What type each room is (String, Number, Boolean)
 * - What's required vs optional
 */

import mongoose from "mongoose";
import { QuestionType, QuizType, AssignmentGroup, ShowCorrectAnswers } from "./enum.js";

// QUESTION SCHEMA (embedded within quiz)
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(QuestionType), // Only allows valid question types
    required: true
  },
  title: { type: String, default: "" },
  points: { type: Number, default: 0 },
  question: { type: String, required: true }, // The actual question text
  choices: [String], // Array of MC: ["Option 1", "Option 2", ...]
  correctAnswers: [String] // Array of Correct answer(s)
});

// Main quiz schema
const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: "Untitled Quiz" },
    course: { 
      type: String || mongoose.Schema.Types.ObjectId,  // Reference to Course
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
    
    points: { type: Number, default: 0 },  // Total points (sum of all questions)

     assignmentGroup: {
      type: String,
      enum: Object.values(AssignmentGroup),
      default: AssignmentGroup.QUIZZES
    },
    
     // Options (all the checkboxes from your editor)
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
    
    // Publishing (controls student visibility)
    published: { type: Boolean, default: false },
    
    // Questions array
    questions: [questionSchema]
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default quizSchema;