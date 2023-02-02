const canvasSketch = require('canvas-sketch')
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const color = require('canvas-sketch-util/color')
const risoColors = require("riso-colors");

const seed = Date.now()
const settings = {
  dimensions: [ 1080, 1080 ],
  animate: false,
  name: seed
};

const sketch = ({ context, width, height }) => {
  random.setSeed(seed)
  // background
  let bgColor = 
    random.pick(risoColors).hex

  // container of shapes
  let rects = []

  // shape properties
  let x, y, w, h, stroke, fill
  let num = 40
  let degrees = -30
  let rectColors = [
    random.pick(risoColors).hex,
    random.pick(risoColors).hex
  ]
  let shadowColor
  let blend

  for (let i=1; i<= num; i++){

    x = random.range(0, width)
    y = random.range(0, height)
    w = random.range(600, width)
    h = random.range(20, 400)
    stroke = random.pick(rectColors)
    fill = random.pick(rectColors)


    blend =  random.value() > 0.5? 'overlay': 'source-over'

    rects.push({
      x, y, w, h, stroke, fill, blend
    })

  }

  return ({ context, width, height }) => {
    context.fillStyle = bgColor
    context.fillRect(0, 0, width, height);

    context.save()
    context.translate(width*0.5, height*0.5)
    
    drawPolygon({
      context,
      radius: 400,
    })
    context.restore()

    context.save()
    context.clip()


    rects.forEach((rect)=>{
      const {x ,y ,w ,h ,stroke, fill, blend} = rect

      context.save()

      context.globalCompositeOperation = blend
      context.translate(x, y)
      context.strokeStyle = stroke
      context.fillStyle = fill
      context.lineWidth = 10
      drawSkewedRectangle({
        context,
        w, h, degrees
      })

      shadowColor = color.offsetHSL(fill, 0, 0, -20)
      shadowColor.rgba[3] = 0.5

      context.shadowColor = color.style(shadowColor.rgba)
      context.shadowOffsetX = -10
      context.shadowOffsetY = 20
      context.fill()
      
      context.shadowColor = null
      context.stroke()

      context.globalCompositeOperation = 'source-over'

      context.lineWidth = 2
      context.strokeStyle = 'black'
      context.stroke()
      context.restore()

    })

    context.restore()

   context.save()
    context.translate(width*0.5, height*0.5)
    context.lineWidth = 20

    drawPolygon({
      context,
      radius: 400 - context.lineWidth,
    })

    context.globalCompositeOperation = 'color-burn'
    context.strokeStyle = rectColors[0]
    context.stroke()
    context.restore() 

  }

};

function drawSkewedRectangle({context, w=600, h=200, degrees=-45}){
    const angle = math.degToRad(degrees)

    const rx = w * Math.cos(angle)
    const ry = w * Math.sin(angle)

    context.save()
    context.translate(-rx*0.5, -(ry+h)*0.5)

    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(rx, ry)
    context.lineTo(rx, ry+h)
    context.lineTo(0, h)
    context.closePath()
    context.stroke()
    context.restore()

}

function drawPolygon({context, radius=100, sides=3}){
  let angle = Math.PI * 2 / sides
  context.beginPath()
  context.moveTo(0, -radius)
  for(let i = 1; i<= sides; i++){
    const theta = i * angle - Math.PI * 0.5
    const x = radius * Math.cos(theta)
    const y = radius * Math.sin(theta)
    context.lineTo(x, y)
  }
    context.closePath()
}

canvasSketch(sketch, settings);
