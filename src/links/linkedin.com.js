const request = require('request');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

module.exports = (date, link) => {
    return new Promise( (resolve, reject) => {       
        const options = {
            url: link,
            headers: {
              'User-Agent': 'request'
            }
          };
        request(options, (err, res, body) => {
            if (!err)  {
                let lastUpdate;                
                const results = [];

                const $ = cheerio.load(body);
                $('li.result-card').each(function (i, elm) {
                    let jobDate = $(elm).find('time').attr('datetime').trim().split('-');
                    jobDate = new Date(Date.UTC(Number(jobDate[0]), (jobDate[1] - 1) % 12, jobDate[2]));
        
                    if (jobDate > date) {
                        lastUpdate = lastUpdate ? Math.max(lastUpdate, jobDate) : jobDate;    

                        const title = $(elm).find('h3.result-card__title.job-result-card__title').text();
                        const company = $(elm).find('h4.result-card__subtitle.job-result-card__subtitle').text();
                        const city = $(elm).find('span.job-result-card__location').text();
                        const url = $(elm).find('a.result-card__full-card-link').attr('href').replace(/&amp/g, '&');
                        const image = $(elm).find('img.artdeco-entity-image').attr('data-delayed-url').replace(/&amp/g, '&');
        
                        const embed = new MessageEmbed();
                        embed.setColor(0x0A66C2);
                        embed.setAuthor("LinkedIn", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/768px-LinkedIn_logo_initials.png");
                        embed.setTitle(title);
                        embed.addField(company, city, true);
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