class MandelbrotApp {
   constructor() {
      this.workers = null;
      this.workerCount = 0;
      this.jobNum = 0;
      
      this.running = false;
      this.repaintTimeout = null;
      
      this.xmin = 0;
      this.ymin = 0;
      this.xmax = 0;
      this.ymax = 0;
      this.dx = 0;
      this.dy = 0;
      
      this.jobs = [];
      this.jobsCompleted = 0;
      
      this.OSC = null;  // Off-screen canvas, holds the the Mandelbrot set.
      this.OSG = null;  // Graphics context for off-screen canvas.
      this.canvas = null;    // On-screen canvas -- shows OSC, with stuff possibly drawn on top.
      this.graphics = null;  // Graphics context for on-screen canvas.
      
      this.dragbox = null;
      
      this.maxIterations = 100;
      this.stretchPalette = true;
      this.fixedPaletteLength = 250;
      this.paletteLength = 0;
      this.palette = [];
   }
   
   newWorkers(count) {
      var i;
      if (this.workers) {
         for (i = 0; i < this.workerCount; i++) {
            this.workers[i].terminate();
         }
      }
      this.workers = [];
      this.workerCount = count;
      for (i = 0; i < this.workerCount; i++) {
         this.workers[i] = new Worker("Mandelbrotworker.js");
       //  this.workers[i] = new Worker();
        this.workers[i].onmessage = (msg) => this.jobFinished(msg);
         
      }
   }
   
   setLimits(x1, x2, y1, y2) {
      this.xmin = x1;
      this.xmax = x2;
      this.ymin = y1;
      this.ymax = y2;
      if (this.xmax < this.xmin) {
         var temp = this.xmin;
         this.xmin = this.xmax;
         this.xmax = temp;
      }
      if (this.ymax < this.ymin) {
         var temp = this.ymax;
         this.ymax = this.ymin;
         this.ymin = temp;
      }
      var width = this.xmax - this.xmin;
      var height = this.ymax - this.ymin;
      var aspect = width/height;
      var windowAspect = this.canvas.width / this.canvas.height;
      if (aspect < windowAspect) {
         var newWidth = width*windowAspect/aspect;
         var center = (this.xmax + this.xmin)/2;
         this.xmax = center + newWidth/2;
         this.xmin = center - newWidth/2;
      }
      else if (aspect > windowAspect) {
         var newHeight = height*aspect/windowAspect;
         var center = (this.ymax+this.ymin)/2;
         this.ymax = center + newHeight/2;
         this.ymin = center - newHeight/2;
      }
      this.dx = (this.xmax - this.xmin) / (this.canvas.width - 1);
      this.dy = (this.ymax - this.ymin) / (this.canvas.height - 1);
   }
   
   doDraw() {
      this.graphics.drawImage(this.OSC,0,0);
      if (this.dragbox && this.dragbox.width > 2 && this.dragbox.height > 2) {
         this.dragbox.draw(this.graphics);
      }
   }
   
   repaint() {
      this.doDraw();
      if (this.running) {
         this.repaintTimeout = setTimeout(() => this.repaint(), 500);
         $("#message").html("Computing...  Completed " + this.jobsCompleted + " of " + this.canvas.height + " rows");
      }
      else {
          $("#message").html("Idle");
      }
   }
   
   stopJob() {
       if (this.running) {
          this.jobNum++;
          this.running = false;
          if (this.repaintTimeout)
             clearTimeout(this.repaintTimeout);
          this.repaintTimeout = null;
          this.repaint();
       }
   }
   
