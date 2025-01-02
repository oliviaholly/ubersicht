# Now playing for Übersicht

This is a now playing widget for [Übersicht](http://tracesof.net/uebersicht/)
that displays the current track in Spotify, Music (iTunes), and Sonos depending on which
is currently playing.

Modified from: [Original not found]

![Screenshot of now playing widget](/images/image_5.png)

## Installation

Clone this repository to your widgets folder (default: ~/Library/Application Support/Übersicht/widgets).

### Sonos

For Sonos support you need to install [SoCo](https://github.com/SoCo/SoCo), a Python Sonos Controller, `pip install soco`. You also need to adjust the IP address to your speaker inside `current_track.py`. You can find the IP address by going to "About Sonos" inside the Sonos desktop application.

