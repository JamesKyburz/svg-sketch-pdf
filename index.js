var through = require('through')
var Pdf = require('pdfkit')
var duplexer = require('duplexer')
var concat = require('concat-stream')
var rotate = require('./rotate-event-counter-clockwise')
var rgb2hex = require('rgb2hex')
var xtend = require('xtend')

module.exports = function (opt) {
  var doc
  var readable = through()
  var writable = through(create, done)
  var s = duplexer(writable, readable)

  var layout
  var restore = false
  var style
  var color

  function create (event) {
    if (event.forEach) return event.forEach(create)

    if (event.type === 'header') {
      layout = event.layout.type
      createPage(event)
    }

    if (layout === 'portrait') rotate(event, 1, opt.size[1])

    if (event.type === 'style') {
      style = xtend(event.args)
    }

    if (event.layout || event.type === 'style') {
      restore = true
      doc.save()
    }
    if (event.layout) {
      if (event.layout.font) {
        doc.font(event.layout.font.name)
        doc.fontSize(event.layout.font.size)
      }
      if (event.layout.rotate) {
        doc.rotate(event.layout.rotate.deg, {origin: [event.args.x, event.args.y]})
      }
    }

    if (event.args && event.args.stroke) {
      color = event.args.stroke === 'transparent'
        ? 'transparent'
        : rgb2hex(event.args.stroke).hex
    }

    if (style) applyStyles(style)

    if (color && color !== 'transparent') {
      strokeColor(color)
    }

    var f = doc[type(event)]
    if (f && args(event).length) {
      f.apply(doc, args(event))
      doc.stroke()
      if (restore) {
        doc.restore()
        restore = false
      }
    }
  }

  function type (event) {
    return event.type === 'rect' &&
    event.args.rx
      ? 'roundedRect'
      : event.type
  }

  function applyStyles (args) {
    dash(args)
    Object.keys(args).forEach(applyStyle.bind(null, args))
  }

  function applyStyle () {
    var argv = [].slice.call(arguments)
    var args = argv.shift()
    var type = argv.shift()
    if (doc[type]) {
      doc[type](args[type])
    }
  }

  function strokeColor (color) {
    doc.fillColor(color)
    doc.strokeColor(color)
  }

  function dash (style) {
    var strokeDashArray = (style['stroke-dasharray'] || '').split(',')
    if (strokeDashArray.length === 2) {
      doc.dash(+strokeDashArray[0], {space: +strokeDashArray[1]})
    } else {
      doc.undash()
    }
  }

  function args (event) {
    return Object.keys(event.args).map(value).concat(style())
    function value (key) {
      if (event.type === 'text' && key === 'y') {
        var yoffset = opt.yoffset ? opt.yoffset(event) : 0
        return event.args[key] - yoffset
      } else {
        return event.args[key]
      }
    }

    function style () {
      return (event.layout
        ? event.layout.style
        : undefined
      ) || []
    }
  }

  function createPage (event) {
    if (doc) {
      doc.addPage(page(event))
      return
    } else {
      doc = new Pdf(page(event))
    }

    if (opt.document) {
      opt.document(doc)
    }
  }

  function page (event) {
    return {
      layout: event.layout.type,
      margin: 0,
      compress: opt.compress,
      size: opt.size
    }
  }

  function done () {
    if (opt.base64) {
      doc.pipe(concat(function (data) {
        readable.emit('data', data.toString('base64'))
        readable.end()
      }))
    } else {
      doc.pipe(readable)
    }
    doc.end()
  }

  return s
}
