import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

interface Split {
    userId: Id<"users">;
    amount: number;
    paid: boolean;
}

interface Group {
    _id: Id<"groups">;
    name: string;
    description?: string;
    members: { userId: Id<"users"> }[];
}

interface User {
    _id: Id<"users">;
    name: string;
    email?: string;
    imageUrl?: string;
}

interface Expense {
    paidByUserId: Id<"users">;
    groupId?: Id<"groups">;
    splits: Split[];
}

interface Settlement {
    paidByUserId: Id<"users">;
    receivedByUserId: Id<"users">;
    groupId?: Id<"groups">;
    amount: number;
}

export const createSettlement: any = mutation({
    args: {
        amount: v.number(),
        note: v.optional(v.string()),
        paidByUserId: v.id("users"),
        receivedByUserId: v.id("users"),
        groupId: v.optional(v.id("groups")),
        relatedExpenseIds: v.optional(v.array(v.id("expenses"))),
    },
    handler: async (ctx, args) => {
        const caller = await ctx.runQuery((internal as any).user.getCurrentUser);

        if (args.amount <= 0) throw new Error("Amount must be positive");
        if (args.paidByUserId === args.receivedByUserId) {
            throw new Error("Payer and receiver cannot be the same user");
        }
        if (
            caller._id !== args.paidByUserId &&
            caller._id !== args.receivedByUserId
        ) {
            throw new Error("You must be either the payer or the receiver");
        }

        if (args.groupId) {
            const group = await ctx.db.get(args.groupId);
            if (!group) throw new Error("Group not found");

            const isMember = (uid: Id<"users">) =>
                group.members.some((m: { userId: Id<"users"> }) => m.userId === uid);

            if (!isMember(args.paidByUserId) || !isMember(args.receivedByUserId)) {
                throw new Error("Both parties must be members of the group");
            }
        }

        return await ctx.db.insert("settlements", {
            amount: args.amount,
            note: args.note,
            date: Date.now(),
            paidByUserId: args.paidByUserId,
            receivedByUserId: args.receivedByUserId,
            groupId: args.groupId,
            relatedExpenseIds: args.relatedExpenseIds,
            createdBy: caller._id,
        });
    },
});

export const getSettlementData = query({
    args: {
        entityType: v.string(),
        entityId: v.string(),
    },
    handler: async (ctx, args) => {
        const me = await ctx.runQuery((internal as any).user.getCurrentUser);

        if (args.entityType === "user") {
            const other = await ctx.db.get(args.entityId as Id<"users">);
            if (!other) throw new Error("User not found");

            const myExpenses = await ctx.db
                .query("expenses")
                .withIndex("by_user_and_group", (q) =>
                    q.eq("paidByUserId", me._id).eq("groupId", undefined)
                )
                .collect();

            const otherUserExpenses = await ctx.db
                .query("expenses")
                .withIndex("by_user_and_group", (q) =>
                    q.eq("paidByUserId", other._id).eq("groupId", undefined)
                )
                .collect();

            const expenses = [...myExpenses, ...otherUserExpenses] as Expense[];

            let owed = 0;
            let owing = 0;

            for (const exp of expenses) {
                const involvesMe =
                    exp.paidByUserId === me._id ||
                    exp.splits.some((s) => s.userId === me._id);
                const involvesThem =
                    exp.paidByUserId === other._id ||
                    exp.splits.some((s) => s.userId === other._id);
                if (!involvesMe || !involvesThem) continue;

                if (exp.paidByUserId === me._id) {
                    const split = exp.splits.find(
                        (s) => s.userId === other._id && !s.paid
                    );
                    if (split) owed += split.amount;
                }

                if (exp.paidByUserId === other._id) {
                    const split = exp.splits.find(
                        (s) => s.userId === me._id && !s.paid
                    );
                    if (split) owing += split.amount;
                }
            }

            const mySettlements = await ctx.db
                .query("settlements")
                .withIndex("by_user_and_group", (q) =>
                    q.eq("paidByUserId", me._id).eq("groupId", undefined)
                )
                .collect();

            const otherUserSettlements = await ctx.db
                .query("settlements")
                .withIndex("by_user_and_group", (q) =>
                    q.eq("paidByUserId", other._id).eq("groupId", undefined)
                )
                .collect();

            const settlements = [...mySettlements, ...otherUserSettlements] as Settlement[];

            for (const st of settlements) {
                if (st.paidByUserId === me._id) {
                    owing = Math.max(0, owing - st.amount);
                } else {
                    owed = Math.max(0, owed - st.amount);
                }
            }

            return {
                type: "user",
                counterpart: {
                    userId: other._id,
                    name: other.name,
                    email: other.email,
                    imageUrl: other.imageUrl,
                },
                youAreOwed: owed,
                youOwe: owing,
                netBalance: owed - owing,
            };
        } else if (args.entityType === "group") {
            const group = await ctx.db.get(args.entityId as Id<"groups">) as Group;
            if (!group) throw new Error("Group not found");

            const isMember = group.members.some(
                (m) => m.userId === me._id
            );
            if (!isMember) throw new Error("You are not a member of this group");

            const expenses = await ctx.db
                .query("expenses")
                .withIndex("by_group", (q) => q.eq("groupId", group._id))
                .collect() as Expense[];

            const balances: Record<string, { owed: number; owing: number }> = {};
            group.members.forEach((m) => {
                if (m.userId !== me._id) balances[m.userId] = { owed: 0, owing: 0 };
            });

            for (const exp of expenses) {
                if (exp.paidByUserId === me._id) {
                    exp.splits.forEach((split) => {
                        if (split.userId !== me._id && !split.paid) {
                            balances[split.userId].owed += split.amount;
                        }
                    });
                } else if (balances[exp.paidByUserId]) {
                    const split = exp.splits.find(
                        (s) => s.userId === me._id && !s.paid
                    );
                    if (split) balances[exp.paidByUserId].owing += split.amount;
                }
            }

            const settlements = await ctx.db
                .query("settlements")
                .filter((q) => q.eq(q.field("groupId"), group._id))
                .collect() as Settlement[];

            for (const st of settlements) {
                if (st.paidByUserId === me._id && balances[st.receivedByUserId]) {
                    balances[st.receivedByUserId].owing = Math.max(
                        0,
                        balances[st.receivedByUserId].owing - st.amount
                    );
                }
                if (st.receivedByUserId === me._id && balances[st.paidByUserId]) {
                    balances[st.paidByUserId].owed = Math.max(
                        0,
                        balances[st.paidByUserId].owed - st.amount
                    );
                }
            }

            const members = await Promise.all(
                Object.keys(balances).map((id) => ctx.db.get(id as Id<"users">))
            );

            const list = Object.keys(balances).map((uid) => {
                const m = members.find((u) => u && u._id === uid);
                const { owed, owing } = balances[uid];
                return {
                    userId: uid,
                    name: m?.name || "Unknown",
                    imageUrl: m?.imageUrl,
                    youAreOwed: owed,
                    youOwe: owing,
                    netBalance: owed - owing,
                };
            });

            return {
                type: "group",
                group: {
                    id: group._id,
                    name: group.name,
                    description: group.description,
                },
                balances: list,
            };
        }

        throw new Error("Invalid entityType; expected 'user' or 'group'");
    },
});