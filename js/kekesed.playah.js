/* 
	Playah Javascript Plugin for MetroUI
	Requires jQuery and MetroUI Bootstrap.
	
	Copyright (c)2015 Kekesed. All rights reserved.
	https://app.kekesed.gq/run/Playah/
*/
$.widget("kekesed.playah", {
	options: {
		theme:'blue',
		autoplay:false,
		random:false,
		loop:true,
		android_mode:true,
		playlist: [],
		header:{
			height: '150px',
			color:'darkBlue',
		},
		callback:{
			onNext:function(SongData) {},
			onPrev:function(SongData) {},
			onState:function(Status, SongData) {},
			onError:function(Err, SongData) {},
			onLoad:function() {},
		},
	},
	vars: {
		btn:{
			ply:null,
			rew:null,
			fwd:null
		},
		icn: {
			ply:null,
			pau:null
		},
		songId:0,
		state:'pause',
		kontrol: {
			img:null,
			judul:null,
			pbar:null
		},
		statis :{
			player:null,
			temp:null,
		}
	},
	_create: function() {
		if(!(window.location.host.search("sndbox.ga") || window.location.host.search("kekesed.gq"))) {
			console.info("This site uses Playah HTML5 Audio Player\nhttps://app.kekesed.gq/run/Playah");
		}
		var elemen = this.element;
		var pict = $('<section/>', {class:'playah-picture bg-' + this.options.header.color}).css({overflow:'hidden', height: this.options.header.height});
		var pbar = $('<section/>', {class:'playah-progressbar progress-bar no-margin bg-dark'}).progressbar({
			value:100,
			color: "bg-" + this.options.theme,
			animate:false
		});
		var konten = $('<section/>', {class:'playah-konten bg-white padding15'});
		
		var kondisi = 'stop';
		
		// konstruk konten:
		var ply_btn = $("<button/>", {class:"large bg-" + this.options.theme + " fg-white"});
		var rew_btn = $("<button/>", {class:"fg-" + this.options.theme});
		var fwd_btn = $("<button/>", {class:"fg-" + this.options.theme});
		
		var ply_icn = $("<i/>", {class:"icon-play-2"}).appendTo(ply_btn);
		var rew_icn = $("<i/>",{class:"icon-previous"}).appendTo(rew_btn);
		var fwd_icn = $("<i/>", {class:"icon-next"}).appendTo(fwd_btn);
		var pau_icn = $("<i/>", {class:"icon-pause-2"});
		
		// Wrapper kontrol
		var ply_judul = $('<div/>', {class:'playah-judulan text-center'});
		var ply_control = $('<div/>', {class:'playah-control text-center margin10'});
		//create ui
			// kontrol
			rew_btn.appendTo(ply_control);
			ply_btn.appendTo(ply_control);
			fwd_btn.appendTo(ply_control);
			
			//Judulisasi
			ply_judul.appendTo(konten);
			// Kontrol Final
			ply_control.appendTo(konten);
		
		// Finalization
		pict.appendTo(elemen);
		pbar.appendTo(elemen);
		konten.appendTo(elemen);
		
		//Simpan ke memori
		this.vars.btn.ply = ply_btn;
		this.vars.btn.rew = rew_btn;
		this.vars.btn.fwd = fwd_btn;
		this.vars.icn.ply = ply_icn;
		this.vars.icn.pau = pau_icn;
		this.vars.kontrol.img = pict;
		this.vars.kontrol.judul = ply_judul;
		this.vars.kontrol.pbar = pbar;
		$("<small/>", {class:"place-right text-muted"}).append('Playah HTML5 Audio Player').appendTo(this.element);
		//SMART CHOOSANT Playlist:
		if(this.options.playlist.length == 0) {
			//None
			this._ganti_judul({title:'Playlist unloaded', artist:'Playah', album:'Ganteng dan Tamvan'});
			this._navRefresh();
		} else if(this.options.playlist.length > 0) {
			this._navRefresh();
		}
		
		//LOAD THE G*D-DAMN SONG:
		if(this.options.random) this.options.playlist = this._fliptable(this.options.playlist);
		this._play();
		
		if(this.options.autoplay) this._triggerplay();
		
		//PLAY-PAUSE:
		var Ortu = this;
		ply_btn.click(function() {
			Ortu._triggerplay();
		});
		
		//REWIND
		rew_btn.click(function() {
			Ortu.pref();
		});
		//FORWARD
		fwd_btn.click(function() {
			Ortu.next();
		});
		//CALLBACK:
		this.options.callback.onLoad();
	},
	_audioRefresh: function() {
		var pemuter = this.vars.statis.player;
		//RESTART
		pemuter.prop('currentTime', '0');
		if(this.vars.state == 'pause') {
			//lagi pause:
			$(this.vars.btn.ply).html('');
			this.vars.icn.ply.appendTo(this.vars.btn.ply);
			pemuter.trigger('pause');
		} else {
			//Play:
			$(this.vars.btn.ply).html('');
			this.vars.icn.pau.appendTo(this.vars.btn.ply);
			pemuter.trigger('play');
		}
	},
	next:function() {
		var Ortu = this;
		Ortu._plop();
		Ortu._play();
		Ortu._audioRefresh();
		//CALLBACK:
		this.options.callback.onNext(this.options.playlist[this.vars.songId]);
	},
	pref:function() {
		var Ortu = this;
		if(Ortu.options.android_mode && (Ortu.vars.statis.player.prop('currentTime') >= 5)) {
			//ANTI BUFFER: TAMVAN MODE
			Ortu.vars.statis.player.prop('currentTime',0);
		} else {
			Ortu._glop();
			Ortu._play();
		}
		Ortu._audioRefresh();
		this.options.callback.onPrev(this.options.playlist[this.vars.songId]);
	},
	_navRefresh: function() {
		if(this.options.playlist.length <= 1) {
			this.vars.btn.rew.attr('disabled','disabled');
			this.vars.btn.fwd.attr('disabled','disabled');
			if(this.options.playlist.length == 0) {
				this.vars.btn.ply.attr('disabled', 'disabled');
			} else {
				this.vars.btn.ply.removeAttr('disabled','disabled');
			}
		} else {
			this.vars.btn.rew.removeAttr('disabled');
			this.vars.btn.fwd.removeAttr('disabled');
			this.vars.btn.ply.removeAttr('disabled');
		}
	},
	_plop: function() {
		if(this.vars.songId >= this.options.playlist.length-1) {
			if(this.options.loop) {
				this.vars.songId = 0;
			} else {
				this.vars.songId = this.options.playlist.length-1;
			}
		} else {
			this.vars.songId += 1;
		}
	},
	_glop: function() {
		if(this.vars.songId == 0) {
			if(this.options.loop) {
				this.vars.songId = this.options.playlist.length-1;
			} else {
				this.vars.songId = 0;
			}
		} else {
			this.vars.songId -= 1;
		}
	},
	_play: function() {
		//detroy object
		if(typeof(this.vars.statis.player) != 'undefined' && this.vars.statis.player!= null)
			this.vars.statis.temp.remove();
		
		//geting index
		var idx = this.vars.songId;
		this._ganti_judul(this.options.playlist[idx].meta);
		var Audioer = this._audiofuck(this.options.playlist[idx].src);
		if(typeof(this.options.playlist[idx].meta.image) != "undefined" && this.options.playlist[idx].meta.image != null)
			this._imgchew(this.options.playlist[idx].meta.image);
		//appending to temp element
		var Temp = $("<div/>", {class:'playah-temp'}).appendTo(this.element).css({display:'none'});
		this.vars.statis.temp = Temp;
		Audioer.appendTo(Temp);
		Audioer.trigger('load');
		this.vars.kontrol.pbar.progressbar('value', 0);
		var pbar =this.vars.kontrol.pbar;
		var Ortu = this;
		Audioer.bind('timeupdate', function() {
			var durasi = $(this).prop('duration');
			var cdur = $(this).prop('currentTime');
			pbar.progressbar('value', cdur/durasi*100);
		});
		Audioer.bind('ended', function() {
			Ortu.next();
		});
		
		this.vars.kontrol.pbar.click(function(e) {
			//SEEK:
			var x = e.pageX - $(this).offset().left;
			var persen = x / $(this).innerWidth();
			Audioer.prop('currentTime', Audioer.prop('duration') * persen);
		});
		this.vars.statis.player = Audioer;
	},
	_triggerplay:function() {
		var pemuter = this.vars.statis.player;
		//PLAY PAUSE:
		if(this.vars.state == 'pause') {
			//lagi pause:
			$(this.vars.btn.ply).html('');
			this.vars.icn.pau.appendTo(this.vars.btn.ply);
			pemuter.trigger('play');
			this.vars.state = 'play';
		} else {
			//Play:
			$(this.vars.btn.ply).html('');
			this.vars.icn.ply.appendTo(this.vars.btn.ply);
			pemuter.trigger('pause');
			this.vars.state = 'pause';
		}
		this.options.callback.onState(this.vars.state, this.options.playlist[this.vars.songId]);
	},
	_ganti_judul: function (props) {
		this.vars.kontrol.judul.html('');
		if(typeof(props.title) != 'undefined' && props.title != null)
			var Judul = $("<strong/>", {class:"playah-judul"}).text(props.title);
		 else var Judul = $("<strong/>", {class:"playah-judul"}).text('Untitled Song');
		Judul.appendTo(this.vars.kontrol.judul);
		this.vars.kontrol.judul.append('<br>');
		
		if(typeof(props.artist) != 'undefined' && props.artist != null) {
			var Artis = $("<small/>",{class:'playah-artist text-bold fg-' + this.options.theme}).text(props.artist);
			Artis.appendTo(this.vars.kontrol.judul);
			this.vars.kontrol.judul.append(' ');
		}
		if(typeof(props.album) != 'undefined' && props.album != null) {
			var Album = $("<small/>", {class:"playah-album"}).text(props.album);
			Album.appendTo(this.vars.kontrol.judul);
		}
	},
	_audiofuck: function(source) {
		var player = $('<audio/>', {'preload':'none'});
		var mp3 = $('<source/>', {src: source.mp3, type:'audio/mpeg'});
		mp3.appendTo(player);
		
		if(typeof(source.ogg) != "undefined" && source.ogg !== null ) {
			var ogg = $('<source/>', {src: source.ogg, type:'audio/ogg'});
			ogg.appendTo(player);
		}
		return player;
	},
	_imgchew: function(prop) {
		var gambar = $('<img/>', {src:prop});
		this.vars.kontrol.img.html('');
		gambar.appendTo(this.vars.kontrol.img);
	},
	_fliptable: function (array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}
});