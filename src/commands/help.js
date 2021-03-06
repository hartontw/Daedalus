const Command = require('./command');

class Help extends Command {
    static get description() {
        return "Show list of commands and their explanation.";
    }

    static get usage() {
        return `/help
                /help <search>`;
    }

    constructor(message, args, commands) {
        super(message, args);
        this.commands = commands;
    }

    get wrongFormat() {
        return false;
    }

    async run() {
        try {
            let commands = this.commands;

            if (this.args._[0]) {
                commands = {};

                let keys = Object.keys(this.commands);
                for (const key of keys) {
                    if (key.startsWith(this.args._[0]))
                        commands[key] = this.commands[key];
                }

                keys = Object.keys(commands);
                if (keys.length === 0)
                    commands = this.commands;
            }

            const fields = [];

            const keys = Object.keys(commands);
            for (const key of keys) {
                fields.push({
                    name: '/' + key,
                    value: commands[key].description
                });
            }

            this.args.dm = true;

            return await await this.send({
                embed: {
                    color: 3447003,
                    title: "**__List of commands:__**",
                    fields
                }
            });

        } catch (error) {
            return this.error(error);
        }
    }
}

module.exports = Help;