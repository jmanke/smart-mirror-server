'use strict'

const fs = require('fs').promises
const http = require('http')
const url = require('url')
const opn = require('open')
const destroyer = require('server-destroy')

const { google } = require('googleapis')

const scopes = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
]

const TOKEN_PATH = `${__dirname}/token.json`

// Be sure to call authorize() before making requests
class GoogleApi {
  isAuthorizing

  __oauth2Client
  __oauth2ClientCallbacks = []
  get oauth2Client() {
    if (!this.__oauth2Client) {
      let resolveDefer
      const promise = new Promise((resolve) => (resolveDefer = resolve))
      this.__oauth2ClientCallbacks.push(resolveDefer)
      this.authorize()
      return promise
    }

    return new Promise((resolve) => {
      resolve(this.__oauth2Client)
    })
  }
  set oauth2Client(v) {
    if (this.__oauth2ClientCallbacks.length) {
      this.__oauth2ClientCallbacks.forEach((cb) => cb(v))
      this.__oauth2ClientCallbacks = []
    }

    this.__oauth2Client = v
  }

  async authorize() {
    if (this.isAuthorizing) {
      return
    }

    this.isAuthorizing = true
    const data = await fs.readFile(`${__dirname}/credentials.json`)
    const credentials = JSON.parse(data)
    const { client_secret, client_id, redirect_uris } = credentials.installed
    let oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[1],
    )

    oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        // store the tokens
        try {
          console.log('Update token complete')
          fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))
        } catch {
          console.log('ERROR WRITING TOKEN')
        }
      }
    })

    // Check if we have previously stored a token.
    try {
      const token = await fs.readFile(TOKEN_PATH)
      oauth2Client.setCredentials(JSON.parse(token))
    } catch (err) {
      oauth2Client = await this.getNewToken(oauth2Client)
    }

    this.oauth2Client = oauth2Client
    this.isAuthorizing = false
  }

  async getNewToken(oauth2Client) {
    return new Promise((resolve, reject) => {
      // grab the url that will be used for authorization
      const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' '),
      })
      const server = http
        .createServer(async (req, res) => {
          try {
            if (req.url.indexOf('/?code=') > -1) {
              const qs = new url.URL(req.url, 'http://localhost:3000')
                .searchParams
              res.end(
                'Authentication successful! Please return to the console.',
              )
              server.destroy()
              const { tokens } = await oauth2Client.getToken(qs.get('code'))
              oauth2Client.credentials = tokens // eslint-disable-line require-atomic-updates

              // Store the token to disk for later program executions
              await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))
              console.log('Token stored to', TOKEN_PATH)
              resolve(oauth2Client)
            }
          } catch (e) {
            reject(e)
          }
        })
        .listen(3000, () => {
          // open the browser to the authorize url to start the workflow
          opn(authorizeUrl, { wait: false }).then((cp) => cp.unref())
        })
      destroyer(server)
    })
  }

  async getEvents({ maxResults, timeMin, timeMax }) {
    const calendar = google.calendar({
      version: 'v3',
      auth: await this.oauth2Client,
    })

    try {
      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults,
      })

      return res.data.items
    } catch (err) {
      throw err
    }
  }

  async getTasks({ maxResults, showCompleted = false }) {
    const tasks = google.tasks({
      version: 'v1',
      auth: await this.oauth2Client,
    })

    try {
      const taskListsResponse = await tasks.tasklists.list({})

      const taskPromises = taskListsResponse.data.items.map(
        async (taskList) => {
          return tasks.tasks.list({
            tasklist: taskList.id,
            showCompleted,
            maxResults,
          })
        },
      )

      const taskResponses = await Promise.all(taskPromises)

      return (
        taskResponses.reduce(
          //@ts-ignore
          (prev, curr) => [...prev, ...(curr.data.items ?? [])],
          [],
        ) ?? []
      )
    } catch (err) {
      throw err
    }
  }
}

module.exports = GoogleApi
