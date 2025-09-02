/*
  Warnings:

  - The primary key for the `Problem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `codeSnippets` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `editorial` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `hints` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `referenceSolutions` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `testCases` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Submission` table. All the data in the column will be lost.
  - Changed the type of `difficulty` on the `Problem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `userId` on table `Problem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_problemId_fkey";

-- DropIndex
DROP INDEX "Problem_difficulty_idx";

-- DropIndex
DROP INDEX "Submission_problemId_idx";

-- DropIndex
DROP INDEX "Submission_userId_idx";

-- AlterTable
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_pkey",
DROP COLUMN "codeSnippets",
DROP COLUMN "editorial",
DROP COLUMN "hints",
DROP COLUMN "referenceSolutions",
DROP COLUMN "testCases",
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" TEXT NOT NULL,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "constraints" DROP NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Problem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Problem_id_seq";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "code",
DROP COLUMN "language",
DROP COLUMN "status",
ALTER COLUMN "problemId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
