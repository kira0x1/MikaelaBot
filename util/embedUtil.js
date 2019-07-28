const Discord = require('discord.js')
const util = require('../util/util')
const { ConvertDuration } = require('../subcommands/music_commands/musicUtil')
const ms = require('ms')

async function quickEmbed(title) {
    const embed = new Discord.RichEmbed()
        .setTitle(title)
        .setColor(0xc71459)

    await util.getCurrentMessage().channel.send(embed)
}

/**
 *
 *
 * @param {Discord.Message} message
 * @param {{ tag: userTag, user: target }} target
 * @param {Array} songs
 * @param {Number} pageAt
 */
async function songPageEmbed(message, target, pages) {
    let pageAt = 0
    let pageAmount = pages.length

    let totalSongs = 0
    pages.map(pg => totalSongs += pg.songs.length)

    const embed = new Discord.RichEmbed()

    if (totalSongs === 0)
        embed.addField('\u200b', '***no favorites 😕***')

    embed.addField(`\n\n***Favorites***\nPage **${pageAt + 1}**\nTotal Songs **${totalSongs}**`, '\u200b')
        .setThumbnail(target.user.avatarURL || target.user.user.avatarURL)
        .setColor(0xc71459)

    if (totalSongs > 0)
        await embedSongs(embed, pages[pageAt].songs, pageAt)

    let msg = await message.channel.send(embed)
    if (pages.length <= 1) return

    await msg.react('⬅')
    msg.react('➡')


    const filter = (reaction, user) => {
        return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !user.bot
    }
    const collector = msg.createReactionCollector(filter, { time: ms('15m') })
    collector.on('collect', async r => {
        if (r.emoji.name === '➡') {
            pageAt++
            if (pageAt >= pageAmount) pageAt = 0
        }
        else if (r.emoji.name === '⬅') {
            pageAt--
            if (pageAt < 0) pageAt = pageAmount - 1;
        }

        r.remove(r.users.last())

        const newEmbed = new Discord.RichEmbed()
            .setThumbnail(target.user.avatarURL || target.user.user.avatarURL)
            .addField(`\n\n***Favorites***\nPage **${pageAt + 1}**\nTotal Songs **${totalSongs}**`, '\u200b')
            .setColor(0xc71459)

        await embedSongs(newEmbed, pages[pageAt].songs, pageAt)

        await r.message.edit(newEmbed)
    })

    collector.on('end', collected => {
        msg.clearReactions().catch(console.error)
    })
}

/**
 *
 *
 * @param {Message} message
 * @param {Array} values
 * @param {Number} valuesPerPage
 */
async function pageEmbed(message, values, valuesPerPage, word) {
    let embed = new Discord.RichEmbed()
        .setColor(0xc71459)

    if (values.length === 0) {
        embed.setTitle(`No definition found for ${word} 😕`)
        return message.channel.send(embed)
    }
    const pageAmount = Math.floor(values.length / valuesPerPage)

    embed.setTitle(`**Urban Dictionary definition for** ***${word}***`)

    await embedDefinition(embed, values, 0, valuesPerPage)
    message.channel.send(embed)
}

/**
 *
 *
 * @param {Discord.RichEmbed} embed
 * @param {Array} songs
 */

async function embedDefinition(embed, values, pageAt, valuesPerPage) {
    values.slice(0, 3).map((def, pos) => {
        let defString = def.definition
        if (defString.length >= 1024)
            defString = defString.substr(0, 850) + '...'
        embed.addField(`**${(pageAt * valuesPerPage) + (pos + 1)}  Definition:**`, `**${defString}**\n*Upvotes:* **${def.thumbs_up}**  *Downvotes:* **${def.thumbs_down}**`)
    })

}

async function embedSongs(embed, songs, pageAt) {
    songs.map((song, pos) => {
        embed.addField(`**${(pageAt * 5) + (pos + 1)}  ${song.song_title}**`, ConvertDuration(song.song_duration))
    })
}

module.exports = { quickEmbed, songPageEmbed, pageEmbed }