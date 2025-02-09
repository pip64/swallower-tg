import database from "../../database/index.mjs";

export default async function setIsBotActive (channel_id, state) {
    const chat = await database("channels")
        .where("channel_id", channel_id)
        .update({
            enabled: state
        })
        .then(() => true)
        .catch(error => console.log(error))

    return !!chat;
}