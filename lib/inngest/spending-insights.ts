import { ConvexHttpClient } from "convex/browser"
import { inngest } from "./client"
import { api } from "@/convex/_generated/api";
import { GoogleGenerativeAI } from '@google/generative-ai';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const spendingInsights = inngest.createFunction(
    { id: "spending-insights" },
    { cron: "0 8 1 * *" },
    async ({ step }) => {
        const users = await step.run("Fetch users with expenses", async () => {
            return await convex.query(api.inngest.getUserWithExpenses);
        });

        const results = [];

        for (const user of users) {
            const expenses = await step.run(`Expenses · ${user._id}`, async () =>
                convex.query(api.inngest.getUserMonthlyExpenses, { userId: user._id })
            );
            if (!expenses?.length) continue;

            const expenseData = JSON.stringify({
                expenses,
                totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
                categories: expenses.reduce((cats, e) => {
                    const category = e.category ?? "uncategorised";
                    cats[category] = (cats[category] ?? 0) + e.amount;
                    return cats;
                }, {} as Record<string, number>),
            });

            const prompt = `
As a financial analyst, review this user's spending data for the past month and provide insightful observations and suggestions.
Focus on spending patterns, category breakdowns, and actionable advice for better financial management.
Use a friendly, encouraging tone. Format your response in HTML for an email.

User spending data:
${expenseData}

Provide your analysis in these sections:
1. Monthly Overview
2. Top Spending Categories
3. Unusual Spending Patterns (if any)
4. Saving Opportunities
5. Recommendations for Next Month
            `.trim();

            try {
                const aiResponse = await step.run(`AI Analysis · ${user._id}`, async () => {
                    return await model.generateContent(prompt);
                });

                const htmlBody = (aiResponse?.response?.candidates?.[0]?.content?.parts?.[0] as { text: string })?.text ?? "";

                await step.run(`Email · ${user._id}`, async () =>
                    convex.action(api.email.sendEmail, {
                        to: user.email,
                        subject: "Your Monthly Spending Insights",
                        html: `
                  <h1>Your Monthly Financial Insights</h1>
                  <p>Hi ${user.name},</p>
                  <p>Here's your personalized spending analysis for the past month:</p>
                  ${htmlBody}
                `,
                        apiKey: process.env.RESEND_API_KEY!,
                    })
                );

                results.push({ userId: user._id, success: true });
            } catch (err) {
                results.push({
                    userId: user._id,
                    success: false,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        return {
            processed: results.length,
            success: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
        };
    }
);