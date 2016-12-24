# MAC : Music Augmented Conversation

The goal of the project is augment conversation with music. 

### Demo : https://youtu.be/UhzYFD62Kzc 

## Request access for bigdata-crew.slack.com. The bot is already installed here.

## Pre-requisite for mac.js:
Create a new file names env.js with the following:
```
process.env['slackClientId'] = <Slack Client ID>
process.env['slackClientSecret'] = <Slack Client Secret>
process.env['port'] = <Port when you setup the slack app on developer.slack.com>
process.env['redirectUri'] = <Redirect URI from developer.slack.app>
process.env['musixkey'] = <Musix Match API Key>
process.env['spotifyClientId'] = <Spotify Client ID>
process.env['spotifyClientSecret'] = <Spotify Client Secret>
```

Execution Instructions:

## bot server
$ node mac.js

## run the data server
upload the dataserver folder to heroku and add the new URL to the slack app configurations. The data serve is launched automatically.

## Test results folder has all the results of executing Artillery tool