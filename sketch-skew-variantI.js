
const canvasSketch = require('canvas-sketch')
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const color = require('canvas-sketch-util/color')
const risoColors = require("riso-colors");

const seed = Date.now()
const settings = {
  dimensions: [ 1080, 1080 ],
  animate: false,
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



  const size = 540
  const unit = size /4
  const margin = 40

  return ({ context, width, height }) => {
    context.fillStyle = bgColor
    context.fillRect(0, 0, width, height);

    function drawFirst(){
      context.translate( width/2, height/2)
      context.beginPath()
      context.moveTo(-2*unit, -2*unit)
      context.lineTo(-2*unit, +1*unit)
      context.lineTo(+1*unit, +1*unit)
      context.lineTo(+1*unit, -2*unit)
      context.closePath()
    }

    function drawSecond(){
      context.translate( width/2, height/2)
      context.beginPath()
      context.moveTo(-1*unit, -1*unit)
      context.lineTo(-1*unit, 2*unit)
      context.arcTo(2*unit, 2*unit,2*unit, -1*unit, 3/4*size)
      context.lineTo(2*unit, -1*unit)
      context.closePath()
    }

    function drawThird(){
      context.translate( width/2, height/2)
      context.beginPath()
      context.arc(-3*unit/2, 3*unit/2, unit/2, 0, 2*Math.PI)
    }

    function drawFourth(){
      context.translate( width/2, height/2)
      context.beginPath()
      context.moveTo(1*unit+margin, 2*unit)
      context.lineTo(2*unit-margin, 2*unit)
      context.lineTo(2*unit-margin, -2*unit)
      context.lineTo(1*unit+margin, -2*unit)
      context.closePath()
    }

    function buildShape(shape){
      context.save()
      shape()
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
      context.lineWidth = 20
      context.globalCompositeOperation = 'color-burn'
      context.strokeStyle = rectColors[0]
      shape()
      context.stroke()

      context.restore()
    }

    for(const shape of [drawFirst, drawSecond, drawThird, drawFourth]){

      rectColors = [
        random.pick(risoColors).hex,
        random.pick(risoColors).hex
      ]

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

      buildShape(shape)
    }

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



canvasSketch(sketch, settings);

