import "dotenv/config"
import { Routes } from "discord.js"
import { REST } from "discord.js"

(async () => {
    const { TOKEN, GUILDID, CLIENTID } = process.env
    const rest = new REST({ version: "10" }).setToken(TOKEN)
    try {
        const url = Routes.applicationCommands(CLIENTID)
        await rest.put(url, { body: [] })
        console.log("Deleted All Commands!")
    } catch(error) {
        console.error(error)
    }
})()
