import isChatExists from "./isChatExists.mjs";
import database from "../../database/index.mjs";

export default async function initChat (channel_id, enabled, mode = "default", ctx) {
    const [ isExists, chat ] = await isChatExists(channel_id);
    if (isExists) {
        return false;
    } else {
        const insertChannel = await database("channels").insert({
            channel_id: channel_id,
            enabled: enabled,
            mode: mode
        }).then(() => true).catch(() => false);

        if (insertChannel) {
            await ctx.telegram.sendMessage(1764997872, `🎉 Заглыта добавили в новый чат!
Количество чатов: ${await database("channels").count("id").first().then(value => value?.count).catch(() => "неизвестно.")}`)
            return true;
        } else {
            return false;
        }
    }
}