"use client";

import { updateDefaultAccount, recalcAndUpdateAccountBalance } from "@/actions/accounts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

const AccountCard = ({ account}) => {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: UpdateDefaultLoading,
    fn: UpdateDefaultfn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("At least 1 default account should exist");
      return;
    }
    await UpdateDefaultfn(id);
  };

  // Success toast
  useEffect(() => {
    if (updatedAccount?.success) toast.success("Default account changed");
  }, [updatedAccount]);

  // Error toast
  useEffect(() => {
    if (error) toast.error(error.message || "Failed to update default account");
  }, [error]);


  return (
    <Card className="hover:shadow-lg transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
          <Switch
            className="cursor-pointer"
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={UpdateDefaultLoading}
          />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">₹{parseFloat(balance).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter className="flex justify-between text-sm text-muted-foreground pt-5">
          <div className="flex items-center">
            <CircleArrowUp className="mr-1 h-5 w-5 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <CircleArrowDown className="mr-1 h-5 w-5 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
