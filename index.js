import "dotenv/config"
import { Sets } from "./setLoader.js"
import { LoadCollection, ClientSetup } from "@jssidekick/discordcommon"

(async () => {
    const sets = await Sets.create()
    const client = ClientSetup()
    client.commands = await LoadCollection({ doBeforeAdding: (command) => {
        if (Object.keys(command).includes("register")) {
            command.register(sets)
        }
    }})
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