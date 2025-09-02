import prisma from "../prisma.js";

// Create a new problem
export const createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, tags, userId, examples, constraints, isGlobal } = req.body;

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        userId: isGlobal ? null : (userId ? Number(userId) : null), // 👈 ensure Int
        examples,
        constraints,
        isGlobal: isGlobal || false,
      },
    });

    res.status(201).json(problem);
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all problems (global + user-specific)
export const getProblems = async (req, res) => {
  try {
    const { userId } = req.query; // optional filter

    const problems = await prisma.problem.findMany({
      where: {
        OR: [
          { isGlobal: true }, // always include global
          { userId: userId ? Number(userId) : undefined }, // 👈 parse to Int
        ],
      },
      include: { user: true, submissions: true },
    });

    res.json(problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get problem by ID
export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id: Number(id) }, // 👈 convert param to Int
      include: { user: true, submissions: true },
    });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ message: "Server error" });
  }
};
