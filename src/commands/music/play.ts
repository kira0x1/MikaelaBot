import { Message, MessageEmbed } from 'discord.js';
import { logger } from '../../app';
import { ICommand } from '../../classes/Command';
import { Song } from "../../classes/Song";
import { convertPlaylistToSongs, getSong, isPlaylist } from '../../util/apiUtil';
import { createFavoriteCollector, getPlayer } from '../../util/musicUtil';
import { createFooter, embedColor, QuickEmbed } from '../../util/styleUtil';
import { Player } from '../../classes/Player';
import { sendQueueEmbed } from './queue';

export const command: ICommand = {
   name: 'play',
   description: 'Play a song',
   aliases: ['p', 'add'],
   usage: '[song]',
   args: false,

   async execute(message: Message, args: string[]) {

      //Make sure the user is in voice
      if (!message.member.voice.channel) {
         return QuickEmbed(message, `You must be in a voice channel to play music`);
      }

      const player = getPlayer(message)

      if (args.length === 0) {
         resumeQueue(message, player)
         return
      }

      //Get the users query
      let query = args.join(' ');

      //Search for song
      const song = await getSong(query);

      //If song not found, tell the user.
      if (!song) return QuickEmbed(message, 'Song not found');

      if (isPlaylist(song)) {
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

export async function playSong(message: Message, song: Song) {
   //Get the guilds player
   const player = getPlayer(message);

   if (!player) return logger.log('warn', 'couldnt find player');
   if (!song) return message.channel.send('Couldnt find song');

   //Add the song to the player
   player.addSong(song, message);

   //Tell the user
   let embed = createFooter(message)
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      .setTitle(song.title)
      .setDescription(`**Added to queue**\n${song.duration.duration}`)
      .setURL(song.url)

   const msg = await message.channel.send(embed);
   createFavoriteCollector(song, msg)
}

async function resumeQueue(message: Message, player: Player) {
   if (!player.hasSongs()) {
      const embed = new MessageEmbed()
         .setColor(embedColor)
         .setTitle("Queue Empty, please add a song")

      message.channel.send(embed)
      return;
   }

   player.resumeQueue(message)
   const embed = createFooter(message).setTitle("Resuming Queue!")
   await message.channel.send(embed)
   sendQueueEmbed(message)
}