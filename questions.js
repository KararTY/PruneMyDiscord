const { colors: { blue, underline } } = require('./dependencies')

module.exports = {
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
