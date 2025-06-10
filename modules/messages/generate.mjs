import * as fs from 'node:fs/promises'
import { constants } from 'node:fs/promises'
import { modes } from '../../constants/modes.mjs'
import z2bp from "../z2bp.mjs"
import getMode from '../modes/getMode.mjs'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_WORDS_TO_INSERT = 5
const MAX_SYMBOLS_COUNT = 1000
const fileCache = new Map()
const CACHE_TTL = 5 * 60 * 1000

async function safeReadFile(filePath) {
    try {
        const stats = await fs.stat(filePath)
        if (stats.size > MAX_FILE_SIZE) {
            console.warn(`File ${filePath} is too large: ${stats.size} bytes`)
            return null
        }
        return await fs.readFile(filePath, { encoding: "utf-8" })
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error)
        return null
    }
}

function insertRandomWords(text, words) {
    if (!text || !words || !Array.isArray(words)) return text
    
    const splitted = text.split(" ")
    const count = Math.min(Math.ceil(splitted.length / 3), MAX_WORDS_TO_INSERT)
    
    const indexesToInsert = Array.from({length: count})
        .map(() => Math.floor(Math.random() * splitted.length))
    
    indexesToInsert.forEach(index => {
        const randomWord = words[Math.floor(Math.random() * words.length)]
        if (randomWord) {
            splitted.splice(index, 0, randomWord)
        }
    })
    
    return splitted.join(" ")
}

export default async function generateMarkov(input = "", channel_id, symbols_count, mode = "default", type) {
    try {
        symbols_count = Math.min(symbols_count, MAX_SYMBOLS_COUNT)
        
        const file_name = type === "direct" 
            ? "./database/direct_messages.txt" 
            : `./database/messages/${channel_id}.txt`

        const cachedData = fileCache.get(file_name)
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
            return processText(cachedData.content, input, symbols_count, mode)
        }

        const hasAccess = await fs.access(file_name, constants.R_OK | constants.W_OK)
            .then(() => true)
            .catch(() => false)

        if (!hasAccess) {
            console.warn(`No access to file: ${file_name}`)
            return null
        }

        const chatMessages = await safeReadFile(file_name)
        if (!chatMessages) {
            return null
        }

        fileCache.set(file_name, {
            content: chatMessages,
            timestamp: Date.now()
        })

        return processText(chatMessages, input, symbols_count, mode)
    } catch (error) {
        console.error('Error in generateMarkov:', error)
        return null
    }
}

async function processText(content, input, symbols_count, mode) {
    try {
        const zaglyt2 = new z2bp(content)
        const sentence = zaglyt2.generate(input, symbols_count)
        
        if (!sentence) {
            return null
        }

        const modeFunction = modes[mode]
        if (modeFunction) {
            return await modeFunction(sentence)
        }

        const otherMode = await getMode(Number(mode))
        if (otherMode?.words) {
            return insertRandomWords(sentence, otherMode.words)
        }

        return sentence
    } catch (error) {
        console.error('Error processing text:', error)
        return null
    }
}