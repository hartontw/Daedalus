const udemy = require('../apis/udemy');
const { MessageEmbed } = require('discord.js');

module.exports = (date, link) => {
    return new Promise( (resolve, reject) => {       
        udemy.get(link)
        .then(json => {
            const results = [];
            for(let result of json.results) {                
                const created = new Date(result.created);
                if (created > date) {
                    const embed = new MessageEmbed();
                    embed.setColor(0xEA5252);      
                    embed.setAuthor("Udemy", "https://aefam.org/wp-content/uploads/2018/10/udemy-logo.png");
                    embed.setTitle(result.title);
                    embed.setDescription(result.headline);      
                    embed.addField('Precio', result.is_paid ? result.price : 'Gratis');
                    embed.setURL(`https://udemy.com${result.url}`);
                    embed.setThumbnail(result.image_125_H);
    
                    results.push(embed);
                }
            }
            resolve(results);
        })
        .catch(reject);
    });    
}