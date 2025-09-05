import { FetchUserAccounts } from "@/actions/DashboardAccount";
import { defaultCategories } from "@/data/categories";
import React from "react";
import AddTransactionForm from "../_components/transactionForm";
import { getTransaction } from "@/actions/transaction";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
const AddTransactionPage = async ({ searchParams }) => {
  const accounts = await FetchUserAccounts();

  // await searchParams since it's now async in Next.js 14
  const params = await searchParams;
  const editId = params?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title ">
          {editId ? "Edit" : "Add"} Transaction
        </h1>
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="#06b6d4" />}
      >
        <AddTransactionForm
          accounts={accounts}
          categories={defaultCategories}
          editMode={!!editId}
          initialData={initialData}
        />
      </Suspense>
    </div>
  );
};

export default AddTransactionPage;
