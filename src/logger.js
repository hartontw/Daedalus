const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

const basicFormat = format.combine(
    errors({ stack: true }), // Does nothing
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(info => {
        if (info.stack) {            
            return `[${info.timestamp}] ${info.level}: ${info.message}\n${info.stack}`;            
        } 
        else {
            return `[${info.timestamp}] ${info.level}: ${info.message}`;
        }
    })
);

const options = {
    console: {
        handleExceptions: true,
        level: 'debug',
        format: combine(            
            colorize(),
            basicFormat
        )
    },
    file: {
        filename: process.env.LOG_FILE || path.join(__dirname, '..', 'data', 'App.log'),
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

// Because errors({ stack: true }) does nothing
const error = logger.error;
logger.error = e => {
    error({message: e.message, stack:e.stack});
}

module.exports = logger;