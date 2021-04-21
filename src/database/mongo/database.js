const mongoose = require('mongoose');
const Link = require('./models/Link');

function start(channels)
{
    return new Promise( async (resolve, reject) => {
        try {
            await mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Daedalus', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: true,
                useCreateIndex: true
            });

            const links = await Link.find({});
            for(let link of links) {
                link.channels = link.channels.filter(c => channels.include(c));
                await link.save();
            }

            resolve('Mongo');
        }
        catch(error) {
            reject(error);
        }
    });
}

async function getLinks() {
    return await Link.find({}).lean();
}

async function getLinkById(id) {
    return await Link.findById(id).lean();
}

async function insertLink(link) {
    return await Link.create(link).lean();
}

async function updateLink(link) {
    await Link.updateOne({_id:link._id}, {link});
}

async function updateLinkDate(id, date = Date.now()) {
    await Link.updateOne({_id:id}, {lastUpdate: date});
}

async function deleteLink(id) {
    await Link.deleteOne({_id:id});
}

async function addChannelToLink(linkID, channelID) {
    const link = await Link.findById(linkID).lean();
    if (!link.channels.includes(channelID)) {
        link.channels.push(channelID);
        await link.save();
    }
}

async function deleteChannelFromLink(linkID, channelID) {
    const link = await Link.findById(linkID).lean();
    link.channels = link.channels.filter(c => c !== channelID);
    await link.save();
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