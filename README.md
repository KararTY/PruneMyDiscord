# PruneMyDiscord
Prune (Delete) all of your Discord messages in a guild.

## Setup
 1. Install NodeJS.
 2. Download the files (Either through `git clone` or through "Download ZIP").
 3. Open up your terminal / cmd, traverse to your director using `cd` and run `npm install` to install dependencies.
 4. And then finally run `npm start` to start the script.
 5. Continue through the CLI selection menus.

### Automation
For automation purposes, like in a CRON job, this is how **`settings.json`** can look like:
```js
{
  "authToken": "<your discord authentication token>",
  "channels": {
    "groups": ["<group channel id, not owner id>"],
    "dms": ["<dm channel id, not recipient id>"],
    "guilds": {
      "<guild id>": ["<guild channel id>"]
    }
  },
  "auto": true, // Important, must be set to true to disable the cli selection menus.
  "debug": true
}
```

### Command line arguments example:
(Pay attention that we're launching it using `node ./initialize.js` instead of `npm start`.)
```
node ./initialize.js --token <discord authentication token> --guilds <guild id>:<guild channel id>,<guild channel id> --groups <group dm channel id>,<group dm channel id> --dms <dm channel id>
```
The following command line arguments are available:
  * `-t` OR `--token` `<discord authentication token>`
  * `-g` OR `--guilds` `<guild id>:<guild channel id>,<guild channel id>.<guild id>:<guild channel id>` Use **:** to denote guild that former value is guild id and next value is a guild channel. Use **,** to denote next channel in same guild as previous one. Use **.** to denote that the upcoming values are for a new guild. 
  * `-c` OR `--groups` `<group dm channel id>,<group dm channel id>`
  * `-d` OR `--dms` `<dm channel id>`
