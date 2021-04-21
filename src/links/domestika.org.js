const request = require('request');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

module.exports = (date, link) => {
    return new Promise( (resolve, reject) => {       
        request(link, (err, res, body) => {
            if (!err)  {
                let lastUpdate;                
                const results = [];
                const $ = cheerio.load(body);
                $('.job-item').each(function (i, elm) {
                    let jobDate = $(elm).find('.job-item__date').text().trim().split('/');
                    jobDate = new Date(Date.UTC(Number(jobDate[2]) + 2000, (jobDate[1] - 1) % 12, jobDate[0]));
        
                    if (jobDate > date) {
                        lastUpdate = lastUpdate ? Math.max(lastUpdate, jobDate) : jobDate;

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
                        embed.setTimestamp(jobDate);
        
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