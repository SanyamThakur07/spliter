import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";


export const getAllContacts = query({
    handler: async (ctx: any): Promise<{ users: any[]; groups: any[] }> => {
        const currentUser: any = await ctx.runQuery((internal as any).user.getCurrentUser);

        const expensesYouPaid: any[] = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q: any) =>
                q.eq("paidByUserId", currentUser._id).eq("groupId", undefined))
            .collect();

        const expensesNotPaidByYou: any[] = (await ctx.db
            .query("expenses")
            .withIndex("by_group", (q: any) =>
                q.eq("groupId", undefined))
            .collect()
        )
            .filter((e: any) =>
                e.paidByUserId !== currentUser._id &&
                e.splits.some((s: any) => s.userId === currentUser._id)
            );

        const personalExpeneses: any[] = [...expensesYouPaid, ...expensesNotPaidByYou];

        const contactIds: Set<string> = new Set<string>();
        personalExpeneses.forEach((exp: any) => {
            if(exp.paidByUserId !== currentUser._id)
                contactIds.add(exp.paidByUserId);

            exp.splits.forEach((s: any) => {
                if(s.userId !== currentUser._id) contactIds.add(s.userId);
            });
        });
        
        const contactUsers: any[] = await Promise.all(
            [...contactIds].map(async(id: string) => {
                const u: any = await ctx.db.get(id as Id<"users">);
                if (u && "email" in u && "name" in u) {
                    return {
                        id: u._id,
                        name: u.name,
                        email: u.email,
                        imageUrl: u.imageUrl,
                        type: "user",
                    };
                }
                return null;
            })
        );

        const userGroups: any[] = (await ctx.db.query("groups").collect())
            .filter((g: any) => g.members.some((m: any) => m.userId === currentUser._id))
            .map((g: any) => ({
                id: g._id,
                name: g.name,
                description: g.description,
                memberCount: g.members.length,
                type: "group"
            }));

        return {users: contactUsers.filter(Boolean), groups: userGroups};
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        members: v.array(v.id("users")),  
    },

    handler: async(ctx: any, args: any) => {
        const currentUser: any = await ctx.runQuery((internal as any).user.getCurrentUser)

        if(!args.name.trim()) throw new Error("Group name cannot be empty");

        const uniqueMembers = new Set(args.members);
        uniqueMembers.add(currentUser._id);

        for(const id of uniqueMembers){
            if(!(await ctx.db.get(id)))
                throw new Error(`User with ID ${id} not found`);
        }

        return await ctx.db.insert("groups", {
            name: args.name.trim(),
            description: args.description?.trim() ?? "",
            createdBy: currentUser._id,
            members: [...uniqueMembers].map((id) => ({
                userId: id,
                role: id === currentUser._id ? "admin" : "member",
                joinedAt: Date.now(),
            })),
        });
    }

})
