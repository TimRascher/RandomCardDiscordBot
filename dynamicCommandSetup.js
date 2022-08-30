import { Collection } from "discord.js"
import fs from "fs"

/**
 * @typedef { Object } Command
 * @property { import("discord.js").SlashCommandBuilder } data
 * @property { (import("discord.js").Interaction) => Undefined } execute
 */

/** @return { Command[] } */
const GetCommands = async () => {
    const path = "./commands"
    const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"))
    let commands = []
    for (let i = 0; i < commandFiles.length; i++) {
        const filePath = `${path}/${commandFiles[i]}`
        const { default: command } = await import(filePath)
        commands.push(command)
    }
    return commands
}
export { GetCommands }

/**
 * @param { import("./setLoader").Sets } sets
 * @return { Collection }
 */
export default async (sets) => {
    const rawCommands = await GetCommands()
    let commands = new Collection()
    rawCommands.forEach(command => {
        if (Object.keys(command).includes("register")) {
            command.register(sets)
        }
        commands.set(command.data.name, command)
    })
    return commands
}