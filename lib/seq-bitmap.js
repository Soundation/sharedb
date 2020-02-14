module.exports = SeqBitmap;

function SeqBitmap() {
  this.map = {};
}

/**
 * Get the lowest available sequence index for the provided id and mark it as in use.
 */
SeqBitmap.prototype.requestNext = function(id) {
  if (this.map[id] === undefined) {
    this.map[id] = [0];
  }

  var idx = 0;
  while (idx < this.map[id].length && this.map[id][idx] === -1) {
    idx++;
  }

  if (idx === this.map[id].length) {
    this.map[id].push(0);
  }

  var pos = 0;
  var mask = 0x80000000;
  while ((this.map[id][idx] & mask) !== 0) {
    mask = mask >>> 1;
    pos++;
  }

  this.map[id][idx] = this.map[id][idx] | mask;

  return idx * 32 + pos;
}

/**
 * Resign the sequence index for the provided id and mark it as not in use
 */
SeqBitmap.prototype.resign = function(id, seq) {
  if (this.map[id] == null) {
    return;
  }

  var idx = Math.floor(seq / 32);
  if(idx >= this.map[id].length) {
    return;
  }

  var pos = seq - (idx * 32);
  var mask = ~(0x1 << 31 - pos);
  this.map[id][idx] = this.map[id][idx] & mask;

  while (this.map[id].length > 0 && this.map[id][this.map[id].length - 1] === 0) {
    this.map[id].pop();
  }

  if(this.map[id].length === 0) {
    delete this.map[id];
  }
}
