import fso from "fs"
import { AttachmentBuilder, Attachment } from "discord.js"
const fs = fso.promises

/**
 * @typedef { Object } SetData
 * @property { String } setName
 * @property { String } id
 * @property { [String] } cards
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
 */

const baseDir = "./data/cards"

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
        file.cards = files
        file.dir = dir
        return file
    } catch(error) {
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
    /** @type { [String] } */
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
    card(name) {
        return { 
            name: name,
            path: `${this.dir}/${name}`,
            load: async () => {
                let file = await fs.readFile(`${this.dir}/${name}`)
                return new AttachmentBuilder(file).attachment
            }
        }
    }
    /** @return { FileInfo } */
    randomCard() {
        const randomIndex = Math.floor(Math.random() * this.cards.length)
        const name = this.cards[randomIndex]
        return this.card(name)
    }
}

class Sets {
    /** @type { [Set] } */
    sets
    constructor() {}
    async update() {
        let dirInfo = (await fs.readdir(baseDir)).filter(i => !i.startsWith("."))
        this.sets = (await Promise.all(dirInfo.map(async (dir) => {
            return await LoadSetJSON(dir)
        }))).filter(i => i != null).map(i => new Set(i)).sort((a, b) => { return a.setName - b.setName })
        return this
    }
    /**
     * @param { String } id 
     * @return { Set }
     **/
    set(id) { return this.sets.filter(set => set.id.toLocaleLowerCase() == id.toLocaleLowerCase())[0] }
    static create() { return new Sets() }
}

export { Sets }