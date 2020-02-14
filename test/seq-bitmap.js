var expect = require('expect.js');
var SeqBitmap = require('../lib/seq-bitmap');

describe('SeqBitmap', function () {
  var sbm;

  beforeEach(function () {
    sbm = new SeqBitmap();
  });

  it('should return incrementing sequences', () => {
    for(var i = 0; i < 1024; i++) {
      var seq = sbm.requestNext('a');
      expect(seq).to.equal(i);
    }

    expect(sbm.map['a']).to.have.length(32);
  });

  it('should re-use resigned seq', () => {
    expect(sbm.requestNext('a')).to.equal(0);
    expect(sbm.requestNext('a')).to.equal(1);
    sbm.resign('a', 0);
    expect(sbm.requestNext('a')).to.equal(0);
    expect(sbm.requestNext('a')).to.equal(2);
    sbm.resign('a', 0);
    sbm.resign('a', 1);
    sbm.resign('a', 2);
    expect(sbm.requestNext('a')).to.equal(0);
    expect(sbm.requestNext('a')).to.equal(1);
    expect(sbm.requestNext('a')).to.equal(2);
    expect(sbm.requestNext('a')).to.equal(3);
  });

  it('should re-use resigned seq across ints', () => {
    for(var i = 0; i < 1024; i++) {
      var seq = sbm.requestNext('a');
      expect(seq).to.equal(i);
    }

    sbm.resign('a', 0);
    sbm.resign('a', 31);
    sbm.resign('a', 32);
    sbm.resign('a', 76);
    sbm.resign('a', 974);
    sbm.resign('a', 128);

    expect(sbm.requestNext('a')).to.equal(0);
    expect(sbm.requestNext('a')).to.equal(31);
    expect(sbm.requestNext('a')).to.equal(32);
    expect(sbm.requestNext('a')).to.equal(76);
    expect(sbm.requestNext('a')).to.equal(128);
    expect(sbm.requestNext('a')).to.equal(974);
    expect(sbm.requestNext('a')).to.equal(1024);
  });

  it('should keep sparse ints and re-use', () => {
    for(var i = 0; i < 1024; i++) {
      var seq = sbm.requestNext('a');
      expect(seq).to.equal(i);
    }

    for(var i = 32; i < 64; i++) {
      sbm.resign('a', i);
    }

    expect(sbm.map['a']).to.have.length(32);
    expect(sbm.map['a'][1]).to.equal(0);

    for(var i = 0; i < 32; i++) {
      var seq = sbm.requestNext('a');
      expect(seq).to.equal(i + 32);
    }

    expect(sbm.map['a'][1]).to.equal(-1);
  });

  it('should cleanup unused integers', () => {
    for(var i = 0; i < 1024; i++) {
      var seq = sbm.requestNext('a');
      expect(seq).to.equal(i);
    }

    expect(sbm.map['a']).to.have.length(32);

    for(var i = 32; i < 1024; i++) {
      sbm.resign('a', i);
    }

    expect(sbm.map['a']).to.have.length(1);
  });

  it('should cleanup unused entries', () => {
    for(var i = 0; i < 1024; i++) {
      var seq = sbm.requestNext('a');
      expect(seq).to.equal(i);
    }

    expect(sbm.map['a']).to.have.length(32);

    for(var i = 0; i < 1024; i++) {
      sbm.resign('a', i);
    }

    expect(sbm.map['a']).to.equal(undefined);
    expect(Object.keys(sbm.map).length).to.equal(0);
  });
});
