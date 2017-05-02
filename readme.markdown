# svg-sketch-pdf

[![Greenkeeper badge](https://badges.greenkeeper.io/JamesKyburz/svg-sketch-pdf.svg)](https://greenkeeper.io/)

pdf creation for [svg-sketch](https://github.com/jameskyburz/svg-sketch)

using the awesome [pdfkit](https://github.com/devongovett/pdfkit) library

converts json from svg-sketch to pdf.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

[![build status](https://api.travis-ci.org/JamesKyburz/svg-sketch-pdf.svg)](http://travis-ci.org/JamesKyburz/svg-sketch-pdf)

Try it out! [![view on requirebin](http://requirebin.com/badge.png)](http://requirebin.com/embed?gist=b4bd7115e66f79e0a841)

use with [browserify](http://browserify.org)

# example

run in node or browser!

``` js
var fs = require('fs');
var pdf = require('./')({size: [595.28, 841.89], base64: typeof window !== 'undefined'});
var concat = require('concat-stream');
pdf.pipe(concat(write));
pdf.write([
  {
    type: 'header',
    layout: {
      type: 'landscape'
    }
  },
  {
    type: 'text',
    args: {
      value: 'I love svg',
      x: 100,
      y: 100
    }
  },
  {
    type: 'path',
    args: {
      d: 'M 100,114 L 200,114'
    }
  }
]);

pdf.end();

function write(data) {
  if ('undefined' === typeof window) {
    fs.writeFileSync('output.pdf', data, {encoding: 'base64'});
  } else {
    window.location.href = 'data:application/pdf;base64,' + data;
  }
}
```

`opt.size` is [width, height]

`opt.document` optional `function document(pdfkitDoc) { }`

`opt.yoffset` optional `function yoffset(event) {}`

`opt.compress` optional compress pdf (default false)

# install

With [npm](https://npmjs.org) do:

```
npm install svg-sketch-pdf
```

# license

MIT
