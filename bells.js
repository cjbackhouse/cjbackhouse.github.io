import Bell from "./bell.js";
import Method from "./method.js";

// Attach UI
document.getElementById('method6' ).addEventListener('change', pick_method);
document.getElementById('method8' ).addEventListener('change', pick_method);
document.getElementById('method10').addEventListener('change', pick_method);
document.getElementById('method12').addEventListener('change', pick_method);

document.getElementById('stage').addEventListener('change', pick_stage);
document.getElementById('pair').addEventListener('change', pick_pair);
document.getElementById('firstrow').addEventListener('change', pick_first_row);

document.getElementById('stop').addEventListener('click', stop);

function bellAsString(i){
  if(i == 9) return '0';
  if(i == 10) return 'E';
  if(i == 11) return 'T';
  return ''+(i+1);
}

function charAsBell(c){
    if(c == '0') return 9;
    if(c == 'E') return 10;
    if(c == 'T') return 11;
    return Math.floor(c)-1;
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

var method, bells = [], row, first = 0, hand, updown, bellNo, timer;

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

  // Update estimate of the desired speed
  if(hand && bellNo == 0) dnow /= 1.8; // undo handstroke gap
  if(dnow > 1.5*spacing) dnow = 1.5*spacing; // truncate outliers
  if(dnow > 0) spacing = 2./3*spacing + 1./3*dnow;

  if(spacing < 100) spacing = 150; // very fast, something went wrong?
  if(spacing > 600) spacing = 600; // very slow, something went wrong?

  // Update the peal time
  var mins = Math.floor((spacing/1000.*(bells.length+.8)*5040)/60.+.5);
  var hrs = Math.floor(mins/60);
  mins = Math.floor(mins-60*hrs);
  document.getElementById('peal_time').innerHTML = hrs+'h'+mins+'m';

  // Not the user's bell. We need to ring it
  if(row[bellNo] != first && row[bellNo] != first+1) bells[row[bellNo]].pull();

  bellNo += 1;
  bellNo %= bells.length;
  if(bellNo == 0){
    // New row
    hand = !hand;
    if(hand && updown) updown = false;
    if(!updown) row = method.nextRow();
    console.log(rowAsString(row));
  }

  // So long as it's not the user next
  if(row[bellNo] != first && row[bellNo] != first+1){
    var dt = spacing;
    // Handstroke gap
    if(bellNo == 0 && hand) dt *= 1.8;

    timer = window.setTimeout(bell, dt);
  }
}

var once = true;

function right()
{
  if(!once || first == 0) bells[first].pull();
  if(once){
    once = false;
    document.getElementById('stop').style.display = 'inline';
  }
  bell();
}

function left()
{
  // Allow using either hand to trigger the AI to pull off
  if(!once || first == 0) bells[first+1].pull();
  if(once){
    once = false;
    document.getElementById('stop').style.display = 'inline';
  }
  bell();
}

document.getElementById('left').addEventListener('click', left);
document.getElementById('right').addEventListener('click', right);
// Activate for touch screens
if('ontouchstart' in document.documentElement){
  document.getElementById('left').style.display = 'inline';
  document.getElementById('right').style.display = 'inline';
}

document.onkeydown = function(event){
  if(event.shiftKey || event.ctrlKey || event.altKey) return;
  if(event.key == 'j') right();
  if(event.key == 'f') left();
}

var stopping = false;

function stop(){
  if(stopping) return;
  stopping = true;

  if(timer){
    window.clearTimeout(timer);
    timer = undefined;
  }

  bellNo = 0;
  prevNow = -1;
  spacing = 300;
  document.getElementById('stop').style.display = 'none';
  once = true;

  stopping = false;
}

function pick_stage(){
  stop();

  var N = document.getElementById('stage').value;
  console.log('Picking', N, 'bells');

  while(bells.length > N){
    bells[0].destroy();
    bells.shift();
  }

  while(bells.length < N){
    bells.unshift(new Bell(N-bells.length-1, N, first));
  }

  for(var i = 0; i < N; ++i) bells[i].setPosition(i, N, first);

  row = Rounds(N);

  var select = document.getElementById('pair');

  while(select.options.length > N/2){
    // Stay on the tenors rather than flipping back to trebles
    if(select.selectedIndex == select.options.length-1) --select.selectedIndex;
    select.remove(select.options.length-1);
  }

  while(select.options.length < N/2){
    var n = select.options.length;
    var opt = document.createElement('option');
    opt.text = bellAsString(n*2)+'-'+bellAsString(n*2+1);
    opt.value = bellAsString(n*2)+bellAsString(n*2+1);
    select.add(opt);
  }

  for(var i = 6; i <= 12; i += 2){
    var m = document.getElementById('method'+i);
    if(i == N) m.style.display = 'inline'; else m.style.display = 'none';
  }

  pick_method(); // make sure method is appropriate
}

function pick_method(event){
  stop();

  var N = document.getElementById('stage').value;
  var notat = document.getElementById('method'+N).value;
  console.log('Setting method to', notat, 'on', N);
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

  pick_pair(); // make sure pair are within range
}

function pick_pair()
{
  stop();

  var pair = document.getElementById('pair').value;
  console.log('Picked pair', pair);

  var oldfirst = first;
  first = charAsBell(pair[0]);

  if(first != oldfirst){
    for(var i = 0; i < bells.length; ++i) bells[i].setPosition(i, bells.length, first);
  }

  pick_first_row();
}

function pick_first_row()
{
  stop();

  var N = document.getElementById('firstrow').value;
  method.reset();
  console.log('skip after reset', rowAsString(row));
  for(var i = 0; i < N; ++i) method.nextRow();
  row = method.curRow();
  console.log('Picked first row, skip', N, 'changes to', rowAsString(row));
  if(N == 0) setAtHand();
  else setAtBack();
}
