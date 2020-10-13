import rp from 'request-promise';
import { getInfo, validateURL } from 'ytdl-core-discord';
import ytsr from 'ytsr';
import { ISong } from '../classes/Player';
import { ConvertDuration } from './musicUtil';


export function Get(url: string, options?: any) {
    if (!options)
        options = {
            method: 'GET',
            json: true,
        };

    return new Promise((resolve, reject) => {
        rp(url, options)
            .then(body => resolve(body))
            .catch(err => reject(err));
    });
}

export function rand(max: number) {
    return Math.floor(Math.random() * max);
}

//todo Change error return to make it compatable with QuickEmbed
export async function getSong(query: string): Promise<ISong> {
    try {
        if (validateURL(query)) {
            const details = (await getInfo(query)).videoDetails
            return {
                title: details.title,
                id: details.videoId,
                url: details.video_url,
                duration: ConvertDuration(details.lengthSeconds)
            }
        }

        const songSearch = await ytsr(query, { limit: 1 })
        if (!songSearch) return

        const res = songSearch.items[0]
        if (res.type !== 'video') return

        const details = (await getInfo(res.link)).videoDetails
        return {
            title: details.title,
            id: details.videoId,
            url: details.video_url,
            duration: ConvertDuration(details.lengthSeconds)
        }
    } catch (err) {
        console.error(err)
    }
}
