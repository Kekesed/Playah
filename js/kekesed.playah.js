/*
  Playan HTML 5 Audio Player
  Requires Metro UI v3, jQuery.

   Created by Mealkuwat a.k.a Kekesed
   https://kekesed.id

   @author: Mealkuwat // Kekesed
   @copyright: Copyright (c) 2016 Kekesed
   @link: https://kekesed.id/


  Saya orang Indonesia.
  Jadilah warganegara yang membanggakan.
*/
$.widget("Kekesed.Playah", {
  options:{
		autoplay:false,
		random:false,
		loop:true,
		android_mode:true,
		playlist: [],
    /*
      Playlist.json:
      [{
      type:'mp3',
      path:'/ganteng.mp3'
      meta:{picture:asd}
    },{
      type:'soundcloud:playlist',
      path:'https:',
      behavior: function(songid,songmetadata){}
      }]
    */
		theme: {
      base:'white',
      accent:'darkBlue'
    },
    header:{
      height:'150px'
    },
		callback:{
			onNext:function(SongData) {},
			onPrev:function(SongData) {},
			onState:function(Status, SongData) {},
			onError:function(Err, SongData) {},
			onLoad:function() {},
		},
  },

  //bertanggung  jawab sebagai memori penyimpanan global.
  statik: {
    kontrol:{
      skeleton:{
        kepala:$("<div/>"),
        progress:$('<div/>', {class:'progress no-margin', 'data-value':0, 'data-role':'progress'}),
        badan:$('<div/>', {class:'no-margin padding20 align-center'}),
      },
      badan:{
        judul:$('<div/>', {class:'text-bold no-margin', text:'....'}),
        subjudul:$('<p/>', {class:'text-small'}),
        artis:$('<b/>', {text:'Hayashi'}),
        album:$('<span/>', {text:'Playah'}),

        kPlay: $('<button/>', {class:'button fg-white bg-blue'}), // cek settingan asset :v
        kBckw: $('<button/>', {class:'button mini-button'}),
        kFrwd: $('<button/>', {class:'button mini-button'}),

        iPlay: $('<span/>', {class:'mif-play'}),
        iPaus: $('<span/>', {class:'mif-pause'}),
        iBack: $('<span/>', {class:'mif-backward'}),
        iForw: $('<span/>', {class:'mif-forward'})
      }
    },
    cache: {
      player:undefined,
      isplaying:false
    },
    siklus: {
      Playmate: [], // buat nampung playlist yang udah di acak, ato langsung ke siniin aja buar langsung joss
      curr_num: -1, //buat nyimpen ini di playlist yang mana.
      curr_audio: undefined // buat yang audio yang lagi di puter, mungkin buat ngambil metadatanya
    }
  },

  //bertanggung jawab sebagai constructor
  _create:function(){
    //mempersingkat
    var bdn = this.statik.kontrol.badan;
    var bdn_= this.statik.kontrol.skeleton.badan;

    // MAYOR
    this.statik.kontrol.skeleton.kepala.addClass("align-center bg-"+this.options.theme.accent);
    this.statik.kontrol.skeleton.kepala.css({height:this.options.header.height, overflow:'hidden'});
    this.statik.kontrol.badan.artis.addClass('fg-'+this.options.theme.accent)
    this.statik.kontrol.skeleton.progress.data('data-color', this.options.theme.accent);
    this.statik.kontrol.skeleton.badan.addClass('bg-grayLighter');

    //MINOR
    bdn.kPlay.append(bdn.iPlay);
    bdn.kBckw.append(bdn.iBack);
    bdn.kFrwd.append(bdn.iForw);
    bdn.subjudul.append(bdn.artis).append("&nbsp;&nbsp;").append(bdn.album);
    bdn_.append(bdn.judul)
        .append(bdn.subjudul)
        .append(bdn.kBckw)
        .append(bdn.kPlay)
        .append(bdn.kFrwd);
    this.element.append(this.statik.kontrol.skeleton.kepala)
                .append(this.statik.kontrol.skeleton.progress)
                .append(this.statik.kontrol.skeleton.badan);
    // init finish
    this.options.callback.onLoad();

    //PRE-CYCLE PREPARATION
    var opt = this.options;
    var par = this;
    this.resolve_playlist().then(function(){
      //AUTOPLAY
      console.log(par.statik.siklus.Playmate);
      par._next(true);
      if(opt.autoplay){
        par._emit();
      } else {
        par._emit(true); // autoplay disabled
      }
      par.update_kiri_kanan();
      //BUTTON BINDER
      var sket = par.statik.kontrol.badan;
      $(sket.kPlay).click(function(){
        if(!par.statik.cache.isplaying)
          $(par.statik.cache.player).trigger('play');
        else
          $(par.statik.cache.player).trigger('pause');
      });
      $(sket.kBckw).click(function(){
        par._prev();
      });
      $(sket.kFrwd).click(function(){
        par._next();
      });
      $(par.statik.kontrol.skeleton.progress).click(function(e){
        var x = e.pageX - $(this).offset().left;
        var persen = x / $(this).innerWidth();
        var letakDurasi = $(par.statik.cache.player).prop('duration') * persen;
        $(par.statik.cache.player)[0].currentTime =letakDurasi;
      });
    });
  },

  update_kiri_kanan: function(){
    var opt = this.options;
    if(this.statik.siklus.Playmate.length <= 0) {
      //nggak ada track di playlistnya
      $(this.statik.kontrol.badan.kBckw).prop('disabled', true);
      $(this.statik.kontrol.badan.kFrwd).prop('disabled', true);
      $(this.statik.kontrol.badan.kPlay).prop('disabled', true);
      return;
    } else if(this.statik.siklus.Playmate.length == 1) {
      //cuma atu... disabling the prev and next button
      $(this.statik.kontrol.badan.kBckw).prop('disabled', true);
      $(this.statik.kontrol.badan.kFrwd).prop('disabled', true);
      $(this.statik.kontrol.badan.kPlay).prop('disabled', false);
    } else {
      $(this.statik.kontrol.badan.kBckw).prop('disabled', false);
      $(this.statik.kontrol.badan.kFrwd).prop('disabled', false);
      $(this.statik.kontrol.badan.kPlay).prop('disabled', false);
    }
  },
  resolve_playlist:function(){
    var par = this;
    var opt = this.options;
    return new Promise(function(ok,err){
      var crrPlaylist = [];
      var sc=false;
      var first=true;
      if(Array.isArray(opt.playlist)){

        opt.playlist.forEach(function(dat){
          //console.log(dat);
          if(dat.type == 'soundcloud'){
            sc=true;
            par.sc.trackify(dat, function(kembalian){
              if(Array.isArray(kembalian)){
                kembalian.forEach(function(da){
                  crrPlaylist.push(da);
                });
              } else
                crrPlaylist.push(kembalian);


                if (first)
                  ok();
                first=false;

                par.update_kiri_kanan();
            });
          } else{
            crrPlaylist.push(dat);
          }
          par.update_kiri_kanan();
        });
        if(opt.random)
          par.statik.siklus.Playmate = par._fliptable(crrPlaylist);
        else
          par.statik.siklus.Playmate = crrPlaylist;

        if(!sc)
          ok();
        par.update_kiri_kanan();
      } else {
        par.statik.siklus.Playmate = [].concat(opt.playlist);
        ok();
      }

    });
  },

  sc: {
    data: {
      clid: 'b9d1369138efad91c7ab558b02baa3cc'
    },
    trackify: function(data, cl){
      var par = this;
      this.resolve('resolve', {url:data.path}, function(datz){
        if (datz.uri.search('track') != -1)
          var ret ={
            type:'soundcloud',
            path: datz.stream_url + "?client_id=" + par.data.clid,
            meta: {
              contribute:datz.permalink_url,
              artist: datz.user.username,
              title: datz.title,
              album: 'Soundcloud',
              image: datz.artwork_url.replace('large', 'crop')
            }
          };

        if(datz.uri.search('playlist') != -1){
          var ret= [];
          datz.tracks.forEach(function(datx){
            ret.push({
              type:'soundcloud',
              path: datx.stream_url + "?client_id=" + par.data.clid,
              meta: {
                contribute: datx.permalink_url,
                artist: datx.user.username,
                title: datx.title,
                album: datz.title,
                image: (datx.artwork_url?datx.artwork_url:datx.user.avatar_url).replace('large', 'crop')
              }
            });
          });
        }

        cl(ret);
      });
      return ;
    },
    resolve: function(url, data, cl){
      var dat = data;
      dat.client_id = this.data.clid;
      $.ajax({
        url:'https://api.soundcloud.com/' + url,
        data: dat,
        method:'get',
      }).always(function(data){
        cl(data);
        return data;
      });
    }
  },

  // Berguna untuk memulai siklus pemutaran lagu baru
  _emit: function(prepare) {
    prepare = prepare || false;
    this._sodok_audio(this.statik.siklus.curr_audio);         //Ganti Audio
    this._ganti_judul(this.statik.siklus.curr_audio.meta);    //Ganti Judul
    //ganti bgnya belon

    //PLAY
    if(this.statik.cache.isplaying || (!prepare && this.statik.cache.isplaying))
      $(this.statik.cache.player).trigger('play');

    this._integrate_listener();
  },

  //bertanggung jawab untuk mengganti tampilan judul
  _ganti_judul: function(data) {
    var knt = this.statik.kontrol.badan;
    knt.judul.text(data.title);
    knt.artis.text(data.artist);
    knt.album.text(data.album);

    //ganti gambhar
    var kp = this.statik.kontrol.skeleton.kepala;
    if(data.image)
      $(kp).html('').append($('<img/>', {src:data.image, 'data-role':'fitImage', 'data-type':'sd'}));
    else
      $(kp).html('');
  },

  //bertanggung jawab untuk meload file baru
  _sodok_audio: function(data) {
    var curr = this.statik.cache.isplaying;
    if(!(this.statik.cache.player == undefined))
      $(this.statik.cache.player).trigger('pause');
    this.statik.cache.isplaying = curr;
    this.statik.cache.player = $('<audio/>', {type:'audio/mp3',src:data.path, autoplay:false, control:false});

    $(this.statik.cache.player).trigger('load');

  },

  //bertanggung jawab menginject listener yang baru untuk tiap kali audio berganti,
  //saat lagu ganti, dan terjadi masalah pada player
  _integrate_listener: function() {
    var par = this;
    var ply= false;
    $(this.statik.cache.player).on({
      /*'canplay':function(){
        par.statik.cache.player.trigger('play');
      },*/
      'timeupdate':function(){
        // ganti progressbar;
        /*ply=true;
        par.statik.cache.isplaying = ply;*/
        $(par.statik.kontrol.skeleton.progress).data('progress').set($(this).prop('currentTime')/$(this).prop('duration')*100);
      },
      'ended':function(){
        if(par.statik.siklus.Playmate.length > 1) {
          par.statik.cache.isplaying = true;
            par._next();
        }
      },


      /// Tombol Pemutarnya~
      'playing': function(){
        ply=true;
        par.statik.cache.isplaying = ply;
        par.statik.kontrol.badan.kPlay.html('').append(par.statik.kontrol.badan.iPaus);
      },
      'play': function(){
        ply=true;
        par.statik.cache.isplaying = ply;
        par.statik.kontrol.badan.kPlay.html('').append(par.statik.kontrol.badan.iPaus);
      },
      'pause':function(){
        ply=false;
        par.statik.cache.isplaying = ply;
        par.statik.kontrol.badan.kPlay.html('').append(par.statik.kontrol.badan.iPlay);
      },
      'seeking':function(){
        ply=false; // review lagi
        par.statik.cache.isplaying = ply;
        par.statik.kontrol.badan.kPlay.html('').append(par.statik.kontrol.badan.iPlay);
      },
      'waiting':function(){
        ply=false;
        par.statik.cache.isplaying = ply;
        par.statik.kontrol.badan.kPlay.html('').append(par.statik.kontrol.badan.iPlay);
      },
      'error':function(){
        ply=false;
        par.statik.cache.isplaying = ply;
        par.statik.kontrol.badan.kPlay.html('').append(par.statik.kontrol.badan.iPlay);
      }

    });
  },

  //bertanggung jwab untuk mengganti lagu, dan memulai siklus baru
  _next:function(cancel_emit) {
    cancel_emit = cancel_emit || false;
    console.log(this.statik.siklus.Playmate);
    var cnum = this.statik.siklus.curr_num;
    cnum = (cnum+1)%this.statik.siklus.Playmate.length;
    this.statik.siklus.curr_audio = this.statik.siklus.Playmate[cnum]; //add up the next part.
    this.statik.siklus.curr_num = cnum;
    console.info("Next! Current number: " + cnum);
    console.log(this.statik.siklus.curr_audio);
    //emit the "next are triggered."
    if(!cancel_emit)
      this._emit();
  },

  //bertanggung jawab untuk menggantu lagu dan memulai siklus baru
  _prev:function(){
    // SPECIAL FORCE: ANDROID MODE
    if(this.options.android_mode) {
      if(this.statik.cache.player.prop('currentTime') > 5){
        this.statik.cache.player.prop('currentTime', 0);
        return;
      }
    };
    var cnum = this.statik.siklus.curr_num;
    if(cnum <= 0)
      cnum = this.statik.siklus.Playmate.length-1;
    else
      cnum--;
    this.statik.siklus.curr_audio = this.statik.siklus.Playmate[cnum]; //add up the next part.
    this.statik.siklus.curr_num = cnum;
    //emit the prev was triggered.

    console.info("Prev! Current number: " + cnum);
    console.log(this.statik.siklus.curr_audio);
    this._emit();
  },

  //bertanggung jawab untuk merandomkan playlist.
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

$.fn.extend({
	ksd_info: {
		Playah: function() { return "2.0";},
	}
});
