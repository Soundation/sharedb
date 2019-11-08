
exports.defaultType = require('ot-json0').type;

// SND: START Support static presence and undo/redo in ot-json0
exports.defaultType.isNoop = function(operation) { return operation.length === 0; }
exports.defaultType.createPresence = function(presence) { return presence; }
exports.defaultType.transformPresence = function(presence) { return presence; }
// SND: END Support static presence and undo/redo in ot-json0

exports.map = {};

exports.register = function(type) {
  if (type.name) exports.map[type.name] = type;
  if (type.uri) exports.map[type.uri] = type;
};

exports.register(exports.defaultType);
