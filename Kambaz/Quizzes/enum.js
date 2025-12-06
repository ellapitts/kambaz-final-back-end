// Quiz Enums - keeping objects separate from functionality

export const QuestionType = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  FILL_IN_BLANK: "FILL_IN_BLANK"
};

export const QuizType = {
  GRADED_QUIZ: "GRADED_QUIZ",
  PRACTICE_QUIZ: "PRACTICE_QUIZ",
  GRADED_SURVEY: "GRADED_SURVEY",
  UNGRADED_SURVEY: "UNGRADED_SURVEY"
};

export const AssignmentGroup = {
  QUIZZES: "QUIZZES",
  EXAMS: "EXAMS",
  ASSIGNMENTS: "ASSIGNMENTS",
  PROJECT: "PROJECT"
};

export const ShowCorrectAnswers = {
  IMMEDIATELY: "IMMEDIATELY",
  AFTER_DUE_DATE: "AFTER_DUE_DATE",
  NEVER: "NEVER"
};