// import {PrismaClient} from "../generated/prisma/index.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// const globelForPrisma = globalThis;

// export const db = globelForPrisma.prisma || new PrismaClient();

// if(process.env.NODE_ENV !== "production") globelForPrisma.prisma = db

export const db = new PrismaClient();
