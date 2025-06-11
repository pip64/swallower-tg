import generateStory from "../modules/generateStory.mjs";

export default async function generateStoryCommand(ctx) {
    try {
        const story = generateStory(['group', 'supergroup'].includes(ctx.chat.type) ? `./database/messages/${ctx.message.chat.id}.txt` : './database/direct_messages.txt');

        await ctx.reply(`Я сочинил рассказ "${story[1]}":\n\n${story[0]}`);
    } catch (error) {
        console.log(error);
    }
}