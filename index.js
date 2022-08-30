import "dotenv/config"
import { Sets } from "./setLoader.js"
import ClientSetup from "./setupDiscord.js"
import DynamicCommandSetup from "./dynamicCommandSetup.js"

(async () => {
    const sets = await Sets.create()
    const client = ClientSetup()
    client.commands = await DynamicCommandSetup(sets)
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isChatInputCommand()) { return }
        const command = interaction.client.commands.get(interaction.commandName)
        if (!command) { return }
        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            await interaction.reply({ content: "There was an error.", ephemeral: true })
        }
    })
    client.login(process.env.TOKEN)
})()
