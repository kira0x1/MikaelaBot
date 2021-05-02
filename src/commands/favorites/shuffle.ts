import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { findOrCreate } from '../../database/api/userApi';
import { getTarget } from '../../util/discordUtil';
import { createDeleteCollector, getPlayer, randomUniqueArray } from '../../util/musicUtil';
import { createFooter, embedColor, quickEmbed, sendErrorEmbed } from '../../util/styleUtil';

const maxShuffleAmount = 20;

export const command: Command = {
   name: 'shuffle',
   description: 'Shuffle songs from a favorites list',
   usage: '[amount: optional] [target: optional]',
   aliases: ['random', 'mix', 'rand', 'sh'],
   cooldown: 1,

   async execute(message, args) {
      let amount = 1;

      args.find((arg, pos) => {
         if (Number(arg)) {
            amount = Number(arg);
            args.splice(pos, 1);
         }
      });

      let target = message.author;
      if (args.length > 0) target = await getTarget(message, args.join(' '));

      if (!target) return quickEmbed(message, `Could not find user \`${args.join(' ')}\``);

      const user = await findOrCreate(target);

      if (!user.favorites || user.favorites.length == 0) {
         return sendErrorEmbed(
            message,
            `Cannot shuffle from user <@${user.id}>\nuser must add songs to their favorites list first`,
            { errorTitle: 'User has no favorites' }
         );
      }

      const embed = createFooter(message);
      embed.setColor(embedColor);

      const player = getPlayer(message);
      if (!player) return logger.log('error', `Could not find player for guild ${message.guild.name}`);

      if (amount > maxShuffleAmount) {
         embed.setFooter(`Max Amount is ${maxShuffleAmount}!`);
         amount = maxShuffleAmount;
      }

      const title = `Shuffling ${amount} ${amount > 1 ? 'songs' : 'song'} from ${user.username}`;

      const random = randomUniqueArray(user.favorites);
      const firstSong = random();

      const favSource = user.id;
      const playedBy = message.author.id;

      firstSong.favSource = favSource;
      firstSong.playedBy = playedBy;

      embed.setTitle(title);

      let startIndex = 1;

      if (!player.isPlaying) {
         embed.addField(`Playing ${firstSong.title}`, `${firstSong.url}\n\u200b`);
         startIndex = 0;
      } else {
         embed.addField(`1 ${firstSong.title}`, firstSong.url);
      }

      embed.setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));
      embed.setThumbnail(target.displayAvatarURL({ dynamic: true }));

      player.addSong(firstSong, message);

      const songsAdding = [firstSong];

      for (let i = startIndex; i < amount; i++) {
         let song = random();

         if (songsAdding.includes(song) && songsAdding.length < user.favorites.length) {
            let hasFoundSong = false;
            while (!hasFoundSong) {
               song = random();
               if (!songsAdding.includes(song)) hasFoundSong = true;
            }
         }

         song.favSource = favSource;
         song.playedBy = playedBy;

         songsAdding.push(song);
         embed.addField(`${i + 1} ${song.title}`, song.url);
         player.addSong(song, message);
      }

      const msg = await message.channel.send(embed);
      createDeleteCollector(msg, message);
   }
};
