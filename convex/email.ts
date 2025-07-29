import { Resend } from 'resend';
import { action } from './_generated/server';
import { v } from 'convex/values';

export const sendEmail = action({
    args: {
        to: v.string(),
        subject: v.string(),
        html: v.string(),
        text: v.optional(v.string()),
        apiKey: v.string(),
    },
    handler: async (ctx, args) => {
        const resend = new Resend(args.apiKey);

        const { data, error } = await resend.emails.send({
            from: "Splitr <onboarding@resend.dev>",
            to: args.to,
            subject: args.subject,
            html: args.html,
            text: args.text,
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, id: data.id };
    }
})