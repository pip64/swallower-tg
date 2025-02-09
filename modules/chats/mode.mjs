import database from "../../database/index.mjs";
import { modes } from "../../constants/modes.mjs";

export default async function setBotMode(channel_id, mode) {
    if (Object.keys(modes).includes(mode)) {
        const chat = await database("channels")
            .where("channel_id", channel_id)
            .update({
                mode: mode
            })
            .then(() => true)
            .catch(error => console.log(error))

        return !!chat;
    } else return false;
}