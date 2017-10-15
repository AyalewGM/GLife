var workers;
   var wokerCount;
   var jobNum = 0;
   
   var running = false;
   var repaintTimeout;
   
   var xmin, ymin, xmax, ymax;
   var dx, dy;
   
   var jobs;
   var jobsCompleted;
   
   var OSC;  // Off-screen canvas, holds the the Mandelbrot set.
   var OSG;  // Graphics context for on-screen canvas.
   var canvas;    // On-screen canvas -- shows OSC, with stuff possibly drawn on top.
   var graphics;  // Graphics context for on-screen canvas.
   
   var dragbox = null;
   
   var maxIterations;
   var stretchPalette = true;
   var fixedPaletteLength = 250;
   var paletteLength;
   var palette;
   
   function newWorkers(count) {
      var i;
      if (workers) {
         for (i = 0; i < workerCount; i++) {
            workers[i].terminate();
         }
      }
      workers = [];
      workerCount = count;
      for (i = 0; i < workerCount; i++) {
         workers[i] = new Worker("Mandelbrotworker.js");
       //  workers[i] = new Worker();
        workers[i].onmessage = jobFinished;
         
      }
   }
   
   function setLimits(x1, x2, y1, y2) {
      xmin = x1;
      xmax = x2;
      ymin = y1;
      ymax = y2;
      if (xmax < xmin) {
         var temp = xmin;
         xmin = xmax;
         xmax = temp;
      }
      if (ymax < ymin) {
         var temp = ymax;
         ymax = ymin;
         ymin = temp;
      }
      var width = xmax - xmin;
      var height = ymax - ymin;
      var aspect = width/height;
      var windowAspect = canvas.width / canvas.height;
      if (aspect < windowAspect) {
         var newWidth = width*windowAspect/aspect;
         var center = (xmax + xmin)/2;
         xmax = center + newWidth/2;
         xmin = center - newWidth/2;
      }
      else if (aspect > windowAspect) {
         var newHeight = height*aspect/windowAspect;
         var center = (ymax+ymin)/2;
         ymax = center + newHeight/2;
         ymin = center - newHeight/2;
      }
      dx = (xmax - xmin) / (canvas.width - 1);
      dy = (ymax - ymin) / (canvas.height - 1);
   }
   
   function doDraw() {
      graphics.drawImage(OSC,0,0);
      if (dragbox && dragbox.width > 2 && dragbox.height > 2) {
         dragbox.draw();
      }
   }
   
   function repaint() {
      doDraw();
      if (running) {
         repaintTimeout = setTimeout(repaint, 500);
         $("#message").html("Computing...  Completed " + jobsCompleted + " of " + canvas.height + " rows");
      }
      else {
          $("#message").html("Idle");
      }
   }
   
   function stopJob() {
       if (running) {
          jobNum++;
          running = false;
          if (repaintTimeout)
             clearTimeout(repaintTimeout);
          repaintTimeout = null;
          repaint();
       }
   }
   
   function startJob() {
       if (running)
          stopJob();
       graphics.fillRect(0,0,canvas.width,canvas.height);
       OSG.fillStyle="#BBB";
       OSG.fillRect(0,0,canvas.width,canvas.height);
       jobs = [];
       var y = ymax;
       var rows = canvas.height;
       var columns = canvas.width;
       for ( var row = 0; row < rows; row++) {
          jobs[rows - 1- row] = { 
              jobNum: jobNum,
              row: row,
              maxIterations: maxIterations,
              y: y,
              xmin: xmin,
              columns: columns,
              dx: dx
          };
          y -= dy;
       }
       jobsCompleted = 0;
       for (var i = 0; i < workerCount; i++) {
          var j = jobs.pop();
          j.workerNum = i;
          workers[i].postMessage(j);
       }
       running = true;
       $("#message").html("Computing...");
       repaintTimeout = setTimeout(repaint,333);
    }
    
    function jobFinished(msg) {
       job = msg.data;
        if (job.jobNum != jobNum)
          return;
       var iterationCounts = job.iterationCounts;
       var row = job.row;
       var columns = canvas.width;
       for (var col = 0; col < columns; col++) {
          var ct = iterationCounts[col];
          var paletteIndex;
          if (ct < 0)
             OSG.fillStyle = "#000";
          else {
             paletteIndex = iterationCounts[col] % paletteLength;
             OSG.fillStyle = palette[paletteIndex];
          }
          OSG.fillRect(col,row,1,1);
       }
       jobsCompleted++;
       if (jobsCompleted == canvas.height)
          stopJob();
       else if (jobs.length > 0) {
          var worker = workers[job.workerNum];
          var j = jobs.pop();
          j.workerNum = job.workerNum;
          worker.postMessage(j);
       }
    }
   
   function setDefaults() {
      stopJob();
      setLimits(-2.2,0.8,-1.2,1.2);
      stretchPalette = true;
      fixedPaletteLength = 250;
      maxIterations = 100;
      createPalette();
      $("#stretchPaletteCheckbox").attr("checked", true);
      $("#paletteLengthPar").css("display","none");
      $("#maxIterSelect").val(100);
      $("#otherMaxIter").html("&nbsp;");
      $("#paletteLengthSelect").val("250");
      $("#otherPaletteLength").html("&nbsp;");
      startJob();
   }
   
   function makeSpectralColor(hue) {
      var section = Math.floor(hue*6);
      var fraction = hue*6 - section;
      var rgb;
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
   
   function createPalette() {
      var length = stretchPalette ? maxIterations : fixedPaletteLength;
      if (length == paletteLength)
         return;
      paletteLength = length;
      palette = [];
      for (var i = 0; i < paletteLength; i++) {
          var hue = i / paletteLength
          palette[i] = makeSpectralColor(hue);
      }
   }
   
   function DragBox(x,y) {
      this.x = this.left = x;
      this.y = this.top = y;
      this.width = 0;
      this.height = 0;
   }
   DragBox.prototype.draw = function() {  // Draw the box on the on-screen canvas
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
   DragBox.prototype.zoom = function(zoomin) {
      if (this.width <= 2 || this.height <= 2)
         return;
      stopJob();
      var x1, x2, y1, y2;  // coordinates of corners of zoombox
      var cx, cy;   // coordinates of center of zoombox
      var newWidth, newHeight;
      x1 = xmin + this.left/canvas.width*(xmax-xmin);
      x2 = xmin + (this.left+this.width)/canvas.width*(xmax-xmin);
      y1 = ymax - (this.top+this.height)/canvas.height*(ymax-ymin);
      y2 = ymax - this.top/canvas.height*(ymax-ymin);
      cx = (x1+x2)/2;
      cy = (y1+y2)/2;
      if (zoomin == false) { 
         var newXmin = xmin + (xmin-x1)/(x2-x1)*(xmax-xmin);
         var newXmax = xmin + (xmax-x1)/(x2-x1)*(xmax-xmin);
         var newYmin = ymin + (ymin-y1)/(y2-y1)*(ymax-ymin);
         var newYmax = ymin + (ymax-y1)/(y2-y1)*(ymax-ymin);
         setLimits(newXmin,newXmax,newYmin,newYmax);
      }
      else {
         newWidth = x2 - x1;
         newHeight = y2 - y1;
         setLimits( cx-newWidth/2, cx+newWidth/2, cy-newHeight/2, cy+newHeight/2 ); 
      }
      startJob();
   }
   
   function setUpDragging() {
      var zoomin;
      dragbox = null;  // initially, the mouse is not being dragged.
      $("#mbcanvas").mousedown(function(e){
           if (dragbox || e.button != 0)
              return;
           var offset = $("#mbcanvas").offset();
           var x = Math.round(e.pageX - offset.left);
           var y = Math.round(e.pageY - offset.top);
           dragbox = new DragBox(x,y);
           zoomin = !e.shiftKey;
           doDraw();
      });
      $("#mbcanvas").mousemove(function(e){
          if (dragbox) {
              var offset = $("#mbcanvas").offset();
              var x = Math.round(e.pageX - offset.left);
              var y = Math.round(e.pageY - offset.top);
              dragbox.setCorner(x,y);
              doDraw();
          }
      });
      $(document).mouseup(function() {
            // This is called when the mouse is released anywhere in the document.  This
            // is attached to the document, not the canvas, because the mouseup after a
            // mousedown on the canvas can occur anywhere.  (Actually, a saner langauge 
            // would send the mouseup to the same object that got the mousedown, but
            // javascript/jquery doesn't seem to do that.)
         if (dragbox) {
            dragbox.zoom(zoomin);
            dragbox = null;
         }
      });
   }
   
   function changeWorkerCount() {
      var ct = parseInt($("#threadCountSelect").val())
      if (ct == workerCount)
         return;
      stopJob();
      newWorkers(ct);
      startJob();
   }
   
   function changeMaxIterations() {
      var val = $("#maxIterSelect").val();
      var iter;
      if (val == "Other...") {
         val = prompt("Enter the maximum number of iterations", maxIterations);
         iter = parseInt(val);
         if (isNaN(iter) || iter < 1 || iter > 100000) {
            alert("Sorry, the value must be a positive integer, and not more than 100000.");
            $("#maxIterSelect").val(maxIterations);
            return;
         }
         $("#otherMaxIter").html("(" + iter +")")
      }
      else {
         iter = parseInt(val);
         $("#otherMaxIter").html("&nbsp;");
      }
      if (iter == maxIterations)
         return;
      maxIterations = iter;
      createPalette();
      startJob();
   }
   
   
   function changeStretchPalette() {
      var checked = $("#stretchPaletteCheckbox").attr("checked");
      if (stretchPalette == checked)
         return;
      stretchPalette = checked;
      var newPaletteLength = stretchPalette ? maxIterations : fixedPaletteLength;
      $("#paletteLengthPar").css( "display", stretchPalette? "none" : "block" );
      if (newPaletteLength != paletteLength) {
         createPalette();
         startJob();
      }
   }
   
   
   function changePaletteLength() {
      var val = $("#paletteLengthSelect").val();
      var len;
      if (val == "Other...") {
         val = prompt("Enter the palette length.", fixedPaletteLength);
         len = parseInt(val);
         if (isNaN(len) || len < 2 || len > 100000) {
            alert("Sorry, the value must be an integer, between 2 and 100000");
            $("#paletteLengthSelect").val(fixedPaletteLength);
            return;
         }
         $("#otherPaletteLength").html("(" + len +")")
      }
      else {
         len = parseInt(val);
         $("#otherPaletteLength").html("&nbsp;");
      }
      if (len == fixedPaletteLength)
         return;
      fixedPaletteLength = len;
      if (fixedPaletteLength != paletteLength) {
         createPalette();
         startJob();
      }
   }
      
    
   $(function() {
      if ( ! window.Worker ) {
         $("#message").html("Sorry, your browser does not support worker threads.<br>"
               + "This page should work with recent versions of Firefox, Safari,<br>"
               + "Chrome, and Opera.  It will probably work in Internet Explorer 10.");
         return;
      }
      canvas = document.getElementById("mbcanvas");
      if (! canvas ||  ! canvas.getContext ) {
         $("#message").html("Sorry, your browser doesn't support the canvas element.");
         return;
      }
      graphics = canvas.getContext("2d");
      OSC = document.createElement("canvas");
      OSC.width = canvas.width;
      OSC.height = canvas.height;
      OSG = OSC.getContext("2d");
      graphics.fillStyle = "#BBB";
      createPalette();
      newWorkers(4);
      $("#restoreButton").click(setDefaults);
      $("#threadCountSelect").val("4");
      $("#threadCountSelect").change(changeWorkerCount);
      $("#maxIterSelect").val("100");
      $("#maxIterSelect").change(changeMaxIterations);
      $("#stretchPaletteCheckbox").attr("checked", true);
      $("#stretchPaletteCheckbox").change(changeStretchPalette);
      $("#paletteLengthSelect").val(fixedPaletteLength);
      $("#paletteLengthSelect").change(changePaletteLength);
      setUpDragging();
      setDefaults();
   });
