#!/usr/bin/env python
from soco import SoCo
from PIL import Image
from io import BytesIO

ip = '192.168.1.57'

def time(input):
    split_time = input.split(":")
    minutes = int(split_time[0]) * 60
    seconds = int(split_time[1])

    return minutes + seconds

if __name__ == '__main__':
    sonos = SoCo(ip) # Pass in the IP of your Sonos speaker

    track = sonos.get_current_track_info()
    state = sonos.get_current_transport_info()

    artist = track['artist']
    name = track['title']
    album = track['album']
    position = track['position'][2:]
    duration = track['duration'][2:]
    album_art = track['album_art']

    image = Image.open(album_art)  
    image = image.resize((150, 150))  # Resize the image for quicker calculation
    image = image.convert('RGB')

    # Calculate dominant color
    dom_color = image.getcolors(150*150)[0][1]
    print(dom_color)


    position = str(time(position))
    duration = str(time(duration))

    nothing = "not_playing::::::::::::::::"
    np = "playing::" + artist + "::" + name + "::" + album + "::::" + album_art + "::" + position + "::" + duration + "::" + dom_color

    if state['current_transport_state'] == "STOPPED":
        print(nothing)
    else:
        print(np)