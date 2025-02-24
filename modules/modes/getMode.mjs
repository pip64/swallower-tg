import database from "../../database/index.mjs";

export default async function getMode (id) {
    return await database("modes").where('id', id).first().catch(() => null);
}