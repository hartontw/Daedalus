const request = require('request');

const url = 'http://worldtimeapi.org/api/timezone';

module.exports = () => {
    return new Promise( (resolve, reject) => {
        request(url, {json: true}, (error, res, body) => {
            if (error) {
                reject(error);
            }
            else if (res.statusCode == 200) {
                resolve(body);
            }
            else {
                reject(`TimeZone: ${res.statusCode}`);
            }
        });
    });
};