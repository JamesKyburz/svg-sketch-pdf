var through    = require('through');
var Pdf        = require('pdfkit');
var duplexer   = require('duplexer');
var concat     = require('concat-stream');
var rotate     = require('./rotate-event-counter-clockwise');
var rgb2hex    = require('rgb2hex');
var fs         = require('fs');

module.exports = function(opt) {
  var doc;
  var readable = through();
  var writable = through(process, done);
  var s = duplexer(writable, readable);

  var layout;
  var restore = false;
  var color;

  function process(event) {
    if (event.forEach) return event.forEach(process);
    if (event.type === 'header') {
      layout = event.layout.type;
      createPage(event);
    }

    if (layout === 'portrait') rotate(event, 1, opt.size[1]);

    if (event.layout || event.type === 'style') {
      process.restore = true;
      doc.save();
    }
    if (event.layout) {
      if (event.layout.font) {
        doc.font(event.layout.font.name);
        doc.fontSize(event.layout.font.size);
      }
      if (event.layout.rotate) {
        doc.rotate(event.layout.rotate.deg, {origin: [event.args.x, event.args.y]});
      }
    }

    if (event.args && event.args.stroke) {
      color = rgb2hex(event.args.stroke).hex;
    }

    if (event.type === 'style') {
      applyStyles(event.args);
    }

    if (color) {
      strokeColor(color);
    }

    var f = doc[type(event)];
    if (f && args(event).length) {
      f.apply(doc, args(event));
      doc.stroke();
      if (process.restore) {
        doc.restore();
        process.restore = false;
      }
    }
  }

  function type(event) {
    return event.type === 'rect' &&
           event.args.rx ?
           'roundedRect'
           :
          event.type
    ;
  }

  function applyStyles(style) {
    dash(style);
  }

  function strokeColor(color) {
    doc.fillColor(color);
    doc.strokeColor(color);
  }

  function dash(style) {
    var strokeDashArray = (style['stroke-dasharray'] || '').split(',');
    if (strokeDashArray.length === 2) {
      doc.dash(+strokeDashArray[0], {size: +strokeDashArray[1]});
    }
  }

  function args(event) {
    return Object.keys(event.args).map(value).concat(style());
    function value(key) {
      if (event.type === 'text' && key === 'y') {
        var yoffset = opt.yoffset ? opt.yoffset(event) : 0;
        return event.args[key] - yoffset;
      } else {
        return event.args[key];
      }
    }

    function style() {
      return (event.layout ?
        event.layout.style
        :
        undefined
      ) || [];
    }
  }

  function createPage(event) {
    if (doc) {
      doc.addPage(page(event));
      return;
    } else {
      doc = new Pdf(page(event));
    }

    if (opt.document) {
      opt.document(doc);
    }
  }

  function page(event) {
    return {
      layout: event.layout.type,
      margin: 0,
      compress: opt.compress,
      size: opt.size
    };
  }

  function done() {
    if (opt.base64) {
      doc.pipe(concat(function(data) {
        readable.emit('data', data.toString('base64'));
      }));
    } else {
      doc.pipe(readable);
    }
    doc.end();
  }

  return s;
};
