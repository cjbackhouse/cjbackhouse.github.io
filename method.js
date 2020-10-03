function Rounds(N){
  var ret = [];
  for(var i = 0; i < N; ++i) ret.push(i);
  return ret;
}

export default class Method
{
  constructor(notat, N){
    this.notat = [[]];
    for(var i = 0; i < notat.length; ++i){
      if(notat[i] == 'x'){
        if(this.notat[this.notat.length-1].length > 0) this.notat.push([]);
        this.notat.push([]); // cross = none fixed + new row
      }
      else if(notat[i] == '.'){
        this.notat.push([]); // start a new row
      }
      else{
        this.notat[this.notat.length-1] += this.charToPlace(notat[i]);
      }
    }
    if(this.notat[this.notat.length-1].length == 0 && notat[notat.length-1] != 'x') this.notat.pop();

    this.rowNo = 0;
    this.currow = Rounds(N);
  }

  swapPair(i){
    var k = this.currow[i];
    this.currow[i] = this.currow[i+1];
    this.currow[i+1] = k;
  }

  charToPlace(c){
    if(c == '0') return 9;
    if(c == 'E') return 10;
    if(c == 'T') return 11;
    return Math.floor(c)-1;
   }

  reset(){
    console.log('reset!');
    this.currow = Rounds(this.currow.length);
    console.log(this.currow);
  }

  nextRow(){
    var prev = -1;
    for(var i = 0; i < this.notat[this.rowNo].length; ++i){
      for(var j = prev+1; j+1 < this.notat[this.rowNo][i]; j += 2) this.swapPair(j);
      prev = Math.floor(this.notat[this.rowNo][i]);
    }
    for(var j = prev+1; j+1 < this.currow.length; j += 2) this.swapPair(j);

    ++this.rowNo;
    this.rowNo %= this.notat.length;

    return this.currow;
  }
}
