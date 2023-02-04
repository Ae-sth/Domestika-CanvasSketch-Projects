const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let points 
let canvasElement
const sketch = ({ canvas }) => {
  canvasElement = canvas
  points = [
    new Point(200, 580),
    new Point(400, 300, true),
    new Point(800, 580),
    new Point(600, 700, true),
    new Point(900, 600),
  ]

  canvas.addEventListener('mousedown', onMouseDown)
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.save()
    context.beginPath()
    context.moveTo(points[0].x, points[0].y)
    context.strokeStyle = '#999'
    for (let i = 1; i < points.length; i++){
      context.lineTo(points[i].x, points[i].y)
    }
    context.stroke() 
    context.restore()

    context.save()
    context.beginPath()
    context.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i+=2){
      context.quadraticCurveTo(points[i].x, points[i].y, points[i+1].x, points[i+1].y)
    }
    context.stroke() 
    context.restore()

    context.beginPath()

    // draw a smooth curve using quadratic curve
    for(let i=0; i < points.length-1; i++){
      const currentPoint = points[i]
      const nextPoint = points[i+1]

      const x = currentPoint.x + (nextPoint.x - currentPoint.x) / 2
      const y = currentPoint.y + (nextPoint.y - currentPoint.y) / 2


      // draws midpoints
/*       context.save()
      context.beginPath()
      context.arc(x, y, 5, 0, 2*Math.PI)
      context.fillStyle = 'blue'
      context.fill()
      context.restore() */

      // 
      if(i===0) 
        context.moveTo(currentPoint.x, currentPoint.y)
      else if(i===points.length-2) 
        context.quadraticCurveTo(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y)
      else 
        context.quadraticCurveTo(currentPoint.x, currentPoint.y, x, y)
    }

    context.lineWidth = 4
    context.strokeStyle = 'blue'
    context.stroke()


    points.forEach(point=>point.draw(context))
  };

};

function onMouseDown(event){
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  // very interesting way to protect click position from canvas scalling.
  const x = (event.offsetX / canvasElement.offsetWidth) * canvasElement.width
  const y = (event.offsetY / canvasElement.offsetHeight) * canvasElement.height

  //let hit = false 
  points.forEach(point=>{
    point.isDragged = point.hitTest(x, y)
    //if(!hit && point.isDragged) hit = true
  })

/*   if(!hit){
    points.push(new Point(x, y))
  } */

}

function onMouseMove(event){
  const x = (event.offsetX / canvasElement.offsetWidth) * canvasElement.width
  const y = (event.offsetY / canvasElement.offsetHeight) * canvasElement.height

  points.forEach(point=>{
    if(point.isDragged){
      point.x = x
      point.y = y
    }
  })

}

function onMouseUp(){
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)

}

class Point {
  constructor(x, y, control = false){
    this.x = x
    this.y = y
    this.control = control

    this._radius = 10
  }


  draw(context){
    context.save()
    context.translate(this.x, this.y)
    context.fillStyle = this.control? 'red': 'black'
    context.beginPath()
    context.arc(0, 0, this._radius, 0, 2*Math.PI)
    context.fill()
    context.restore()
  }

  hitTest(x, y){
    const dx = x - this.x
    const dy = y - this.y
    const dd = Math.sqrt(dx*dx+dy*dy)

    return dd < 20
  }
}
canvasSketch(sketch, settings);
