import { ICommand } from '../../classes/Command';

const notPogLink = 'https://cdn.discordapp.com/attachments/709803931878031404/752487923353649202/Senko_not_poggers.mp4'

export const command: ICommand = {
   name: 'NotPoggers',
   aliases: ['npog', 'notpoggie', 'notpoggies', 'notpog'],
   description: 'Post not poggers video uwu',

   async execute(message, args) {
      await message.channel.send(notPogLink);
   }
};
