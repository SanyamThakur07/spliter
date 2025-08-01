"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { UserPlus, X } from "lucide-react";
import React, { use, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type User = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
};
type ParticipantSelectorProps = {
  participants: User[];
  onParticipantsChange: (updatedUser: User[]) => void;
};
const ParticipantSelector = ({
  participants,
  onParticipantsChange,
}: ParticipantSelectorProps) => {
  const { data: currentUser } = useConvexQuery(api.user.getCurrentUser) as {
    data: User | undefined;
  };
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResult } = useConvexQuery(api.user.searchUsers, {
    query: searchQuery,
  }) as { data: User[] | undefined };

  const addParticipant = (user: User) => {
    if (participants.some((p) => p.id === user.id)) {
      return;
    }
    onParticipantsChange([...participants, user]);
    setOpen(false);
    setSearchQuery("");
  };
  const deleteParticipant = (userId: any) => {
    if (userId === currentUser?.id) {
      return;
    }
    onParticipantsChange(participants.filter((p) => p.id !== userId));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {participants.map((p) => (
        <Badge key={p.id} variant={"secondary"} className="py-2 px-3">
          <Avatar className="h-5 w-5">
            <AvatarImage src={p.imageUrl} />
            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{p.id === currentUser?.id ? "You" : p.name || p.email}</span>
          {p.id !== currentUser?.id && (
            <Button
              type="button"
              variant={"ghost"}
              onClick={() => deleteParticipant(p.id)}
              className="h-3 w-3"
            >
              <X className="ml-1" />
            </Button>
          )}
        </Badge>
      ))}
      {participants.length < 2 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant={"outline"}>
              <UserPlus />
              Add person
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Command>
              <CommandInput
                placeholder="Search by name or email..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandGroup heading="Users">
                  <CommandEmpty>No users found.</CommandEmpty>
                  {searchResult?.map((user: User) => (
                    <CommandItem
                      key={user.id}
                      value={user.name + user.email}
                      onSelect={() => addParticipant(user)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">{user.name}</span>
                          <span className="text-xs text-gray-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
export default ParticipantSelector;
