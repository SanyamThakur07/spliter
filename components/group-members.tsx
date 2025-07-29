import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexQuery } from "@/hooks/use-convex-query";
import React from "react";
import { moveMessagePortToContext } from "worker_threads";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

type User = {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
};
type Member = {
  id: Id<"users">;
  name: string;
  imageUrl: string;
  role: string;
};
type GroupMemberProps = {
  members: Member[];
};
const GroupMembers = ({ members }: GroupMemberProps) => {
  const { data: currentUser } = useConvexQuery(api.user.getCurrentUser) as {
    data: User | undefined;
  };

  if (!members || !members.length) {
    return (
      <div className="text-center text-gray-500 py-6">
        No members in this group
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const isCurrentUser = member.id === currentUser?._id;
        const isAdmin = member.role === "admin";

        return (
          <div className="relative flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.imageUrl} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span>{member.name}</span>
              <div>
                {isAdmin && (
                  <span className="text-gray-500 text-sm">Admin</span>
                )}
              </div>
            </div>
            <div>
              {isCurrentUser && (
                <Badge
                  variant={"outline"}
                  className="absolute top-1 py-0 rounded-md h-5 font-medium"
                >
                  You
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupMembers;
