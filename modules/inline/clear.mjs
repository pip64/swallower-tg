export default function getClearKeyboard() {
    return [
        [{ text: 'Сообщения', callback_data: "clear_messages" }, { text: 'Стикеры', callback_data: "clear_stickers" }],
        [{ text: 'Всё', callback_data: "clear_all" }],
    ]
}