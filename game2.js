
window.gameOfLife = {};

gameOfLife.cell = function () {
	"use strict";
	var future, _;

	_ = {
		alive : false,
		touch : function () { _.alive = !_.alive; },
		neighbours : [],
		neighboursAlive : function () {
			var sum = 0;
			_.neighbours.forEach(function (neighbour) {
				sum += +neighbour.alive;
			});
			return sum;
		},
		progress : function () {
			if (future === undefined) {
				_.futureIsBright();
			}
			_.alive = future;
			future = undefined;
		},
		futureIsBright : function () {
			if (future === undefined) {
				var neighboursAlive = _.neighboursAlive();
				future = neighboursAlive === gameOfLife.cell.neighboursToLive || (_.alive && neighboursAlive === gameOfLife.cell.neighboursToStagnate);
			}
			return future;
		}
	};
	
	return _;
};

gameOfLife.cell.neighboursToLive = 3;
gameOfLife.cell.neighboursToStagnate = 2;

gameOfLife.game = function (size) {
	"use strict";
	var _, i, j;

	_ = {
		cells : [],
		
		touch : function (x, y) { 
			_.cells[x][y].touch();
		},
		
		progress : function () {
			var i, j;
			for (i = 0; i < _.cells.length; i++) {
				for (j = 0; j < _.cells[i].length; j++) {
					_.cells[i][j].futureIsBright();
				}
			}
			for (i = 0; i < _.cells.length; i++) {
				for (j = 0; j < _.cells[i].length; j++) {
					_.cells[i][j].progress();
				}
			}
		}
	};

	function correctIndex(p) {
		return (p < 0) ? size - 1 : ((p > size - 1) ? 0 : p);
	}
	
	function neighbourIndexes(p) {
		return [correctIndex(p - 1), p, correctIndex(p + 1)];
	}

	for (i = 0; i < size; i++) {
		_.cells[i] = [];
		for (j = 0; j < size; j++) {
			_.cells[i][j] = new gameOfLife.cell();
		}
	}
	
	function setNeighbours() {
		var i, j, k, l, indexesX, indexesY;
		for (i = 0; i < size; i++) {
			for (j = 0; j < size; j++) {
				indexesX = neighbourIndexes(i);
				indexesY = neighbourIndexes(j);
				for (k = 0; k < indexesX.length; k++) {
					for (l = 0; l < indexesY.length; l++) {
						_.cells[i][j].neighbours.push(_.cells[indexesX[k]][indexesY[l]]);
					}
				}
				_.cells[i][j].neighbours.splice(4, 1);
			}
		}
	}
	
	setNeighbours();
	
	/*
	_.cells.forEach(function (row, i) {
		row.forEach(function (cell, j) {
			neighbourIndexes(i).forEach(function (x) {
				neighbourIndexes(j).forEach(function (y) {
					cell.neighbours.push(_.cells[x][y]);
				});
			});
			cell.neighbours.splice(4, 1);
		});
	});
	*/
	
	return _;
};

gameOfLife.randomize = function (game) {
	"use strict";
	var i, j;
	for (i = 0; i < game.cells.length; i++) {
		for (j = 0; j < game.cells.length; j++) {
			game.cells[i][j].alive = (Math.random() > 0.5);
		}	
	}
};