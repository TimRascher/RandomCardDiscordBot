import { SlashCommandBuilder } from "discord.js"

/** @type { import("../setLoader.js").Sets } */
let gSets

export default {
    data: new SlashCommandBuilder()
        .setName("sets")
        .setDescription("Shows Available Sets."),
    /** @param { import("discord.js").Interaction } interaction */
    async execute(interaction) {
        if (!gSets) { throw "Sets not found." }
        let menuText = this.menu(gSets)
        await interaction.reply(menuText)
    },
    /**
     * @param { import("../setLoader.js").Sets } sets
     * @return { String }
     **/
    menu(sets) {
        let menuText = "Sets:\n"
        gSets.sets.forEach((set) => {
            menuText += `${set.id}: ${set.setName} (1-${set.cards.length})\n`
        })
        return menuText
    },
    /** @param { import("../setLoader.js").Sets } sets */
    register(sets) {
        gSets = sets
    }
}
