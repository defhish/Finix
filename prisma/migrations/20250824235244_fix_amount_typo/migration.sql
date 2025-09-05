/*
  Warnings:

  - You are about to drop the column `amound` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paymentProofUrl` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `amount` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "amound",
DROP COLUMN "paymentProofUrl",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "receiptUrl" TEXT;
