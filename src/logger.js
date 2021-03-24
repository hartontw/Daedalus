const { createLogger, format, transports } = require('winston');

const basicFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => {
        if (!info.stack) {
            return `[${info.timestamp}] ${info.level}: ${info.message}`;
        } else return `[${info.timestamp}] ${info.level}: ${info.message}\n${info.stack}`;
    })
);

const options = {
    console: {
        handleExceptions: true,
        level: 'debug',
        format: format.combine(
            format.colorize(),
            basicFormat
        )
    },
    file: {
        filename: process.env.LOG_FILE || 'Daedalus.log',
        level: 'debug',
        format: basicFormat,
        maxsize: 5120000,
        maxFiles: 1
    },
}

const logger = createLogger({
    transports: [
        new transports.Console(options.console),
        new transports.File(options.file),
    ]
});

module.exports = logger;