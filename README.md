# Playah
A HTML5 Audio Player based on MetroUI CSS Version 2 (v3 are now on work). Basically it works for direct stream, like mp3 or ogg file on server.
It will played smoothly as your browser play it usually.

**Current Version:** 1.3.

** UNFINISHED DOCUMENTATION **


## Playah needs jQuery!
Since Playah using the jQuery widget factory, it means that Playah requires the jQuery framework. And you don't have to worry, if you use the default set of MetroUI CSS, you just need to add our Javascript, and call the api.

# Constructing the Playah:
```javascript
jQuery("#player").playah({ ... });
```

## Constructing playlist:
The playlist it self are constructed in JSON Format, so it gonna be flexible.
```
PLAYLIST
	|- meta
	|	|- title
	|	|- album
	|	|- artist
	|	|- img
	|
	|- src
	|	|- mp3
	|	|- ogg
	|
	|- type
```
The type are now will be ignored because of we still trying to repair the Soundcloud integrator utility.

## Public Method:
**Still Update**