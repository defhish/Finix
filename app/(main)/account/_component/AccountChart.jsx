"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

//Map for each date range value
const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

const AccountChart = ({ transactions }) => {
  //the date range that is to be showm
  const [dateRange, setDateRange] = useState("1M");

  const filterData = useMemo(() => {
    //so this is not an array which takes in the map we created above and gives the value accordingly
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? //startOfDay gives the current date
        //subdays basically subtracts range.days from 'now'
        startOfDay(subDays(now, range.days))
      : //else consider the oldest available date
        startOfDay(new Date(0));

    //Filter transaction withing date range
    const filtered = transactions.filter(
      //check if date of the transaction is more than the start date and less than the date of the end day then show
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, transaction) => {
      //MMM dd gives date in jan,feb,mar 01-31 format
      const date = format(new Date(transaction.date), "MMM dd");

      //for the given key, key is the date here, initiate with 0 for credit and devit
      if (!acc[date]) {
        acc[date] = { date, credit: 0, debit: 0 };
      }

      //if the transaction for the given date is credit, add it to credit of acc
      if (transaction.type === "CREDIT") {
        acc[date].credit += transaction.amount;
      } else {
        //else add it to debit of acc
        acc[date].debit += transaction.amount;
      }

      return acc;
    }, {});

    //convert to array and sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filterData.reduce(
      (acc, day) => ({
        credit: acc.credit + day.credit,
        debit: acc.debit + day.debit,
      }),
      { credit: 0, debit: 0 }
    );
  }, [filterData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-base font-normal">
          Transaction Graph
        </CardTitle>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[145px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => {
              return (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Credit</p>
            <p className="text-lg font-bold text-green-500">
              ₹{totals.credit.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Total Debit</p>
            <p className="text-lg font-bold text-red-500">
              ₹{totals.debit.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Net</p>
            <p
              className={`text-lg font-bold ${
                totals.credit - totals.debit >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              ₹{(totals.credit - totals.debit).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filterData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 10,
              }}
              barSize={28}
            >
              {/* Soft grid lines */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />

              {/* X axis */}
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />

              {/* Y axis */}
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value.toFixed(2)}`}
                tick={{ fill: "#6b7280" }}
              />

              {/* Tooltip with color badge */}
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  padding: "8px 12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value, name) => {
                  const color = name === "credit" ? "#22c55e" : "#ef4444"; // green/red
                  return [
                    <span style={{ color, fontWeight: 600 }}>
                      ₹{Number(value).toFixed(2)}
                    </span>,
                  ];
                }}
              />

              {/* Legend with nice spacing */}
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: "#374151", fontSize: "13px" }}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                )}
              />

              {/* Define gradients for bars */}
              <defs>
                <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              {/* Bars */}
              <Bar
                dataKey="credit"
                fill="url(#creditGradient)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="debit"
                fill="url(#debitGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountChart;
