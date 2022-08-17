import "dotenv/config"
import { Sets } from "./cards/setLoader.js"
import { Message } from "discord.js"
import ClientSetup from "./setupDiscord.js"

/** 
 * @param { Message } mes
 * @param { Sets } sets
 **/
const menu = (mes, sets) => {
    const channel = mes.channel
    let menuText = "Sets:\n"
    sets.sets.forEach((set) => {
        menuText += `${set.id}: ${set.setName}\n`
    })
    channel.send(menuText)
}

(async () => {
    const sets = await Sets.create()
    const client = ClientSetup()
    client.on("messageCreate", async (message) => {
        let content = message.content
        if (!content.toUpperCase().startsWith("C!")) { return }
        const parts = content.split(" ")
        if (parts.length == 1) { menu(message, sets); return }
        let set = sets.set(parts[1])
        if (!set) { menu(message, sets); return }
        const channel = message.channel
        const card = set.randomCard()
        let m = await channel.send({ files: [ await card.load() ], content: `${set.setName}` })
    })
    client.login(process.env.TOKEN)
})()