   startJob() {
       if (this.running)
          this.stopJob();
       this.graphics.fillRect(0,0,this.canvas.width,this.canvas.height);
       this.OSG.fillStyle="#BBB";
       this.OSG.fillRect(0,0,this.canvas.width,this.canvas.height);
       this.jobs = [];
       var y = this.ymax;
       var rows = this.canvas.height;
       var columns = this.canvas.width;
       for ( var row = 0; row < rows; row++) {
          this.jobs[rows - 1- row] = { 
              jobNum: this.jobNum,
              row: row,
              maxIterations: this.maxIterations,
              y: y,
              xmin: this.xmin,
              columns: columns,
              dx: this.dx
          };
          y -= this.dy;
       }
       this.jobsCompleted = 0;
       for (var i = 0; i < this.workerCount; i++) {
          var j = this.jobs.pop();
          j.workerNum = i;
          this.workers[i].postMessage(j);
       }
       this.running = true;
       $("#message").html("Computing...");
       this.repaintTimeout = setTimeout(() => this.repaint(),333);
    }
    
   jobFinished(msg) {
       var job = msg.data;
        if (job.jobNum != this.jobNum)
          return;
       var iterationCounts = job.iterationCounts;
       var row = job.row;
       var columns = this.canvas.width;
       for (var col = 0; col < columns; col++) {
          var ct = iterationCounts[col];
          var paletteIndex;
          if (ct < 0)
             this.OSG.fillStyle = "#000";
          else {
             paletteIndex = iterationCounts[col] % this.paletteLength;
             this.OSG.fillStyle = this.palette[paletteIndex];
          }
          this.OSG.fillRect(col,row,1,1);
       }
       this.jobsCompleted++;
       if (this.jobsCompleted == this.canvas.height)
          this.stopJob();
       else if (this.jobs.length > 0) {
          var worker = this.workers[job.workerNum];
          var j = this.jobs.pop();
          j.workerNum = job.workerNum;
          worker.postMessage(j);
       }
    }
   
   setDefaults() {
      this.stopJob();
      this.setLimits(-2.2,0.8,-1.2,1.2);
      this.stretchPalette = true;
      this.fixedPaletteLength = 250;
      this.maxIterations = 100;
      this.createPalette();
      $("#stretchPaletteCheckbox").attr("checked", true);
      $("#paletteLengthPar").css("display","none");
      $("#maxIterSelect").val(100);
      $("#otherMaxIter").html("&nbsp;");
      $("#paletteLengthSelect").val("250");
      $("#otherPaletteLength").html("&nbsp;");
      this.startJob();
   }
   
   makeSpectralColor(hue) {
      var section = Math.floor(hue*6);
      var fraction = hue*6 - section;
      var r, g, b;
      switch (section) {
      case 0:
         r = 1;
         g = fraction;
         b = 0;
         break;
      case 1:
         r = 1 - fraction;
         g = 1;
         b = 0;
         break;
      case 2:
         r = 0;
         g = 1;
         b = fraction;
         break;
      case 3:
         r = 0;
         g = 1 - fraction;
         b = 1;
         break;
      case 4:
         r = fraction;
         g = 0;
         b = 1;
         break;
      case 5:
         r = 1;
         g = 0;
         b = 1 - fraction;
         break;
      }
      var rx = new Number(Math.floor(r*255)).toString(16);
      if (rx.length == 1)
         rx = "0" + rx;
      var gx = new Number(Math.floor(g*255)).toString(16);
      if (gx.length == 1)
         gx = "0" + gx;
      var bx = new Number(Math.floor(b*255)).toString(16);
      if (bx.length == 1)
         bx = "0" + bx;
      var color = "#" + rx + gx + bx;
      return color;
   }
   
   createPalette() {
      var length = this.stretchPalette ? this.maxIterations : this.fixedPaletteLength;
      if (length == this.paletteLength)
         return;
      this.paletteLength = length;
      this.palette = [];
      for (var i = 0; i < this.paletteLength; i++) {
          var hue = i / this.paletteLength
          this.palette[i] = this.makeSpectralColor(hue);
      }
   }

