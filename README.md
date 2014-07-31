easy-types
==========
Easy type checking for node.js.

## Installation
  npm install easy-types


## Usage

``` js

var types = { 
  myCrazyObject: {
    // Primitive type checking.
    a: 'string',
    b: 'number',
    c: 'boolean',
    d: 'function',
    e: 'object',
    // Defined types
    f: 'int',
    g: 'null',
    h: 'buffer',
    i: 'date',
    // Functions
    j: function(e){ return e === 42 },
    // Arrays 
    k: '[int]',
    // User defined types
    l: 'otherObj',
    // Arrays of user defined types 
    n: '[otherObj]'
  },

  otherObj : {
    a : 'int',
    b : 'otherObj'
  },
}
var check = require('./easy-types.js')(types);

var toCheck = {
  a: 'domo arigato',
  b: 3.14159,
  c: false,
  d: function(){},
  e: {},
  f: 42,
  g: null,
  h: new Buffer(1),
  i: new Date(),
  j: 42,
  k: [1,2,3,4],
  l: {a:1, b: {a:1, b:null}},
  n: [{a:1, b: null}, {a:1, b: null}]
}

try {
  check(toCheck).is('myCrazyObject')
  check({a:232, b: '2'}).is({a:'string', b:'string'})
  console.log('verified');
  // Your awesome code here.
} catch (e) {
  console.log(e);
}


```
