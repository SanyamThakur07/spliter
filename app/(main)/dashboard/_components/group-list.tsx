import { Users } from "lucide-react";
import Link from "next/link";
import React from "react";

type Group = {
  id: string;
  name: string;
  members: { userId: string; role: string; joinedAt: number }[];
  balance: number;
};

type GroupListProps = {
  groups: Group[];
};

const GroupList = ({ groups }: GroupListProps) => {
  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const balance = group.balance;
        const hasBalance = balance !== 0;

        return (
          <Link
            href={`/groups/${group.id}`}
            key={group.id}
            className=" hover:bg-gray-100 transition p-3 rounded-md flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className=" bg-gray-200  rounded-md flex items-center justify-center p-2">
                <Users />
              </div>
              <div className="ml-3">
                <p className="text-md font-medium">{group.name}</p>
                <p className="text-sm text-gray-500">
                  {group.members.length} members
                </p>
              </div>
            </div>
            {hasBalance && (
              <div
                className={`text-md font-bold ${
                  balance > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {balance > 0 ? "+" : ""}${group.balance.toFixed(2)}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default GroupList;
