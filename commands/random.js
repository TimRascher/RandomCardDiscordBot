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
        .setName("random")
        .setDescription("Shows a random card from the chosen Set.")
        .addStringOption(option => 
            option.setName("set")
            .setDescription("The set id to choose a card from.")
            .setRequired(true)),
    /** @param { import("discord.js").Interaction } interaction */
    async execute(interaction) {
        if (!gSets) { throw "Sets not found." }
        let setId = interaction.options.getString("set")
        let set = gSets.set(setId)
        if (!set) { await interaction.reply({ content: await menuText(), ephemeral: true })}
        const card = await set.randomCard()
        await interaction.reply({ files: [ await card.load() ], content: `${set.setName} - ${card.id}` })
    },
    /** @param { import("../setLoader.js").Sets } sets */
    register(sets) {
        gSets = sets
    }
}
