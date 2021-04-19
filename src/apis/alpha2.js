const fs = require('fs');
const path = require('path');
const request = require('request');

const url = 'https://datahub.io/core/language-codes/r/language-codes.json';
const FILE = path.join(__dirname, '..', '..', 'data', 'languajes.json');

function getFile() {
    if (fs.existsSync(FILE)) {
        const text = fs.readFileSync(FILE);
        return JSON.parse(text);
    }
}

module.exports = () => {
    return new Promise( (resolve, reject) => {
        request(url, {json: true}, (error, res, body) => {
            if (error) {
                const json = getFile();
                if (json) resolve(json);
                else reject(error);
            }
            else if (res.statusCode == 200) {
                fs.writeFileSync(FILE, JSON.stringify(body));
                resolve(body);
            }
            else {
                const json = getFile();
                if (json) resolve(json);
                else reject(`Timezones: ${res.statusCode}`);
            }
        });
    });
};