/*
  MIT license
*/
'use strict';

var types = {
  posInt: function(i) {
    return ((typeof i === 'number') && (i % 1 === 0) && (i >= 0));
  },
  int: function(i) {
    return ((typeof i === 'number') && (i % 1 === 0));
  },
  date: function(d) {
    return Object.prototype.toString.call(d) === '[object Date]';
  },
  array: function(a) {
    return Array.isArray(a);
  },
  null: function(e) {
    return e === null;
  },
  object: function(obj) {
    return typeof obj === 'object';
  },
  buffer: function(b) {
    return Buffer.isBuffer(b);
  }
};

function pretty(obj) {
  return JSON.stringify(obj, null, '  ');
}

var userTypes = {};
function addTypes(obj) {
  userTypes = obj;
  return module.exports;
}

function is(obj, req) {
  switch (typeof req) {
    // An arbitrary function to apply to obj
    case 'function':
      if (!req(obj)) throw (pretty(obj) + ' failed ' + req);
      break;

    case 'string':
      // optional types
      var optReq = req.charAt(req.length - 1) === '?' ?
        req.slice(0, -1) :
        undefined;
      // success if optional type and undefined value
      if (optReq) {
        if (obj === undefined) return;
        req = optReq;
      }
      // user defined types
      if (userTypes[req]) {
        is(obj, userTypes[req]);
      }
      // default types
      else if (types[req]) {
        if (! types[req](obj)) {
          throw pretty(obj)+' should be a ' + pretty(req);
        }
      }
      // arrays : "[type]"
      else if (req.charAt(0) === '[' && req.charAt(req.length-1) === ']') {
        if (req.length === 2) throw 'Empty type array, should be "[type]".';
        var typeName = req.slice(1, -1);
        var type = userTypes[typeName] || types[typeName];

        // optional type arrays
        var optTypeName;
        if (!type && typeName.charAt(typeName.length - 1) === '?') {
          optTypeName = typeName.slice(0, -1);
          type = userTypes[optTypeName] || types[optTypeName];
        }
        if (!type) throw 'Nonexistent type, '+typeName;
        if (!Array.isArray(obj)) {
          throw pretty(obj)+' should be an array of '+typeName;
        }
        if (obj.length === 0) {
          return;
        }
        for (var i = 0; i < obj.length; i++) {
          if (optTypeName && obj[i] === undefined) continue;
          is(obj[i], type);
        }
      }
      // primitive types : [boolean, number, undefined, string, object]
      else if (typeof(obj) !== req) {
        throw pretty(obj) + ' should be a(n) '+req;
      }
      break;

    case 'object':
      if (typeof obj !== 'object') throw pretty(obj)+' should be an object';
      if (obj === null) throw pretty(obj)+' is not of type '+pretty(req);
      // {} case
      for (var e in req) {
        if (!req.hasOwnProperty(e)) { continue; }
        if (!obj.hasOwnProperty(e) &&
            req[e].charAt(req[e].length - 1) !== '?') {
          throw pretty(obj)+' does not contain field '+e+
            ' for requirement '+pretty(req);
        }
        is(obj[e], req[e]);
      }

      break;
      default:
        throw 'Not a valid requirement: '+pretty(req) +' for '+ pretty(obj);
    }
}

module.exports = function(obj) {
  return {
    is: function(req){
      try {
        is(obj, req);
      } catch(e) {
        console.trace();
        throw '{'+pretty(obj)+'} Fails to meet {'+pretty(req)+'}\nBecause ' + e;
      }
      return true;
    }
  };
};

module.exports.prototype.addTypes = function(obj) {
  addTypes(obj);
};
module.exports.addTypes = addTypes;

