import { getPlayer } from '../../util/musicUtil';
import { ICommand } from '../../classes/Command';
import { QuickEmbed, wrap } from '../../util/styleUtil';
import { logger } from '../../app';
import { hasPerms } from '../../util/commandUtil';

export const command: ICommand = {
   name: 'volume',
   description: 'Change the volume',
   aliases: ['v'],
   usage: '[- | + | number]\n\nDisplays the volume if no arguments given',
   hidden: true,
   isDisabled: false,

   execute(message, args) {
      const arg = args.shift();
      const player = getPlayer(message);

      if (!player) return logger.log('info', 'no player found while using volume command');
      if (!arg) return QuickEmbed(message, `Volume is currently ${player.volume}`);

      if (!hasPerms(message.member, this.name)) {
         return message.author.send(`You do not have permission to use ${wrap(command.name)}`);
      }

      let amount: number | undefined;

      if (arg === '-') {
         amount = player.volume - 0.5;
      } else if (arg === '+') {
         amount = player.volume + 0.5;
      } else if (Number(arg)) {
         amount = Number(arg);
      }

      if (amount) {
         player.changeVolume(amount, message);
      }
   }
};
