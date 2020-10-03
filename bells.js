import Bell from "./bell.js";
import Method from "./method.js";

function bellAsString(i){
  if(i == 9) return '0';
  if(i == 10) return 'E';
  if(i == 11) return 'T';
  return ''+(i+1);
}

function rowAsString(row){
  var ret = '';
  for(var i = 0; i < row.length; ++i) ret += bellAsString(row[i]);
  return ret;
}

function Rounds(N){
  var ret = [];
  for(var i = 0; i < N; ++i) ret.push(i);
  return ret;
}

function setAtHand()
{
  for(var i = 0; i < bells.length; ++i) if(!bells[i].hand) bells[i].pull();
  hand = true;
  updown = true;
  bellNo = 0;
}

function setAtBack()
{
  for(var i = 0; i < bells.length; ++i) if(bells[i].hand) bells[i].pull();
  hand = false;
  updown = false;
  bellNo = 0;
}

var method, bells, row, hand, updown, bellNo;

// Initialize everything to defaults
pick_stage();
pick_method();
pick_pair();
pick_first_row();

var prevNow = -1;

var spacing = 250;

function bell()
{
  var now = performance.now();
  var dnow = prevNow > 0 ? now-prevNow : -1;
  prevNow = now;

  if(true){//row[bellNo] <= 1){
    if(hand && bellNo == 0) dnow /= 1.8; // undo handstroke gap
    if(dnow > 1.5*spacing) dnow = 1.5*spacing; // truncate outliers
    if(dnow > 0) spacing = 2./3*spacing + 1./3*dnow;

    if(spacing < 100) spacing = 150; // very fast, something went wrong?
    if(spacing > 600) spacing = 600; // very slow, something went wrong?

    var mins = Math.floor((spacing/1000.*(bells.length+.8)*5040)/60.+.5);
    var hrs = Math.floor(mins/60);
    mins = Math.floor(mins-60*hrs);
    document.getElementById('peal_time').innerHTML = hrs+'h'+mins+'m';
  }

  if(row[bellNo] > 1) bells[row[bellNo]].pull();

  bellNo += 1;
  bellNo %= bells.length;
  if(bellNo == 0){
    // New row
    hand = !hand;
    if(hand && updown) updown = false;
    if(!updown) row = method.nextRow();
    console.log(rowAsString(row));
  }

  var dt = spacing;
  // Handstroke gap
  if(bellNo == 0 && hand) dt *= 1.8;

  if(!stop){
    if(row[bellNo] > 1)
      window.setTimeout(function(){bell();}, dt);
  }
  else{
//      setAtHand();
    pick_stage();
    pick_method();
    pick_pair();
    pick_first_row();
//      stop = false;
//      updown = true;
//      once = true;
//      hand = true;
//      row = Rounds(bells.length);
    bellNo = 0;
    prevNow = -1;
    spacing = 300;
    document.getElementById('stop').style.display = 'none';
    stop = false;
  }
}

var once = true;
var stop = false;

document.onkeydown = function(event){
  if(event.key == 'j'){
    bells[0].pull();
     bell();
     if(once){
       once = false;
       document.getElementById('stop').style.display = 'inline';
     }
  }
  if(event.key == 'f'){
    bells[1].pull();
    bell();
  }
}

function pick_stage(){
  var N = document.getElementById('stage').value;
  console.log('Picking', N, 'bells');

  for(var i in bells) bells[i].destroy();
  bells = [];
  for(var i = 0; i < N; ++i) bells[i] = new Bell(i, N);
  row = Rounds(N);

  var select = document.getElementById('pair');
  select.options.length = 0;
  for(var i = 0; i < N; i += 2){
    var opt = document.createElement('option');
    opt.text = bellAsString(i)+'-'+bellAsString(i+1);
    opt.value = bellAsString(i)+bellAsString(i+1);
    select.add(opt);
  }

  for(var i = 6; i <= 12; i += 2){
    var m = document.getElementById('method'+i);
    if(i == N) m.style.display = 'inline'; else m.style.display = 'none';
  }

  if(!stop){
    stop = true;
    bell();
  }
}

function pick_method(event){
  var N = document.getElementById('stage').value;
  var notat = document.getElementById('method'+N).value;
  console.log('Setting method to', notat, 'on', N);
  for(var i in bells) bells[i].destroy();
  bells = [];
  for(var i = 0; i < N; ++i) bells[i] = new Bell(i, N);
  row = Rounds(N);
  method = new Method(notat, N);

  var select = document.getElementById('firstrow');
  // Retain rounds, lose the rest
  select.options.length = 1;
  var start_row = Rounds(N);
  for(var k = 0; k < N*2; ++k){ // Max number of leads
    for(var i = 0; i < N*2; ++i) start_row = method.nextRow();
    // javascript is stupid and doesn't implement array equality
    if(start_row.toString() == Rounds(N).toString()) break;
    var opt = document.createElement('option');
    opt.text = rowAsString(start_row);
    opt.value = N*2*(k+1);
    select.add(opt);
  }

  method = new Method(notat, N);

  if(!stop){
    stop = true;
    bell();
  }
}

function pick_pair()
{
  var pair = document.getElementById('pair').value;
  console.log('Picked pair', pair);
}

function pick_first_row()
{
  var N = document.getElementById('firstrow').value;
  method.reset();
  for(var i = 0; i < N; ++i) row = method.nextRow();
  console.log('Picked first row, skip', N, 'changes to', rowAsString(row));
  if(N == 0) setAtHand();
  else setAtBack();
}
