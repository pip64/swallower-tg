import admins from "../../constants/admins.mjs";
import database from "../../database/index.mjs";

export default async function mailToAll(ctx) {
    if (ctx.chat.type === "private") {
        if (admins.includes(ctx.message.from.id)) {
            const text = ctx.message.text.split("/mail")[1];

            if (text) {
                const chats = await database("channels").catch(() => null);

                if (chats) {
                    await ctx.reply(`⏳ Начинается рассылка.\n\nЧатов обнаружено: ${chats.length}`)

                    let success = 0;

                    for (const chat of chats) {
                        try {
                            await ctx.telegram.sendMessage(chat.channel_id, `⚠️ *Сообщение от разработчика*\n\n${text.trim()}\n\n[Канал Заглыта](https://t.me/zaglit)`, { parse_mode: 'Markdown' })
                            success += 1;                            
                        } catch (error) {console.log(error)}
                    }

                    await ctx.reply(`✅ Рассылка проведена.\n\nДоставлено: ${success}/${chats.length}`)
                } else {
                    await ctx.reply("Упс! Произошла ошибка при получении чатов из БД 😅")
                }
            } else {
                await ctx.reply("❌ Укажите текст рассылки!")
            }
        }
    }
}