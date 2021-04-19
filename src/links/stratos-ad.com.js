const parser = require('fast-xml-parser');
const request = require('request');
const { MessageEmbed } = require('discord.js');
const { google } = require('googleapis');
const customsearch = google.customsearch('v1');
const logger = require('../logger');

const COLOR = 0xAAAAAA;
const LOGO = "https://www.stratos-ad.com/gfx/stratos-310x310.png";

async function searchLogo(company) {
    try {
        const res = await customsearch.cse.list({
            auth: process.env.GOOGLE_SEARCH_KEY,
            cx: process.env.GOOGLE_SEARCH_ENGINE,
            searchType: 'image',
            q: `${company} logo`
        });
    
        if (res && res.data && res.data.items) {
            company = company.toLowerCase();        
            for(let item of res.data.items) {            
                const title = item.title.toLowerCase();
                if (title.includes(company) && title.includes('logo')) return item.link;
            }
            return res.data.items[0].link;
        }
    }
    catch(error) {
        logger.error(error);
    }
}

function getParts(description, company) {        

    const PARTS = [
        {key: company, selector:''},
        {key: 'Requisitos mínimos', selector:'Requisitos mínimos:'},
        {key: 'Requisitos deseados', selector:'Requisitos deseados:'},
        {key: 'Responsabilidades', selector:'Responsabilidades:'},
        {key: 'Beneficios', selector:'Beneficios:'},
    ];

    const format = text => text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]/g, '')
    .trim()
    .replace(/^(?:<br[\s]*\/>)+/, '')
    .replace(/(?:<br[\s]*\/>)+$/, '')
    .replace(/(?:<br[\s]*\/>)+/g, '\n')
    .replace(/(?<!https?:\/\/)(www\.)/, 'https://www.');

    let index = 0;
    const getPart = text => {    
        let match;
        for(let i=index+1; i<PARTS.length; i++) {
            match = text.match(new RegExp(`${PARTS[index].selector}(.+?)(?=${PARTS[i].selector})`));
            if (match) {
                index = i;
                return format(match[1]);
            }
        }        
        match = text.match(new RegExp(`${PARTS[index].selector}(.+)`));
        index = PARTS.length;
        if (match) return format(match[1]);
    }

    const parts = {};
    while(index < PARTS.length) {
        parts[PARTS[index].key] = getPart(description);
    }
    return parts;
}

module.exports = (date, link) => {    
    return new Promise( (resolve, reject) => {        
        request(link, async (err, res, body) => {
            if (!err) {
                if (parser.validate(body)) {
                    let results = [];
                    const entries = parser.parse(body).rss.channel.item.reverse().filter(i => new Date(i.pubDate) > date);
                    for(let entry of entries) {
                        const author = "Stratos";
                        const title = entry.title.match(/busca\s*(.+)/)[1].trim();
                        const company = entry.title.match(/(.+?)(?=busca)/)[1].trim();

                        const logo = await searchLogo(company);

                        const parts = getParts(entry.description, company);

                        const length = 2048 - author.length - title.length - Object.keys(parts).join('').length;
                        
                        const partLength = Math.min(128, length / Object.keys(parts).length);

                        const embed = new MessageEmbed();
                        embed.setColor(COLOR);
                        embed.setAuthor(author, LOGO); 
                        embed.setTitle(title);
                        for (let p in parts) {
                            if (parts[p].length > partLength) {
                                parts[p] = parts[p].substring(0, partLength-3) + '...';
                            }
                            embed.addField(p, parts[p]);
                        }
                        embed.setURL(entry.link);
                        if (logo) {
                            embed.setThumbnail(logo);
                        }                        
        
                        results.push(embed);
                    }
                    resolve(results);
                }
                else {
                    reject(`Invalid ${link}`);
                }
            }
            else {
                reject(err);
            }
        });
    });
}