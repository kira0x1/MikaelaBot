import { ICommand } from '../../classes/Command';

const videoUrl = 'https://cdn.discordapp.com/attachments/642037173729624104/777496871001784350/TRUEoooooo.mp4'

export const command: ICommand = {
   name: 'True',
   aliases: ['truee', 'real', 'circlejerk'],
   description: 'Trrrueeeeeeeeeeee!!',

   async execute(message, args) {
      await message.channel.send(videoUrl);
   }
};
