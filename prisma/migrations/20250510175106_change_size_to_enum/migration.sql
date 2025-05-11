/*
  Warnings:

  - You are about to drop the column `styleId` on the `Product` table. All the data in the column will be lost.
  - The `size` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Style` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Size" AS ENUM ('S', 'M', 'L', 'XL', 'XXL');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_styleId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "styleId",
DROP COLUMN "size",
ADD COLUMN     "size" "Size";

-- DropTable
DROP TABLE "Style";
