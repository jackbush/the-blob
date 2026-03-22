const p5 = require("p5");

import { coreColour, semanticColour } from "./_tokens";
import { measureContainer, jitter, getRgbFromHex } from "./_utils";

const blobSketchLoader = (containerId) => {
  const sketch = function (p) {
    let container;
    let canvas;
    let blob;
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
      blobHex: coreColour.lightBlue,
      // float: 0 = transparent, 255 = opaque
      opacity: 40,
      backgroundColour: semanticColour.background,
    };

    // Convert speed to be independent of framerate (defaults to 60)
    config.speed /= config.frameRate;
    // Correct speed for how we actually use it -- otherwise things get really counterintuitive
    config.speed *= -1;
    // make a colour object from hex + opacity
    config.blobColour = p.color(
      getRgbFromHex(config.blobHex, "r"),
      getRgbFromHex(config.blobHex, "g"),
      getRgbFromHex(config.blobHex, "b"),
      config.opacity,
    );

    p.setup = function () {
      // Set framerate
      p.frameRate(config.frameRate);

      // Get container details
      container = measureContainer(containerId);

      // Create a canvas from container size
      canvas = p.createCanvas(container.width, container.height);

      // Attach canvas to container
      canvas.parent(containerId);

      // Get position for brand device, create and add blobs
      const position = p.createVector(
        container.width * 0.5,
        container.height * 0.5,
      );
      blob = new Cluster(position);
      blob.add(config.layers);

      // Set p5's fill and stroke here, as they don't change
      p.fill(config.blobColour);
      p.noStroke();
    };

    // Set to re-start on window resize
    p.windowResized = p.setup;

    p.draw = function () {
      p.background(config.backgroundColour);
      blob.update();
      blob.display();
    };

    // A Cluster is a collection of Blobs, which share a center.
    function Cluster(position) {
      this.blobs = [];
      this.center = p.createVector(position.x, position.y);
    }

    Cluster.prototype.add = function (numberOfLayers) {
      numberOfLayers = numberOfLayers || 1;
      for (let i = 0; i < numberOfLayers; i++) {
        this.blobs.push(new Blob(this.center));
      }
    };

    Cluster.prototype.update = function () {
      this.blobs.forEach(function (blob) {
        blob.update();
      });
    };

    Cluster.prototype.display = function () {
      this.blobs.forEach(function (blob) {
        blob.display();
      });
    };

    // A Blob is an irregular, undulating shape
    function Blob(position) {
      this.position = p.createVector(position.x, position.y);

      // Hard-coded because the coordinate system only works for five!
      this.points = [
        new Point(0),
        new Point(1),
        new Point(2),
        new Point(3),
        new Point(4),
      ];

      // This is the order we must draw points to create the blob:
      // [0, 3, 1, 4, 2]

      // This loops around three points further at each end, for a smooth join
      this.drawCycle = [1, 4, 2, 0, 3, 1, 4, 2, 0, 3, 1];
    }

    Blob.prototype.update = function () {
      this.points.forEach(function (point) {
        point.update();
      });
    };

    Blob.prototype.display = function () {
      p.beginShape();

      const that = this;
      this.drawCycle.forEach(function (n) {
        p.curveVertex(
          that.position.x + that.points[n].position.x,
          that.position.y + that.points[n].position.y,
        );
      });

      p.endShape(p.CLOSE);
    };

    function Point(vertex) {
      // Vertex is an index, going clockwise from 12 o'clock
      // This is used by the getCoordinates function
      this.vertex = vertex;

      this.radius = jitter(container.height * 0.35, 0.25);
      this.initialRadius = this.radius;
      this.minRadius = this.radius * (1 - config.spread);
      this.maxRadius = this.radius * (1 + config.spread);

      // Which direction the point starts moving in
      this.isGrowing = Math.random() < 0.5;

      // Points are created with a position for flexibility
      this.position = this.getCoordinates(this.vertex, this.radius);
    }

    Point.prototype.update = function () {
      // Change directions if radius is out of bounds
      // The adjustment of min and max here is because otherwise we get stuck in limits!
      if (this.radius >= this.maxRadius * 0.99) this.isGrowing = false;
      if (this.radius <= this.minRadius * 1.01) this.isGrowing = true;

      // position is the point's position between min (-spread) and max (spread);
      const position = this.radius / this.initialRadius - 1;
      // delta is the difference between the current radius and the next one
      let delta =
        config.acceleration * config.speed * Math.pow(position, 2) -
        config.speed;

      // Correct radius change for direction
      if (!this.isGrowing) delta *= -1;

      // Update radius and position
      this.radius += delta;
      this.position = this.getCoordinates(this.vertex, this.radius);
    };

    Point.prototype.getCoordinates = function (vertex, radius) {
      const result = {
        x: 0.0,
        y: 0.0,
      };

      // This is sepecifically for a five-point blob
      // This only has three options because symmetry
      switch (vertex) {
        case 0:
          result.x = 0;
          result.y = -1 * radius;
          break;
        case 1:
        case 4:
          result.x = radius * p.cos(18);
          result.y = -1 * radius * p.sin(18);
          break;
        case 2:
        case 3:
          result.x = radius * p.cos(54);
          result.y = radius * p.sin(54);
          break;
        default:
          break;
      }

      // Mirrors for left-side points
      if (vertex === 3 || vertex === 4) result.x *= -1;

      return result;
    };
  };

  return new p5(sketch, containerId);
};

blobSketchLoader("jsSketchContainer");
