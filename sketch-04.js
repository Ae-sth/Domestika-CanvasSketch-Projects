const canvasSketch = require('canvas-sketch'),
  random = require('canvas-sketch-util/random'),
  math = require('canvas-sketch-util/math');

const Tweakpane = require('tweakpane');

const params = {
  cols: 10,
  rows: 10, 
  scale : 30,
  frequency : 0.001,
  amplitude : 0.2,
  animate : true,
  frame: 1,
  lineCap : "butt"
}

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: params.animate
};

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const cols = params.cols
    const rows = params.rows
    const numCells = cols * rows

    const gridw = width * 0.8
    const gridh = height * 0.8 


    const cellw = gridw / cols
    const cellh = gridh / rows

    const marginx = (width - gridw)*0.5
    const marginy = (height - gridh)*0.5

    for(let i = 0; i < numCells; i++){
      const col = i % cols
      const row = Math.floor(i/cols)

      const x = col * cellw
      const y = row * cellh

      const w = cellw*0.8
      const h = cellh*0.8

      const f = params.animate? frame : params.frame

      const n = random.noise3D(x,y, f*10, params.frequency, params.amplitude)
      const angle = n * Math.PI * 0.2
      const scale = math.mapRange(n,-1,+1,0,1) * params.scale

      context.save()
      
      context.translate(x, y)
      context.translate(marginx, marginy)
      context.translate(cellw*0.5, cellh*0.5)

      context.rotate(angle)

      context.lineWidth = scale
      context.lineCap = params.lineCap

      context.beginPath()
      context.moveTo(w*-0.5,0)
      context.lineTo(w*0.5, 0)
      context.stroke()
      

      context.restore()
    }


  };
};

function createPane(){
  const pane = new Tweakpane.Pane()
  let folder

  folder  = pane.addFolder({
    title: "Grid"
  })
  folder.addInput(params, "lineCap", {options:{
    butt: "butt",
    round: "round",
    square: "square"
  }})
  folder.addInput(params, "cols", {min: 2, max: 50, step: 1})
  folder.addInput(params, "rows", {min: 2, max: 50, step: 1})
  folder.addInput(params, "scale", {min: 20, max: 50})
  folder.addInput(params, "animate")

  folder  = pane.addFolder({
    title: "Noise"
  })
  
  folder.addInput(params, "frequency", {min: -0.01, max: 0.01})
  folder.addInput(params, "amplitude", {min: 0, max: 1})
  folder.addInput(params, "frame", {min: 1, max: 9999})
}

createPane()
canvasSketch(sketch, settings);
