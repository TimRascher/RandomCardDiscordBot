import fso from "fs"
import { AttachmentBuilder, Attachment } from "discord.js"
import chokidar from "chokidar"
const fs = fso.promises

/**
 * @typedef { Object } CardInfo
 * @property { String } filename
 * @property { Number } id
 */

/**
 * @typedef { Object } SetData
 * @property { String } setName
 * @property { String } id
 * @property { [CardInfo] } cards
 * @property { String } dir
 */

/**
 * @typedef { Function } FileLoad
 * @return { Attachment }
 */

/**
 * @typedef { Object } FileInfo
 * @property { String } name
 * @property { String } path
 * @property { FileLoad } load
 * @property { Number } id
 */

const baseDir = "./data/cards"
/** @type { [Set] } */
let sets = []

/**
 * @param { String } name
 * @return { Number }
 **/
const GetId = (name) => {
    return Number(name.split(".")[0])
}

const RefreshData = async () => {
    const dirInfo = (await fs.readdir(baseDir)).filter(i => !i.startsWith("."))
    sets = (await Promise.all(dirInfo.map(async (dir) => {
        return await LoadSetJSON(dir)
    }))).filter(i => i != null).map(i => new Set(i)).sort((a, b) => { return a.setName - b.setName })
}
/**
 * @param { String } directory 
 * @returns { SetData }
 */
const LoadSetJSON = async (directory) => {
    const filename = "set.json"
    const dir = `${baseDir}/${directory}`
    const filepath = `${dir}/${filename}`
    try {
        const fileRaw = await fs.readFile(filepath)
        let file = JSON.parse(fileRaw)
        const files = (await fs.readdir(dir)).filter(i => !i.startsWith(".") && i != filename)
        file.cards = files.map((file) => { return { filename: file, id: GetId(file) }})
        file.dir = dir
        return file
    } catch (error) {
        console.log(error)
        return null
    }
}

class Set {
    /** @type { String } */
    id
    /** @type { String } */
    setName
    /** @type { String } */
    dir
    /** @type { [CardInfo] } */
    cards
    /** @param { SetData } set */
    constructor(set) {
        this.id = set.id
        this.setName = set.setName
        this.dir = set.dir
        this.cards = set.cards
    }
    /** 
     * @param { String } name
     * @return { FileInfo }
     */
    async card(name) {
        return {
            name: name,
            path: `${this.dir}/${name}`,
            load: async () => {
                let file = await fs.readFile(`${this.dir}/${name}`)
                return new AttachmentBuilder(file).attachment
            },
            id: GetId(name)
        }
    }
    /** 
     * @param { String } name
     * @return { FileInfo }
     */
     async cardForId(id) {
        const cardInfo = this.cards.filter(card => card.id == id)[0]
        if (!cardInfo) { return null }
        return await this.card(cardInfo.filename)
    }
    /** @return { FileInfo } */
    async randomCard() {
        const randomIndex = Math.floor(Math.random() * this.cards.length)
        const name = this.cards[randomIndex].filename
        return await this.card(name)
    }
}

class Sets {
    constructor() { }
    /** @type { [Set] } */
    get sets() { return sets }
    /**
     * @param { String } id 
     * @return { Set }
     **/
    set(id) { return this.sets.filter(set => set.id.toLocaleLowerCase() == id.toLocaleLowerCase())[0] }
    static create() { return new Sets() }
}

export { Sets }

(async () => {
    chokidar.watch('./data/cards').on('all', async (event, path) => {
        if (path.endsWith("set.json")) { await RefreshData() }
    })
})()