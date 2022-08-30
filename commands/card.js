import { SlashCommandBuilder } from "discord.js"

/** @type { import("../setLoader.js").Sets } */
let gSets

/** @return { String } */
const menuText = async () => {
    let { default: command } = await import("./sets.js")
    return command.menu(gSets)
}

export default {
    data: new SlashCommandBuilder()
        .setName("card")
        .setDescription("Shows a specific card from the chosen Set.")
        .addStringOption(option => 
            option.setName("set")
            .setDescription("The set id to choose a card from.")
            .setRequired(true))
        .addIntegerOption(option => 
            option.setName("card")
            .setDescription("The card id to display.")
            .setRequired(true)),
    /** @param { import("discord.js").Interaction } interaction */
    async execute(interaction) {
        if (!gSets) { throw "Sets not found." }
        let setId = interaction.options.getString("set")
        let cardId = interaction.options.getInteger("card")
        let set = gSets.set(setId)
        if (!set) { await interaction.reply({ content: await menuText(), ephemeral: true })}
        const card = await set.cardForId(cardId)
        await interaction.reply({ files: [ await card.load() ], content: `${set.setName} - ${card.id}` })
    },
    /** @param { import("../setLoader.js").Sets } sets */
    register(sets) {
        gSets = sets
    }
}