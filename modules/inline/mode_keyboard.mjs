import { modes } from "../../constants/modes.mjs"

export default function getModeKeyboard (mode) {
    return [
        [ { text: mode === 'default' ? "• Обычный •" : "Обычный", callback_data: "default" }, { text: mode === 'reverse' ? "• Наоборот •" : "Наоборот", callback_data: "reverse" } ],
        [ { text: mode === 'alternating' ? `• ${modes.alternating("странный")} •` : modes.alternating("странный"), callback_data: "alternating" }, { text: mode === 'smiles' ? `• ${modes.smiles("Смайлы")} •` : modes.smiles("Смайлы") , callback_data: "smiles" } ],
        [ { text: mode === 'tiktok' ? "• Тик ток •" : "Тик ток", callback_data: "tiktok" }, { text: mode === 'gachi' ? "• Гачи мучи •" : "Гачи мучи", callback_data: "gachi" } ],
        [ { text: mode === 'communist' ? "• Коммунист •" : "Коммунист", callback_data: "communist" }, { text: mode === 'halloween' ? "• 🎃Хэллоуин🎃 •" : "🎃Хэллоуин🎃", callback_data: "halloween" } ],
        [ { text: mode === 'random' ? "• Рандом •" : "Рандом", callback_data: "random" } ],
    ]
}