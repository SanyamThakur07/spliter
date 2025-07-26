"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { ChevronRight, PlusCircle, Users } from "lucide-react";
import React from "react";
import { BarLoader } from "react-spinners";
import ExpenseSummary from "./_components/expense-summary";
import Link from "next/link";
import BalanceSummary from "./_components/balance-summary";
import GroupList from "./_components/group-list";

type Balance = {
  youOwe: number;
  youAreOwed: number;
  totalBalance: number;
  oweDetails: {
    youOwe: Array<any>;
    youAreOwedBy: Array<any>;
  };
};

const DashboardPage = () => {
  const { data: balances, isLoading: balancesLoading } = useConvexQuery(
    api.dashboard.getUserBalances,
  );
  const { data: groups, isLoading: groupsLoading } = useConvexQuery(
    api.dashboard.getUserGroups,
  );
  const { data: totalSpent, isLoading: totolSpentLoading } = useConvexQuery(
    api.dashboard.getTotalSpend,
  );
  const { data: monthlySpending, isLoading: monthlySpendingLoading } =
    useConvexQuery(api.dashboard.getMonthlySpending);

  const isLoading =
    balancesLoading ||
    groupsLoading ||
    totolSpentLoading ||
    monthlySpendingLoading;

  return (
    <div>
      {isLoading ? (
        <div>
          <BarLoader width={"100%"} color="#36d7b7" />
        </div>
      ) : (
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between gap-6 pt-5 mb-4">
            <h1 className="gradient-title font-bold text-5xl"> Dashboard </h1>
            <Button asChild>
              <Link href="/expenses/new">
                <PlusCircle className="mr-1" /> Add Expense
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-medium text-gray-500">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {balances ? (
                    (balances as Balance).totalBalance > 0 ? (
                      <span className="text-green-600">
                        +$
                        {(balances as Balance).totalBalance.toFixed(2)}
                      </span>
                    ) : (balances as Balance).totalBalance < 0 ? (
                      <span className="text-red-600">
                        ${(balances as Balance).totalBalance.toFixed(2)}
                      </span>
                    ) : (
                      <span>$0.00</span>
                    )
                  ) : null}
                </div>
                <p className="text-sm text-gray-500">
                  {balances
                    ? (balances as Balance).totalBalance > 0
                      ? "You are owed money"
                      : (balances as Balance).totalBalance < 0
                        ? "You owe money"
                        : "All settled up!"
                    : null}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-medium text-gray-500">
                  You are owed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-green-600">
                  {balances
                    ? `$${(balances as Balance).youAreOwed.toFixed(2)}`
                    : "$0.00"}
                </div>
                <p className="text-sm text-gray-500">
                  {balances
                    ? `From ${(balances as Balance).oweDetails.youAreOwedBy.length || 0} people`
                    : "From 0 people"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-medium text-gray-500">
                  You owe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balances ? (
                  (balances as Balance).oweDetails.youOwe.length > 0 ? (
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        ${(balances as Balance).youOwe.toFixed(2)}
                      </div>
                      <p className="text-gray-500 text-sm">
                        To {(balances as Balance).oweDetails.youOwe.length}{" "}
                        People
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold"> $0.00 </div>
                      <p className="text-sm text-gray-500">
                        You don't owe anyone
                      </p>
                    </div>
                  )
                ) : (
                  <div>
                    <div className="text-2xl font-bold"> $0.00 </div>
                    <p className="text-sm text-gray-500">
                      You don't owe anyone
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <ExpenseSummary
                monthlySpending={monthlySpending ?? []}
                totalSpent={totalSpent ?? 0}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      Balance Details
                    </CardTitle>
                    <Button
                      asChild
                      variant={"link"}
                      className="font-bold text-gray-500"
                    >
                      <Link href={"/contacts"}>
                        View all
                        <ChevronRight />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {balances && (
                    <BalanceSummary balances={balances as Balance} />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      Your Groups
                    </CardTitle>
                    <Button
                      asChild
                      variant={"link"}
                      className="font-bold text-gray-500"
                    >
                      <Link href={"/contacts"}>
                        View all
                        <ChevronRight />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <GroupList groups={groups ?? []} />
                </CardContent>
                <CardFooter>
                  <Button asChild variant={"outline"} className="w-full">
                    <Link href={"/contacts?createGroup=true"}>
                      <Users className="h-4 w-4 mr-2" />
                      Create new group
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
