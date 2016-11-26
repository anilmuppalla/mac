import os
import time
import sys

from slackclient import SlackClient
from Util import getTracksSpotify as GTS
from spotipy import oauth2, Spotify


# starterbot's ID as an environment variable
BOT_ID = os.environ.get("BOT_ID")

# constants
AT_BOT = "<@" + BOT_ID + ">"
EXAMPLE_COMMAND = "do"

# instantiate Slack & Twilio clients
slack_client = SlackClient(os.environ.get('SLACK_BOT_TOKEN'))

def handle_command(command, channel):
	"""
        Receives commands directed at the bot and determines if they
        are valid commands. If so, then acts on the commands. If not,
        returns back what it needs for clarification.
	"""
	lyrics = command
	musix = GTS.Musix()
	params = {"q_lyrics": lyrics}
	musix.addMusixParams(params)
	musix.getTracksFromLyrics()
	res = musix.getTracks()
	spotipyCred = oauth2.SpotifyClientCredentials(client_id='5404d36c8bfe444cb1ca8ad56a3569c0', 
		client_secret='0ac167a19f064eafa153e0f01dd8e2f0')
	spotify_const = Spotify(client_credentials_manager=spotipyCred)
	tracks = GTS.Tracks()
	tracks.buildTrackMap(res, spotify_const)
	mapsongs = tracks.getTrackMap()
	for key in mapsongs.keys():
		# print mapsongs[key]['preview']
		message = mapsongs[key]['link']
		print message
		slack_client.api_call("chat.postMessage", channel=channel, text=message, as_user=True)
	
def parse_slack_output(slack_rtm_output):
    """
        The Slack Real Time Messaging API is an events firehose.
        this parsing function returns None unless a message is
        directed at the Bot, based on its ID.
    """
    output_list = slack_rtm_output
    if output_list and len(output_list) > 0:
    	for output in output_list:
    		if output['text']:
    			return output['text'].split(AT_BOT)[1].strip().lower(), output['channel']	
	return None, None

if __name__ == "__main__":
	READ_WEBSOCKET_DELAY = 2 # 1 second delay between reading from firehose
	if slack_client.rtm_connect():
		print "StarterBot connected and running!"
		while True:
			print slack_client.rtm_read()
			try:
				command, channel = parse_slack_output(slack_client.rtm_read())
				if command and channel:
					handle_command(command, channel)
			except:
				print "Exception"
				pass
			# print channel
			time.sleep(READ_WEBSOCKET_DELAY)
	else:
		print("Connection failed. Invalid Slack token or bot ID?")