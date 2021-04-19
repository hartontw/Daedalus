const URL = require('url').URL;
const fs = require('fs');
const path = require('path');

function filter(link) {
    const url = new URL(link);
    const hostname = url.hostname.replace(/^www\./, '');

    const filePath = path.join(__dirname, `${hostname}.js`);
    if (fs.existsSync(filePath)) {
        return require(`./${hostname}.js`);
    }
    
    return require('./rss');
}

module.exports = link => {
    return filter(link.destination)(new Date(link.lastUpdate - (3600000 * 24 * 60)), link.destination);
}