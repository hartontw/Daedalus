require('dotenv').config();
const commands = require('./commands');
const logger = require('./logger');

const Discord = require("discord.js");

const client = new Discord.Client();

client.on('ready', () => {
    logger.info(`Bot is ready ${client.user.tag}`);
});

client.on('message', async message => {
    const reply = await commands.user(message);
    if (reply) {
        if (reply.hasErrors()) {
            logger.info(`Command ${reply.command} from message ${reply.message.id} with errors:`);
            for (const error of reply.errors) {
                logger.error(error.message, error);
            }                
        } else logger.info(`Command ${reply.command} from user ${reply.user} from message ${reply.message.id}`);
    } else {
        logger.info(`Message ${message.id}`);
    }
});

client.login(process.env.BOT_TOKEN);