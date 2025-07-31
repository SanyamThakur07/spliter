"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexQuery } from "@/hooks/use-convex-query";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

type User = {
  id: Id<"users">;
  name: string;
  email: string;
  imageUrl: string;
};

type Group = {
  id: Id<"groups">;
  name: string;
  members: User[];
};

type ConvexGroup = {
  id: Id<"groups">;
  name: string;
  memberCount: number;
};

type ConvexQueryResult = {
  groups: ConvexGroup[];
  selectedGroup?: Group;
};

type GroupSelectorProps = {
  onChange: (group: Group) => void;
};

const GroupSelector = ({ onChange }: GroupSelectorProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const { data } = useConvexQuery(
    api.groups.getGroupOrMembers,
    selectedGroupId ? { groupId: selectedGroupId } : {},
  ) as { data: ConvexQueryResult | undefined };

  useEffect(() => {
    if (data?.selectedGroup) {
      onChange(data.selectedGroup);
    }
  }, [data, onChange]);

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  if (!data?.groups || data.groups.length === 0) {
    return (
      <div className="text-sm text-amber-600 p-2 bg-amber-100 rounded-md">
        You need to create a group first before adding group expense
      </div>
    );
  }

  return (
    <Select value={selectedGroupId} onValueChange={handleGroupChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a group" />
      </SelectTrigger>
      <SelectContent>
        {data.groups.map((group) => (
          <SelectItem key={group.id} value={group.id}>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-300 p-1">
                <Users />
              </div>
              <span>{group.name}</span>
              <span>({group.memberCount} members)</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default GroupSelector;
