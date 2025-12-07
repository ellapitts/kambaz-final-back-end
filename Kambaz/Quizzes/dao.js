import model from "./model.js";
import quizAttemptSchema from "./quizattemptSchema.js";
import { QuestionType } from "./enum.js";
import mongoose from "mongoose";

const QuizAttemptModel = mongoose.model("QuizAttemptModel", quizAttemptSchema);

export default function QuizzesDao() {
  
  // ============= QUIZ CRUD OPERATIONS =============

  const findQuizzesForCourse = (courseId) => {
    return model.find({ course: courseId }).sort({ availableDate: 1 });
  };

  const findQuizById = (quizId) => {
    return model.findById(quizId);
  };

  const createQuiz = (quiz) => {
    delete quiz._id;
    return model.create(quiz);
  };

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

  const deleteQuiz = (quizId) => {
    return model.deleteOne({ _id: quizId });
  };

  const toggleQuizPublish = async (quizId) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");
    
    quiz.published = !quiz.published;
    await quiz.save();
    return quiz;
  };

  // ============= QUESTION OPERATIONS =============

  const addQuestion = async (quizId, question) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");
    
    quiz.questions.push(question);
    
    // Recalculate total points
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    
    await quiz.save();
    return quiz;
  };

  const updateQuestion = async (quizId, questionId, updates) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");
    
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

  const deleteQuestion = async (quizId, questionId) => {
    const quiz = await model.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");
    
    quiz.questions = quiz.questions.filter(
      (q) => q._id.toString() !== questionId
    );
    
    // Recalculate total points
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    
    await quiz.save();
    return quiz;
  };

  // ============= ATTEMPT OPERATIONS =============

  const findAttemptsByStudentAndQuiz = (studentId, quizId) => {
    return QuizAttemptModel.find({ student: studentId, quiz: quizId })
      .sort({ attemptNumber: -1 });
  };

  const findLatestAttempt = (studentId, quizId) => {
    return QuizAttemptModel.findOne({ student: studentId, quiz: quizId })
      .sort({ attemptNumber: -1 });
  };

  const countAttempts = (studentId, quizId) => {
    return QuizAttemptModel.countDocuments({ student: studentId, quiz: quizId });
  };

  const createAttempt = async (attempt) => {
    const attemptCount = await countAttempts(attempt.student, attempt.quiz);
    attempt.attemptNumber = attemptCount + 1;
    
    delete attempt._id;
    return QuizAttemptModel.create(attempt);
  };

  const updateAttempt = (attemptId, updates) => {
    return QuizAttemptModel.updateOne({ _id: attemptId }, { $set: updates });
  };

  const submitAttempt = async (attemptId, answers) => {
    const attempt = await QuizAttemptModel.findById(attemptId).populate('quiz');
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
      if (question.type === QuestionType.MULTIPLE_CHOICE || 
          question.type === QuestionType.TRUE_FALSE) {
        isCorrect = answer.answer.length === 1 && 
                    question.correctAnswers.includes(answer.answer[0]);
      } else if (question.type === QuestionType.FILL_IN_BLANK) {
        const studentAnswer = answer.answer[0]?.toLowerCase().trim();
        isCorrect = question.correctAnswers.some(
          (correct) => correct.toLowerCase().trim() === studentAnswer
        );
      }
      
      if (isCorrect) {
        pointsEarned = question.points;
        totalScore += pointsEarned;
      }
      
      gradedAnswers.push({
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        pointsEarned
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

  const findAllAttemptsForQuiz = (quizId) => {
    return QuizAttemptModel.find({ quiz: quizId })
      .populate('student', 'firstName lastName email')
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
    findAllAttemptsForQuiz
  };
}