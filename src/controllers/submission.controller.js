import prisma from "../prisma.js";

// Create a new submission
export const createSubmission = async (req, res) => {
  try {
    const { userId, problemId, code, language } = req.body;

    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId,
        code,
        language,
      },
      include: { user: true, problem: true },
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all submissions for a problem
export const getSubmissionsByProblem = async (req, res) => {
  try {
    const { problemId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { problemId },
      include: { user: true },
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all submissions of a user
export const getSubmissionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { userId },
      include: { problem: true },
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
};
