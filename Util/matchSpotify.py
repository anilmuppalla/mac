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

class Track:

	def __init__(self,name,artist):
		self.name = name
		self.artist = artist

	def getName(self):
		return self.name

	def getArtist(self):
		return self.artist

	def getUrl(self):
		return self.url

	def setName(self,name):
		self.name = name

	def setArtist(self,artist):
		self.artist = artist

#TODO: Complete
class Tracks:
	def __init__(self):
		self.tracks = []
		self.num_tracks = 0
		self.trackMap ={}


class Constants:
	def __init__(self):
		self.musix_api_key = "eddca3beccf778ab522216a01e6bc3f4"
		self.musix_url = "http://api.musixmatch.com/ws/1.1/track.search"
		self.musix_data = { "apikey": self.musix_api_key,
					  "f_has_lyrics": 1,
					  "format": "json",
					  "page_size":1,
					  "s_track_rating":"desc"}
		self.spotify_url = "https://api.spotify.com/v1/search"
		self.spotify_data = {"limit": 10}


	def addMusixParams(self,data):
		for key in data.keys():
			#if key already exists, overwrite val
			self.musix_data[key] = data[key]

	def addSpotifyParams(self,data):
		for key in data.keys():
			self.spotify_data[key] = data[key]
			
	def getMusixParams(self):
		return self.musix_data

	def getSpotifyParams(self):
		return self.spotify_data

if __name__=="__main__":
    
    #get lyrics from command line
    if len(sys.argv) < 2:
    	print "Too few arguments. Usage-- python matchSpotify.py <lyrics>"
    else:
    	#get lyrics
    	lyrics = ""

    	#trackMap of type Track obj: Preview URL
    	trackMap = {}
    	
    	for word in sys.argv[1:]:
    		lyrics += " " + str(word) 
    	lyrics = lyrics.strip()

    	const = Constants()
    	params = {"q_lyrics": lyrics}
    	const.addMusixParams(params)

    	r = requests.get(const.musix_url, params = const.getMusixParams())
    	result = r.json()
    	tracklist = result["message"]["body"]["track_list"]
    	
    	print "Num tracks", len(tracklist)

    	for item in tracklist:

    		item = item["track"]
    		name = item["track_name"]
    		artist = item["artist_name"]
    		track = Track(name,artist)

    		#spotify request
    		spotify_const = Constants()

    		#TODO: Pass name and artist
    		spotify_params = { "q" : name , "type": "track"}
    		spotify_const.addSpotifyParams(spotify_params)
    		req = requests.get(spotify_const.spotify_url,params = spotify_const.getSpotifyParams())
    		res = req.json()

    		preview_url = res["tracks"]["items"][0]["preview_url"]

    		trackMap[track] = preview_url

    print trackMap





