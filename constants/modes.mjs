const smiles = ['🤩', '🤮', '🙏', '🕊', '🤡', '🥱', '😍', '🌚', '🌭', '💯', '🖕', '😈', '😎', '💊', '🤷‍♂️', '🤷‍♀️', '🤨', '😴', '🤓', '🗿'];
const random = max => Math.floor(Math.random() * (max - 0) + 0)

Array.prototype.insert = function (element, index) {
    this.splice(index + 1, 0, element);

    return this;
}

Array.prototype.choice = function () {
    return this[random(this.length)];
}

String.prototype.toAlternatingCase = function () {
    return [...this].map((char, i) => i % 2 ? char.toUpperCase() : char.toLowerCase()).join('');
};

const insert = (list, element, index) => {
    list.splice(index + 1, 0, element);

    return list;
}

String.prototype.insertRandomWords = function(massive) {
    let splitted = this.split(" ");
    const count = Math.ceil(splitted.length / 3);

    const indexesToInsert = Array.from({length: count > 0 ? count : 1}).map(() => random(0, splitted.length));

    indexesToInsert.map(value => splitted = splitted.insert(massive.choice(), value));

    return splitted.join(" ");
};

const bot_modes = {
    default: text => text,
    reverse: text => text.split("").reverse().join(""),
    alternating: text => text.toAlternatingCase(),
    smiles: text => smiles.choice() + text.split(" ").map(word => word + smiles.choice()).join(""),
    tiktok: text => text.insertRandomWords(["изгой", "ш-общительная", "пикми", "найк про", "босс КФС", "палитра", "нормис", "в мешочке"]),
    gachi: text => text.insertRandomWords(["semen", "cum", "gay boy", "dungeon master", "full master", "three hundred bucks", "fucking slave", "boss of the gym", "fuck you", "fisting anal"]),
    communist: text => `☭${text.insertRandomWords(["за 3 копейки", "ленин", "благодаря сталину", "прекрасная цена", "пятилетка", "за революцию"])}☭`,
    halloween: text => `🎃${text.insertRandomWords(["бу", "☠️", "скелет", "🎃", "кровь", "страшно", "бойся", "конфетка"])}🎃`
}

export const modes = {
    ...bot_modes,
    random: text => bot_modes[Object.keys(bot_modes).choice()](text)
}

export const modeFormats = {
    default: 'Обычный',
    reverse: 'Наоборот',
    alternating: 'сТрАнНыЙ',
    smiles: 'Смайлы',
    tiktok: 'Тик ток',
    gachi: 'Гачи мучи',
    random: 'Рандом'
}