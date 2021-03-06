import { Document, model, Schema } from 'mongoose';
import { Song } from '../../classes/Song';

// To support multiplebots in the same server we must give the bots id and the prefix
export interface PrefixSetting {
   prefix: string;
   botId: string;
}

export interface BannedChannel {
   id: string;
   name: string;
   bannedBy: string;
}

export interface IServer extends Document {
   serverId: string;
   serverName: string;
   queue: Song[];
   prefixes: PrefixSetting[];
   bannedChannels: BannedChannel[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ServerSchema = new Schema({
   serverId: { type: String, required: true },
   serverName: { type: String, required: true },
   queue: { type: Array<Song>(), required: true },
   prefixes: { type: Array<PrefixSetting>(), required: true },
   bannedChannels: { type: Array<BannedChannel>(), required: true }
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Server = model<IServer>('servers', ServerSchema);
