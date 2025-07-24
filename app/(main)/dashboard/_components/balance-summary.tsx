import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

type Balance = {
  youOwe: number;
  youAreOwed: number;
  totalBalance: number;
  oweDetails: {
    youOwe: Array<any>;
    youAreOwedBy: Array<any>;
  };
};

type BalanceSummaryProps = {
  balances: Balance;
};

const BalanceSummary = ({ balances }: BalanceSummaryProps) => {
  const { oweDetails } = balances;
  const hasOwed = oweDetails.youAreOwedBy.length > 0;
  const hasOwing = oweDetails.youOwe.length > 0;

  return (
    <div className="space-y-4">
      {hasOwed && (
        <div>
          <h3 className="flex items-center font-semibold mb-3">
            <ArrowUpCircle className="mr-2 text-green-500 " />
            Owed to you
          </h3>
          <div className="space-y-2">
            {oweDetails.youAreOwedBy.map((item) => (
              <Link
                href={`/person/${item.userId}`}
                key={item.userId}
                className="hover:bg-gray-100 rounded-md transition p-3 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.imageUrl} />
                    <AvatarFallback> {item.name.charAt(0)} </AvatarFallback>
                  </Avatar>
                  <span className="ml-2">{item.name}</span>
                </div>
                <span className="text-green-600 font-bold">
                  ${item.amount.toFixed(2)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      {hasOwing && (
        <div>
          <h3 className="flex items-center font-semibold mb-3">
            <ArrowDownCircle className="mr-2 text-red-500 " />
            You owe
          </h3>
          <div className="space-y-2">
            {oweDetails.youOwe.map((item) => (
              <Link
                href={`/person/${item.userId}`}
                key={item.userId}
                className="hover:bg-gray-100 rounded-md transition p-3 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.imageUrl} />
                    <AvatarFallback> {item.name.charAt(0)} </AvatarFallback>
                  </Avatar>
                  <span className="ml-2">{item.name}</span>
                </div>
                <span className="text-red-600 font-bold">
                  ${item.amount.toFixed(2)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSummary;
