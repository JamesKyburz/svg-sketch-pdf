module.exports = rotate;

var offset;

function rotate(event, scale, height) {
  offset = height * (scale || 1);
  if (event.args) {
    translateText(event);
    translateEllipse(event);
    swapXY(event);
    translateDimensions(event);
    translatePath(event);
  }
}

function translateText(event) {
  if (event.type === 'text') {
    event.layout = event.layout || {};
    event.layout.rotate = event.layout.rotate || {};
    event.layout.rotate.deg = event.layout.rotate.deg || 0;
    event.layout.rotate.deg -= 90;
  } else if (event.layout && event.layout.rotate) {
    event.layout.rotate.deg -= 90;
  }
}

function swapXY(event) {
  var tmp;
  if ('undefined' !== typeof event.args.x) {
    tmp = event.args.x;
    event.args.x = event.args.y;
    event.args.y = offset - tmp;
  }
}

function translateEllipse(event) {
  var tmp;
  if (event.type === 'ellipse') {
    tmp = event.args.cx;
    event.args.cx = event.args.cy;
    event.args.cy = offset - tmp;
    tmp = event.args.rx;
    event.args.rx = event.args.ry;
    event.args.ry = tmp;
  }
}

function translateDimensions(event) {
  var tmp;
  if (event.args.height) {
    tmp = event.args.width;
    event.args.width = event.args.height;
    event.args.height = tmp;
    event.args.y -= tmp;
  }
}

function translatePath(event) {
  var points;
  if (event.args.d) {
      points = event.args.d.match(/\d+\.?\d*/g).map(Number);
      var d =
        'M ' +
        points[1] +
        ',' +
        (offset - points[0]) +
        ' '
      ;
      points.splice(0, 2);

      var x, y;

      while((x = points.shift()) !== undefined) {
        y = points.shift();
        d += '' +
          'L ' +
          y +
          ',' +
          (offset - x)
        ;
      }

      event.args.d = d;
  }
}
