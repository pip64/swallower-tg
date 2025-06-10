import admins from "../../constants/admins.mjs";
import database from "../../database/index.mjs";

export default async function mailToAll(ctx) {
    if (ctx.chat.type === "private") {
        if (admins.includes(String(ctx.message.from.id))) {
            const text = ctx.message.text.split("/mail")[1];

            if (text) {
                const chats = await database("channels").catch(() => null);

                if (chats) {
                    const totalChats = chats.length;
                    await ctx.reply(`⏳ Начинается рассылка.\n\nЧатов обнаружено: ${totalChats}`);

                    let success = 0;
                    let failed = 0;
                    const BATCH_SIZE = 10;
                    
                    for (let i = 0; i < chats.length; i += BATCH_SIZE) {
                        const batch = chats.slice(i, i + BATCH_SIZE);
                        const batchPromises = batch.map(async (chat) => {
                            try {
                                await ctx.telegram.sendMessage(
                                    chat.channel_id, 
                                    `⚠️ *Сообщение от разработчика*\n\n${text.trim()}\n\n[Канал Заглыта](https://t.me/zaglit)`, 
                                    { parse_mode: 'Markdown' }
                                );
                                success++;
                                return true;
                            } catch (error) {
                                console.log(`Failed to send to ${chat.channel_id}:`, error);
                                failed++;
                                return false;
                            }
                        });

                        await Promise.all(batchPromises);
                        
                        if (i % 10 === 0) {
                            await ctx.reply(
                                `📊 Прогресс рассылки:\n` +
                                `✅ Успешно: ${success}\n` +
                                `❌ Ошибок: ${failed}\n` +
                                `⏳ Осталось: ${totalChats - (success + failed)}`
                            ).catch(console.error);
                        }
                    }

                    await ctx.reply(
                        `✅ Рассылка завершена.\n\n` +
                        `📊 Итоги:\n` +
                        `✅ Успешно: ${success}\n` +
                        `❌ Ошибок: ${failed}\n` +
                        `📝 Всего: ${totalChats}`
                    );
                } else {
                    await ctx.reply("Упс! Произошла ошибка при получении чатов из БД 😅");
                }
            } else {
                await ctx.reply("❌ Укажите текст рассылки!");
            }
        }
    }
}