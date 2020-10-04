const hand_src = 'https://ringingroom.com/static/images/h-handstroke.png';
const back_src = 'https://ringingroom.com/static/images/h-backstroke.png';
const audio_src = 'https://ringingroom.com/static/audio/hand.mp3';

// Initial times of the bell audios
const inits = [17, 29, 32, 35, 38, 41, 44, 47, 50, 20, 23, 26];

export default class Bell {
  constructor(i, N, first){
    this.hand = true;
    this.init = inits[inits.length-N+i];

    this.audio = new Audio(audio_src);
    var _this = this;
    // Pause after 2sec
    this.audio.addEventListener('timeupdate',
    function(event){
      if(this.currentTime > _this.init+2){
        this.pause();
        this.currentTime = _this.init;
      }
    });

    this.img = new Image();
    this.img.src = hand_src;
    document.body.append(this.img);

    this.img.style.position = 'fixed';
    this.img.style.transform = 'translate(-50%, -50%)';
    var ang = (.5+2*(i-first-.5)/N)*Math.PI;
    this.left = Math.cos(ang) < 0;
    if(this.left) this.img.style.transform += 'scaleX(-1)';
    this.img.style.left = 50+35*Math.cos(ang)+'%';
    this.img.style.top  = 50+35*Math.sin(ang)+'%';
    this.img.style.width = '15%';

    this.label = document.createElement('div');
    this.label.innerHTML = '<b>'+(i+1)+'</b>';
    this.label.style.position = 'fixed';
    this.label.style.transform = 'translate(-50%, -50%)';
    this.label.style.left = 50+45*Math.cos(ang)+'%';
    this.label.style.top  = 50+45*Math.sin(ang)+'%';
    document.body.append(this.label);
  }

  destroy()
  {
    this.audio.remove();
    this.img.remove();
    this.label.remove();
  }

  pull(){
    this.hand = !this.hand;
//      if(this.hand) this.img.src = hand_src; else this.img.src = back_src;
    this.audio.pause();
    this.audio.currentTime = this.init;
    this.audio.play();

    if(this.hand){
      if(this.left){
        this.img.style.animation = 'swing_dn_left .1s forwards ease-in-out';
      }
      else{
        this.img.style.animation = 'swing_dn .1s forwards ease-in-out';
      }
    }
    else{
      if(this.left){
        this.img.style.animation = 'swing_up_left .1s forwards ease-in-out';
      }
      else{
        this.img.style.animation = 'swing_up .1s forwards ease-in-out';
      }
    }
  }
}
