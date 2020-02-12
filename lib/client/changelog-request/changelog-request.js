var Changelog = require('../../changelog');
var emitter = require('../../emitter');

module.exports = ChangelogRequest;

function ChangelogRequest(connection, requestId, collection, id, options, callback) {
  emitter.EventEmitter.call(this);

  if (typeof callback !== 'function') {
    throw new Error('Callback is required for ChangelogRequest');
  }

  this.requestId = requestId;
  this.connection = connection;
  this.id = id;
  this.collection = collection;
  this.options = options;
  this.callback = callback;

  this.sent = false;
}
emitter.mixin(ChangelogRequest);

ChangelogRequest.prototype.send = function () {
  if (!this.connection.canSend) {
    return;
  }

  this.connection.send(this._message());
  this.sent = true;
};

ChangelogRequest.prototype._onConnectionStateChanged = function () {
  if (this.connection.canSend) {
    if (!this.sent) this.send();
  } else {
    // If the connection can't send, then we've had a disconnection, and even if we've already sent
    // the request previously, we need to re-send it over this reconnected client, so reset the
    // sent flag to false.
    this.sent = false;
  }
};

ChangelogRequest.prototype._handleResponse = function (error, message) {
  this.emit('ready');

  if (error) {
    return this.callback(error);
  }

  var changelog = new Changelog(this.id, message.data);

  this.callback(null, changelog);
};

ChangelogRequest.prototype._message = function () {
  return {
    a: 'nc',
    id: this.requestId,
    c: this.collection,
    d: this.id,
    o: this.options,
  };
};
