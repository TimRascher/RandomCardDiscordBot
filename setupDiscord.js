import Discord, { Client } from "discord.js"

export default () => {
    let intents = new Discord.IntentsBitField()
    const I = Discord.IntentsBitField.Flags
    intents.add(I.DirectMessages)
    intents.add(I.Guilds)
    intents.add(I.GuildMessages)
    intents.add(I.MessageContent)
    return new Client({ intents: intents })
}