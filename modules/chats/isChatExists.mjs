import database from "../../database/index.mjs"

export default async function isChatExists(channel_id, type) {
    const chat = await database(type || "channels")
        .where(type === "users" ? "user_id" : "channel_id", channel_id)
        .first()
        .then(value => value)
        .catch(error => console.log(error))

    if (chat) {
        return [true, chat]
    } else {
        return [false, {}]
    }
}