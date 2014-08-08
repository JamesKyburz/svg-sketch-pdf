# svg-sketch-pdf

pdf creation for [svg-sketch](https://github.com/jameskyburz/svg-sketch)

using the awesome [pdfkit](https://github.com/devongovett/pdfkit) library

converts json from svg-sketch to pdf.

use with [browserify](http://browserify.org)

# example

run in node or browser!

``` js
var fs = require('fs');
var pdf = require('./')({size: [595.28, 841.89]});
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
`

# install

With [npm](https://npmjs.org) do:

```
npm install svg-sketch-pdf
```

# license

MIT
