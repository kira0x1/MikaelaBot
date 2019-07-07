const discord = require('discord.js')
const { prefix } = require('../config.json')
const sendDM = false
const { perms, usage } = require('../util/util')

module.exports = {
  name: 'help',
  description: 'lists all commands',
  aliases: ['h', 'commands', 'mikaela', 'cmd'],
  guildOnly: false,
  usage: '[command name]',
  cooldown: 15,

  execute(message, args) {
    const data = []
    const embed = new discord.RichEmbed().setColor(0xc71459)
    const { commands } = message.client

    //Send all commands if no arguments given
    if (!args.length) {
      data.push('List of commands:')
      data.push(commands.map(command => command.name).join(', '))
      data.push(`\nTo get info about a specific command send \`${prefix}<help> [command name]\``)

      // let embed = new discord.RichEmbed()
      embed.setTitle(data[0]).setFooter(data[2])

      commands.map(command => {
        if (perms(command.perms, message.author.id) && command !== undefined) {
          embed.addField(command.name, command.description)
        }
      })

      if (sendDM) {
        message.author
          .send(data, { split: true })
          .then(() => {
            if (message.channel.type === 'dm') return

            message.channel.send('I sent you a DM with a list of commands :smile:')
          })
          .catch(error => {
            console.error(`Failed to send help DM to ${message.author.tag}.\n`, error)
            message.channel.send("Failed to DM you. You might have DM's disabled")
          })
      } else if (!sendDM) {
        message.channel.send(embed).catch(error => {
          console.error(error)
        })
      }

      return
    }

    //Send specific command
    const name = args[0].toLowerCase()
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

    if (!command) {
      return message.channel.send(`command not found: ${name}`)
    }

    const embedSpecific = new discord.RichEmbed()
      .setTitle(`Command: ${command.name}`)
      .setColor(0xc71459)
      .setDescription(`\`Description: ${command.description}\``)
      .addField('Aliases', `\`${command.aliases || 'None'}\``)
      .addField('Usage', usage(command))
      .addField('Cooldown', `\`${command.cooldown || 3} second(s)\``)

    message.channel.send({ embed: embedSpecific })
    // data.push(`**Name:** ${command.name}`)
    // if (command.aliases) data.push(`**Aliases:** ${command.aliases}`);
    // if (command.description) data.push(`**Description:** ${command.description}`);
    // data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
    // if (command.usage) data.push(usage(command));
    // `**Usage:** ${prefix}${command.name} ${command.usage}`);

    // message.channel.send(data, { split: true })
  },
}
