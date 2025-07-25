import { v } from "convex/values";
import { query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

type GroupMembers = {
    id: Id<"users">
    name: string,
    email: string,
    imageUrl: string,
    role: string,
}

type SelectedGroup = {
    id: Id<"groups">
    name: string,
    description: string,
    createdBy: Id<"users">,
    members: GroupMembers[],
}

type GroupSummary = {
    id: Id<"groups">;
    name: string;
    description: string;
    memberCount: number;
}

type GetGroupOrMembersReturn = {
    selectedGroup: SelectedGroup | null;
    groups: GroupSummary[];
}
export const getGroupOrMembers = query({
    args: {
        groupId: v.optional(v.id("groups"))
    },
    handler: async (ctx, args): Promise<GetGroupOrMembersReturn> => {
        const currentUser = await ctx.runQuery((internal as any).user.getCurrentUser);

        const allGroups = await ctx.db.query("groups").collect();
        const userGroups = allGroups.filter((group) =>
            group.members.some((member) =>
                member.userId === currentUser._id)
        );

        if (args.groupId) {
            const selectedGroup = userGroups.find((group) =>
                group._id === args.groupId
            );

            if (!selectedGroup) {
                throw new Error("Group not found or you're not a member")
            }
            const memberDetails = await Promise.all(
                selectedGroup.members.map(async (member) => {
                    const user = await ctx.db.get(member.userId);

                    if (!user) return null;

                    return {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                        role: member.role,
                    };
                })
            );
            const validMembers = memberDetails.filter((member) => member !== null);

            return {
                selectedGroup: {
                    id: selectedGroup._id,
                    name: selectedGroup.name,
                    description: selectedGroup.description,
                    createdBy: selectedGroup.createdBy,
                    members: validMembers,
                },
                groups: userGroups.map((group) => ({
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    memberCount: group.members.length,
                })),
            };
        }
        else {

            return {
                selectedGroup: null,
                groups: userGroups.map((group) => ({
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    memberCount: group.members.length,
                })),
            };
        }

    },
});

export const getGroupExpenses = query({
    args: {
        groupId: v.id("groups")
    },
    handler: async (ctx, { groupId }) => {

        const currentUser = await ctx.runQuery((internal as any).user.getCurrentUser);

        const group = await ctx.db.get(groupId);
        if (!group) throw new Error("Group not found");

        if (!group.members.some((m) => m.userId === currentUser._id)) throw new Error("You are not a member of this group");

        const expenses = await ctx.db.query("expenses")
            .withIndex("by_group", (q) => q.eq("groupId", groupId))
            .collect();

        const settlements = await ctx.db.query("settlements")
            .withIndex("by_group", (q) => q.eq("groupId", groupId))
            .collect();

        const memeberDetails = await Promise.all(
            group.members.map(async (member) => {
                const u = await ctx.db.get(member.userId);
                return {
                    id: u?._id,
                    name: u?.name,
                    imageUrl: u?.imageUrl,
                    role: member.role,
                };
            })
        );
        const ids = memeberDetails.map((m) => m.id);

        const totals = Object.fromEntries(ids.map((id) => [id, 0]));
        const ledger = {};

        ids.forEach((a) => {
            ledger[a] = {};
            ids.forEach((b) => {
                if (a !== b) ledger[a][b] = 0;
            });
        });

        for (const exp of expenses) {
            const Payer = exp.paidByUserId;

            for (const split of exp.splits) {
                if (split.userId === Payer || split.paid) continue;

                const debtor = split.userId;
                const amt = split.amount;

                totals[Payer] += amt;
                totals[debtor] += amt;

                ledger[debtor][Payer] += amt;
            }
        }

        for (const s of settlements) {
            totals[s.paidByUserId] += s.amount;
            totals[s.receivedByUserId] -= s.amount;

            ledger[s.paidByUserId][s.receivedByUserId] -= s.amount;

        }

        ids.forEach((a) => {
            ids.forEach((b) => {
                if (a >= b) return;
                const diff = ledger[a][b] - ledger[b][a];

                if (diff > 0) {
                    ledger[a][b] = diff;
                    ledger[b][a] = 0;
                }
                else if (diff < 0) {
                    ledger[b][a] = -diff;
                    ledger[a][b] = 0;
                }
                else {
                    ledger[a][b] = 0;
                    ledger[b][a] = 0;
                }
            });
        });
    }

})