"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { getAllCategories } from "@/lib/expense-categories";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z, { date } from "zod";
import CategorySelector from "./category-selector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import GroupSelector from "./group-selector";
import ParticipantSelector from "./participant-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SplitSelector from "./split-selector";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().optional(),
  date: z.date(),
  paidByUserId: z.string().min(1, "Payer is required"),
  splitType: z.enum(["equal", "percentage", "exact"]),
  groupId: z.string().optional(),
});

type User = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
};
type Group = {
  id: string;
  name: string;
  members: User[];
};
type Splits = {
  userId: string;
  amount: number;
  paid?: boolean;
};
type ExpenseFormProps = {
  type: "individual" | "group";
  onSuccess: (id: string) => void;
};

const ExpenseForm = ({ type = "individual", onSuccess }: ExpenseFormProps) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [splits, setSplits] = useState<Splits[]>([]);

  const { data: currentUser } = useConvexQuery(api.user.getCurrentUser) as {
    data: User | undefined;
  };
  const createExpense = useConvexMutation(api.expenses.createExpense);
  const categories = getAllCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date(),
      paidByUserId: "",
      splitType: "equal",
      groupId: undefined,
    },
  });

  const amountValue = watch("amount");
  const paidByUserId = watch("paidByUserId");

  useEffect(() => {
    if (participants.length === 0 && currentUser) {
      setParticipants([
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl,
        },
      ]);
    }
  }, [currentUser, participants.length]);

  useEffect(() => {
    if (participants.length > 0 && !paidByUserId) {
      setValue("paidByUserId", participants[0].id);
    }
  }, [participants, paidByUserId, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const amount = parseFloat(data.amount);

      // Validate that we have splits
      if (splits.length === 0) {
        toast.error("Please wait for the splits to be calculated.");
        return;
      }

      const formattedSplits = splits.map((split) => ({
        userId: split.userId,
        amount: split.amount,
        paid: split.userId === data.paidByUserId, // Set paid to true for the person who paid
      }));

      const totalSplitAmount = formattedSplits.reduce(
        (sum, spilt) => sum + spilt.amount,
        0,
      );
      const tolerance = 0.01;

      if (Math.abs(totalSplitAmount - amount) > tolerance) {
        toast.error(
          `Split amount doesn't add up to the total. Please adjust your splits.`,
        );
        return;
      }

      const groupId = type === "individual" ? undefined : data.groupId;

      await createExpense.mutate({
        description: data.description,
        amount: amount,
        category: data.category || "Other",
        date: data.date.getTime(),
        paidByUserId: data.paidByUserId,
        splitType: data.splitType,
        splits: formattedSplits,
        groupId,
      });

      toast.success("Expense created successfully");
      reset();
      const otherParticipant = participants.find(
        (p) => p.id !== currentUser?.id,
      );
      const otherParticipantId = otherParticipant?.id;
      if (onSuccess)
        onSuccess(type === "individual" ? otherParticipantId : groupId);
    } catch (error) {
      toast.error("Failed to create expense");
    }
  };
  if (!currentUser) return null;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="description" className="font-medium mb-2">
            Description
          </Label>
          <Input
            id="description"
            placeholder="Lunch, movie, tickets, etc."
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="amount" className="font-medium mb-2">
            Amount
          </Label>
          <Input id="amount" placeholder="0.00" {...register("amount")} />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="category" className="font-medium mb-2">
            Category
          </Label>
          <CategorySelector
            categories={categories}
            onChange={(categoryId: any) => {
              if (categoryId) setValue("category", categoryId);
            }}
          />
        </div>
        <div>
          <Label className="font-medium mb-2">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-3" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  setSelectedDate(date);
                  setValue("date", date);
                }}
                className="rounded-lg"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {type === "group" && (
        <div className="mt-4">
          <Label className="font-medium mb-2">Group</Label>
          <GroupSelector
            onChange={(group) => {
              if (!selectedGroup || selectedGroup.id !== group.id) {
                setSelectedGroup(group);
                setValue("groupId", group.id);
              }

              if (group.members && Array.isArray(group.members)) {
                setParticipants(group.members);
              }
            }}
          />
        </div>
      )}

      {type === "individual" && (
        <div className="mt-4">
          <Label className="font-medium mb-2">Participants</Label>
          <ParticipantSelector
            participants={participants}
            onParticipantsChange={setParticipants}
          />
          {participants.length <= 1 && (
            <p className="text-sm text-red-500">
              Please add atleast one more participant
            </p>
          )}
        </div>
      )}
      <div className="mt-4">
        <Label className="font-medium mb-2">Paid by</Label>
        <Select
          value={paidByUserId}
          onValueChange={(value) => setValue("paidByUserId", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select who paid" />
          </SelectTrigger>
          <SelectContent>
            {participants.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                <span>
                  {String(p.id) === String(currentUser.id) ? "You" : p.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.paidByUserId && (
          <p className="text-sm text-red-500">{errors.paidByUserId.message}</p>
        )}
      </div>
      <div className="mt-4">
        <Label className="mb-2 font-medium">Split type</Label>
        <Tabs
          defaultValue="equal"
          onValueChange={(value) => setValue("splitType", value)}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="equal">Equal</TabsTrigger>
            <TabsTrigger value="percentage">Percentage</TabsTrigger>
            <TabsTrigger value="exact">Exact Amounts</TabsTrigger>
          </TabsList>
          <TabsContent value="equal" className="pt-4">
            <p className="text-sm text-gray-500 ">
              Split equally among all participants
            </p>
            <SplitSelector
              type="equal"
              amount={parseFloat(amountValue) || 0}
              paidByUserId={paidByUserId}
              participants={participants}
              onSplitChange={setSplits}
            />
          </TabsContent>
          <TabsContent value="percentage" className="pt-4">
            <p className="text-sm text-gray-500">Split by percentage</p>
            <SplitSelector
              type="percentage"
              amount={parseFloat(amountValue) || 0}
              paidByUserId={paidByUserId}
              participants={participants}
              onSplitChange={setSplits}
            />
          </TabsContent>
          <TabsContent value="exact" className="pt-4">
            <p className="text-sm text-gray-500">Enter exact amount</p>
            <SplitSelector
              type="exact"
              amount={parseFloat(amountValue) || 0}
              paidByUserId={paidByUserId}
              participants={participants}
              onSplitChange={setSplits}
            />
          </TabsContent>
        </Tabs>
        <div className="justiyfy-end text-right mt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Expense"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ExpenseForm;
