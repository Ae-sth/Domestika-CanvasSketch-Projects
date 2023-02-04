const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const eases = require('eases')
const colormap = require('colormap');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const particles = []
const cursor = {
  x: Number.MAX_SAFE_INTEGER,
  y: Number.MAX_SAFE_INTEGER
}
const colors = colormap({
  colormap: 'viridis',
  nshades: 20
})
let elCanvas
const sketch = ({width, height, canvas}) => {

  let x, y
  let pos = []

  const numCircles = 15
  const gapCircle = 8
  const gapDot = 4
  let dotRadius = 12
  let circleRadius = 0
  const fitRadius = dotRadius
  elCanvas = canvas
  canvas.addEventListener('mousedown', onMouseDown)

  for(let i =0; i<numCircles; i++){

    const circumference = 2 * Math.PI * circleRadius
    const numFit = i? Math.floor(circumference / (fitRadius * 2 + gapDot)) :1
    const fitSlice = Math.PI * 2 / numFit
    for(let j= 0; j<numFit; j++){
     const theta = fitSlice * j
     
     x = Math.cos(theta) *circleRadius
     y = Math.sin(theta) *circleRadius

     x += width *0.5
     y += height *0.5

     radius = dotRadius

     particles.push(
      new Particle({x, y, radius})
     )

    }

    circleRadius += fitRadius*2 + gapCircle
    dotRadius = (1 - eases.quadInOut(i / numCircles)) * fitRadius
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    particles.sort((a, b)=> a.scale - b.scale)
    particles.forEach(particle => {
      particle.update()
      particle.draw(context)
    })
  };
};

canvasSketch(sketch, settings);

function onMouseDown(e){
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  onMouseMove(e)
}

function onMouseMove(e){
  const x = (e.offsetX/elCanvas.offsetWidth) * elCanvas.width
  const y = (e.offsetY/elCanvas.offsetHeight) * elCanvas.height

  cursor.x = x
  cursor.y = y

  console.log(cursor)

}

function onMouseUp(){
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)

  cursor.x = Number.MAX_SAFE_INTEGER
  cursor.y = Number.MAX_SAFE_INTEGER

}

class Particle {
  constructor({x, y, radius=10}){

    // position
    this.x = x
    this.y = y

    // accelration
    this.ax = 0
    this.ay = 0

    // velocity
    this.vx = 0
    this.vy = 0

    // initial position
    this.ix = x
    this.iy = y

    this.radius = radius
    this.scale = 1

    this.color = colors[0]

    this.minDist = random.range(100, 200)
    this.pushFactor = random.range(0.01, 0.02)
    this.pullFactor = random.range(0.002, 0.004)
    this.dampFactor = random.range(0.90,0.95)
  }

  update(){

    let dx, dy, dd, distDelta, idxColor


    // pull force
    dx = this.ix - this.x
    dy = this.iy - this.y
    dd = Math.sqrt(dx*dx+dy*dy)

    this.scale = math.mapRange(dd, 0, 200, 1, 5)
    this.color = colors[
      Math.floor(math.mapRange(dd, 0, 200, 1, colors.length - 1, true))
    ]

    this.ax = dx * this.pullFactor
    this.ay = dy * this.pullFactor

    // push force
    dx = this.x - cursor.x
    dy = this.y - cursor.y
    dd = Math.sqrt(dx*dx+dy*dy)

    distDelta = this.minDist - dd

    if(dd < this.minDist){
      this.ax += (dx/dd) * distDelta * this.pushFactor 
      this.ay += (dy/dd) * distDelta * this.pushFactor 
    }

    this.vx += this.ax
    this.vy += this.ay

    this.vx *= this.dampFactor
    this.vy *= this.dampFactor

    this.x += this.vx
    this.y += this.vy
  }

  draw(context){
    context.save()
    context.translate(this.x, this.y)
    context.fillStyle = this.color

    context.beginPath()
    context.arc(0, 0, this.radius*this.scale, 0, 2*Math.PI)
    context.fill()
    context.restore()
  }
}
