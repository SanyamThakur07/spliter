"use client";

import GroupBalances from "@/components/group-balances";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { ArrowLeft, ArrowLeftRight, PlusCircle, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import ExpenseList from "@/components/expense-list";
import { SettlementsList } from "@/components/settlement-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import GroupMembers from "@/components/group-members";

type Group = {
  id: Id<"groups">;
  name: string;
  description: string;
};
type Member = {
  id: Id<"users">;
  name: string;
  imageUrl: string;
  role: string;
};
type Balance = Member & {
  totalBalance: number;
  owes: { to: string; amount: number }[];
  owedBy: { from: string; amount: number }[];
};
type GroupData = {
  group: Group;
  members: Member[];
  expenses: any[];
  settlements: any[];
  balances: Balance[];
  userLookUpMap: Record<string, Member>;
};

const GroupExpensePage = () => {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("expenses");

  const { data } = useConvexQuery(api.groups.getGroupExpenses, {
    groupId: params.id,
  }) as { data: GroupData | undefined };

  const group = data?.group;
  const members = data?.members || [];
  const expenses = data?.expenses || [];
  const settlements = data?.settlements || [];
  const balances = data?.balances || [];
  const userLookUpMap = data?.userLookUpMap;

  return (
    <div className="container mx-auto p-6 max-w-5xl ">
      <div className="mb-6">
        <Button size={"sm"} variant={"outline"} onClick={() => router.back()}>
          <ArrowLeft /> Back
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-md bg-gray-200 p-3">
            <Users className="h-10 w-10" />
          </div>
          <div>
            <h1 className="gradient-title font-bold text-4xl">{group?.name}</h1>
            <p className="text-md font-medium text-gray-500">
              {group?.description}
            </p>
            <p className="text-gray-500">{members?.length} members</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Button asChild variant={"outline"}>
              <Link href={`/settlements/group/${params.id}`}>
                <ArrowLeftRight /> Settle up
              </Link>
            </Button>
            <Button asChild>
              <Link href={"/expenses/new"}>
                <PlusCircle /> Add expense
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5  mt-4">
        <div className="grid col-span-2">
          <Card className="px-5 py-7">
            <CardTitle className="text-xl font-bold pb-3">
              Group Balances
            </CardTitle>
            <CardContent>
              <GroupBalances balances={balances} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="py-7">
            <CardTitle className="text-xl font-bold px-6">Members</CardTitle>
            <CardContent>
              <GroupMembers members={members} />
            </CardContent>
          </Card>
        </div>
      </div>
      <Tabs
        defaultValue="expenses"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-4"
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
            showOtherPerson={false}
            isGroupExpense={true}
            otherPersonId={params.id as Id<"users">}
            userLookUpMap={userLookUpMap}
          />
        </TabsContent>
        <TabsContent value="settlements" className="space-y-4 mt-2">
          <SettlementsList
            settlements={settlements}
            isGroupSettlement={true}
            userLookUpMap={userLookUpMap}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupExpensePage;
