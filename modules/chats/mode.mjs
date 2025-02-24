import database from "../../database/index.mjs";
import { modes } from "../../constants/modes.mjs";
import getMode from "../modes/getMode.mjs";

export default async function setBotMode(channel_id, mode) {
    if (Object.keys(modes).includes(mode) || await getMode(Number(mode))) {
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