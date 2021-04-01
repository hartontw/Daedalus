const parser = require('fast-xml-parser');
const request = require('request');

module.exports = (date, link) => {    
    return new Promise( (resolve, reject) => {        
        request(link, (err, res, body) => {
            if (!err) {
                if (parser.validate(body)) {
                    let entries = [];
                    body = parser.parse(body);                        
                    if (body.feed) {
                        entries = body.feed.entry.filter(i => Date.parse(i.published) > date).map(i => i.link || i.id);                
                    }
                    else if (body.rss) {
                        entries = body.rss.channel.item.filter(i => Date.parse(i.pubDate) > date).map(i => i.link || i.guid);
                    }
                    resolve(entries.reverse());
                }
                else {
                    reject(`Invalid RSS: ${link}`);
                }
            }
            else {
                reject(err);
            }
        });
    });
}