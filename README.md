# Daedalus
Discord bot for post links based on RSS and others. Also it has commands.

### Install
MongoDB
```sh
npm install mongoose
```

JSON File
```sh
npm install uuid
```

### Environment variables
- **BOT_TOKEN**: [Discord Application token](https://discord.com/developers/applications)
- LOG_FILE: Desired log file path (./data/Bot.log)
- CONNECTION_STRING: Connection string for desired BD type
    - JSON (./data/Daedalus.json)
    - MongoDB (mongodb://localhost:27017/Daedalus)
- HOST: Web portal host (localhost)
- PORT: Web portal port (3000)
- YOUTUBE_KEY: [Youtube API Key](https://console.cloud.google.com/apis/)
- GOOGLE_SEARCH_ENGINE: [Google Programmable Search Engine ID](https://programmablesearchengine.google.com/cse/all)
- GOOGLE_SEARCH_KEY: [Google Custom Search API Key](https://console.cloud.google.com/apis/)
- UDEMY_ID: [Udemy API ID](https://www.udemy.com/developers/affiliate/)
- UDEMY_SECRET: [Udemy API Key](https://www.udemy.com/developers/affiliate/)

### Commands
Write ```/help```for commands help.

### Custom link reader
Just add to links folder your file with format:
```host.domain.js```
```js
module.exports = (date, link) => {    
    return new Promise( (resolve, reject) => {     
        // YOUR CODE
    });
}
```

TODO:
- Add admin password
- Improve workaround to add commands
- Add more database connectors
- Improve frontend design
- Improve error control
- Improve logger