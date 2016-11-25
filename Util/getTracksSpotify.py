'''
A Script which takes song lyrics as argument and:
 Gets the song name, artist from MusixMatch
 Gets the Spotify track ID

 Musix URL Endpoint: http://api.musixmatch.com/ws/1.1/track.search
 Musix API Key: eddca3beccf778ab522216a01e6bc3f4

 Spotify URL Endpoint: https://api.spotify.com/v1/search

'''
import requests
import sys
import pprint
import spotipy
from difflib import SequenceMatcher
from spotipy import oauth2


class Musix:
	def __init__(self):
		self.musix_api_key = "eddca3beccf778ab522216a01e6bc3f4"
		self.musix_url = "http://api.musixmatch.com/ws/1.1/track.search"
		self.musix_data = { "apikey": self.musix_api_key,
					  "f_has_lyrics": 1,
					  "format": "json",
					  "s_track_rating":"desc"}
		self.tracks = {}

	def addMusixParams(self,data):
		for key in data.keys():
			#if key already exists, overwrite val
			self.musix_data[key] = data[key]

	def getMusixParams(self):
		return self.musix_data

	def getTracksFromLyrics(self):
		res = requests.get(self.musix_url, params=self.musix_data)
		self.tracks = res.json()

	def getTracks(self):
		return self.tracks

class Tracks:

	def __init__(self):
		self.tracks = []
		self.num_tracks = 0
		self.trackMap = {}

	def buildTrackMap(self, data, spotify_const):

		tracklist = data["message"]["body"]["track_list"]

		for item in tracklist:
			item = item["track"]
			track_name = item["track_name"]
			artist = item["artist_name"]
			print track_name, ":", artist
			query = "track:" + track_name + "%20" + "artist:" + artist 
			results = spotify_const.search(q=track_name, type='track')
			for track in results['tracks']['items']:
				if SequenceMatcher(None, track['artists'][0]['name'], artist).ratio() > 0.5:
					self.trackMap[track_name] = {"artist" : track['artists'][0]['name'] , "link" : track['external_urls']['spotify'], "name" : track['name']}

	def getTrackMap(self):
		return self.trackMap

if __name__=="__main__":
    
    if len(sys.argv) < 2:
    	print "Too few arguments. Usage -- python matchSpotify.py <lyrics>"
    else:
    	#get lyrics from command line
    	
    	lyrics = sys.argv[1]
    	
    	musix = Musix()
    	params = {"q_lyrics": lyrics}
    	musix.addMusixParams(params)
    	musix.getTracksFromLyrics()
    	res = musix.getTracks()

    	spotipyCred = oauth2.SpotifyClientCredentials(client_id='5404d36c8bfe444cb1ca8ad56a3569c0', 
    		client_secret='0ac167a19f064eafa153e0f01dd8e2f0')

    	spotify_const = spotipy.Spotify(client_credentials_manager=spotipyCred)

    	tracks = Tracks()

    	tracks.buildTrackMap(res, spotify_const)
    	
    	print tracks.getTrackMap()





