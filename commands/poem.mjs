import generatePoem from "../modules/generatePoem.mjs";

export default async function generatePoemCommand(ctx) {
    try {
        const poem = generatePoem();

        await ctx.reply(`Я сочинил стихотворение "${poem[1]}"\n\n${poem[0]}`);
    } catch (error) {
        console.log(error);
    }
}