// PMD - PruneMyDiscord v2

const fs = require('fs')
const path = require('path')
const cli = require('inquirer')
const { Client } = require('discord.js')
const discord = new Client()

const argv = require('minimist')(process.argv.slice(2), { string: ['token', 'guilds', 'groups', 'dms'], alias: { t: 'token', g: 'guilds', c: 'groups', d: 'dms' } })

const {
  colors: {
    red,
    green,
    blue,
    bold,
    underline
  },
  settings,
  rx: {
    Subject
  }
} = require('./dependencies')

const questions = {
  firstStart: {
    type: 'list',
    name: 'acceptTOS',
    message: `Have you read and accepted Discord's Developer Terms of Service?\n${blue(underline('https://discordapp.com/developers/docs/legal'))}\nDo you understand that you have to take all\nresponsibility for any and all consequences as a\nresult of running this script?\n`,
    choices: ['Yes', 'No']
  },
  askForToken: {
    type: 'password',
    name: 'authToken',
    mask: '*',
    message: 'Please enter your Discord Authentication token:\n',
    validate: (val) => {
      val = val.trim().replace(/[ ]+/g, '')
      if (val.length === 0) {
        throw new Error('Invalid token length. Try again.')
      } else return true
    }
  }
}

const Pruner = require('./pruner')

const ui = new cli.ui.BottomBar()
const prompts = new Subject()

cli.prompt(prompts).ui.process.subscribe(onAnswer, (err) => {
  console.error(err)
  process.exit(1)
}, null)

function listGuildsPrompt () {
  const prompt = {
    type: 'checkbox',
    name: 'choosenGuilds',
    choices: [],
    message: 'Please choose guilds, DMs and groups to prune (Multiple choices):\n',
    validate: function (vals) {
      if (vals.length < 1) {
        return 'Choose at least one.'
      }
      return true
    }
  }

  const places = {
    guilds: [],
    directMessages: [],
    groups: []
  }

  discord.channels.forEach(i => {
    switch (i.type) {
      case 'text':
        const guild = discord.guilds.get(i.guild.id)
        if (guild.channels.get(i.id).memberPermissions(guild.member(discord.user.id)).has('READ_MESSAGE_HISTORY') && guild.channels.get(i.id).memberPermissions(guild.member(discord.user.id)).has('READ_MESSAGES')) {
          if (!places.guilds.find(g => g.value.id === i.guild.id)) {
            places.guilds.push({ name: `${i.guild.name} (${i.guild.id})`, checked: settings.channels ? !!settings.channels.guilds[i.guild.id] : false, value: { type: 'guild', id: i.guild.id } })
          }
        }
        break
      case 'group':
        places.groups.push({ name: `${i.name || i.owner.username} (${i.id})`, checked: settings.channels ? (settings.channels.groups.indexOf(i.id) > -1) : false, value: { type: 'group', id: i.id } })
        break
      case 'dm':
        places.directMessages.push({ name: `${i.recipient.username} (${i.recipient.id})`, checked: settings.channels ? (settings.channels.dms.indexOf(i.id) > -1) : false, value: { type: 'dm', id: i.id } })
        break
    }
  })

  if (places.guilds.length > 0) {
    prompt.choices.push(new cli.Separator('= Guilds ='))
    prompt.choices.push({ name: 'ALL GUILDS', value: { type: 'guild', all: true, id: places.guilds.map(guild => guild.value.id) } })
    places.guilds.forEach(i => {
      prompt.choices.push(i)
    })
  }

  if (places.groups.length > 0) {
    prompt.choices.push(new cli.Separator('= Groups ='))
    prompt.choices.push({ name: 'ALL GROUPS', value: { type: 'group', id: places.groups.map(group => group.value.id) } })
    places.groups.forEach(i => {
      prompt.choices.push(i)
    })
  }

  if (places.directMessages.length > 0) {
    prompt.choices.push(new cli.Separator('= Direct messages ='))
    prompt.choices.push({ name: 'ALL DMs', value: { type: 'dm', id: places.directMessages.map(dm => dm.value.id) } })
    places.directMessages.forEach(i => {
      prompt.choices.push(i)
    })
  }

  return prompts.next(prompt)
}

