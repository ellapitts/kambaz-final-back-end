import QuizzesDao from "./dao.js";

export default function QuizRoutes(app) {
  const dao = QuizzesDao();

  // ===================================
  // ============ HANDLERS =============
  // ===================================

  // GET all quizzes for a course
  const findQuizzesForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const quizzes = await dao.findQuizzesForCourse(courseId);
      const currentUser = req.session?.currentUser;

      if (currentUser?.role === "STUDENT") {
        const publishedQuizzes = quizzes.filter((q) => q.published);

        const quizzesWithScores = await Promise.all(
          publishedQuizzes.map(async (quiz) => {
            const latestAttempt = await dao.findLatestAttempt(
              currentUser._id,
              quiz._id
            );
            return {
              ...quiz.toObject(),
              latestScore: latestAttempt?.score || null,
              attemptCount: await dao.countAttempts(currentUser._id, quiz._id),
            };
          })
        );

        return res.json(quizzesWithScores);
      }

      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // GET single quiz
  const findQuizById = async (req, res) => {
    try {
      const { quizId } = req.params;
      const quiz = await dao.findQuizById(quizId);

      if (!quiz) return res.status(404).json({ error: "Quiz not found" });

      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // POST create quiz
  const createQuiz = async (req, res) => {
    try {
      const { courseId } = req.params;
      const quiz = {
        title: "Untitled Quiz",
        course: courseId,
        published: false,
        points: 0,
        questions: [],
        ...req.body,
      };

      const newQuiz = await dao.createQuiz(quiz);
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // PUT update quiz
  const updateQuiz = async (req, res) => {
    try {
      const { quizId } = req.params;
      const updates = req.body;

      await dao.updateQuiz(quizId, updates);
      const updatedQuiz = await dao.findQuizById(quizId);

      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // DELETE quiz
  const deleteQuiz = async (req, res) => {
    try {
      const { quizId } = req.params;
      const status = await dao.deleteQuiz(quizId);
      res.json(status);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // PUT publish/unpublish
  const togglePublishQuiz = async (req, res) => {
    try {
      const { quizId } = req.params;
      const updatedQuiz = await dao.toggleQuizPublish(quizId);
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error toggling publish:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Add question
  const addQuestion = async (req, res) => {
    try {
      const { quizId } = req.params;
      const question = {
        type: "MULTIPLE_CHOICE",
        title: "New Question",
        points: 1,
        question: "",
        choices: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswers: ["Option 1"],
        ...req.body,
      };

      const updatedQuiz = await dao.addQuestion(quizId, question);
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error adding question:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Update question
  const updateQuestion = async (req, res) => {
    try {
      const { quizId, questionId } = req.params;
      const updates = req.body;

      const updatedQuiz = await dao.updateQuestion(
        quizId,
        questionId,
        updates
      );

      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Delete question
  const deleteQuestion = async (req, res) => {
    try {
      const { quizId, questionId } = req.params;
      const updatedQuiz = await dao.deleteQuestion(quizId, questionId);
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Get attempts
  const findAttemptsForQuiz = async (req, res) => {
    try {
      const { quizId } = req.params;
      const currentUser = req.session?.currentUser;

      if (!currentUser)
        return res.status(401).json({ error: "Not authenticated" });

      if (currentUser.role === "FACULTY") {
        const attempts = await dao.findAllAttemptsForQuiz(quizId);
        return res.json(attempts);
      }

      const attempts = await dao.findAttemptsByStudentAndQuiz(
        currentUser._id,
        quizId
      );

      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Latest attempt
  const findLatestAttempt = async (req, res) => {
    try {
      const { quizId } = req.params;
      const currentUser = req.session?.currentUser;

      if (!currentUser)
        return res.status(401).json({ error: "Not authenticated" });

      const attempt = await dao.findLatestAttempt(currentUser._id, quizId);
      res.json(attempt || null);
    } catch (error) {
      console.error("Error fetching latest attempt:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Start attempt
  const startQuizAttempt = async (req, res) => {
    try {
      const { courseId, quizId } = req.params;
      const currentUser = req.session?.currentUser;

      if (!currentUser)
        return res.status(401).json({ error: "Not authenticated" });

      const quiz = await dao.findQuizById(quizId);
      if (!quiz)
        return res.status(404).json({ error: "Quiz not found" });

      const attemptCount = await dao.countAttempts(currentUser._id, quizId);

      if (!quiz.multipleAttempts && attemptCount >= 1)
        return res.status(403).json({ error: "No attempts remaining" });

      if (quiz.multipleAttempts && attemptCount >= quiz.howManyAttempts)
        return res.status(403).json({ error: "No attempts remaining" });

      const attempt = await dao.createAttempt({
        quiz: quizId,
        student: currentUser._id,
        course: courseId,
        answers: [],
        score: 0,
        totalPoints: quiz.points,
      });

      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error starting attempt:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Submit attempt
  const submitQuizAttempt = async (req, res) => {
    try {
      const { attemptId } = req.params;
      const { answers } = req.body;

      const gradedAttempt = await dao.submitAttempt(attemptId, answers);
      res.json(gradedAttempt);
    } catch (error) {
      console.error("Error submitting attempt:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Save answers
  const saveQuizAnswers = async (req, res) => {
    try {
      const { attemptId } = req.params;
      const { answers } = req.body;

      const status = await dao.updateAttempt(attemptId, { answers });
      res.json(status);
    } catch (error) {
      console.error("Error saving answers:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // ===================================
  // ============ ROUTES ===============
  // ===================================

  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);
  app.get("/api/courses/:courseId/quizzes/:quizId", findQuizById);
  app.post("/api/courses/:courseId/quizzes", createQuiz);
  app.put("/api/courses/:courseId/quizzes/:quizId", updateQuiz);
  app.delete("/api/courses/:courseId/quizzes/:quizId", deleteQuiz);
  app.put("/api/courses/:courseId/quizzes/:quizId/publish", togglePublishQuiz);

  app.post("/api/courses/:courseId/quizzes/:quizId/questions", addQuestion);
  app.put("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", updateQuestion);
  app.delete("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", deleteQuestion);

  app.get("/api/courses/:courseId/quizzes/:quizId/attempts", findAttemptsForQuiz);
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts/latest", findLatestAttempt);
  app.post("/api/courses/:courseId/quizzes/:quizId/attempts", startQuizAttempt);
  app.post("/api/courses/:courseId/quizzes/:quizId/attempts/:attemptId/submit", submitQuizAttempt);
  app.put("/api/courses/:courseId/quizzes/:quizId/attempts/:attemptId", saveQuizAnswers);
}
