import "dotenv/config"
import { Sets } from "./setLoader.js"
import { Message } from "discord.js"
import ClientSetup from "./setupDiscord.js"
import CommandHandler from "./commands.js"

(async () => {
    const sets = await Sets.create()
    const client = ClientSetup()
    client.on("messageCreate", async (message) => {
        await CommandHandler(message, sets)
        // let content = message.content
        // if (!content.toUpperCase().startsWith("C!")) { return }
        // const parts = content.split(" ")
        // if (parts.length == 1) { menu(message, sets); return }
        // let set = sets.set(parts[1])
        // if (!set) { menu(message, sets); return }
        // const channel = message.channel
        // const card = set.randomCard()
        // let m = await channel.send({ files: [ await card.load() ], content: `${set.setName}` })
    })
    client.login(process.env.TOKEN)
})()