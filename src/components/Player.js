import React, { Component } from "react";
    // import 'react-h5-audio-player/lib/styles.css';
    import { Progress } from "semantic-ui-react";
    import Draggable, { DraggableCore } from "react-draggable";


export default class extends Component {
  state = {
    currentTime: 0,
    duration: 0,
    loop: false,
  };

  componentDidMount() {
    this.player.addEventListener("timeupdate", (e) => {
      const { currentTime, duration } = e.target;
      this.setState({
        currentTime: currentTime,
        duration: duration,
      });

      if (currentTime === duration) {
        this.props.stop();
      }
    });
    console.log(this.player.currentTime ,"cdm")
  }


  componentWillUnmount() {
    this.player.removeEventListener("timeupdate", () => {});
  }

  songSeek = () => {
    var timer = this.player.duration;
    var ct = this.player.currentTime;
      console.log(this.player.currentTime,"songseek");


    var seeking = false;
    var seekto;
    var seekslider = document.getElementById("seekslider");
    seekslider.addEventListener("mousedown", function (event) {
      seeking = true;
      seek(event);
    });
    seekslider.addEventListener("mousemove", function (event) {
      seek(event);
    });
    seekslider.addEventListener("mouseup", function () {
      seeking = false;
    });

    function seek(event) {
      if (seeking) {
        seekslider.value = event.clientX - seekslider.offsetLeft;
        seekto = this.player.duration * (seekslider.value / 100);
        this.player.currentTime = seekto;
      }
    }
  };

  

  componentDidUpdate(prevProps) {
        console.log(this.player.currentTime,"cdu");


    const { song, stop } = this.props;
    const prevSong = prevProps.song;
    if (song.id !== prevSong.id) {
      this.player.pause();
      this.player.src = song.link;
      stop();
    }
    if (!song) {
      // !song || !song.id
      this.player.pause();
    }
  }

  componentDidUpdate = () => {
    var seeking = false;
    var seekto;
    var seekslider = document.getElementById("seekslider");
    seekslider.addEventListener("mousedown", function (event) {
      seeking = true;

    seekslider.value = event.clientX - seekslider.offsetLeft;
    seekto = this.player.duration * (seekslider.value / 100);
    this.player.currentTime = seekto;
  
    });
    seekslider.addEventListener("mousemove", function (event) {
      seekslider.value = event.clientX - seekslider.offsetLeft;
      seekto = this.player.duration * (seekslider.value / 100);
      this.player.currentTime = seekto;
  
    });
    seekslider.addEventListener("mouseup", function () {
      seeking = false;
    });
    
    console.log(this.player.duration, "cdu2");
//     function seek(event) {
//       if (seeking) {
//     seekslider.value = event.clientX - seekslider.offsetLeft;
//     seekto = this.player.duration * (seekslider.value / 100);
//     this.player.currentTime = seekto;
//   }
// }


  }
  play = () => {
    const { play, song } = this.props;
    if (this.player.paused && this.player.currentSrc) {
      this.player.play();
    } else {
      this.player.src = song.link;
      this.player.play();
    }
    play();
  };

  stop = () => {
    const { stop } = this.props;
    this.player.pause();
    stop();
  };

  backword = () => {
    this.player.currentTime -= 10;
  };
  forward = () => {
    this.player.currentTime += 10;
  };

  toggleLoop = () => {
    this.setState(
      {
        loop: !this.state.loop,
      },
      () => {
        this.player.loop = this.state.loop;
      }
    );
  };

