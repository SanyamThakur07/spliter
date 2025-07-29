import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { id } from "date-fns/locale";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type User = {
  _id: Id<"users">;
  name: string;
  imageUrl: string | "";
};
type Member = {
  id: Id<"users">;
  name: string;
  imageUrl: string;
};
type Balance = Member & {
  totalBalance: number;
  owes: { to: string; amount: number }[];
  owedBy: { from: string; amount: number }[];
};

type GroupBalancesProps = {
  balances: Balance[];
};

const GroupBalances = ({ balances }: GroupBalancesProps) => {
  const { data: currentUser } = useConvexQuery(api.user.getCurrentUser) as {
    data: User | undefined;
  };

  if (!balances.length || !currentUser) {
    return (
      <div className="text-center py-5 text-gray-500">
        No balance information availble
      </div>
    );
  }
  const me = balances.find((b) => b.id === currentUser._id);

  if (!me) {
    return (
      <div className="text-center py-4 text-gray-500">
        You're not a part of this group
      </div>
    );
  }

  const userMap: Record<string, Balance> = Object.fromEntries(
    balances.map((b) => [b.id, b]),
  );

  const owedByMembers = me.owedBy.map(({ from, amount }) => ({
    ...userMap[from],
    amount,
  }));
  const owingToMembers = me.owes.map(({ to, amount }) => ({
    ...userMap[to],
    amount,
  }));
  const isAllSettledUp =
    me.totalBalance === 0 &&
    owedByMembers.length === 0 &&
    owingToMembers.length === 0;

  return (
    <div className="space-y-4">
      <div className="text-center pb-5 border-b">
        <p className="text-gray-500">Your balance</p>
        <p
          className={`text-2xl font-bold ${me.totalBalance > 0 ? "text-green-600" : me.totalBalance < 0 ? "text-red-600" : ""}`}
        >
          {me.totalBalance > 0
            ? `+$${me.totalBalance.toFixed(2)}`
            : me.totalBalance < 0
              ? `-$${Math.abs(me.totalBalance).toFixed(2)}`
              : `$0.00`}
        </p>
        <p className="text-gray-500">
          {me.totalBalance > 0
            ? `You are owed money`
            : me.totalBalance < 0
              ? `You owe money`
              : `You are all settled up`}
        </p>
      </div>
      {isAllSettledUp ? (
        <div className="text-center py-4">
          <p className="text-gray-500"> Everyone is settled up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {owedByMembers.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <ArrowUpCircle className="text-green-600 mr-2 h-4 w-4" />
                Owed to you
              </div>
              <div className="space-y-4">
                {owedByMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.imageUrl}></AvatarImage>
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                    <div>
                      <span className="text-lg font-medium text-green-600">
                        ${member.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {owingToMembers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center">
                <ArrowDownCircle className="mr-2 text-red-600 h-4 w-4" />
                You Owe
              </div>
              {owingToMembers.map((member) => (
                <div
                  key={member.id}
                  className="space-y-2 flex items-center justify-between"
                >
                  <div className="flex itesm-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.imageUrl || ""}></AvatarImage>
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                  <div>
                    <span className="text-red-600 text-lg font-medium">
                      ${member.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupBalances;
