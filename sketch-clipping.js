const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const sketch = () => {

  const size = 540
  const unit = size /4
  const margin = 40

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    // first
    context.save()
    context.translate( width/2, height/2)

    context.beginPath()
    context.moveTo(-2*unit, -2*unit)
    context.lineTo(-2*unit, +1*unit)
    context.lineTo(+1*unit, +1*unit)
    context.lineTo(+1*unit, -2*unit)
    context.closePath()
    context.clip()

    context.beginPath()
    context.arc(0,0,3*unit,0, 2*Math.PI)
    context.fillStyle = "white"
    context.fill()
    context.restore()

    // second
    context.save()
    context.translate( width/2, height/2)
    context.beginPath()
    context.moveTo(-1*unit, -1*unit)
    context.lineTo(-1*unit, 2*unit)
    context.arcTo(2*unit, 2*unit,2*unit, -1*unit, 3/4*size)
    context.lineTo(2*unit, -1*unit)
    context.closePath()
    context.clip()

    context.beginPath()
    context.arc(0,0,4*unit,0, 2*Math.PI)
    context.fillStyle = "blue"
    context.fill()
    context.restore()

    // third
    context.save()
    context.translate( width/2, height/2)

    context.beginPath()
    context.arc(-3*unit/2, 3*unit/2, unit/2, 0, 2*Math.PI)
    context.clip()

    context.beginPath()
    context.arc(-2*unit, 3*unit/2,4*unit,0, 2*Math.PI)
    context.fillStyle = "red"
    context.fill()
    context.restore()

    // fourth
    context.save()
    context.translate( width/2, height/2)

    context.beginPath()
    context.moveTo(1*unit+margin, 2*unit)
    context.lineTo(2*unit-margin, 2*unit)
    context.lineTo(2*unit-margin, -2*unit)
    context.lineTo(1*unit+margin, -2*unit)
    context.closePath()
    context.clip()

    context.beginPath()
    context.arc(0, 0, size,0, 2*Math.PI)
    context.fillStyle = "green"
    context.fill()
    context.restore()
    
  };
};

canvasSketch(sketch, settings);
