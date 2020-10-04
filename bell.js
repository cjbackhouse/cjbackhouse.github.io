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

    // TODO - figure out how to do this with transition
    this.img.style.animation = 'grow 2s ease-in-out';

    this.label = document.createElement('div');
    this.label.style.position = 'fixed';
    this.label.style.transform = 'translate(-50%, -50%)';
    document.body.append(this.label);

    this.setPosition(i, N, first);
  }

  setPosition(i, N, first){
    this.img.style.position = 'fixed';
    this.img.style.transform = 'translate(-50%, -50%)';
    var ang = (.5+2*(i-first-.5)/N)*Math.PI;
    this.left = Math.cos(ang) < 0;
    if(this.left) this.img.style.transform += 'scaleX(-1)'; else this.img.style.transform += 'scaleX(+1)';

    this.img.style.left = 50+35*Math.cos(ang)+'%';
    this.img.style.top  = 50+35*Math.sin(ang)+'%';
    this.img.style.width = '15%';

    this.img.style.transition = 'left 1.5s ease-in-out, top 1.5s ease-in-out, transform .5s';

    this.label.innerHTML = '<b>'+(i+1)+'</b>';
    this.label.style.left = 50+45*Math.cos(ang)+'%';
    this.label.style.top  = 50+45*Math.sin(ang)+'%';
  }

  destroy(){
    this.img.style.opacity = '0';
    this.img.style.transition = 'opacity 1s ease-in-out';
    this.img.addEventListener('transitionend', () => { this.img.remove(); });

    this.audio.remove();
    this.label.remove();
  }

  pull(){
    this.hand = !this.hand;
//      if(this.hand) this.img.src = hand_src; else this.img.src = back_src;
    this.audio.pause();
    this.audio.currentTime = this.init;
    this.audio.play();

    var t = 'translate(-50%, -50%)';
    if(this.left) t += ' scaleX(-1)';
    if(this.hand) t += ' rotate(0deg)'; else t += ' rotate(90deg)';

    this.img.style.transform = t;
    this.img.style.transition = 'transform .1s ease-in-out';
  }
}
