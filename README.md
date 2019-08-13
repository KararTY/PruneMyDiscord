# PruneMyDiscord
Prune (Delete) all of your Discord messages in a guild.

## Setup
 1. Install NodeJS.
 2. Download the files (Either through `git clone` or through "Download ZIP").
 3. Run `npm install` to install dependencies.
 4. Open up your terminal / cmd and go to the directory and type `npm start`.

For automation purposes, this is how **`settings.json`** can look like:
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
The following command line arguments are available when **`auto`** is set to true:
  * `--token` `<discord authentication token>`
  * `--guilds` `<guild id>:<guild channel id>,<guild channel id>.<guild id>:<guild channel id>` Use **:** to denote guild that former value is guild id and next value is a guild channel. Use **,** to denote next channel in same guild as previous one. Use **.** to denote that the upcoming values are for a new guild. 
  * `--groups` `<group dm channel id>,<group dm channel id>`
  * `--dms` `<dm channel id>`