function listGuildChannelsPrompt (guilds) {
  const prompt = {
    type: 'checkbox',
    name: 'choosenGuildChannels',
    choices: [],
    message: 'Please choose the channels in the guilds (Multiple choices):\n',
    validate: function (vals) {
      if (vals.length < 1) {
        return 'Choose at least one.'
      }
      return true
    }
  }

  const parsedGuilds = []

  for (let index = 0; index < guilds.length; index++) {
    const guild = discord.guilds.get(guilds[index])

    parsedGuilds.push({
      name: guild.name,
      id: guild.id,
      channelCategories: [
        {
          name: 'No category',
          channels: [{
            name: 'ALL CHANNELS',
            checked: !!guilds.find(g => g.all),
            id: guild.channels.filter(c => c.type === 'text' && c.memberPermissions(guild.member(discord.user.id)).has('READ_MESSAGE_HISTORY') && c.memberPermissions(guild.member(discord.user.id)).has('READ_MESSAGES')).map(c => c.id)
          }]
        }
      ]
    })

    const pG = parsedGuilds.find(pG => pG.id === guild.id)

    guild.channels.forEach(channel => {
      if (channel.type === 'text' && channel.memberPermissions(guild.member(discord.user.id)).has('READ_MESSAGE_HISTORY') && channel.memberPermissions(guild.member(discord.user.id)).has('READ_MESSAGES')) {
        const channelObject = {
          name: channel.name,
          id: channel.id,
          checked: (settings.channels && settings.channels.guilds && settings.channels.guilds[guild.id]) ? (settings.channels.guilds[guild.id].indexOf(channel.id) > -1) : false
        }

        if (channel.parent) {
          const parentInCategoriesArray = () => pG.channelCategories.find(cC => cC.name === channel.parent.name)
          if (!parentInCategoriesArray()) pG.channelCategories.push({ name: channel.parent.name, id: channel.parent.id, channels: [] })
          parentInCategoriesArray().channels.push(channelObject)
        } else {
          const defaultCategory = () => pG.channelCategories.find(cC => cC.name === 'No category')
          defaultCategory().channels.push(channelObject)
        }
      }
    })
  }

  if (parsedGuilds.length > 0) {
    parsedGuilds.forEach(pG => {
      prompt.choices.push(new cli.Separator(`= ${pG.name} (${pG.id}) =`))
      pG.channelCategories.forEach(cC => {
        prompt.choices.push(new cli.Separator(`== ${cC.name}${cC.id ? ` (${cC.id})` : ''} ==`))
        cC.channels.forEach(c => {
          prompt.choices.push({ name: `${c.name}${typeof c.id === 'string' ? ` (${c.id})` : ''}`, checked: c.checked, value: { guild: pG.id, id: c.id } })
        })
      })
    })
  }

  return prompts.next(prompt)
}

function attemptLogin (answer) {
  ui.log.write('Attempting to authenticate...')
  discord.once('ready', () => {
    ui.log.write(green(`Success: ${bold('Discord account authenticated.')}`))
    listGuildsPrompt()
  }).login(answer).catch((e) => {
    if (settings.debug) console.error(e)
    ui.log.write(red(`Error: ${bold(e.message)}`))
    discord.removeAllListeners('ready')
    prompts.next(questions.askForToken)
  })
}

function onAnswer (question) {
  const answer = question.answer
  switch (question.name) {
    case 'acceptTOS':
      if (answer === 'Yes') {
        if (settings.authToken.length > 0) return attemptLogin(settings.authToken)
        else return prompts.next(questions.askForToken)
      } else {
        ui.log.write(red(`ToS not accepted, aborting script.`))
        return process.exit(1)
      }
    case 'authToken':
      return attemptLogin(answer)
    case 'choosenGuilds':
      const guilds = [...new Set(answer.filter(choice => choice.type === 'guild').map(guild => guild.id).flat())]
      const groups = [...new Set(answer.filter(choice => choice.type === 'groups').map(group => group.id).flat())]
      const dms = [...new Set(answer.filter(choice => choice.type === 'dm').map(dm => dm.id).flat())]
      settings.channels.groups = groups.length > 0 ? groups : []
      settings.channels.dms = dms.length > 0 ? dms : []
      if (guilds.length > 0) {
        return listGuildChannelsPrompt(guilds)
      } else {
        fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 2))
        if (settings.debug) console.table(settings.channels)
        const pruner = new Pruner(discord, settings)
        return pruner.start(ui)
      }
    case 'choosenGuildChannels':
      const parsedGuildsAndChannels = {}
      answer.forEach(channel => {
        if (!parsedGuildsAndChannels[channel.guild]) parsedGuildsAndChannels[channel.guild] = []
        if (typeof channel.id !== 'string') channel.id.forEach(id => parsedGuildsAndChannels[channel.guild].push(id))
        else parsedGuildsAndChannels[channel.guild].push(channel.id)
        parsedGuildsAndChannels[channel.guild] = [...new Set(parsedGuildsAndChannels[channel.guild])]
      })
      settings.channels.guilds = parsedGuildsAndChannels
      fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 2))
      if (settings.debug) console.table(settings.channels)
      const pruner = new Pruner(discord, settings)
      return pruner.start(ui)
  }
}

if (settings.auto || argv.guilds || argv.groups || argv.dms) {
  discord.login(argv.token ? argv.token.replace(/ /g, '') : settings.authToken).catch(e => { console.error(e); process.exit() })
  discord.once('ready', () => {
    const guilds = {}
    if (argv.guilds) {
      argv.guilds.split('.').filter(Boolean).forEach(g => {
        const guildID = g.replace(/:[0-9,]+/g, '').replace(/ /g, '').replace(/[^0-9]+/g, '')
        guilds[guildID] = g.replace(/[0-9]+:/g, '').split(',').map(val => val.replace(/ /g, '').replace(/[^0-9]+/g, ''))
      })
    }
    const groups = argv.groups ? argv.groups.split(',').filter(Boolean).map(val => val.replace(/ /g, '')) : []
    const dms = argv.dms ? argv.dms.split(',').filter(Boolean).map(val => val.replace(/ /g, '')) : []
    if (settings.debug) console.table([guilds, groups, dms])

    if (argv.guilds || argv.groups || argv.dms) {
      // Rewrite in memory only.
      settings.channels.guilds = guilds
      settings.channels.groups = groups
      settings.channels.dms = dms
    }

    const pruner = new Pruner(discord, settings)
    pruner.start()
  })
} else prompts.next(questions.firstStart)
