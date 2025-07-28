import express from "express";
import {PrismaClient} from "../generated/prisma/index.js";


const problemRoutes = express.Router();
const prisma = new PrismaClient();

// POST /api/problems
problemRoutes.post('/', async (req, res) => {
  try {
    const newProblem = await prisma.problem.create({ data: req.body });
    res.json(newProblem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

// GET /api/problems
problemRoutes.get('/', async (req, res) => {
  try {
    const problems = await prisma.problem.findMany();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// GET /api/problems/:id
problemRoutes.get('/:id', async (req, res) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
    });
    if (!problem) return res.status(404).json({ error: 'Not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

export default problemRoutes;
