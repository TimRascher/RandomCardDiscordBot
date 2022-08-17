import { Sets } from "./setLoader.js"
import { Message, EmbedBuilder } from "discord.js"

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
    CARD: "card",
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
    menu: async (mes, sets) => {
        const channel = mes.channel
        let menuText = "Sets:\n"
        sets.sets.forEach((set) => {
            menuText += `${set.id}: ${set.setName} (1-${set.cards.length})\n`
        })
        menuText += "C! help - Get More Commands."
        await channel.send(menuText)
    },
    /** 
     * @param { Message } mes
     * @param { Sets } sets
     * @param { String } setId
     **/
    randomCard: async (mes, sets, setId) => {
        let set = sets.set(setId)
        if (!set) { await CommandHandlers.menu(mes, sets); return }
        const channel = mes.channel
        const card = await set.randomCard()
        await channel.send({ files: [ await card.load() ], content: `${set.setName} - ${card.id}` })
    },
    /** 
     * @param { Message } mes
     * @param { Sets } sets
     **/
    help: async (mes, sets) => {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Help Cheat Sheet')
            .setURL('https://github.com/TimRascher/RandomCardDiscordBot')
            .addFields(
                { name: 'Commands', value: `
                - \`C!\`: Menu command, show you current card sets.
                - \`C! {set id}\`: Add the set id to the menu command to get a random card.
                - \`C! card {set id}-{card number}\`: Add the set id to the menu command to get a random card. (ex \`C! card rac-1\`)
                - \`C! help\`: Sends you this helpful help sheet full of help.
                ` }
            )
        await mes.author.send({ embeds: [helpEmbed] })
    },
    /** 
     * @param { Message } mes
     * @param { Sets } sets
     * @param { String } modifier
     **/
    card: async (mes, sets, modifier) => {
        const menu = async () => { await CommandHandlers.menu(mes, sets) }
        const splitMod = modifier.split("-")
        if (splitMod.length != 2) { await menu(); return }
        const set = sets.set(splitMod[0])
        if (!set) { await menu(); return }
        const card = await set.cardForId(splitMod[1])
        if (!card) { await menu(); return }
        await mes.channel.send({ files: [ await card.load() ], content: `${set.setName} - ${card.id}` })
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
        case ValidCommands.MENU: await CommandHandlers.menu(message, sets); break
        case ValidCommands.SET: await CommandHandlers.randomCard(message, sets, command.modifier); break
        case ValidCommands.CARD: await CommandHandlers.card(message, sets, command.modifier); break
        case ValidCommands.HELP: await CommandHandlers.help(message, sets); break
        default: await CommandHandlers.menu(message, sets)
    }
}