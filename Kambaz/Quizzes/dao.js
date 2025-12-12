/**
 * DAO (Data Access Object) - The "middleman" between routes and database
 *
 * @purpose
 * - Contains all database operations
 * - Handles complex logic (like grading, point calculation)
 * - Keeps routes.js clean and focused
 *
 * @pattern
 * Routes call DAO functions → DAO talks to MongoDB → Returns data to routes
 */

import model from "./model.js";
import quizAttemptSchema from "./quizattemptSchema.js";
import { QuestionType } from "./enum.js";
import mongoose from "mongoose";

const QuizAttemptModel = mongoose.model("QuizAttemptModel", quizAttemptSchema);

export default function QuizzesDao() {
  // ============= QUIZ CRUD OPERATIONS =============

  /**
   * Find all quizzes for a course
   * Sorts by available date (earliest first)
   */
  const findQuizzesForCourse = (courseId) => {
    return model.find({ course: courseId }).sort({ availableDate: 1 });
  };

  /**
   * Find one quiz by ID
   */
  const findQuizById = (quizId) => {
    return model.findById(quizId);
  };

  /**
   * Create new quiz
   * Removes _id if present (MongoDB generates it)
   */
  const createQuiz = (quiz) => {
    delete quiz._id;
    return model.create(quiz);
  };

  /**
   * Update quiz
   * IMPORTANT: Auto-recalculates total points when questions change
   */
  const updateQuiz = (quizId, updates) => {
    // Recalculate points if questions changed
    if (updates.questions) {
      const totalPoints = updates.questions.reduce(
        (sum, q) => sum + (q.points || 0),
        0
      );
      updates.points = totalPoints;
    }

    return model.updateOne({ _id: quizId }, { $set: updates });
  };

  /**
   * Delete quiz
   */
  const deleteQuiz = (quizId) => {
    return model.deleteOne({ _id: quizId });
  };

  /**
   * Toggle publish status
   * Flips published between true/false
   */
  const toggleQuizPublish = async (quizId) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");

    quiz.published = !quiz.published;
    await quiz.save();
    return quiz;
  };

  // ============= QUESTION OPERATIONS =============

  /**
   * Add question to quiz
   * Recalculates total quiz points
   */
  const addQuestion = async (quizId, question) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");

    quiz.questions.push(question);

    // Recalculate total points
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    await quiz.save();
    return quiz;
  };

  /**
   * Update existing question
   * Finds question by ID and updates it
   * Recalculates total quiz points
   */
  const updateQuestion = async (quizId, questionId, updates) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");

    // Find question in array via index
    const questionIndex = quiz.questions.findIndex(
      (q) => q._id.toString() === questionId
    );

    if (questionIndex === -1) throw new Error("Question not found");

    // Update the question
    Object.assign(quiz.questions[questionIndex], updates);

    // Recalculate total points
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    await quiz.save();
    return quiz;
  };

  /**
   * Delete question
   * Removes from array and recalculates points
   */
  const deleteQuestion = async (quizId, questionId) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");

    // Filter out the question to delete
    quiz.questions = quiz.questions.filter(
      (q) => q._id.toString() !== questionId
    );

    // Recalculate total points
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    await quiz.save();
    return quiz;
  };

  // ============= ATTEMPT OPERATIONS =============

  /**
   * Find all attempts for a student/quiz combination
   * Sorted newest first
   */
  const findAttemptsByStudentAndQuiz = (studentId, quizId) => {
    return QuizAttemptModel.find({ student: studentId, quiz: quizId }).sort({
      attemptNumber: -1,
    });
  };

  /**
   * Find most recent attempt
   */
  const findLatestAttempt = (studentId, quizId) => {
    return QuizAttemptModel.findOne({ student: studentId, quiz: quizId }).sort({
      attemptNumber: -1,
    });
  };

  /**
   * Count how many attempts student has made
   */
  const countAttempts = (studentId, quizId) => {
    return QuizAttemptModel.countDocuments({
      student: studentId,
      quiz: quizId,
    });
  };

  /**
   * Create new attempt
   * Auto-increments attempt number
   */
  const createAttempt = async (attempt) => {
    const attemptCount = await countAttempts(attempt.student, attempt.quiz);
    attempt.attemptNumber = attemptCount + 1;

    delete attempt._id;
    return QuizAttemptModel.create(attempt);
  };

  /**
   * Update attempt (save in-progress answers)
   */
  const updateAttempt = (attemptId, updates) => {
    return QuizAttemptModel.updateOne({ _id: attemptId }, { $set: updates });
  };

  /**
   *  Submit attempt
   *  Grades the attempt and calculates score
   *    * @workflow
   * 1. Load attempt and quiz data
   * 2. Grade each answer based on question type
   * 3. Calculate total score
   * 4. Mark attempt as completed
   * 5. Save and return graded attempt
   */
  const submitAttempt = async (attemptId, answers) => {
    // Load attempt with quiz data
    const attempt = await QuizAttemptModel.findById(attemptId).populate("quiz");
    if (!attempt) throw new Error("Attempt not found");

    const quiz = attempt.quiz;
    let totalScore = 0;
    const gradedAnswers = [];

    // Grade each answer
    for (const answer of answers) {
      const question = quiz.questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      // Check correctness based on question type
      if (
        question.type === QuestionType.MULTIPLE_CHOICE ||
        question.type === QuestionType.TRUE_FALSE
      ) {
        // Exact match: student's answer must be in correctAnswers
        isCorrect =
          answer.answer.length === 1 &&
          question.correctAnswers.includes(answer.answer[0]);
      } else if (question.type === QuestionType.FILL_IN_BLANK) {
        // Case-insensitive match for fill-in-blank
        const studentAnswer = answer.answer[0]?.toLowerCase().trim();
        isCorrect = question.correctAnswers.some(
          (correct) => correct.toLowerCase().trim() === studentAnswer
        );
      }

      // Award points if correct
      if (isCorrect) {
        pointsEarned = question.points;
        totalScore += pointsEarned;
      }

      // Store graded answer
      gradedAnswers.push({
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        pointsEarned,
      });
    }

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.score = totalScore;
    attempt.totalPoints = quiz.points;
    attempt.completed = true;
    attempt.submittedAt = new Date();

    await attempt.save();
    return attempt;
  };

  /**
   * Find all attempts for a quiz (faculty view)
   * Includes student info (firstName, lastName, email)
   */
  const findAllAttemptsForQuiz = (quizId) => {
    return QuizAttemptModel.find({ quiz: quizId })
      .populate("student", "firstName lastName email")
      .sort({ submittedAt: -1 });
  };

  // Return all functions
  return {
    findQuizzesForCourse,
    findQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    toggleQuizPublish,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    findAttemptsByStudentAndQuiz,
    findLatestAttempt,
    countAttempts,
    createAttempt,
    updateAttempt,
    submitAttempt,
    findAllAttemptsForQuiz,
  };
}
