import { v } from "convex/values";
import { query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

type GroupMembers = {
    id: Id<"users">;
    name: string;
    email: string;
    imageUrl: string;
    role: string;
}

type SelectedGroup = {
    id: Id<"groups">;
    name: string;
    description: string;
    createdBy: Id<"users">;
    members: GroupMembers[];
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

type GetGroupExpensesReturn = {
    group: {
        id: Id<"groups">;
        name: string;
        description: string;
    };
    members: GroupMembers[];
    expenses: any[];
    settlements: any[];
    balances: any[];
    userLookupMap: Record<string, GroupMembers>;
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
                throw new Error("Group not found or you're not a member");
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
            const validMembers = memberDetails.filter((member): member is GroupMembers => member !== null);

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
        } else {
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
    handler: async (ctx, { groupId }): Promise<GetGroupExpensesReturn> => {
        const currentUser = await ctx.runQuery((internal as any).user.getCurrentUser);

        const group = await ctx.db.get(groupId);
        if (!group) throw new Error("Group not found");

        if (!group.members.some((m) => m.userId === currentUser._id)) {
            throw new Error("You are not a member of this group");
        }

        const expenses = await ctx.db.query("expenses")
            .withIndex("by_group", (q) => q.eq("groupId", groupId))
            .collect();

        const settlements = await ctx.db.query("settlements")
            .withIndex("by_group", (q) => q.eq("groupId", groupId))
            .collect();

        const memberDetails = await Promise.all(
            group.members.map(async (member) => {
                const u = await ctx.db.get(member.userId);
                if (!u) return null;
                return {
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    imageUrl: u.imageUrl,
                    role: member.role,
                };
            })
        );

        const validMemberDetails = memberDetails.filter((member): member is GroupMembers => member !== null);
        const ids = validMemberDetails.map((m) => m.id);

        const totals: Record<string, number> = Object.fromEntries(ids.map((id) => [id.toString(), 0]));
        const ledger: Record<string, Record<string, number>> = {};

        ids.forEach((a) => {
            ledger[a.toString()] = {};
            ids.forEach((b) => {
                if (a !== b) ledger[a.toString()][b.toString()] = 0;
            });
        });

        for (const exp of expenses) {
            const payer = exp.paidByUserId.toString();

            for (const split of exp.splits) {
                if (split.userId === exp.paidByUserId || split.paid) continue;

                const debtor = split.userId.toString();
                const amt = split.amount;

                totals[payer] += amt;
                totals[debtor] -= amt;

                ledger[debtor][payer] += amt;
            }
        }

        for (const s of settlements) {
            const payerStr = s.paidByUserId.toString();
            const receiverStr = s.receivedByUserId.toString();

            totals[payerStr] += s.amount;
            totals[receiverStr] -= s.amount;

            ledger[payerStr][receiverStr] -= s.amount;
        }

        ids.forEach((a) => {
            ids.forEach((b) => {
                const aStr = a.toString();
                const bStr = b.toString();
                if (aStr >= bStr) return;
                const diff = ledger[aStr][bStr] - ledger[bStr][aStr];

                if (diff > 0) {
                    ledger[aStr][bStr] = diff;
                    ledger[bStr][aStr] = 0;
                } else if (diff < 0) {
                    ledger[bStr][aStr] = -diff;
                    ledger[aStr][bStr] = 0;
                } else {
                    ledger[aStr][bStr] = 0;
                    ledger[bStr][aStr] = 0;
                }
            });
        });

        const balances = validMemberDetails.map((m) => ({
            ...m,
            totalBalance: totals[m.id.toString()],
            owes: Object.entries(ledger[m.id.toString()])
                .filter(([, v]) => v > 0)
                .map(([to, amount]) => ({ to, amount })),
            owedBy: ids
                .filter((other) => ledger[other.toString()][m.id.toString()] > 0)
                .map((other) => ({ from: other.toString(), amount: ledger[other.toString()][m.id.toString()] })),
        }));

        const userLookupMap: Record<string, GroupMembers> = {};
        validMemberDetails.forEach((member) => {
            userLookupMap[member.id.toString()] = member;
        });

        return {
            group: {
                id: group._id,
                name: group.name,
                description: group.description,
            },
            members: validMemberDetails,
            expenses,
            settlements,
            balances,
            userLookupMap,
        };
    }
});