   setUpDragging() {
      var zoomin;
      this.dragbox = null;  // initially, the mouse is not being dragged.
      $("#mbcanvas").mousedown((e) => {
           if (this.dragbox || e.button != 0)
              return;
           var offset = $("#mbcanvas").offset();
           var x = Math.round(e.pageX - offset.left);
           var y = Math.round(e.pageY - offset.top);
           this.dragbox = new DragBox(x,y);
           zoomin = !e.shiftKey;
           this.doDraw();
      });
      $("#mbcanvas").mousemove((e) => {
          if (this.dragbox) {
              var offset = $("#mbcanvas").offset();
              var x = Math.round(e.pageX - offset.left);
              var y = Math.round(e.pageY - offset.top);
              this.dragbox.setCorner(x,y);
              this.doDraw();
          }
      });
      $(document).mouseup(() => {
            // This is called when the mouse is released anywhere in the document.  This
            // is attached to the document, not the canvas, because the mouseup after a
            // mousedown on the canvas can occur anywhere.  (Actually, a saner langauge 
            // would send the mouseup to the same object that got the mousedown, but
            // javascript/jquery doesn't seem to do that.)
         if (this.dragbox) {
            this.dragbox.zoom(zoomin, this);
            this.dragbox = null;
         }
      });
   }

   changeWorkerCount() {
      var ct = parseInt($("#threadCountSelect").val())
      if (ct == this.workerCount)
         return;
      this.stopJob();
      this.newWorkers(ct);
      this.startJob();
   }

   changeMaxIterations() {
      var val = $("#maxIterSelect").val();
      var iter;
      if (val == "Other...") {
         val = prompt("Enter the maximum number of iterations", this.maxIterations);
         iter = parseInt(val);
         if (isNaN(iter) || iter < 1 || iter > 100000) {
            alert("Sorry, the value must be a positive integer, and not more than 100000.");
            $("#maxIterSelect").val(this.maxIterations);
            return;
         }
         $("#otherMaxIter").html("(" + iter +")")
      }
      else {
         iter = parseInt(val);
         $("#otherMaxIter").html("&nbsp;");
      }
      if (iter == this.maxIterations)
         return;
      this.maxIterations = iter;
      this.createPalette();
      this.startJob();
   }

   changeStretchPalette() {
      var checked = $("#stretchPaletteCheckbox").attr("checked");
      if (this.stretchPalette == checked)
         return;
      this.stretchPalette = checked;
      var newPaletteLength = this.stretchPalette ? this.maxIterations : this.fixedPaletteLength;
      $("#paletteLengthPar").css( "display", this.stretchPalette? "none" : "block" );
      if (newPaletteLength != this.paletteLength) {
         this.createPalette();
         this.startJob();
      }
   }

   changePaletteLength() {
      var val = $("#paletteLengthSelect").val();
      var len;
      if (val == "Other...") {
         val = prompt("Enter the palette length.", this.fixedPaletteLength);
         len = parseInt(val);
         if (isNaN(len) || len < 2 || len > 100000) {
            alert("Sorry, the value must be an integer, between 2 and 100000");
            $("#paletteLengthSelect").val(this.fixedPaletteLength);
            return;
         }
         $("#otherPaletteLength").html("(" + len +")")
      }
      else {
         len = parseInt(val);
         $("#otherPaletteLength").html("&nbsp;");
      }
      if (len == this.fixedPaletteLength)
         return;
      this.fixedPaletteLength = len;
      if (this.fixedPaletteLength != this.paletteLength) {
         this.createPalette();
         this.startJob();
      }
   }

