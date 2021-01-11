import { ICommand } from '../../classes/Command';

const pogLink = 'https://cdn.discordapp.com/attachments/709803931878031404/751941837673201684/Poggers.mp4'

export const command: ICommand = {
   name: 'poggers',
   description: 'Posts a poggie woggie',
   aliases: ['poggie', 'pog', 'pogger'],

   async execute(message, args: string[]) {
      await message.channel.send(pogLink);
   }
};
