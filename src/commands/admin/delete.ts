import { ICommand } from '../../classes/Command';
import { createFooter } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'delete',
    description: 'Deletes messages',
    usage: '[amount]',
    aliases: ['d'],
    perms: ['kira'],
    hidden: true,

    async execute(message, args) {
        if (message.author.id !== '177016697117474816') {
            await message.author.send('You do not have permission to use this command');
            return;
        }

        let amount = 2;
        args.find(arg => {
            if (Number(arg)) {
                amount = Number(arg) + 1;
            }
        });

        //If the channel is not a text channel then we cant bulkdelete so return
        if (message.channel.type !== 'text') return;
        const author = message.author;

        try {
            const messagesDeleted = await message.channel.bulkDelete(amount);
            if (!messagesDeleted) return;

            const embed = createFooter(message)
                .setTitle(`${author.username} deleted ${messagesDeleted.size} messages`)
                .setDescription(`Server:\n\tName: ${message.guild.name}\n\tID:${message.guild.id}`);

            messagesDeleted.map((del, i) => embed.addField(`${i}) From: ${del.author.username}`, del.content));
            await author.send(embed);
        } catch (err) {
            await author.send(`Error deleting messages in  ${message.guild}, channel: ${message.channel.name}`);
        }
    }
};
