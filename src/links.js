const parser = require('fast-xml-parser');
const request = require('request');
const logger = require('./logger');
const URL = require('url').URL;
const searchYT = require('youtube-search');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

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

function domestika(date, channel, link) {
    try {
        request(link, (err, res, body) => {
            if (err) throw new Error(err);

            const $ = cheerio.load(body);
            $('.projects-badge-list li').each(function(i, elm) {
                let jobDate = $(elm).find('.job-item__date').text().trim().split('/');                
                jobDate = new Date(Date.UTC(Number(jobDate[2])+2000, (jobDate[1]-1)%12, jobDate[0]));                                

                if (jobDate > date) {
                    const thumb = $(elm).find('.job-item__logo');

                    const url = $(thumb).attr('href');
                    const image = $(thumb).find('picture img').attr('data-src');

                    const title = $(elm).find('.job-title').text();
                    const company = $(elm).find('.job-item__company').text();
                    const description = $(elm).find('.job-item__excerpt').text();

                    let color = 0x00AE86;
                    const type = $(elm).find('.circle-badge');
                    if (type) {
                        if (type.hasClass('circle-badge--full_time')) color = 0xFD608B;
                        else if (type.hasClass('circle-badge--contract')) color = 0x3B5998;
                        else if (type.hasClass('circle-badge--freelance')) color = 0xF2A82D;
                        else if (type.hasClass('circle-badge--part_time')) color = 0x52AB43;
                        else if (type.hasClass('circle-badge--internship')) color = 0xFF6400;
                    }

                    const embed = new MessageEmbed();
                    embed.setColor(color);
                    embed.setAuthor("Domestika", "https://pbs.twimg.com/profile_images/460779702576107520/UV6FudNq_400x400.png");
                    embed.setTitle(title);
                    embed.addField(company, description, true);
                    embed.setURL(url);
                    embed.setThumbnail(image);

                    channel.send(embed);
                }
            });
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
        case 'domestika.org': return domestika;
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