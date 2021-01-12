import { MessageEmbed } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { createFooter } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'serverinfo',
    description: 'Shows info of the current server',
    aliases: ['srvinfo', 'guild'],

    async execute(message, _) {
        let guild = message.guild;
        let embed: MessageEmbed = createFooter(message);

        embed.setTitle('Server info');

        let description: string = guild.description || `Server info for ${guild}`;
        embed.setDescription(description);

        embed.setThumbnail(guild.iconURL({size: 1024}));

        embed.addField('Server ID', `\`${guild.id}\``);
        embed.addField('Created at', guild.createdAt.toUTCString());
        embed.addField('Owner', guild.owner, true);
        embed.addField('Members', guild.memberCount, true);
        embed.addField('Region', guild.region, true);

        await message.channel.send(embed);
    }
};
