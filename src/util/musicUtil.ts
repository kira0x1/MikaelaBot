import chalk from 'chalk';
import { Client, Collection, Message } from 'discord.js';
import { IDuration, Player } from '../classes/Player';

const players: Collection<string, Player> = new Collection();

export function ConvertDuration(duration_seconds: number | string) {
  let minutes: number = Math.floor(Number(duration_seconds) / 60);
  let seconds: number | string = Math.floor(Number(duration_seconds) - minutes * 60);
  let hours = Math.floor(minutes / 60);

  if (seconds < 10) seconds = '0' + seconds;

  const duration: IDuration = {
    seconds: seconds.toString(),
    minutes: minutes.toString(),
    hours: hours.toString(),
    duration: `${minutes}:${seconds}`,
  };

  return duration;
}

export function initPlayers(client: Client) {
  client.guilds.cache.map(async guild => {
    const guildResolved = await client.guilds.fetch(guild.id);
    console.log(chalk.bgBlue.bold(`${guildResolved.name}, ${guildResolved.id}`));
    players.set(guildResolved.id, new Player(guildResolved, client));
  });
}

export function getPlayer(message: Message): Player {
  const guildId = message.guild.id;
  const playerFound = findPlayer(guildId)

  if (playerFound) {
    return playerFound
  }

  return setNewPlayer(message.client, guildId)
}

export function setNewPlayer(client: Client, guildId: string): Player {
  const guild = client.guilds.cache.get(guildId);
  const player = new Player(guild, client);
  players.set(guild.id, player);
  return player;
}

export function findPlayer(guildId: string): Player {
  return players.get(guildId);
}

export async function getTarget(message: Message, query: string) {
  query = query.toLowerCase();

  const mention = message.mentions.users.first()
  if (mention !== undefined) return mention;

  const guild = message.guild;

  let member = guild.members.cache.find(m => m.displayName.toLowerCase() === query || m.id === query);

  if (member) return member.user

  //If user wasnt found either due to a typo, or the user wasnt cached then query query the guild.
  const memberSearch = await guild.members.fetch({ query: query, limit: 1 })

  if (memberSearch && memberSearch.first()) {
    return memberSearch.first().user
  }
}
