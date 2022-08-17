import { Sets } from "./setLoader.js"
import { Message } from "discord.js"

/**
 * @typedef { Object } Command
 * @property { String } command
 * @property { String } modifier
 */

/** 
 * @readonly
 * @enum { String }
 **/
const ValidCommands = {
    MENU: "menu",
    INVALID: "invalid",
    SET: "set",
    HELP: "help"
}
/**
 * @param { String } content 
 * @param { Sets } sets 
 * @return { Command }
 */
const getCommand = (content, sets) => {
    const hasSet = (id) => { return sets.sets.map(s => s.id).find(s => s == id) }

    let parts = content.split(" ")
    if (parts.length == 1) { return { command: ValidCommands.MENU } }
    const command = parts[1]?.toLowerCase()
    const modifier = parts[2]?.toLowerCase()
    if (hasSet(command)) { return { command: ValidCommands.SET, modifier: command } }
    escapeCheck: if (Object.keys(ValidCommands).find(k => ValidCommands[k] == command)) {
        if (command == ValidCommands.SET && hasSet(modifier) != modifier) { break escapeCheck }
        return { command: command, modifier: modifier }
    }
    return { command: ValidCommands.INVALID }
}

const CommandHandlers = {
    /** 
     * @param { Message } mes
     * @param { Sets } sets
     **/
    menu: (mes, sets) => {
        const channel = mes.channel
        let menuText = "Sets:\n"
        sets.sets.forEach((set) => {
            menuText += `${set.id}: ${set.setName}\n`
        })
        channel.send(menuText)
    },
    /** 
     * @param { Message } mes
     * @param { Sets } sets
     **/
    randomCard: async (mes, sets, setId) => {
        let set = sets.set(setId)
        if (!set) { CommandHandlers.menu(mes, sets); return }
        const channel = mes.channel
        const card = set.randomCard()
        await channel.send({ files: [ await card.load() ], content: `${set.setName}` })
    }
}


/**
 * @param { Message } message
 * @param { Sets } sets
 */
export default async (message, sets) => {
    const content = message.content.trim()
    if (!content.toUpperCase().startsWith("C!")) { return }
    const command = getCommand(content, sets)
    switch (command.command) {
        case ValidCommands.MENU: CommandHandlers.menu(message, sets); break
        case ValidCommands.SET: CommandHandlers.randomCard(message, sets, command.modifier); break
        default: CommandHandlers.menu(message, sets)
    }
}