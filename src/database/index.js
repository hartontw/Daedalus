const db = require('./json/database');
const CronJob = require('cron').CronJob;
const logger = require('../logger');
const links = require('../links/index');
const bot = require('../bot');

const cronjobs = new Map();
function cronStart(link)
{
    if (cronjobs.has(link._id)) {
        cronjobs.get(link._id).stop();
    }

    cronjobs.set(link._id, new CronJob(link.cronjob.rule, () => {
        db.getLinkById(link._id)
        .then(link => {
            db.updateLinkDate(link._id).catch(logger.error);
            if (link.channels.length > 0) {
                links(link)
                .then(results => {
                    for(let result of results) {
                        for(let channel of link.channels) {
                            bot.sendToChannel(channel, result);
                        }
                    }
                })
                .catch(logger.error);
            }
        })
        .catch(logger.error);
      }, null, true, link.cronjob.timezone)
    );
}

let dbname;
function start(channels)
{
    return new Promise( (resolve, reject) => {        
        if (!dbname) {
            db.start(channels)
            .then(name => {                
                db.getLinks()
                .then(links => {
                    for(let link of links) {
                        cronStart(link);
                    }
                    dbname = name;
                    resolve(name);
                })
                .catch(reject);
            })
            .catch(reject);
        }
        else reject(`${dbname} db already started`);
    });
}

function insertLink(link)
{
    return new Promise( (resolve, reject) => {
        db.insertLink(link)
        .then(link => {
            cronStart(link);
            resolve(link);
        })
        .catch(reject);
    })
}

function updateLink(link)
{
    return new Promise( (resolve, reject) => {
        db.updateLink(link)
        .then( () => {
            cronStart(link);
            resolve();
        })
        .catch(reject);
    });
}

function deleteLink(id)
{
    return new Promise( (resolve, reject) => {
        db.deleteLink(id)
        .then( () => {
            if (cronjobs.has(id)) {
                cronjobs.get(id).stop();
                cronjobs.delete(id);
            }
            resolve();
        })
        .catch(reject);
    });
}

module.exports = {
    start,
    getLinks: db.getLinks,
    getLinkById: db.getLinkById,
    insertLink,
    updateLink,
    deleteLink,
    addChannelToLink: db.addChannelToLink,
    deleteChannelFromLink: db.deleteChannelFromLink
}