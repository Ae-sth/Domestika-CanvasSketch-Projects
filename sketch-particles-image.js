const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const eases = require('eases')
const colormap = require('colormap');
const interpolate = require('color-interpolate')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let imgA, imgB
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

  const imgACanvas = document.createElement('canvas')
  const imgAContext = imgACanvas.getContext('2d')

  imgACanvas.width = imgA.width
  imgACanvas.height = imgA.height
  
  imgAContext.drawImage(imgA, 0, 0)

  const imgAData = imgAContext.getImageData(0, 0, imgACanvas.width, imgACanvas.height).data
  
  const imgBCanvas = document.createElement('canvas')
  const imgBContext = imgBCanvas.getContext('2d')

  imgBCanvas.width = imgB.width
  imgBCanvas.height = imgB.height
  
  imgBContext.drawImage(imgB, 0, 0)
  const imgBData = imgBContext.getImageData(0, 0, imgBCanvas.width, imgBCanvas.height).data

  let x, y

  const numCircles = 30
  const gapCircle = 5
  const gapDot = 5
  let dotRadius = 12
  let circleRadius = 0
  const fitRadius = dotRadius
  elCanvas = canvas
  canvas.addEventListener('mousedown', onMouseDown)

  let ix, iy, r, g, b, idx, colorA, colorB, colorMapped
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

     ix = Math.floor((x/width)*imgA.width)
     iy = Math.floor((y/height)*imgA.height)
     idx = (iy * imgA.width + ix) * 4


     r = imgAData[idx+0]
     g = imgAData[idx+1]
     b = imgAData[idx+2]

     colorA = `rgb(${r}, ${g}, ${b})`

    radius = math.mapRange(r, 0, 255, 1, 12)

     r = imgBData[idx+0]
     g = imgBData[idx+1]
     b = imgBData[idx+2]

     colorB = `rgb(${r}, ${g}, ${b})`

     colorMapped = interpolate([colorA, colorB])



     particles.push(
      new Particle({x, y, radius, color: colorMapped})
     )

    }

    circleRadius += fitRadius*2 + gapCircle
    dotRadius = (1 - eases.quadInOut(i / numCircles)) * fitRadius
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    // context.drawImage(imgACanvas, 0, 0 )
    particles.sort((a, b)=> a.scale - b.scale)
    particles.forEach(particle => {
      particle.update()
      particle.draw(context)
    })
  };
};


async function start(){
  imgA = await loadImage('assets/image-1.jpg')
  imgB = await loadImage('assets/image-2.jpg')
  canvasSketch(sketch, settings);
}

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
  constructor({x, y, radius=10, color}){


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

    this.colorMap = color
    this.color = this.colorMap(0)

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
    this.color = this.colorMap(math.mapRange(dd, 0, 200, 0, 1, true))

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

async function loadImage(url){
  return new Promise((resolve, reject)=>{
    const img = new Image()
    img.onload = ()=> resolve(img)
    img.onerror = ()=> reject()

    img.src = url
  })

}

start()