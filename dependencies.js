const { red, green, gray, blue, bold, underline } = require('colorette')
const rx = require('rxjs')

// Settings validation
const fs = require('fs')
const path = require('path')
const defaultSettings = {
  authToken: '',
  channels: {
    groups: [],
    dms: [],
    guilds: {}
  },
  auto: false,
  debug: true
}
const saveSettings = settings => fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 2))
let settings
try {
  settings = require('./settings.json')
  if (typeof settings.auto !== 'boolean') settings.auto = false
  if (typeof settings.debug !== 'boolean') settings.debug = true
  if (typeof settings.channels !== 'object') settings.channels = { guilds: {}, groups: [], dms: [] }
  if (!settings.channels.guilds) settings.channels.guilds = {}
  if (!settings.channels.groups) settings.channels.groups = []
  if (!settings.channels.dms) settings.channels.dms = []
  if (typeof settings.authToken !== 'string') settings.authToken = ''
  saveSettings(settings)
} catch (e) {
  settings = defaultSettings
  saveSettings(settings)
}

module.exports = { colors: { red, green, gray, blue, bold, underline }, settings, rx }
