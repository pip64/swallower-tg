import newChatMode from "../modules/modes/newMode.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";

export default async function newMode (ctx) {
    try {
        const [isExists, chat] = await isChatExists(ctx.message.from.id, "users");

        if (isExists) {
            const commandArguments = ctx?.message?.text?.split("/newmode")[1]?.trim()?.split("\n");
            const name = commandArguments[0];
            const words = commandArguments[1];

            if (!name) await ctx.reply("❌ Не указано название режима.");
            if (!words) await ctx.reply("❌ Не указаны слова для режима.");

            const mode = await newChatMode(name, words, ctx.message.from.id);            

            if (!mode[0]) return await ctx.reply("❌ " + mode[1]);

            await ctx.replyWithMarkdown(mode[1] + "\nЧтобы использовать его в группе, напишите `/mode " + mode[0] + "`");
        } else {
            await initChat(ctx.message.from.id, true, "default", ctx, "users");
            await newMode(ctx);
        }
    } catch (error) {
        console.log(error)
    }
}