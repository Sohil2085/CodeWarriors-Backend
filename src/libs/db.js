import {PrismaClient} from "../generated/prisma/index.js";

const globelForPrisma = globalThis;

export const db = globelForPrisma.prisma || new PrismaClient();

if(process.env.NODE_ENV !== "production") globelForPrisma.prisma = db
