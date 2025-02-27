import database from "../../database/index.mjs";

export default async function newChatMode(name, words, author_id) {
    const fixedWords = words.split(",").map(word => word.trim()).filter(word => word.length <= 20);

    if (fixedWords.length > 10) return [null, "Слишком длинный список. Он должен содержать не больше 10 слов."];

    const findMode = await database("modes").whereRaw('words @> ?::varchar[]', [fixedWords]).first().catch(() => null);

    if (findMode) return [findMode?.id, "Такой режим уже существует."];

    const createMode = await database("modes").insert({
        name, words: fixedWords, author_id
    }).catch((error) => console.log(error));
    const createdMode = createMode ?
        await database("modes").whereRaw('words @> ?::varchar[]', [fixedWords]).where("name", name).where("author_id", author_id).first().catch((error) => console.log(error))
        : null;

    return createdMode ? [createdMode?.id, "Режим успешно создан!"] : [null, "Не удалось создать режим."];
}