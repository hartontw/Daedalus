function getDB() {
    const path = require('path');
    const fs = require('fs');
    const package = path.join(__dirname, '..', '..', 'package.json');
    const dependencies = JSON.parse(fs.readFileSync(package)).dependencies;
    if (dependencies.mongoose) return require('./mongo/index');
    //else if (dependencies.sqlite) return requite('./sqlite/index);
    //else if (dependencies.mariadb) return requite('./mariadb/index);
    return require('./json/database');
}

const db = getDB();
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
            if (link.channels.length > 0) {
                links(link)
                .then( ({results, lastUpdate}) => {
                    logger.info(`${link.name || link.destination} => ${results.length} results.`);
                    for(let result of results) {
                        for(let channel of link.channels) {
                            bot.sendToChannel(channel, result);
                        }
                    }
                    if (lastUpdate) {
                        db.updateLinkDate(link._id, lastUpdate).catch(logger.error);
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
            logger.info(`New link => ${link._id}`);
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
            logger.info(`Upated link => ${link._id}`);
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
            logger.info(`Deleted link => ${id}`);
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