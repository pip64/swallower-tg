export default function getSwitcherKeyboard(enabled) {
    return [
        [{ text: enabled ? "• Включен •" : "Включить", callback_data: "bot_enable" }, { text: !enabled ? "• Выключен •" : "Выключить", callback_data: "bot_disable" }]
    ]
}