import {MessageEmbed} from 'discord.js';

import {getPlayer} from '../../util/musicUtil';
import {ICommand} from '../../classes/Command';
import {embedColor} from '../../util/styleUtil';
import {CommandError} from '../../classes/CommandError';

export const command: ICommand = {
    name: 'Pause',
    description: 'Pause the currently playing song',
    aliases: ['ps'],
    hidden: true,

    async execute(message, _) {
        //Get the guilds player
        const player = getPlayer(message);

        //Make sure a player exists
        if (!player) return;

        //If theres no song playing or if the stream dispatcher is undefined exit out
        if (!player.currentlyPlaying || !player.getStream())
            throw new CommandError(`No song currently playing to pause`, this);

        //If the stream is already paused exit out
        if (player.stream.paused) throw new CommandError(`Player is already paused`, this);

        //Pause the player
        player.pause();

        const embed = new MessageEmbed();
        embed.setAuthor(message.author.username, message.author.displayAvatarURL({dynamic: true}));
        embed.setTitle(`Paused ${player.currentlyPlaying.title}`);
        embed.setColor(embedColor);

        await message.channel.send(embed);
    }
};
