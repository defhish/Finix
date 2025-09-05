"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format, subMonths } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Color palette
const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
  "#FF9F40", "#FF5A5F", "#8BC34A", "#00BCD4", "#FF5722"
];

export function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const [monthOffset, setMonthOffset] = useState(0);

  // Filter transactions for selected account
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  // Get recent transactions (last 5)
  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Filter expenses for the selected month
  const currentDate = new Date();
  const filteredTransactions = accountTransactions.filter((t) => {
    const txDate = new Date(t.date);
    const targetDate = subMonths(currentDate, monthOffset);
    return (
      t.type === "DEBIT" &&
      txDate.getMonth() === targetDate.getMonth() &&
      txDate.getFullYear() === targetDate.getFullYear()
    );
  });

  // Group expenses by category
  const expensesByCategory = filteredTransactions.reduce((acc, tx) => {
    const category = tx.category || "Other";
    if (!acc[category]) acc[category] = 0;
    acc[category] += tx.amount;
    return acc;
  }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce(
    (sum, val) => sum + val,
    0
  );

  // Prepare pie chart data with percentages
  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    percent: ((value / totalExpenses) * 100).toFixed(1),
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Transactions Card */}
      <Card className="rounded-2xl shadow-md border border-gray-200">
        <CardHeader className="flex justify-between items-center p-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Transactions
          </CardTitle>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No recent transactions</p>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800">
                    {transaction.description || "Untitled Transaction"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(transaction.date), "PP")}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-full font-medium",
                    transaction.type === "DEBIT"
                      ? "bg-red-50 text-red-500"
                      : "bg-green-50 text-green-500"
                  )}
                >
                  {transaction.type === "DEBIT" ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  ₹{transaction.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Monthly Expense Breakdown Card */}
      <Card className="rounded-2xl shadow-md border border-gray-200">
        <CardHeader className="flex justify-between items-center p-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Expense Breakdown
          </CardTitle>
          <Select value={monthOffset} onValueChange={setMonthOffset}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={0}>Current Month</SelectItem>
              <SelectItem value={1}>Last Month</SelectItem>
              <SelectItem value={2}>2 Months Ago</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-4">
          {pieChartData.length === 0 ? (
            <p className="text-center text-gray-400 py-6">
              No expenses for selected month
            </p>
          ) : (
            <div className="h-[350px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    innerRadius="40%"
                    dataKey="value"
                    nameKey="name"
                    label={({ percent }) => `${percent}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, entry) => [
                      `₹${value.toFixed(2)} (${entry.payload.percent}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: "12px", color: "#4b5563" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
