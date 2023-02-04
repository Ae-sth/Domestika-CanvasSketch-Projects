const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const colormap = require('colormap')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const sketch = ({ width, height }) => {

  let rows = 8
  let cols = 72
  let numCells = rows * cols

  // grid info
  let gw = width * 0.8
  let gh = height * 0.8

  // cell info
  let cw = gw / cols
  let ch = gh / rows

  // margin info
  let mx = (width - gw) * 0.5
  let my = (height - gh) * 0.5

  const points = []

  let x, y, n, lineWidth, color

  let frequency = 0.002, amplitude = 90

  const colors = colormap({
    colormap: 'salinity',
    nshades: amplitude
  })

  for(let i=0; i<numCells; i++){
    x = (i % cols) * cw
    y = Math.floor(i / cols) * ch

    n = random.noise2D(x, y, frequency, amplitude)
    lineWidth = math.mapRange(n, -amplitude, amplitude, 0, 5)
    color = colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))]

    points.push(
      new Point({ x, y, lineWidth, color})
    )
  }

  return ({ context, width, height, frame }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    context.save()
    context.translate(mx, my)
    context.translate(cw * 0.5, ch * 0.5)

    // update points
    points.forEach(point=>{
      n = random.noise2D(point.ix+frame*2, point.iy, frequency, amplitude)
      point.x = point.ix + n
      point.y = point.iy + n
    })

    let lastx, lasty
    // lines
    for(let r = 0; r< rows; r++){
      for(let c =0; c< cols-1; c++){
        const currentPoint = points[r * cols + c]
        const nextPoint = points[r * cols + c + 1]

      const x = currentPoint.x + (nextPoint.x - currentPoint.x) * 0.5
      const y = currentPoint.y + (nextPoint.y - currentPoint.y) * 0.5

      if(!c) {
        lastx = currentPoint.x
        lasty = currentPoint.y
      }
      context.lineWidth = currentPoint.lineWidth
      context.strokeStyle = currentPoint.color
      context.beginPath()
        context.moveTo(lastx, lasty)
        context.quadraticCurveTo(currentPoint.x, currentPoint.y, x, y)
      context.stroke()

        lastx = x - c/cols * 250
        lasty = y - r/rows * 250
      }

    }
    context.restore()
  };
};

canvasSketch(sketch, settings);


class Point {
  constructor({x, y, lineWidth, color}){
    this.x = x
    this.y = y
    this.lineWidth = lineWidth
    this.color = color

    this.ix = x
    this.iy = y
  }


  draw(context){
    context.save()
    context.translate(this.x, this.y)
    context.fillStyle = this.color
    context.beginPath()
    context.arc(0, 0, 10, 0, 2*Math.PI)
    context.fill()
    context.restore()
  }

}
