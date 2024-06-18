var isAnimating = false;
var animationDelay = 1000;
var currentFrame = 0;
var barTop, barBottom;
var barTopY = -10;
var barBottomY = view.size.height - 80; // view.size.height - Math.max(view.size.height / 5, 100);
var barSegmentCount = 5;

var colorPrimary = '#1ee384';
var colorAdjustHigh = 0.55;
var colorAdjustLow = 0.45;
var colorAdjustOutline = 0.2;

var windowPadding = 50;

var dripDrop = false;
var dripCount = barSegmentCount;
var dripArray = [];
var dripStartPoints = [];


function Drip() {
    // Create start points
    var randomIndex = Math.floor(Math.random() * dripStartPoints.length);
    var randomPoint = dripStartPoints[randomIndex];
    dripStartPoints.splice(randomIndex, 1);
    var randomWidth = Math.floor(Math.random() * 40) + 40;

    this.point1 = new Point(randomPoint.x - (randomWidth / 2), barTopY - randomWidth);
    this.point2 = new Point(randomPoint.x + (randomWidth / 2), barTopY);
    this.centerX = (this.point1.x + this.point2.x) / 2;
    
    this.stretchStartY = barTopY;
    this.stretchStopY = this.stretchStartY + (Math.random() * (view.size.height / 5)) + Math.max(Math.random() * (view.size.height / 5), Math.random() * (view.size.height / 3));

    // Start time
    var frameVariation = (dripArray.length < 1) ? 0 : Math.floor(Math.random() * 60);
    this.startingFrame = currentFrame + frameVariation;

    // Velocity & acceleration
    this.velocity = new Point(0, 0);
    if (dripDrop) {
        var randomAccel = 0.005 + (Math.random() * 0.012);
        this.maxVelocity = 50; // Maximum velocity
    } else {
        var randomAccel = 0.02 + (Math.random() * 0.015);
        this.maxVelocity = 200;
    }
    this.acceleration = new Point(0, randomAccel); // Acceleration due to gravity
    this.exitAcceleration = new Point(0, randomAccel + 0.2);


    this.topBarPoint = getPointOnXAxis(barTop, this.centerX);

    this.updatePath();
}

Drip.prototype = {
    iterate: function() {
        if (currentFrame >= this.startingFrame) {
            // Apply acceleration
            this.velocity.y += this.acceleration.y;
            this.velocity.y = Math.min(this.velocity.y, this.maxVelocity); // cap velocity
            
            // Apply velocity to the drip's points
            this.point1.y += this.velocity.y;
            this.point2.y += this.velocity.y;


            // Stretch top bar
            if (this.point2.y >= this.stretchStartY) {
                if (dripDrop) {
                    if (this.point2.y <= this.stretchStopY) {
                        this.topBarPoint.y = this.point2.y;

                    } else {
                        // increase speed of drip when exiting
                        this.acceleration = this.exitAcceleration;
                        this.maxVelocity = 100;
                        // continue to stretch
                        this.topBarPoint.y += this.velocity.y / 10;

                        // stop after reaching boundary
                        this.point2.y = Math.min(this.point2.y, view.size.height + windowPadding);
                        this.topBarPoint.y = Math.min(this.topBarPoint.y, view.size.height + windowPadding);
                    }
                } else {
                    this.topBarPoint.y = this.point2.y;
                }

                // move bottom left & right points to match points on edge of screen
                if (this.centerX == 0) {
                    barTop.segments[barTop.segments.length - 1].point.y = this.topBarPoint.y;
                } else if (this.centerX == view.size.width) {
                    barTop.segments[barSegmentCount].point.y = this.topBarPoint.y;
                }
            }
            
            // Reset if bar reaches bottom of screen
            if (this.topBarPoint.y >= view.size.height + windowPadding) {
                this.reset();
                if (dripArray.length == 0) {
                    isAnimating = false;
                }
            }

            this.updatePath();
        }
    },
    updatePath: function() {
        if (this.path) this.path.remove();
        
        var rect = new Rectangle(this.point1, this.point2);
        this.path = new Path.Ellipse(rect);
        this.path.sendToBack();
        if (dripDrop) {
            setPathColors('drip', this.path);
        }
    },
    reset: function() {
        // Remove from the array
        var index = dripArray.indexOf(this);
        if (index !== -1) {
            dripArray.splice(index, 1);
        }
        // Create a new drip
        if (dripStartPoints.length > 0) {
            dripArray.push(new Drip());
        }

    }
}

