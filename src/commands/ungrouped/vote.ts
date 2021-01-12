import {MessageEmbed} from 'discord.js';
import {logger} from '../../app';

import {ICommand} from '../../classes/Command';
import {embedColor} from '../../util/styleUtil';
import {CommandError} from "../../classes/CommandError";

const voteEmojis = [
    {name: 'one'},
    {name: 'two'},
    {name: 'three'},
    {name: 'four'},
    {name: 'five'},
    {name: 'six'},
    {name: 'seven'},
    {name: 'eight'},
   { name: 'nine' }
];

export const command: ICommand = {
   name: 'Vote',
   description: 'Create a strawpoll',
   usage: '[option1, option2, ...etc] [optional: -title]',
   aliases: ['strawpoll'],

   async execute(message, args) {
      let title = 'strawpoll';
      let options = args.join(' ').split(',');

      let votes: string[] = [];

      //find -title
      options.map((arg, pos) => {
         if (arg.includes('-title')) {
            title = arg.slice(7, arg.length);
         } else {
            votes.push(arg);
         }
      });

      const embed = new MessageEmbed().setTitle(title).setColor(embedColor);

      if (votes.length > 9) {
          throw new CommandError(`max options 9`, this);
      }

      for (let i = 0; i < votes.length; i++) {
         let vote = votes[i];
         embed.addField(vote, `${i + 1}`, true);
      }

      try {
         const messageSent = await message.channel.send(embed);
         for (let i = 0; i < votes.length; i++) {
            const emoji = messageSent.client.emojis.cache.find(
               emoji => emoji.name === voteEmojis[i].name
            );
            await messageSent.react(emoji.id);
         }
      } catch (err) {
         logger.log('error', err);
      }
   }
};
