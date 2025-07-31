"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseForm from "./_components/expense-form";
import { useRouter } from "next/navigation";

const NewExpensePage = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="my-5 space-y-2">
        <h1 className="gradient-title font-bold text-5xl">
          {" "}
          Add a new Expense
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          Record a new expense to split with others
        </p>
      </div>
      <Card>
        <CardContent>
          <Tabs defaultValue="individual">
            <TabsList className="w-full">
              <TabsTrigger value="individual">Individual Expense</TabsTrigger>
              <TabsTrigger value="group">Group Expense</TabsTrigger>
            </TabsList>
            <TabsContent value="individual">
              <ExpenseForm
                type="individual"
                onSuccess={(id) => router.push(`/person/${id}`)}
              />
            </TabsContent>
            <TabsContent value="group">
              <ExpenseForm
                type="group"
                onSuccess={(id) => router.push(`/group/${id}`)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewExpensePage;
