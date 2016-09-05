# Node-Leap-MIDI
*A NodeJS server converting Leap Motion input to MIDI*

This nifty little server turns your Leap Motion controller into a MIDI instrument or controller. I've used it successfully with Ableton Live 9, but should work pretty well for a variety of MIDI-based applications.

##Getting Started##
You must have NodeJS set up on your computer. I'd recommend visiting https://nodejs.org/en/download/

This is a command-line tool, so you'll need to be familiar with the basics of command line usage on your system.

Download or clone this repo, and be sure to change directory into it (from your console), e.g.
```
cd leap-midi
```
Then install all the dependencies:
```
npm install
```

Now you should be ready to go!


##Modes of operation##
The server can operate in two fundamentally different ways (for now).

*Instrument* mode works for only one hand at a time. It sends MIDI note on/off messages as the height of your hand changes. The height of the hand determines the pitch which is sent. You can also rotate your hand left and right or open and close your fist to send Control Change messages - these allow you to affect various aspects of the tone of the instrument or any effects you'd like to apply.

*Controller* mode works for one or two hands. It doesn't send notes - only Control Change messages. At the moment, it works like this: the height of hand 1 sends a single Control Change value from 0 to 127 - this is intended to be used for reverb/delay amount. If a second hand is seen by the Leap, one Control Change value is instantly set to 127 and the height of hand 2 is mapped from 0 - 127 - the idea is to make a Frequency Shift Dry/Wet value get turned fully "on" when a second hand is spotted (and reset to 0 as soon as it leaves), while the height is mapped to the Frequency Shift center pitch value. But I'm sure it could be adapted for other uses.


##Basic usage##
###Instrument mode###


The default mode is *instrument*, so just type:
```
node .
````
which is exactly equivalent to:
```
node . --mode instrument
```

###Controller mode###
For *controller* mode, launch like this:
```
node . --mode controller
```

##Advanced usage##
Many default settings (e.g. number of notes to use in instrument mode, or the Channels used for Control Change messages) can be changed on startup, too. I'll document these more thoroughly soon.