   initialize() {
      if ( ! window.Worker ) {
         $("#message").html("Sorry, your browser does not support worker threads.<br>"
               + "This page should work with recent versions of Firefox, Safari,<br>"
               + "Chrome, and Opera.  It will probably work in Internet Explorer 10.");
         return;
      }
      this.canvas = document.getElementById("mbcanvas");
      if (! this.canvas ||  ! this.canvas.getContext ) {
         $("#message").html("Sorry, your browser doesn't support the canvas element.");
         return;
      }
      this.graphics = this.canvas.getContext("2d");
      this.OSC = document.createElement("canvas");
      this.OSC.width = this.canvas.width;
      this.OSC.height = this.canvas.height;
      this.OSG = this.OSC.getContext("2d");
      this.graphics.fillStyle = "#BBB";
      this.createPalette();
      this.newWorkers(4);
      $("#restoreButton").click(() => this.setDefaults());
      $("#threadCountSelect").val("4");
      $("#threadCountSelect").change(() => this.changeWorkerCount());
      $("#maxIterSelect").val("100");
      $("#maxIterSelect").change(() => this.changeMaxIterations());
      $("#stretchPaletteCheckbox").attr("checked", true);
      $("#stretchPaletteCheckbox").change(() => this.changeStretchPalette());
      $("#paletteLengthSelect").val(this.fixedPaletteLength);
      $("#paletteLengthSelect").change(() => this.changePaletteLength());
      this.setUpDragging();
      this.setDefaults();
   }
   
}

function DragBox(x,y) {
   this.x = this.left = x;
   this.y = this.top = y;
   this.width = 0;
   this.height = 0;
}
DragBox.prototype.draw = function(graphics) {  // Draw the box on the on-screen canvas
   graphics.strokeStyle = "#FFF";
   graphics.strokeRect(this.left-1,this.top-1,this.width+1,this.height+1);
   graphics.strokeRect(this.left+1,this.top+1,this.width-3,this.height-3);
   graphics.strokeStyle = "#000";
   graphics.strokeRect(this.left,this.top,this.width-1,this.height-1);
}
DragBox.prototype.setCorner = function(x1,y1) {
   if (x1 <= this.x) {
      this.left = x1;
      this.width = this.x - x1;
   }
   else {
      this.left = this.x;
      this.width = x1 - this.x;
   }
   if (y1 <= this.y) {
      this.top = y1;
      this.height = this.y - y1;
   }
   else {
      this.top = this.y;
      this.height = y1 - this.y;
   }
}
DragBox.prototype.zoom = function(zoomin, app) {
   if (this.width <= 2 || this.height <= 2)
      return;
   app.stopJob();
   var x1, x2, y1, y2;  // coordinates of corners of zoombox
   var cx, cy;   // coordinates of center of zoombox
   var newWidth, newHeight;
   x1 = app.xmin + this.left/app.canvas.width*(app.xmax-app.xmin);
   x2 = app.xmin + (this.left+this.width)/app.canvas.width*(app.xmax-app.xmin);
   y1 = app.ymax - (this.top+this.height)/app.canvas.height*(app.ymax-app.ymin);
   y2 = app.ymax - this.top/app.canvas.height*(app.ymax-app.ymin);
   cx = (x1+x2)/2;
   cy = (y1+y2)/2;
   if (zoomin == false) { 
      var newXmin = app.xmin + (app.xmin-x1)/(x2-x1)*(app.xmax-app.xmin);
      var newXmax = app.xmin + (app.xmax-x1)/(x2-x1)*(app.xmax-app.xmin);
      var newYmin = app.ymin + (app.ymin-y1)/(y2-y1)*(app.ymax-app.ymin);
      var newYmax = app.ymin + (app.ymax-y1)/(y2-y1)*(app.ymax-app.ymin);
      app.setLimits(newXmin,newXmax,newYmin,newYmax);
   }
   else {
      newWidth = x2 - x1;
      newHeight = y2 - y1;
      app.setLimits( cx-newWidth/2, cx+newWidth/2, cy-newHeight/2, cy+newHeight/2 ); 
   }
   app.startJob();
}
// Global app instance
var mandelbrotApp;

$(function() {
   mandelbrotApp = new MandelbrotApp();
   mandelbrotApp.initialize();
});
