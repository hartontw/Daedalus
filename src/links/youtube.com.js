const { google } = require('googleapis');
const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_KEY });
const URL = require('url').URL;

function getChannelId(url){
    return new Promise( (resolve, reject) => {
        const user = url.pathname.match(/^\/(?:u|user)\/([^/]+)/);
        if (user) {
            youtube.channels.list({
                part: 'id',
                forUsername: user[1]
            }, (err, response) => {
                if (!err) {
                    if (response.data && response.data.items && response.data.items.length > 0) {
                        resolve(response.data.items[0].id);
                    }
                    else resolve();
                }
                else reject(err);
            });
        }
        else {
            const channel = url.pathname.match(/^\/(?:c|channel)\/([^/]+)/);
            resolve(channel[1]);
        }
    });
}

module.exports = (date, link) => {
    return new Promise((resolve, reject) => {
        const url = new URL(link);
        const query = url.search ? url.search.match(/^\?[^=]+=([^;]+)/)[1] : '';

        const options = {
            part: 'snippet',
            type: 'video',
            q: query,
            maxResults: 10,
            order: 'date',
            safeSearch: 'none',
            videoEmbeddable: true
        };

        getChannelId(url)
        .then(id => {
            if (id) options.channelId = id;
            youtube.search.list(options, (err, response) => {
                if (!err) {
                    const results = [];
                    if (response && response.data && response.data.items) {
                        response.data.items.forEach(item => {                            
                            const publishDate = new Date(item.snippet.publishedAt || item.snippet.publishTime);
                            if (publishDate > date) {
                                results.push(`https://youtu.be/${item.id.videoId}`);
                            }
                        });
                    }
                    resolve(results);
                }
                else {
                    reject(err);
                }
            });
        })
        .catch(reject);
    });
};