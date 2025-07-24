import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";

type User = {
  id: string;
  name: string;
  imageUrl: string;
};

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.optional(z.string()),
});

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedMembers, setselectedMembers] = useState<User[]>([]);
  const [searchQuery, setsearchQuery] = useState("");
  const [commandOpen, setcommandOpen] = useState(false);

  const createGroup = useConvexMutation(api.contacts.createGroup);
  const { data } = useConvexQuery(api.user.getCurrentUser);
  const currentUser = data as User | undefined;

  const { data: searchResult, isLoading: isSearching } = useConvexQuery(
    api.user.searchUsers,
    { query: searchQuery },
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(groupSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const addMember = (user: any) => {
    if (!selectedMembers.some((m) => m.id === user.id))
      setselectedMembers([...selectedMembers, user]);

    setcommandOpen(false);
  };

  const removeMember = (userId: any) => {
    setselectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const onSubmit = async (data: any) => {
    try {
      const memberIds = selectedMembers.map((m) => m.id);

      const groupId = await createGroup.mutate({
        name: data.name,
        description: data.description,
        createdBy: currentUser.id,
        members: memberIds,
      });

      reset();
      setselectedMembers([]);
      handleClose();
    } catch (e) {
      throw new Error("Failed to create group");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label> Group Name </Label>
              <Input
                id="name"
                placeholder="Enter group name"
                {...register("name")}
              />
            </div>
            <div className="space-y-2">
              <Label> Description (Optional) </Label>
              <Textarea
                id="description"
                placeholder="Enter group description"
                {...register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label> Members </Label>

              <div className="flex flex-wrap gap-2">
                {currentUser && (
                  <Badge variant={"secondary"} className="px-3 py-1">
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage src={currentUser.imageUrl}></AvatarImage>
                      <AvatarFallback>
                        {currentUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span> {currentUser.name} (You) </span>
                  </Badge>
                )}
                {selectedMembers.map((member) => (
                  <div key={member.id}>
                    <Badge variant={"secondary"} className="px-3 py-1">
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage src={member.imageUrl}></AvatarImage>
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span> {member.name}</span>
                      <button onClick={() => removeMember(member.id)}>
                        <X className="h-4 w-4 ml-1" />
                      </button>
                    </Badge>
                  </div>
                ))}
                <Popover open={commandOpen} onOpenChange={setcommandOpen}>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="flex">
                      <UserPlus className="h-3 w-3" />
                      Add members
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" side="bottom">
                    <Command>
                      <CommandInput
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onValueChange={setsearchQuery}
                      />
                      <CommandList>
                        <CommandGroup heading="Users">
                          <CommandEmpty>No results found.</CommandEmpty>
                          {searchResult?.map((user: any) => (
                            <CommandItem
                              key={user.id}
                              value={user.name + user.email}
                              onSelect={() => addMember(user)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.imageUrl} />
                                  <AvatarFallback>
                                    {user.name.charAt(0)}{" "}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span>{user.name}</span>
                                  <span className="text-gray-500">
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
              </div>
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button type="button" variant={"outline"} onClick={handleClose}>
              {" "}
              Close{" "}
            </Button>
            <Button type="submit"> Create Group </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
