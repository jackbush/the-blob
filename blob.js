import p5 from "p5";

const CONTAINER_ID = "jsSketchContainer";

const config = {
  frameRate: 60,
  layers: 5,
  // Decimal value between 0 and 1
  // NOTE other stuff breaks when this isn't 0.1
  spread: 0.1,
  // Arbitrary constants...
  speed: 20,
  acceleration: 100,

  // colours
  blobHex: "#53C1F0",
  // float: 0 = transparent, 255 = opaque
  opacity: 40,
  backgroundColour: "#171A26",
};

// Convert speed to be framerate-independent, negated to match usage convention
config.speed = -(config.speed / config.frameRate);

const sketch = function (p) {
  let container;
  let blob;
  let blobColour;

  p.setup = function () {
    p.frameRate(config.frameRate);

    const el = document.getElementById(CONTAINER_ID);
    container = { width: el.clientWidth, height: el.clientHeight };
    const canvas = p.createCanvas(container.width, container.height);
    canvas.parent(CONTAINER_ID);

    const base = p.color(config.blobHex);
    blobColour = p.color(p.red(base), p.green(base), p.blue(base), config.opacity);

    blob = new Cluster(p.createVector(container.width * 0.5, container.height * 0.5));
    blob.add(config.layers);

    p.fill(blobColour);
    p.noStroke();
  };

  p.windowResized = p.setup;

  p.draw = function () {
    p.background(config.backgroundColour);
    blob.update();
    blob.display();
  };

  // A Cluster is a collection of Blobs sharing a center.
  class Cluster {
    constructor(position) {
      this.blobs = [];
      this.center = p.createVector(position.x, position.y);
    }

    add(numberOfLayers = 1) {
      for (let i = 0; i < numberOfLayers; i++) {
        this.blobs.push(new Blob(this.center));
      }
    }

    update() {
      this.blobs.forEach((blob) => blob.update());
    }

    display() {
      this.blobs.forEach((blob) => blob.display());
    }
  }

  // A Blob is an irregular, undulating shape
  class Blob {
    constructor(position) {
      this.position = p.createVector(position.x, position.y);
      // Hard-coded because the coordinate system only works for five!
      this.points = Array.from({ length: 5 }, (_, i) => new Point(i));
      // Loops around three points at each end for a smooth join
      this.drawCycle = [1, 4, 2, 0, 3, 1, 4, 2, 0, 3, 1];
    }

    update() {
      this.points.forEach((point) => point.update());
    }

    display() {
      p.beginShape();
      this.drawCycle.forEach((n) => {
        p.curveVertex(
          this.position.x + this.points[n].position.x,
          this.position.y + this.points[n].position.y,
        );
      });
      p.endShape(p.CLOSE);
    }
  }

  class Point {
    constructor(vertex) {
      // Vertex is an index, going clockwise from 12 o'clock
      this.vertex = vertex;

      const jitter = (n, factor = 0.1) => n + n * factor * (Math.random() * 2 - 1);
      this.radius = jitter(Math.min(container.width, container.height) * 0.35, 0.25);
      this.initialRadius = this.radius;
      this.minRadius = this.radius * (1 - config.spread);
      this.maxRadius = this.radius * (1 + config.spread);

      this.isGrowing = Math.random() < 0.5;
      this.position = this.getCoordinates(vertex, this.radius);
    }

    update() {
      // Nudge direction if radius is at limits (avoids getting stuck)
      if (this.radius >= this.maxRadius * 0.99) this.isGrowing = false;
      if (this.radius <= this.minRadius * 1.01) this.isGrowing = true;

      const position = this.radius / this.initialRadius - 1;
      let delta =
        config.acceleration * config.speed * Math.pow(position, 2) - config.speed;

      if (!this.isGrowing) delta *= -1;

      this.radius += delta;
      this.position = this.getCoordinates(this.vertex, this.radius);
    }

    getCoordinates(vertex, radius) {
      // Five-point blob — only three cases due to symmetry; vertices 3 & 4 mirror x
      const xSign = vertex === 3 || vertex === 4 ? -1 : 1;
      switch (vertex) {
        case 0:
          return { x: 0, y: -radius };
        case 1:
        case 4:
          return { x: xSign * radius * p.cos(18), y: -radius * p.sin(18) };
        case 2:
        case 3:
          return { x: xSign * radius * p.cos(54), y: radius * p.sin(54) };
        default:
          return { x: 0, y: 0 };
      }
    }
  }
};

new p5(sketch, CONTAINER_ID);
