/*
  MIT license
*/
'use strict';
module.exports.addTypes = addTypes;

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
}

function is(obj, req) {
  switch (typeof req) {
    // An arbitrary function to apply to obj
    case 'function':
      if (!req(obj)) throw (obj+' failed '+req)
      break;  

    case 'string':
      // user defined types
      if (userTypes[req]) {
        is(obj, userTypes[req]);
      }
      // default types
      else if (types[req]) {
        if (! types[req](obj)) {
          throw obj+' should be a ' + req;
        }
      }
      // arrays : "[type]"
      else if (req.charAt(0) === '[' && req.charAt(req.length-1) === ']') {
        if (req.length === 2) throw 'Empty type array, should be "[type]".';
        var typeName = req.slice(1, -1);
        var type = userTypes[typeName] || types[typeName];
        if (!type) throw 'Nonexistent type, '+typeName
        if (!Array.isArray(obj))
          throw obj+' should be an array.';
        if (obj.length === 0) {
          return;
        }
        for (var i = 0; i < obj.length; i++) {
          is(obj[i], type)
        }
      }
      // primitive types : [boolean, number, undefined, string, object]
      else if (typeof(obj) !== req)
        throw '"'+obj+'" should be a(n) '+req;
      break;

    case 'object':
      if (typeof obj !== 'object') throw obj+' should be an object';
      if (obj === null) return;
      // {} case
      for(var e in req) {
        if (!obj.hasOwnProperty(e)) throw obj+' does not contain field'+e +'for requirement'+req;
        is(obj[e], req[e]);
      }
      
      break;
      default:
        throw 'Not a valid requirement: '+ req + ' for ' + obj
    }
}

var userTypes = {};
function addTypes(obj) {
  userTypes = obj;
  return module.exports
}

module.exports = function(types) {
  addTypes( types || {} );
  return function(obj) {
    return {
      is: function(req){
        try {
          is(obj, req)
        } catch(e) {
          console.log(typeof (e));
          throw '{'+JSON.stringify(obj)+'} Fails to meet {'+JSON.stringify(req)+'}\n Because' + e
        }
        return true
      }
    }
  }
}
// function makeEnum () {
//   var args = arguments;
//   return (function (type) {
//     for (var i = 0; i < args.length; i++) {
//       return true;
//     }
//     return false;
//   });
// }
