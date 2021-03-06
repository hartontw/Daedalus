const parseArgs = require('minimist');

const Help = require('./help');
const Latex = require('./latex');
const Pastebin = require('./pastebin');
const Hastebin = require('./hastebin');
const Gist = require('./gist');
const CodePen = require('./codepen');
const Dice = require('./dice');
const Cercanias = require('./cercanias');
const Random = require('./random');
const Calculator = require('./calculator');
const Vector = require('./vector');

const commands = {
    help: Help,
    latex: Latex,
    pastebin: Pastebin,
    hastebin: Hastebin,
    gist: Gist,
    codepen: CodePen,
    dice: Dice,
    cercanias: Cercanias,
    random: Random,
    calc: Calculator,
    vect: Vector
}

async function user(message) {
    let command;
    let args = [];

    try {
        if (message.author.bot ||
            !message.content.startsWith('/'))
            return false;

        const argsArray = message.content.match(/\S+/g);

        const commandText = argsArray[0].trim().substring(1);

        args = parseArgs(argsArray.slice(1));

        command = commands[commandText];

        if (!command) {
            args._[0] = commandText.toLowerCase().substring(0, 1);
            command = Help;
        }

        if (command === Help)
            command = new command(message, args, commands);
        else
            command = new command(message, args);

        return await command.execute();

    } catch (error) {
        return {
            author: message.author.id,
            command,
            args,
            message,
            errors: [error],
            hasErrors: () => true
        };
    }
}

async function system(message, command, args) {
    args.dm = false;
    args.remains = true;

    try {
        command = commands[command];

        command = new command(message, args);

        return await command.execute();

    } catch (error) {
        return {
            author: message.author.id,
            command,
            args,
            message,
            errors: [error],
            hasErrors: () => true
        };
    }
}

module.exports = {
    user,
    system
};