"use client";

import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { BarLoader } from "react-spinners";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useRouter, useSearchParams } from "next/navigation";
import CreateGroupModal from "./_components/create-group-modal";
import Link from "next/link";

const ContactsPage = () => {
  const [isCreateGroupModal, setisCreateGroupModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading } = useConvexQuery(api.contacts.getAllContacts);

  useEffect(() => {
    const createGroupParams = searchParams.get("createGroup");
    if (createGroupParams === "true") {
      setisCreateGroupModal(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("createGroup");
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  const { users, groups } = data || { users: [], groups: [] };
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between px-7 pt-10">
        <h1 className="gradient-title text-5xl font-bold">Contacts</h1>
        <Button onClick={() => setisCreateGroupModal(true)}>
          Create Group
          <Plus className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-6 px-8 pt-7">
        <div>
          <h2 className="mb-5 flex items-center gap-4 text-xl font-bold">
            <User className="h-7 w-7" />
            People
          </h2>
          {users.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-gray-500">
                No contacts yet. Add an expense with someone to see them here.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {users.map((user: any) => (
                <Link href={`/person/${user.id}`} key={user.id}>
                  <Card className="py-8">
                    <CardContent className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={user.imageUrl}
                          className="h-10 w-10 rounded-full"
                        />
                        <AvatarFallback> {user.name.charAt(0)} </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-gray-500">{user.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <div>
            <h2 className="mb-5 flex items-center gap-4 text-xl font-bold">
              <Users className="h-7 w-7" />
              Group
            </h2>
            {groups.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-gray-500">
                  No groups yet. Create a group to start tracking shared
                  expenses.
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {groups.map((group: any) => (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <Card className="py-8">
                      <CardContent className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold">{group.name}</p>
                          <p className="text-gray-500">
                            {group.memberCount} members
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModal}
        onClose={() => setisCreateGroupModal(false)}
        onSuccess={(groupId: any) => router.push(`/groups/${groupId}`)}
      />
    </div>
  );
};

export default ContactsPage;
