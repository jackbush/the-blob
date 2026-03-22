import p5 from "p5";
import { coreColour } from "./_tokens";
const backgroundColour = coreColour.prussian;

// TODO make this respond to element size (works in ./blob)
export const constellationsSketchLoader = (containerId) => {
  const sketch = function (p) {
    const numberOfPoints = 120;
    const maxDiameter = 10;
    const minDiameter = 4;
    const strokeWeight = 2;
    const maxLength = 100;
    const points = [];

    let lines;
    let frame = 0;

    p.setup = function () {
      // SHONK: this takes width from window, not container
      const linesCanvas = p.createCanvas(p.windowWidth, p.windowHeight);
      linesCanvas.parent(containerId);
      p.background(backgroundColour);

      for (let i = 0; i < numberOfPoints; i++) {
        points.push(new Point());
      }
    };

    p.windowResized = function () {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      p.background(backgroundColour);
    };

    p.draw = function () {
      frame += 0.001;
      p.background(backgroundColour);

      lines = [];

      points.forEach(function (point, index) {
        point.update();
        for (let i = index + 1; i < points.length; i++) {
          if (
            point.position &&
            points[i].position &&
            point.position.dist(points[i].position) < maxLength
          ) {
            lines.push(new Line(point, points[i]));
          }
        }
        point.display();
      });
    };

    function Point() {
      this.diameter = Math.random() * (maxDiameter - minDiameter) + minDiameter;
      this.startX = Math.random() * p.windowWidth;
      this.startY = Math.random() * p.windowHeight;
      this.range = 2 * Math.random() - 0.5;
    }

    Point.prototype.update = function () {
      const deltaX = (100 / this.range) * Math.sin(frame);
      const deltaY = (100 / this.range) * Math.cos(frame);
      this.position = p.createVector(
        this.startX + deltaX,
        this.startY + deltaY,
      );
    };

    Point.prototype.display = function () {
      p.noStroke();
      p.fill(200);
      p.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
    };

    function Line(pointA, pointB) {
      p.strokeWeight(strokeWeight);
      p.stroke(
        250,
        250,
        250,
        maxLength - pointA.position.dist(pointB.position),
      );
      p.line(
        pointA.position.x,
        pointA.position.y,
        pointB.position.x,
        pointB.position.y,
      );
    }
  };
  return new p5(sketch, containerId);
};
