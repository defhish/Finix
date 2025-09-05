/*
  Warnings:

  - You are about to drop the column `receiptUrl` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "receiptUrl",
ADD COLUMN     "paymentProofUrl" TEXT;
