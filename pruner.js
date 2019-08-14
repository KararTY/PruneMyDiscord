const { colors: { green, gray, bold } } = require('./dependencies')

class Pruner {
  constructor (discord, settings) {
    this.discord = discord
    this.settings = settings
  }

  async start (ui) {
    log(green('Preparing pruner...'), this.settings, ui)
    const types = [
      ['guilds', Object.entries(this.settings.channels.guilds)],
      ['groups', this.settings.channels.groups],
      ['dms', this.settings.channels.dms]
    ]
    for (let i = 0; i < types.length; i++) {
      const type = types[i]
      for (let ii = 0; ii < type[1].length; ii++) {
        const typeArray = type[1][ii]
        let channels = [typeArray]
        if (type[0] === 'guilds') channels = this.discord.guilds.get(typeArray[0]).channels.filter(c => typeArray[1].indexOf(c.id) > -1).map(c => c.id)
        for (let iii = 0; iii < channels.length; iii++) {
          let channel
          if (type[0] === 'guilds') channel = this.discord.guilds.get(typeArray[0]).channels.get(channels[iii])
          else channel = this.discord.channels.get(channels[iii])
          if (this.settings.debug) log(gray(`Preparing pruning on ${bold(channelTitle(channel))} ${bold(channelName(channel))}...`), this.settings, ui)
          try {
            await fetchMore({ count: { deleted: 0, parsed: 0 }, settings: this.settings, ui }, channel)
          } catch (e) {
            console.error(e)
            return process.exit(1)
          }
        }
      }
      if (this.settings.debug) log(gray(`Done with ${type[0]}.`), this.settings, ui)
    }
    if (!this.settings.auto && ui) ui.updateBottomBar(green(`Finished.`))
    else console.log(green('Finished.'))
    return process.exit()
  }
}

const channelTitle = (channel) => channel.type === 'text' ? `guild ${channel.guild.name}, channel` : channel.type === 'dm' ? `DM, channel` : 'group DM, channel'
const channelName = (channel) => channel.name || (channel.recipient ? channel.recipient.username : channel.recipients.map(user => user.username).join(', '))

async function fetchMore ({ count, settings, ui }, channel, before) {
  const messages = await channel.fetchMessages({ limit: 100, before: before })
  count.parsed += messages.size
  if (messages.size > 0) {
    const userMessages = messages.filter(message => message.author.id === channel.client.user.id)
    let msgLast
    if (messages.last().author.id === channel.client.user.id) msgLast = messages.array()[messages.array().length - 1].id
    else msgLast = messages.last().id
    if (!settings.auto && ui) ui.updateBottomBar(green(`Out of ${bold(count.parsed)} messages, ${bold(count.deleted)} have been pruned so far in ${bold(channelTitle(channel))} ${bold(channelName(channel))}...`))
    await Promise.all(userMessages.deleteAll()) // Wait for all messages to be successfully deleted before moving on.
    count.deleted += userMessages.size
    return fetchMore({ count, settings, ui }, channel, msgLast)
  } else {
    log(green(`Done with ${bold(channelTitle(channel))} ${bold(channelName(channel))}. Total pruned messages: ${bold(count.deleted)}`), settings, ui)
    return Promise.resolve()
  }
}

function log (message, settings, ui) {
  if (!settings.auto && ui) ui.log.write(message)
  else console.log(message)
}

module.exports = Pruner
