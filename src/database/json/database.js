const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const FILE = process.env.CONNECTION_STRING || path.join(__dirname, '..', '..', '..' , 'data', 'DB.json');

let data = {
    links: {}
};

function save() {
    fs.writeFileSync(FILE, JSON.stringify(data));
}

function start(channels) {
    return new Promise( resolve => {
        if (fs.existsSync(FILE)) {
            data = JSON.parse(fs.readFileSync(FILE));
            for(let l in data.links) {
                data.links[l].channels = data.links[l].channels.filter(c => channels.includes(c));
            }
            save();
        }        
        resolve('JSON');
    });
}

function getLinks() {
    return new Promise( resolve => {
        resolve(Object.values(data.links).map(l => Object.assign({}, l)));
    })
}

function getLinkById(id) {
    return new Promise( resolve => {
        if (data.links[id]) {
            resolve(Object.assign({}, data.links[id]));
        }
        else reject(`Link with id ${link_id} not found`);
    });
}

function insertLink(link) {
    return new Promise( resolve => {
        const newLink = {
            _id: uuidv4(),
            destination: link.destination,
            cronjob: link.cronjob || { rule: '0 0 */1 * * *', timezone: 'Europe/Madrid'},
            lastUpdate: Date.now(),
            name: link.name,
            pictureURL: link.pictureURL,
            channels: []
        };
        data.links[newLink._id] = newLink;
        save();
        resolve(Object.assign({}, newLink));
    });
}

function updateLink(link) {
    return new Promise( (resolve, reject) => {
        if (data.links[link._id]) {
            data.links[link._id] = link;
            save();
            resolve();
        }
        else reject(`Link with id ${link_id} not found`);
    });
}

function updateLinkDate(id, date = Date.now()) {
    return new Promise( (resolve, reject) => {
        if (data.links[id]) {
            data.links[id].lastUpdate = date;
            save();
            resolve();
        }
        else reject(`Link with id ${link_id} not found`);
    });
}

function deleteLink(id) {
    return new Promise( (resolve, reject) => {
        if (data.links[id]) {
            delete data.links[id];
            save();
            resolve();
        }
        else reject(`Link with id ${link_id} not found`);
    });
}

async function addChannelToLink(linkID, channelID) {
    return new Promise( (resolve, reject) => {
        if (data.links[linkID]) {
            if (!data.links[linkID].channels.includes(channelID)) {
                data.links[linkID].channels.push(channelID);
                save();
            }
            resolve();
        }
        else reject(`Link with id ${linkID} not found`);
    });
}

function deleteChannelFromLink(linkID, channelID) {
    return new Promise( (resolve, reject) => {        
        if (data.links[linkID]) {
            data.links[linkID].channels = data.links[linkID].channels.filter(c => c !== channelID);
            save();
            resolve();
        }        
        else reject(`Link with id ${linkID} not found`);
    });
}

module.exports = {
    start,
    getLinks,
    getLinkById,
    insertLink,
    updateLink,
    updateLinkDate,
    deleteLink,
    addChannelToLink,
    deleteChannelFromLink
}