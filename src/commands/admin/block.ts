import { Message } from 'discord.js';
import { logger } from '../../app';
import { ICommand } from '../../classes/Command';
import { AddBlocked, blockedUsers } from '../../db/dbBlocked';
import { getTarget } from '../../util/musicUtil';
import { createFooter, QuickEmbed, wrap } from '../../util/styleUtil';
import { CommandError } from '../../classes/CommandError';

export const command: ICommand = {
   name: 'Block',
   description: 'Block user from using the bot',
   aliases: ['blocked', 'bl'],
   perms: ['admin'],
   args: true,

   async execute(message, args) {
      if (args[0] === '--list') {
         listBlocked(message);
         return;
      }

      const query = args.join(' ');
      const target = await getTarget(message, query);
      if (!target) return QuickEmbed(message, `Member \"${query}\" not found`);

      if (blockedUsers.has(target.id))
         throw new CommandError(`Member \"${target.tag}\" is already blocked`);

      const blockedResponse = await AddBlocked(target.tag, target.id);
      logger.log('info', blockedResponse);

      if (!blockedResponse) {
         throw new Error(`Error while blocking user: ${query}`);
      }

      const embed = createFooter(message)
         .setTitle(`Blocked: \"${target.tag}\"`)
         .setDescription(target.id);

      await message.channel.send(embed);
   }
};

function listBlocked(message: Message) {
   const embed = createFooter(message);

   if (blockedUsers.size === 0) embed.setTitle('Blocked List Empty');
   else embed.setTitle(`Blocked: ${blockedUsers.size}`);

   // const blockedCount = blockedUsers.size;
   // embed.title = blockedCount ? 'Blocked List Empty' : `Blocked: ${blockedCount} Users`

   blockedUsers.map((name, id) => {
      embed.addField(name, wrap(id), true);
   });

   message.channel.send(embed);
}
