import saveMessage from "../modules/messages/save.mjs"
import initChat from "../modules/chats/initChat.mjs"
import on_message from "./on_message.mjs"

export default async function on_sticker (ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            await initChat(ctx.message.chat.id, true, ctx)
            if (ctx?.message?.sticker) {
                await saveMessage(ctx.message.sticker.file_id, ctx.message.chat.id, "stickers")
            }
            
            await on_message(ctx);
        }
    } catch (error) {
        console.log(error)
    }
}