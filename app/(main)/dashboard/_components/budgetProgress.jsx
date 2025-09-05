"use client";
import { updateBudget } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/use-fetch";
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [newBudget, setNewBudget] = useState(
    //intiial value is the old/existing budget or empty string
    initialBudget?.amount?.toString() || ""
  );

  //calculate the percentage use for our budget

  //if initial budget is there then divide current expenses by initial budget and multiply by 100 else 0
  const percentageUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const {
    loading: isLoading,
    fn: updateBudgetfn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  //api call
  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    await updateBudgetfn(amount);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEdit(false);
      toast.success("Budget Updated");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEdit(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">
            Monthly Budget (Default Account)
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {isEdit ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter Amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-[#06b6d4]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initialBudget
                    ? `₹${currentExpenses.toFixed(
                        2
                      )} of ₹${initialBudget.amount.toFixed(2)} spent`
                    : `No budget set yet. Spent ₹${currentExpenses.toFixed(2)}`}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEdit(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-2 w-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {initialBudget && (
          <div className="space-y-2">
            <Progress
              value={percentageUsed}
              extraStyles={
                percentageUsed >= 80
                  ? "bg-red-500" // Critical → over budget
                  : percentageUsed >= 60
                  ? "bg-orange-400" // Warning zone
                  : "bg-blue-600" // Normal zone
              }
            />
            <p className="text-xs text-muted-foreground text-right">
              {percentageUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
