from Util import getTracksSpotify as GTS
from spotipy import oauth2, Spotify
import sys

lyrics = sys.argv[1]
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
print tracks.getTrackMap()
# for key in mapsongs.keys():
# 	print mapsongs[key]