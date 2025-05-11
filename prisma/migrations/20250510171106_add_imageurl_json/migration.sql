/*
  Warnings:

  - The `imageUrl` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[key]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `Color` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `Objective` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `Style` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `Type` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Color` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Objective` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Style` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Type` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Objective" ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" JSONB;

-- AlterTable
ALTER TABLE "Style" ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Type" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_key_key" ON "Category"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Color_key_key" ON "Color"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Objective_key_key" ON "Objective"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Style_key_key" ON "Style"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Type_key_key" ON "Type"("key");
