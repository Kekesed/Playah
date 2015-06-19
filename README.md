# Playah
A HTML5 Audio Player based on MetroUI CSS Version 2 (v3 are now on work). Basically it works for direct stream, like mp3 or ogg file on server.
It will played smoothly as your browser play it usually.

**Current Version:** 1.3.

**UNFINISHED DOCUMENTATION**


#### Playah needs jQuery!
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
#### Options:
|Name|Type|Default Value|Detail|
|:------|:-----:|:-------|:-----------------------|
|theme|string|'Blue'|Theme color of the Playah (All color are defined in global style in MetroUI CSS Doc.|
|autoplay|boolean|false|Auto play the playlist when ready.|
|random|boolean|false|Shuffle the playlist before it plays.|
|loop|boolean|true|Loop the whole playlist. Not one track.|
|android_mode|boolean|true|When prev pessed, it wont change to previous track in playlist, it seeks to 0:00 for several conditions.|
|playlist|object|[]|The playlist.|
|header|object|{height: '150px', color:'darkBlue'}|The Playah have a header, wich is the image that will be loaded. This is shows at default when the img in meta of a track in playlist are undefined or null.|
|callback|object|{...}|The callback function|

#### *header* Object
The *header* object are optional.
|Name|Type|Default|Detail|
|:------|:-----:|:-------|:-----------------------|
|height|string|'150px'|The height in CSS Value.|
|color|string|'darkBlue'|Color background setting in Playah|

#### *callback* Object
The *callback* Object are actually optional.

#### Method
The method we recentcly programmed are *next* and *prev*. The main idea are, this is the void button that will give command to our player. It requires no parameter and will return nothing from it.
