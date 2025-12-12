/**
 * ENUMS - Centralized constants for quiz system
 * 
 * @purpose
 * Defines all possible values for quiz and question types
 * Prevents typos and ensures consistency across frontend and backend
 * 
 * @usage
 * Instead of hardcoding "MULTIPLE_CHOICE" everywhere,
 * import and use QuestionType.MULTIPLE_CHOICE
 */

export const QuestionType = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  FILL_IN_BLANK: "FILL_IN_BLANK"
};

export const QuizType = {
  GRADED_QUIZ: "GRADED_QUIZ", // Regular graded quiz
  PRACTICE_QUIZ: "PRACTICE_QUIZ", // For practice not counting towards grade
  GRADED_SURVEY: "GRADED_SURVEY", // Survey counting towards participation
  UNGRADED_SURVEY: "UNGRADED_SURVEY" // Survey not counting towards grade
};

export const AssignmentGroup = {
  QUIZZES: "QUIZZES",
  EXAMS: "EXAMS",
  ASSIGNMENTS: "ASSIGNMENTS",
  PROJECT: "PROJECT"
};

export const ShowCorrectAnswers = {
  IMMEDIATELY: "IMMEDIATELY", // Show answers right after submission
  AFTER_DUE_DATE: "AFTER_DUE_DATE", // Show answers after the due date
  NEVER: "NEVER" // Never show correct answers
};