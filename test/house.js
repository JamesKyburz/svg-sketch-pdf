var test = require('tape')
var house = require('./house_eventstream.json')
var pdfBuilder = require('../')

test('single page house pdf', function (t) {
  var pdf = pdfBuilder({ size: [600, 600] })
  pdf.pipe(process.stdout)
  pdf.write(house)
  pdf.end()
  pdf.on('end', t.end.bind(t))
})
