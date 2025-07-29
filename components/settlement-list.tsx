import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexQuery } from "@/hooks/use-convex-query";
import React from "react";
import { Card, CardContent } from "./ui/card";
import { ArrowLeftRight, ReceiptIcon } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";

type User = {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
};

type SettlmentListProps = {
  settlements: any[];
  isGroupSettlement: boolean;
  userLookUpMap?: Record<
    string,
    { name: string; imageUrl: string; id: Id<"users"> }
  >;
};
export const SettlementsList = ({
  settlements,
  isGroupSettlement = false,
  userLookUpMap = {},
}: SettlmentListProps) => {
  const { data: currentUser } = useConvexQuery(api.user.getCurrentUser) as {
    data: User | undefined;
  };

  if (!settlements || !settlements.length) {
    return (
      <Card className="p-10 text-center text-gray-500">
        <CardContent>No settlements found</CardContent>
      </Card>
    );
  }

  const getUserDetail = (userId: Id<"users">) => {
    return {
      name:
        userId === currentUser?._id
          ? "You"
          : userLookUpMap[userId]?.name || "Other user",
      imageUrl: null,
      id: userId,
    };
  };
  return (
    <div className="flex flex-col gap-2">
      {settlements.map((settlement) => {
        const payer = getUserDetail(settlement.paidByUserId);
        const receiver = getUserDetail(settlement.receivedByUserId);
        const isCurrentUserPayer = settlement.paidByUserId === currentUser?._id;
        const isCurrentUserReceiver =
          settlement.receivedByUserId === currentUser?._id;

        return (
          <Card key={settlement._id} className="py-8">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-gray-200 p-2">
                    <ArrowLeftRight className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {isCurrentUserPayer
                        ? `You paid ${receiver.name}`
                        : isCurrentUserReceiver
                          ? `${payer.name} paid you`
                          : `${payer.name} paid ${receiver.name}`}
                    </div>
                    <div className="text-gray-500 text-sm flex items-center">
                      <span>
                        {format(new Date(settlement.date), "MMM d, yyyy")}
                      </span>
                      {settlement.note && (
                        <div className="ml-3">
                          <span className="mr-1">•</span>
                          <span>{settlement.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-medium">
                    ${settlement.amount.toFixed(2)}
                  </div>
                  {isGroupSettlement ? (
                    <div>
                      <Badge className="mt-1" variant={"outline"}>
                        Group settlement
                      </Badge>
                    </div>
                  ) : (
                    <div>
                      {isCurrentUserPayer ? (
                        <span className="text-red-600">You paid</span>
                      ) : isCurrentUserReceiver ? (
                        <span className="text-green-600">You received</span>
                      ) : (
                        <span>Payment</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
