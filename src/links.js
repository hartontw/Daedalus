const parser = require('fast-xml-parser');
const request = require('request');
const logger = require('./logger');
const URL = require('url').URL;
const searchYT = require('youtube-search');

function youtube(date, channel, link) {
    console.log(link);
    try {
        const opts = {        
            order: 'date',
            maxResults: 10,
            key: process.env.YOUTUBE_KEY
        };
    
        const url = new URL(link);
        const query = url.search ? url.search.match(/^\?[^=]+=([^;]+)/) : '';
        const pathname = url.pathname.match(/^\/c(?:hannel)?\/(.+)/);
        if (pathname) {
            opts.channelId = pathname[1];
        }
    
        searchYT(query, opts, (err, results) => {
            console.error(err);
            if(err) throw new Error(err);

            results = results.filter(i => i.kind === 'youtube#video' && Date.parse(i.publishedAt) > date).map(i => i.link);
            for(let result of results) {
                channel.send(result);
            }
        });
    }
    catch(error) {
        logger.error(error);
    }
}

function rss(date, channel, link) {    
    try {
        request(link, (err, res, body) => {
            if (err) throw new Error(err);
            if (!parser.validate(body)) throw new Error(`Invalid RSS: ${link}`);
            
            body = parser.parse(body);

            let entries;
            if (body.feed) {
                entries = body.feed.entry.filter(i => Date.parse(i.published) > date).map(i => i.link || i.id);                
            }
            else if (body.rss) {
                entries = body.rss.channel.item.filter(i => Date.parse(i.pubDate) > date).map(i => i.link || i.guid);
            }            

            for(let entry of entries) {
                channel.send(entry);
            }
        });
    }
    catch(error) {
        logger.error(error);
    }
}

function filter(link) {
    const url = new URL(link);
    const hostname = url.hostname.replace(/^www\./, '');    
    switch(hostname) {
        case 'youtube.com': return youtube;
        default: return rss;
    }
}

module.exports = (data, bot) => {
    const info = data.load(bot.channels.cache);
    const date = info.lastUpdate;
    for(let c in info.channels) {
        for(let link of info.channels[c]) {
            filter(link)(date, bot.channels.cache.get(c), link);
        }
    }
};