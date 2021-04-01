const fs = require('fs');

const FILE = 'data.json';

let info = { 
    lastUpdate: Date.now(), 
    youtube: { 
        cronjob: {
            rule: '0 0 0 * * *',
            timeZone: 'Europe/Madrid'
        }, 
        lastUpdate: Date.now() 
    }, 
    channels: {} 
}

function start() {
    if (fs.existsSync(FILE)) {
        info = JSON.parse(fs.readFileSync(FILE));
    }
    return info;
}

function getLastUpdate() {
    return info.lastUpdate;
}

function getYouTubeCronJob() {
    return info.youtube.cronjob;
}

function getYouTubeLastUpdate() {
    return info.youtube.lastUpdate;
}

function getChannels(channels) {

    if (channels) {
        const existing = {};
        for(let id in info.channels) {        
            if (channels.get(id)) {
                existing[id] = info.channels[id];
            }
        }
    
        if (Object.keys(existing).length === Object.keys(info.channels).length) {
            info.channels = existing;
            fs.writeFileSync(FILE, JSON.stringify(info));
        }
    }

    return info.channels;
}

function getChannelLinks(channelID) {
    return info.channels[channelID];
}

function setLastUpdate(date) {
    info.lastUpdate = date || Date.now();
    fs.writeFileSync(FILE, JSON.stringify(info));
}

function setYouTubeCronJob(cronjob) {
    info.youtube.cronjob = cronjob;
    fs.writeFileSync(FILE, JSON.stringify(info));
}

function setYouTubeLastUpdate(date) {
    info.youtube.lastUpdate = date || Date.now();
    fs.writeFileSync(FILE, JSON.stringify(info));
}

function setChannelLinks(id, links) {
    info.channels[id] = links;
    fs.writeFileSync(FILE, JSON.stringify(info));
}

module.exports = {
    start,
    getLastUpdate,
    getYouTubeCronJob,
    getYouTubeLastUpdate,
    getChannels,
    getChannelLinks,
    setLastUpdate,
    setYouTubeCronJob,
    setYouTubeLastUpdate,
    setChannelLinks
}