import {Message, MessageEmbed} from 'discord.js';
import {logger} from '../../app';
import {ICommand} from '../../classes/Command';
import {ISong} from '../../classes/Player';
import {convertPlaylistToSongs, getSong, isPlaylist} from '../../util/apiUtil';
import {createFavoriteCollector, getPlayer} from '../../util/musicUtil';
import {createFooter, embedColor} from '../../util/styleUtil';
import {CommandError} from "../../classes/CommandError";

export const command: ICommand = {
    name: 'play',
    description: 'Play a song',
    aliases: ['p'],
    usage: '[song]',
    args: true,

    async execute(message: Message, args: string[]) {
        //Get the users query
      let query = args.join(' ');

      //Make sure the user is in voice
      if (!message.member.voice.channel) {
          throw new CommandError(`You must be in a voice channel to play music`, this);
      }

      //Search for song
      const song = await getSong(query);

      //If song not found, tell the user.
        if (!song) throw new CommandError('Song not found', this);

      if (isPlaylist(song)) {
         const player = getPlayer(message);
         const playlistSongs = await convertPlaylistToSongs(song);

         const firstSong = playlistSongs[0];
         player.addSong(firstSong, message);

         const embed = createFooter(message)
            .setTitle(`Playlist: ${song.title}\n${song.items.length} Songs`)
            .setDescription(`Playing ${firstSong.title}\n${firstSong.url}\n\u200b`);

         for (let i = 1; i < playlistSongs.length && i < 20; i++) {
            const psong = playlistSongs[i];
            embed.addField(`${i + 1} ${psong.title}`, psong.url);
            player.queue.addSong(psong);
         }
         message.channel.send(embed);
         return;
      }

      //Otherwise play the song
      playSong(message, song);
   }
};

export async function playSong(message: Message, song: ISong) {
   //Get the guilds player
   const player = getPlayer(message);

   if (!player) return logger.log('warn', 'couldnt find player');
   if (!song) return message.channel.send('Couldnt find song');

   //Add the song to the player
   player.addSong(song, message);

   //Tell the user
   let embed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      .setTitle(song.title)
      .setDescription(`**Added to queue**\n${song.duration.duration}`)
      .setURL(song.url)
      .setColor(embedColor);

   const msg = await message.channel.send(embed);
   createFavoriteCollector(song, msg)
}
