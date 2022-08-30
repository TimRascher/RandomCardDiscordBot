import "dotenv/config"
import { Routes } from "discord.js"
import { REST } from "discord.js"
import { GetCommands } from "./dynamicCommandSetup.js"

(async () => {
    const { TOKEN, CLIENTID } = process.env
    const rawCommands = await GetCommands()
    const commands = rawCommands.map(c => c.data.toJSON())
    const rest = new REST({ version: "10" }).setToken(TOKEN)
    try {
        const data = await rest.put(Routes.applicationCommands(CLIENTID), { body: commands })
        console.log(`Successfully registered ${data.length} application commands.`)
    } catch(error) {
        console.error(error)
    }
})()
