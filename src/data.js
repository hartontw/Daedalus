const fs = require('fs');

const FILE = 'data.json';

let info = { lastUpdate: Date.now(), channels: {} }

function load(channels) {
    if (fs.existsSync(FILE)) {
        info = JSON.parse(fs.readFileSync(FILE));
    }

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

    return info;
}

function loadChannel(id) {
    return info.channels[id];
}

function updateDate() {
    info.lastUpdate = Date.now();
    fs.writeFileSync(FILE, JSON.stringify(info));
}

function saveChannel(id, channel) {
    info.channels[id] = channel;
    fs.writeFileSync(FILE, JSON.stringify(info));
}

module.exports = {
    load,
    loadChannel,
    updateDate,
    saveChannel
}