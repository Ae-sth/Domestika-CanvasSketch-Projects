const canvasSketch = require('canvas-sketch')
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const eases = require('eases')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let audio
let audioContext, audioData, sourceNode, analyzerNode
let manager
let minDb, maxDb
const sketch = () => {


  const numCircles = 5
  const numSlices = 9
  const slice = Math.PI*2 / numSlices
  const radius = 200
  let bins = []
  let bin, mapped 
  for(let i=0; i<numCircles*numSlices; i++){
    bin = random.rangeFloor(4,64)
    if(random.value()>0.5) bin = 0
    bins.push(bin)
  }

  const lineWidths = []
  let lineWidth
  for(let i=0; i<numCircles; i++){
    const t = i / (numCircles - 1)
    lineWidth = eases.quadIn(t) * 200 + 20
    lineWidths.push(lineWidth)
  }


  
  return ({ context, width, height }) => {



    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    if(!audioContext) return

    analyzerNode.getFloatFrequencyData(audioData)
    context.save()
    context.translate(width*.5, height*.5)

    let cradius = radius

    for (let i = 0; i<numCircles; i++){
      context.save()
      for(let j = 0; j<numSlices; j++){
        context.rotate(slice)
        context.lineWidth = lineWidths[i]

        bin  = bins[i * numSlices + j]
        if(!bin) continue
        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true)

        lineWidth = lineWidths[i] * mapped
        if(lineWidth<1) continue

        context.lineWidth = lineWidth

        context.beginPath()
        context.arc(0,0, cradius+ context.lineWidth*0.5 , 0, slice)
        context.stroke()
      }
      cradius += lineWidths[i]
      context.restore()
    }
    context.restore()
  };
};

function createAudio(){
  audio = document.createElement('audio')
  // audio.src = 'assets/Jujutsu Kaisen  Nanami Kentos Theme HQ Full Cover.mp3'
  audio.src = 'assets/POL-the-funky-meister-short.wav'
  
  audioContext = new AudioContext()
  sourceNode = audioContext.createMediaElementSource(audio)
  sourceNode.connect(audioContext.destination)

  analyzerNode = audioContext.createAnalyser()
  analyzerNode.smoothingTimeConstant = 0.9
  analyzerNode.fftSize = 512
  sourceNode.connect(analyzerNode)

  minDb = analyzerNode.minDecibels
  maxDb = analyzerNode.maxDecibels
  audioData = new Float32Array(analyzerNode.frequencyBinCount)
}

function addListerners (){
  window.addEventListener('mouseup', ()=>{
    if(!audioContext) createAudio()
    if(audio.paused) {
      audio.play()
      manager.play()
    }
    else {
      audio.pause()
      manager.pause()
    }
  })
}

async function start (){
  addListerners()
  manager = await canvasSketch(sketch, settings);
  manager.pause()
}

start()