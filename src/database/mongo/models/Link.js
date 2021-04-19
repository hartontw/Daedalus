const { Schema, model } = require('mongoose');

const validateURL = function(url) {
    const re = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
    return re.test(url);
};

const linkSchema = new Schema({
    destination: {
        type: String,
        trim: true,
        unique: true,
        required: 'Destination url is required',
        validate: [validateURL, 'Please fill a valid url destination'],
        match: [/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/, 'Please fill a valid url destination']
    },
    cronjob: {
        rule: { type: String, default: '0 0 */1 * * *' },
        timezone: { type: String, default: 'Europe/Madrid' }
    },
    name: String,
    pictureURL: String,
    channels: [String]
});

module.exports = model('Link', linkSchema, 'Links');