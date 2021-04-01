const searchYT = require('youtube-search');
const URL = require('url').URL;
const logger = require('./logger');

function search(date, link) {    
    return new Promise( (resolve, reject) => {
        const opts = {        
            order: 'date',
            maxResults: 10,
            key: process.env.YOUTUBE_KEY
        };

        const url = new URL(link);
        const query = url.search ? url.search.match(/^\?[^=]+=([^;]+)/) : '';
        const channel = url.pathname.match(/^\/c(?:hannel)?\/(.+)/);
        if (channel) {
            opts.channelId = pathname[1];
        }
    
        searchYT(query, opts, (err, results) => {
            if(!err) {
                results = results.filter(i => i.kind === 'youtube#video' && Date.parse(i.publishedAt) > date).map(i => i.link);
                resolve(results);
            }
            else {
                reject(err);
            }
        });
    });
}

module.exports = (date, channels, send) => {
    for(let id in channels) {
        for(let link of channels[id]) {
            const url = new URL(link);
            const hostname = url.hostname.replace(/^www\./, '');
            if (hostname === 'youtube.com') {
                search(date, link)
                .then(results => {
                    for(let result of results) {
                        send(id, result);
                    }
                })
                .catch(logger.error);
            }
        }
    }
};