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
    const { id } = req.params;
    console.log(`🔍 Fetching problem with ID: ${id} (type: ${typeof id})`);

    const problem = await prisma.problem.findUnique({
      where: { id: Number(id) }, // 👈 convert string param → Int
    });

    console.log(`📊 Problem found:`, problem ? 'Yes' : 'No');

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json(problem);
  } catch (err) {
    console.error('❌ Error fetching problem:', err);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

export default problemRoutes;
