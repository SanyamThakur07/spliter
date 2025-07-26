import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { getCategoryById, getCategoryIcon } from "@/lib/expense-categories";
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
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type User = {
  _id: Id<"users">;
  name: string;
  email: string;
  imageUrl: string;
};

type ExpenseListProps = {
  expenses: any[];
  showOtherPerson?: boolean;
  isGroupExpense?: boolean;
  otherPersonId?: Id<"users"> | null;
  userLookUpMap?: Record<
    string,
    { name: string; imageUrl: string; id: Id<"users"> }
  >;
};

const ExpenseList = ({
  expenses,
  showOtherPerson = true,
  isGroupExpense = false,
  otherPersonId = null,
  userLookUpMap = {},
}: ExpenseListProps) => {
  const { data: currentUser } = useConvexQuery(api.user.getCurrentUser) as {
    data: User | undefined;
  };
  const deleteExpense = useConvexMutation(api.expenses.deleteExpense);

  const getUserDetail = (userId: Id<"users">) => {
    return {
      name:
        userId === currentUser?._id
          ? "You"
          : userLookUpMap[userId.toString()]?.name || "Other User",
      imageUrl: userLookUpMap[userId.toString()]?.imageUrl || null,
      id: userId,
    };
  };

  const canDeleteExpense = (expense: any) => {
    if (!currentUser) return false;

    return (
      expense.createdBy === currentUser._id ||
      expense.paidByUserId === currentUser._id
    );
  };

  const handleDeleteExpense = async (expense: any) => {
    try {
      await deleteExpense.mutate({ expenseId: expense._id });
      return { success: true };
    } catch (e) {
      throw new Error("Failed to delete expense");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {expenses.map((expense) => {
        const payer = getUserDetail(expense.paidByUserId);
        const isCurrentUserPayer = expense.paidByUserId === currentUser?._id;
        const category = getCategoryById(expense.category);
        const CategoryIcon = getCategoryIcon(category.id);
        const showDeleteOption = canDeleteExpense(expense);

        return (
          <Card key={expense._id}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 p-2 rounded-full">
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div>{expense.description}</div>
                    <div>
                      <span className="text-sm text-gray-500">
                        {" "}
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div>
                    <div className="font-medium text-lg">
                      ${expense.amount.toFixed(2)}
                    </div>
                    {isGroupExpense ? (
                      <Badge variant={"outline"} className="mt-1">
                        Group Expense
                      </Badge>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {isCurrentUserPayer ? (
                          <span> You paid</span>
                        ) : (
                          <span>{payer.name} paid</span>
                        )}
                      </div>
                    )}
                  </div>
                  {showDeleteOption && (
                    <Button
                      variant={"ghost"}
                      onClick={() => handleDeleteExpense(expense)}
                      className="rounded-full hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-2 w-2 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {expense.splits.map((split: any, idx: any) => {
                    const splitUser = getUserDetail(split.userId);
                    const isCurrentUser = split.userId === currentUser?._id;

                    const shouldShow =
                      showOtherPerson ||
                      (!showOtherPerson &&
                        (split.userId === currentUser?._id ||
                          split.userId === otherPersonId));

                    if (!shouldShow) return null;

                    return (
                      <Badge
                        key={idx}
                        variant={split.paid ? "outline" : "secondary"}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={splitUser.imageUrl || ""} />
                          <AvatarFallback>
                            {splitUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {isCurrentUser ? "You" : splitUser.name}: $
                          {split.amount}
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ExpenseList;
