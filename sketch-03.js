const canvasSketch = require('canvas-sketch'),
 random = require('canvas-sketch-util/random'),
 math = require('canvas-sketch-util/math');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const sketch = ({ context, width, height }) => {

  const agents = []

  for(let i = 0; i < 40; i++){

    const x = random.range(0, width)
    const y = random.range(0, height)

    agents.push(new Agent(x, y))
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    for(let i = 0; i < agents.length; i++){
      const a = agents[i]

      for(let j = i; j < agents.length; j++){
        const b = agents[j]

        const distance = b.position.distanceTo(a.position)
        if(distance > 200) continue

        context.lineWidth = math.mapRange(distance, 0, 200, 12, 1) 
        
        context.beginPath()
        context.moveTo(a.position.x, a.position.y)
        context.lineTo(b.position.x, b.position.y)
        context.stroke()
        
      }
    }

    agents.forEach((agent)=>{
      agent.update()
      agent.draw(context)
      agent.bounce(width, height)
    })
  };
};

canvasSketch(sketch, settings);


class Point{
  constructor(x, y){
    this.x = x
    this.y = y
  }
  
  distanceTo(target){
    let dx = this.x - target.x
    let dy = this.y - target.y

    return Math.sqrt(dx**2+dy**2)
  }
}

class Vector extends Point {


}

class Agent{
  constructor(x, y, radius){
    this.position = new Point(x, y)
    this.velocity = new Vector(random.range(-1,1), random.range(-1,1))
    this.radius = random.range(4, 12)
  }

  update(){
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }

  bounce(width, height){
    if(this.position.x <=0 || this.position.x >= width) this.velocity.x *= -1
    if(this.position.y <=0 || this.position.y >= height) this.velocity.y *= -1
  }

  draw(context){

    context.save()
    context.translate(this.position.x, this.position.y)

    context.lineWidth = 4
    context.beginPath()
    context.arc(0, 0 , this.radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    context.restore()
  }
}