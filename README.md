# PruneMyDiscord
Prune (Delete) all of your Discord messages in a guild.

## Setup
 1. Install NodeJS
 2. Download the files (Either through `git clone` or just downloading each file 1 by 1).
 3. Go into pruneBot.js and change the variables at the top:
 ```js
   // Your auth token.
  let authToken = ''

  // The guild you want to delete your messages in.
  let guildID = ''

  // Leave this empty if you want to delete all of your messages in all guild channels.
  let channelID = ''```
  
 4. Open up your terminal / cmd and go to the directory and type `node pruneBot.js`.
