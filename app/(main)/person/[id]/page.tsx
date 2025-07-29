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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { ArrowLeft, ArrowLeftRight, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import ExpenseList from "@/components/expense-list";
import { SettlementsList } from "@/components/settlement-list";

type ExpenseData = {
  expenses: any[];
  settlements: any[];
  balance: number;
  otherUser: {
    id: Id<"users">;
    name: string;
    email: string;
    imageUrl: string;
  };
};

const PersonExpensePage = () => {
  const [activeTab, setActiveTab] = useState("expenses");
  const params = useParams();
  const router = useRouter();

  const { data } = useConvexQuery(api.expenses.getExpensesBetweenUsers, {
    userId: params.id as Id<"users">,
  }) as { data: ExpenseData | undefined };

  const otherUser = data?.otherUser;
  const expenses = data?.expenses || [];
  const settlements = data?.settlements || [];
  const balance = data?.balance || 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant={"outline"} onClick={() => router.back()} size={"sm"}>
          <ArrowLeft />
          Back
        </Button>
      </div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <Avatar className="h-15 w-15">
            <AvatarImage src={otherUser?.imageUrl || ""} />
            <AvatarFallback> {otherUser?.name.charAt(0)} </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h1 className="text-4xl gradient-title font-bold">
              {" "}
              {otherUser?.name}{" "}
            </h1>
            <p className="text-gray-500"> {otherUser?.email} </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant={"outline"}>
            <Link href={`/settlements/user/${params.id}`}>
              <ArrowLeftRight />
              Settle up
            </Link>
          </Button>

          <Button asChild>
            <Link href={"/expenses/new"}>
              <PlusCircle />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {balance === 0 ? (
                <p>You are all settled up</p>
              ) : balance > 0 ? (
                <p>
                  <span className="font-medium text-lg">{otherUser?.name}</span>{" "}
                  owes you
                </p>
              ) : (
                <p>
                  You owe <span>{otherUser?.name}</span>
                </p>
              )}
            </div>
            <div
              className={`text-2xl font-bold ${balance > 0 ? "text-green-600" : "text-red-500"}`}
            >
              ${Math.abs(balance).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs
        defaultValue="expenses"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full">
          <TabsTrigger value="expenses">
            Expenses ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="settlements">
            Settlements ({settlements.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="space-y-4 mt-2">
          <ExpenseList
            expenses={expenses}
            showOtherPerson={true}
            isGroupExpense={false}
            otherPersonId={params.id as Id<"users">}
            userLookUpMap={
              otherUser ? { [otherUser.id.toString()]: otherUser } : {}
            }
          />
        </TabsContent>
        <TabsContent value="settlements" className="space-y-4 mt-2">
          <SettlementsList
            settlements={settlements}
            isGroupSettlement={false}
            userLookUpMap={
              otherUser ? { [otherUser.id.toString()]: otherUser } : {}
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonExpensePage;
