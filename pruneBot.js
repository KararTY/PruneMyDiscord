const { Client } = require('discord.js')
const client = new Client()

// Your auth token.
let authToken = ''

// Delete a DM channel. 
let dmChannel = true

// The guild you want to delete your messages in.
let guildID = ''

// Leave this empty if you want to delete all of your messages in all guild channels.
// Fill this out if dmChannel is 'true', this is the id of the recipient user.
let channelID = ''

let count = 0

client.once('ready', () => {
  console.log('Logged into Discord.')
  // client.user.setGame('Deleting messages...')
  if (!dmChannel) {
    Promise.all(client.guilds.get(guildID)
      .channels.map(channel => {
        if (channelID) {
          if (channel.id === channelID && channel.permissionsFor(client.user.id).has('READ_MESSAGES') && channel.permissionsFor(client.user.id).has('SEND_MESSAGES') && channel.permissionsFor(client.user.id).has('READ_MESSAGE_HISTORY') && channel.type === 'text') {
            console.log(channel.id, channel.name)
            return fetchMore(channel)
          }
        } else {
          if (channel.permissionsFor(client.user.id).has('READ_MESSAGES') && channel.permissionsFor(client.user.id).has('SEND_MESSAGES') && channel.permissionsFor(client.user.id).has('READ_MESSAGE_HISTORY') && channel.type === 'text') {
            console.log(channel.id, channel.name)
            return fetchMore(channel)
          }
        }
      })).then(() => {
      console.log('Done')
      // process.exit(0) Buggy.
    })
  } else {
    // DM Channel
    Promise.all(client.channels.map(channel => {
      if (channelID) {
        if (channel.type === 'dm' && channel.recipient.id === channelID) {
          return fetchMore(channel)
        }
      }
    })).then(() => {
      console.log('Done')
    })
  }
})

const fetchMore = (channel, before) => {
  return new Promise((resolve, reject) => {
    channel.fetchMessages({limit: 100, before: before}).then(msg => {
      if (msg.size > 0) {
        let msgLast
        if (msg.last().author.id === client.user.id) msgLast = msg.array()[msg.array().length - 1].id
        else msgLast = msg.last().id
        // console.log(msgLast)
        msg.forEach(msg => {
          if (msg.author.id === client.user.id) {
            let channelID = msg.channel.id
            msg.delete().then(msg => {
              count++
              console.log('Deleted', count, channelID)
            }).catch(console.error)
          }
        })
        fetchMore(channel, msgLast).then(resolve, reject)
      } else {
        console.log('Done in channel', channel.id)
        resolve()
      }
    })
  })
}

client.login(authToken).catch(e => console.error(e))
