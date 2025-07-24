import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type MonthlySpending = {
  month: string;
  total: number;
};

type ExpenseSummaryProps = {
  monthlySpending: MonthlySpending[];
  totalSpent: number;
};

const ExpenseSummary = ({
  monthlySpending,
  totalSpent,
}: ExpenseSummaryProps) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = monthlySpending.map((item) => {
    const date = new Date(item.month);
    return {
      name: monthNames[date.getMonth()],
      amount: item.total,
    };
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-lg">Expense Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-500"> Total this month </p>
            <div className="text-2xl font-bold">
              {monthlySpending?.[currentMonth].total.toFixed(2) || "0.00"}
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-500"> Total this year </p>
            <div className="text-2xl font-bold">
              $ {totalSpent?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>
        <div className="h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart width={150} height={40} data={chartData}>
              <CartesianGrid strokeDasharray={"3 3"} vertical={false} />
              <XAxis dataKey={"name"} />
              <YAxis dataKey={"amount"} />
              <Tooltip
                formatter={(value) => [
                  typeof value === "number" ? value.toFixed(2) : value,
                  "Amount",
                ]}
                labelFormatter={() => "Spending"}
              />

              <Bar dataKey="amount" fill="#36d7b7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-gray-500 text-center text-sm">
          Monthly spending for {currentYear}
        </p>
      </CardContent>
    </Card>
  );
};
export default ExpenseSummary;
