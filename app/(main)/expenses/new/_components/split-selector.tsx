"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import React, { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
};

type Split = {
  userId: string;
  name: string;
  email: string;
  imageUrl: string;
  amount: number;
  percentage: number;
  paid: boolean;
};

type SplitSelectorProps = {
  type: "equal" | "percentage" | "exact";
  amount: number;
  paidByUserId: string;
  participants: User[];
  onSplitChange: (split: { userId: string; amount: number }[]) => void;
};

const SplitSelector = ({
  type,
  amount,
  paidByUserId,
  participants,
  onSplitChange,
}: SplitSelectorProps) => {
  const [splits, setSplits] = useState<Split[]>([]);

  useEffect(() => {
    if (!amount || amount <= 0 || participants.length === 0) {
      setSplits([]);
      if (onSplitChange) {
        onSplitChange([]);
      }
      return;
    }

    const totalCents = Math.round(amount * 100);
    const shareCents = Math.floor(totalCents / participants.length);
    const remainderCents = totalCents - shareCents * participants.length;

    const newSplits = participants.map((participant, index) => {
      const cents = shareCents + (index < remainderCents ? 1 : 0);
      const splitAmount = cents / 100;
      return {
        userId: participant.id,
        name: participant.name,
        email: participant.email,
        imageUrl: participant.imageUrl,
        amount: splitAmount,
        percentage: amount > 0 ? (splitAmount / amount) * 100 : 0,
        paid: participant.id === paidByUserId,
      };
    });

    setSplits(newSplits);

    if (onSplitChange) {
      onSplitChange(newSplits);
    }
  }, [type, amount, participants, paidByUserId, onSplitChange]);

  const updatePercentageSplit = (userId: string, newPercentage: number) => {
    const updatedSplits = splits.map((split) => {
      if (split.userId === userId) {
        return {
          ...split,
          percentage: newPercentage,
          amount: (amount * newPercentage) / 100,
        };
      }
      return split;
    });
    setSplits(updatedSplits);
    if (onSplitChange) {
      onSplitChange(updatedSplits);
    }
  };

  const updateExactSplit = (userId: string, newAmount: string) => {
    const parsedAmount = parseFloat(newAmount);
    const finalAmount = isNaN(parsedAmount) ? 0 : parsedAmount;

    const updatedSplits = splits.map((split) => {
      if (split.userId === userId) {
        return {
          ...split,
          amount: finalAmount,
          percentage: amount > 0 ? (finalAmount / amount) * 100 : 0,
        };
      }
      return split;
    });
    setSplits(updatedSplits);
    if (onSplitChange) {
      onSplitChange(updatedSplits);
    }
  };

  const totalAmount = splits.reduce((sum, split) => sum + split.amount, 0);
  const totalPercentage = splits.reduce(
    (sum, split) => sum + split.percentage,
    0,
  );

  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;
  const isAmountValid = Math.abs(totalAmount - amount) < 0.01;

  return (
    <div>
      {splits.map((split) => (
        <div
          key={split.userId}
          className="flex items-center justify-between gap-4 py-2"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={split.imageUrl} />
              <AvatarFallback>{split.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{split.name}</span>
          </div>
          {type == "equal" && (
            <div>
              ${split.amount.toFixed(2)} ({split.percentage.toFixed(1)}%)
            </div>
          )}
          {type === "percentage" && (
            <div className="flex items-center gap-4 flex-1">
              <Slider
                value={[split.percentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) =>
                  updatePercentageSplit(split.userId, values[0])
                }
                className="flex-1 "
              />
              <div className="flex gap-1 items-center min-w-[100px]">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={split.percentage.toFixed(1)}
                  onChange={(e) =>
                    updatePercentageSplit(
                      split.userId,
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-16 h-8"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <span className="text-sm ml-1">${split.amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {type === "exact" && (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1"></div>
              <div className="flex gap-1 items-center">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="0"
                  max={amount * 2}
                  step="0.01"
                  value={split.amount.toFixed(2)}
                  onChange={(e) =>
                    updateExactSplit(split.userId, e.target.value)
                  }
                  className="w-24 h-8"
                />
                <span className="text-sm text-muted-foreground ml-1">
                  ({split.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Total row */}
      <div className="flex justify-between border-t pt-3 mt-3">
        <span className="font-medium">Total</span>
        <div className="text-right">
          <span
            className={`font-medium ${!isAmountValid ? "text-amber-600" : ""}`}
          >
            ${totalAmount.toFixed(2)}
          </span>
          {type !== "equal" && (
            <span
              className={`text-sm ml-2 ${!isPercentageValid ? "text-amber-600" : ""}`}
            >
              ({totalPercentage.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Validation warnings */}
      {type === "percentage" && !isPercentageValid && (
        <div className="text-sm text-amber-600 mt-2">
          The percentages should add up to 100%.
        </div>
      )}

      {type === "exact" && !isAmountValid && (
        <div className="text-sm text-amber-600 mt-2">
          The sum of all splits (${totalAmount.toFixed(2)}) should equal the
          total amount (${amount.toFixed(2)}).
        </div>
      )}
    </div>
  );
};
export default SplitSelector;
