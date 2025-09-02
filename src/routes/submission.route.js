import express from "express";
import { createSubmission, getSubmissionsByProblem, getSubmissionsByUser } from "../controllers/submission.controller.js";

const router = express.Router();

router.post("/", createSubmission);
router.get("/problem/:problemId", getSubmissionsByProblem);
router.get("/user/:userId", getSubmissionsByUser);

export default router;
