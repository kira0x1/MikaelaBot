import { Command } from '../../classes/Command';
import { Player } from '../../classes/Player';
import { createDeleteCollector, getPlayer } from '../../util/musicUtil';
import { addCodeField, createFooter, quickEmbed } from '../../util/styleUtil';
import { updateLastQueue } from './queue';

export const command: Command = {
   name: 'remove',
   description: 'Remove a song from queue',
   usage: '[position in queue]',
   aliases: ['r'],

   async execute(message, args) {
      const player = getPlayer(message);
      if (!player) return;

      if (!player.hasSongs()) return quickEmbed(message, 'Queue is empty');

      const numbers = args.filter(arg => {
         const n = Number(arg);
         if (n !== NaN && n !== undefined) return n;
      });

      const arg1 = numbers[0];
      const arg2 = numbers[1];

      if (!arg1) return;

      let pos;

      try {
         pos = checkPos(arg1, player);
      } catch (error) {
         return quickEmbed(message, error.message);
      }

      let pos2;

      if (arg2) {
         try {
            pos2 = checkPos(arg2, player);
         } catch (error) {
            return quickEmbed(message, error.message);
         }
      }

      if (pos2) {
         const songs = player.queue.songs.splice(
            Math.max(0, pos - 1),
            Math.min(pos2, player.queue.songs.length)
         );

         const embed = createFooter(message)
            .setTitle(`Removed ${songs.length} ${songs.length == 1 ? 'song' : 'songs'} from the queue`)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));

         addCodeField(embed, songs.map((s, i) => `${i + 1}: ${s.title}`).join('\n'));

         message.channel.send(embed).then(msg => createDeleteCollector(msg, message));
         updateLastQueue(message);
         return;
      }

      const song = player.queue.removeAt(pos).shift();
      if (!song) return quickEmbed(message, 'Couldnt find song');

      const embed = createFooter(message)
         .setTitle(`Removed song\n${song.title}`)
         .setURL(song.url)
         .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));

      message.channel.send(embed).then(msg => createDeleteCollector(msg, message));
      updateLastQueue(message);
   }
};

function checkPos(arg: number | string, player: Player) {
   const pos = Number(arg);
   if (pos === NaN) throw new Error(`Remove position must be a number`);

   if (pos < 1 || pos > player.getSongs().length + 1) throw new Error(`Invalid position`);

   return pos;
}
