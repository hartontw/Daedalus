const parser = require('fast-xml-parser');
const request = require('request');

module.exports = (date, link) => {    
    return new Promise( (resolve, reject) => {        
        request(link, (err, res, body) => {
            if (!err) {
                if (parser.validate(body)) {
                    let lastUpdate;
                    let results = [];

                    body = parser.parse(body);                        
                    if (body.feed) {
                        results = body.feed.entry.filter(i => new Date(i.published) > date).map(i => i.link || i.id);  
                    }
                    else if (body.rss) {
                        results = body.rss.channel.item.filter(i => new Date(i.pubDate) > date).map(i => i.link || i.guid);
                    }

                    if (results.length > 0) {
                        results = results.reverse();
                        lastUpdate = Math.max.apply(Math, results.map(function(e) { return Date.parse(e.pubDate); }));
                    }

                    resolve({results, lastUpdate});
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