  render() {
    var minutes = Math.floor(this.state.duration / 60),
      seconds_int = this.state.duration - minutes * 60,
      seconds_str = seconds_int.toString(),
      seconds = seconds_str.substr(0, 2),
      time = minutes + ":" + seconds;

    var updateTime = Math.floor(this.state.currentTime / 60),
      seconds_int = this.state.currentTime - updateTime * 60,
      seconds_str = seconds_int.toString(),
      seconds = seconds_str.substr(0, 2),
      updatedTime = updateTime + ":" + seconds;

    const { song, playing } = this.props;
    console.log(song.link);
    const { title } = song;
    const { currentTime, duration, loop } = this.state;
    // console.log(time);
    let percent = 0;
    if (duration > 0) {
      percent = (currentTime * 100) / duration;
      // console.log(currentTime); // for current time display
    }
    const loopClass = `white-button ${loop ? "orange-button" : ""}`;
    const genres = (song.genreData || [])
      .map((genre) => genre.name.charAt(0).toUpperCase() + genre.name.slice(1))
      .join(", ");

    // if(seeking){
    //     seekslider.value = event.clientX - seekslider.offsetLeft;
    //       seekto = audio.duration * (seekslider.value / 100);
    //       audio.currentTime = seekto;
    // }

    //   var seekto;
    // var seeking = false;
    // // playbtn = document.getElementById("playpausebtn");
    // // mutebtn = document.getElementById("mutebtn");
    // var seekslider = document.getElementsByClassName("seekslider");
    // var volumeslider = document.getElementById("volumeslider");
    // var curtimetext = document.getElementById("curtimetext");
    // var durtimetext = document.getElementById("durtimetext");
    // // seekslider.addEventListener("mousedown", function (event) {
    // //   seeking = true;
    // //   seek(event);
    // // });
    // // seekslider.addEventListener("mousemove", function (event) {
    // //   seek(event);
    // // });
    // // seekslider.addEventListener("mouseup", function () {
    // //   seeking = false;
    // // });
    // function seek(event) {
    //   var seekto;
    //   if (seeking) {
    //     seekslider.value = event.clientX - seekslider.offsetLeft;
    //     seekto = this.player.duration * (seekslider.value / 100);
    //     this.player.duration.currentTime = seekto;
    //   }
    // }

    // function seektimeupdate() {
    //   var nt = this.player.duration.currentTime * (100 / this.player.duration.duration);
    //   seekslider.value = nt;
    //   var curmins = Math.floor(this.player.duration.currentTime / 60);
    //   var cursecs = Math.floor(this.player.duration.currentTime - curmins * 60);
    //   var durmins = Math.floor(this.player.duration.duration / 60);
    //   var dursecs = Math.floor(this.player.duration.duration - durmins * 60);
    //   if (cursecs < 10) {
    //     cursecs = "0" + cursecs;
    //   }
    //   if (dursecs < 10) {
    //     dursecs = "0" + dursecs;
    //   }
    //   if (curmins < 10) {
    //     curmins = "0" + curmins;
    //   }
    //   if (durmins < 10) {
    //     durmins = "0" + durmins;
    //   }
    //   curtimetext.innerHTML = curmins + ":" + cursecs;
    //   durtimetext.innerHTML = durmins + ":" + dursecs;
    // }

    return (
      <div className="play-buttons">
        <h3 className="song-title">{title}</h3>
        <p className="song-description">{genres}</p>
        <div>
          <audio ref={(ref) => (this.player = ref)} />
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "\nbody{ background:#666; }\nbutton{ border:none; cursor:pointer; outline:none; }\ninput{ outline:none; }\nbutton#playpausebtn{\n\tbackground:url(images/pause.png) no-repeat;\n\twidth:12px;\n\theight:14px;\n}\nbutton#mutebtn{\n\tbackground:url(images/speaker.png) no-repeat;\n\twidth:5px;\n\theight:14px;\n}\ninput#seekslider{\n\twidth:100px;\n}\ninput#volumeslider{\n\twidth: 70px;\n}\ndiv#timebox{\n\tdisplay:inline-block;\n\twidth:80px;\n\tbackground:#000;\n\ttext-align:center;\n\tcolor: #09F; \n\tfont-family: Arial, Helvetica, sans-serif;\n\tfont-size:11px;\n}\ninput[type='range'] {\n    -webkit-appearance: none !important;\n\tmargin:0px;\n\tpadding:0px;\n    background: #000;\n    height:13px;\n\tborder-bottom:#333 1px solid;\n}\ninput[type='range']::-ms-fill-lower  {\n\tbackground:#000;\n}\ninput[type='range']::-ms-fill-upper  {\n\tbackground:#000;\n}\ninput[type='range']::-moz-range-track {\n\tborder:none;\n    background: #000;\n}\ninput[type='range']::-webkit-slider-thumb {\n    -webkit-appearance: none !important;\n    background: radial-gradient(#FFF, #333);\n    height:11px;\n    width:11px;\n\tborder-radius:100%;\n\tcursor:pointer;\n}\ninput[type='range']::-moz-range-thumb {\n    background: radial-gradient(#FFF, #333);\n    height:11px;\n    width:11px;\n\tborder-radius:100%;\n\tcursor:pointer;\n}\ninput[type='range']::-ms-thumb {\n    -webkit-appearance: none !important;\n    background: radial-gradient(#FFF, #333);\n    height:11px;\n    width:11px;\n\tborder-radius:100%;\n\tcursor:pointer;\n}\n",
          }}
        />
        <div className="audioSeek">
          <p className="audioEndTime">{time}</p>
          <p className="audioStartTime">{updatedTime}</p>

          <input
            style={{ color: "#d9a86c", cursor: "pointer" }}
            id="seekslider"
            type="range"
            // onChange={this.songSeek}
            min="0"
            max="100"
            value={`${percent}`}
            // max={percent}
            // percent={percent}
            step="1"
          />
          {/* <input
            ref={(ref) => (this.seekProgress = ref)}
            style={{ color: "#d9a86c", cursor: "pointer" }}
            type="range"
            className="seekslider"
            min={0}
            max={100}
            step="1"
            value={percent}
            active
          /> */}
        </div>

        <div className="play-buttons-conatiner">
          {/* <div className="random white-button">
            <i className="fa fa-random ran"></i>
          </div> */}
          <div className="backward white-button elevated-button" onClick={this.backword}>
            <i className="fa fa-backward bac "></i>
          </div>
          {!playing ? (
            <div onClick={this.play} className="playing white-button elevated-button">
              <i className="fa fa-play play"></i>
            </div>
          ) : (
            <div className="pause white-button elevated-button" onClick={this.stop}>
              <i className="fa fa-pause pau "></i>
            </div>
          )}
          <div className="forward white-button elevated-button" onClick={this.forward}>
            <i className="fa fa-forward forw"></i>
          </div>
          {/* <div className={loopClass} onClick={this.toggleLoop}>
            <i className="fa fa-retweet repeat"></i>
          </div> */}
        </div>
      </div>
    );     }
}