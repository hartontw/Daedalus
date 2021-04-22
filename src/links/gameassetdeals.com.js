const request = require('request');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

function getPublishedDate(ago) {
    const published = Date.now();
    const days = ago.match(/(\d+)\s+days\s+ago/);
    if (days) return new Date(published - days[1] * 24 * 3600000);
    const hours = ago.match(/(\d+)\s+hours\s+ago/);
    if (hours) return new Date(published - hours[1] * 3600000);
    const minutes = ago.match(/(\d+)\s+minutes\s+ago/);
    if (minutes) return new Date(published - minutes[1] * 60000);
    const seconds = ago.match(/(\d+)\s+seconds\s+ago/);
    if (seconds) return new Date(published - seconds[1] * 1000);
    return new Date(0);
}

module.exports = (date, link) => {
    return new Promise( (resolve, reject) => {       
        request(link, (err, res, body) => {
            if (!err)  {
                let lastUpdate;                
                const results = [];
                
                const $ = cheerio.load(body);
                $('div.container.center-block li.col-md-4').each(function (i, elm) {                    
                    const trs = $(elm).find('tr');
                    const ago = $(trs[5]).find('td.overflow-ellipsis').text();
                    const published = getPublishedDate(ago);
                    if (published > date) {
                        lastUpdate = lastUpdate ? Math.max(lastUpdate, published) : published;

                        const tds = $(trs[0]).find('td');
                        const url = $(tds[0]).find('a').attr('href');
                        const image = $(tds[0]).find('img').attr('src').replace(/(?<!https?:)(\/\/)/, 'https://');
                        const title = decodeURI($(tds[1]).find('b').text());

                        const company = $(trs[1]).find('td').text();

                        const category = decodeURI($(trs[2]).find('td').text());

                        const price = $(trs[4]).find('td').text().trim().match(/^(\$\d+\.\d+)/)[1];
                        const lastPrice = $(trs[4]).find('td s').text().trim();
                        const priceDrop = $(trs[4]).find('td span').text().trim(); 

                        const priceField = price + (lastPrice ? ` ~~${lastPrice}~~ ${priceDrop}` : '');

                        const embed = new MessageEmbed();
                        embed.setColor(0x222F37);
                        embed.setAuthor("Game Assets Deals", "https://www.gameassetdeals.com/images/new-site-icon.png");
                        embed.setTitle(title);
                        embed.addField("Author", company);
                        embed.addField("Category", category);                        
                        embed.addField("Price", priceField);
                        embed.setURL(url);
                        embed.setThumbnail(image);
                        embed.setTimestamp(published);
        
                        results.push(embed);
                    }
                });
                
                resolve({results, lastUpdate});
            }
            else {
                reject(err);
            }
        });        
    });    
}