function setPathColors(type, p) { // sets path colors

    // p.selected = true;
    p.fillColor = colorPrimary;
    
    if (type == 'barTop' || type == 'barBottom') {
        p.strokeColor = colorPrimary;
        p.strokeColor.lightness = colorAdjustLow;
        p.strokeWidth = 10;
        p.strokeCap = 'round';
    }

    var shadowOffsetY = 10;
    if (type == 'drip') {
        shadowOffsetY = shadowOffsetY/2;
    } else if (type == 'barBottom') {
        shadowOffsetY = -shadowOffsetY;
    }

    p.shadowColor = colorPrimary;
    p.shadowColor.lightness = colorAdjustOutline;
    p.shadowOffset = new Point(0, shadowOffsetY);
}

function createBarSegment() {

    // barTop path
    // bottom focal points
    for (var i = 0; i < barSegmentCount; i++) {
        var pointX = (i / (barSegmentCount - 1)) * view.size.width;
        var focalPoint = new Point(pointX, barTopY);
        barTop.add(focalPoint);
        dripStartPoints.push(focalPoint);
    }
    barTop.smooth();

    // surrounding points to complete rectangle
    barTop.add(new Point(view.size.width + windowPadding, barTopY)); // bottom right
    barTop.add(new Point(view.size.width + windowPadding, -windowPadding)); // top right
    barTop.add(new Point(-windowPadding, -windowPadding)); // top left
    barTop.add(new Point(-windowPadding, barTopY)); // bottom left

    barTop.closed = true;

    // barBottom path
    /*
    for (var i = 0; i < barSegmentCount; i++) {
        var pointX = (i / (barSegmentCount - 1)) * view.size.width;
        var focalPoint = new Point(pointX, barBottomY);
        barBottom.add(focalPoint);
    }
    barBottom.smooth();

    barBottom.add(new Point(view.size.width + windowPadding, barBottomY)); // top right
    barBottom.add(new Point(view.size.width + windowPadding, view.size.height + windowPadding)); // bottom right
    barBottom.add(new Point(-windowPadding, view.size.height + windowPadding)); // bottom left
    barBottom.add(new Point(-windowPadding, barBottomY)); // top left

    barBottom.sendToBack();
    */

}

// Function to find a point on a path that lies on the same X-axis as a given X-coordinate
function getPointOnXAxis(path, xValue) {
    var tolerance = 5; // Tolerance range to account for floating-point precision
    var matchingPoint = null;
    for (var i = 0; i < path.segments.length; i++) {
        var pointX = path.segments[i].point.x;
        if (Math.abs(pointX - xValue) <= tolerance) {
            matchingPoint = path.segments[i].point;
            break;
        }
    }
    return matchingPoint;
}


/* -------------------------------------
----------------- MAIN -----------------
------------------------------------- */

function init() {
    
    currentFrame = 0;
    isAnimating = false;
    if (document.location.hash == '') {
        setTimeout(function() {
            isAnimating = true;
        }, animationDelay);
    }

    // create top and bottom bars
    barTop = new Path();
    // barBottom = new Path();
    createBarSegment();
    setPathColors('barTop', barTop);
    // setPathColors('barBottom', barBottom);

    // create drips
    dripArray = [];
    for (var i = 0; i < dripCount; i++) {
        if (dripStartPoints.length > 0) {
            dripArray.push(new Drip());
        }
    }

}

function onFrame() {
    if (isAnimating) {
        for (var i = 0; i < dripArray.length; i++) {
            dripArray[i].iterate();
        }
        currentFrame++;
    }
}


function onResize() {
    // remove paths
    if (barTop) barTop.remove();
    for (var i = 0; i < dripArray.length; i++) {
        dripArray[i].path.remove();
    }

    init();
}