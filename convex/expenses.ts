import { v } from "convex/values"
import { query } from "./_generated/server"

export const getExpensesBetweenUsers = query({
    args: { userId: v.id("users") },
    handler: async (ctx) => {

    }
})