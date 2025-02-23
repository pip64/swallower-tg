import generatePoem from "../modules/generatePoem.mjs";

export default async function generatePoemCommand(ctx) {
    try {
        const poem = generatePoem();

        await ctx.reply("Я сочинил стихотворение\n\n" + poem);
    } catch (error) {
        console.log(error);
    }
}