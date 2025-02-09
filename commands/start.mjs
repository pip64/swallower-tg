export default async function startCommand(ctx) {
	try {
        await ctx.reply(`👋 Привет! Я - заглыт и работаю только в чатах!

    В чатах ко мне нужно обращаться по имени или пинговать.`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Добавить в чат", url: "https://t.me/zaglit_bot?startgroup=start" }], [{ text: "Канал Заглыта", url: "https://t.me/zaglit" }]
                ]
            }
        })
	} catch (error) {
                	console.log(error);
                }
}