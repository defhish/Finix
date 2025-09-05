import { FetchUserAccounts, getDashBoardData } from "@/actions/DashboardAccount";
import CreateAccountTab from "@/components/CreateAccountTab";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React, { Suspense } from "react";
import AccountCard from "./_components/accountcard";
import BudgetProgress from "./_components/budgetProgress";
import { getCurrentBudget } from "@/actions/budget";
import { BarLoader } from "react-spinners";
import { DashboardOverview } from "./_components/DashboardOverview";

async function DashboardPage() {
  const accounts = await FetchUserAccounts();

  // Find the default account safely
  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Fetch budget data only if default account exists
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  // Fetch transactions only if default account exists
  const transactions = defaultAccount
    ? await getDashBoardData(defaultAccount.id)
    : [];

  // If no accounts exist, render a friendly message
  if (!accounts || accounts.length === 0) {
    return (
      <div className="px-5 py-10 text-center space-y-5">
        <h2 className="text-2xl font-semibold">No Accounts Found</h2>
        <p className="text-gray-500">Create your first account to start tracking your finances.</p>
        <CreateAccountTab>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer max-w-xs mx-auto">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountTab>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 space-y-8">
      {/* Budget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Overview */}
      <Suspense fallback={<BarLoader width="100%" color="#06b6d4" />}>
        <DashboardOverview accounts={accounts} transactions={transactions} />
      </Suspense>

      {/* Account Grid */}
      <Suspense fallback={<BarLoader width="100%" color="#06b6d4" />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountTab>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-solid">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                <Plus className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium">Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountTab>

          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </Suspense>
    </div>
  );
}

export default DashboardPage;
