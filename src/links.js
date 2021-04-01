const logger = require('./logger');
const URL = require('url').URL;

function filter(link) {
    const url = new URL(link);
    const hostname = url.hostname.replace(/^www\./, '');
    switch(hostname) {
        case 'domestika.org': return require('./links/domestika');
        default: return require('./links/rss');
    }
}

module.exports = (date, channels, send) => {
    for(let id in channels) {
        for(let link of channels[id]) {
            filter(link)(date, link)
            .then(results => {
                for(let result of results) {
                    send(id, result);
                }
            })
            .catch(logger.error);
        }
    }
}