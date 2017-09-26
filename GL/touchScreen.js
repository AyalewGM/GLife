gameOfLife.touchScreen = function () {
	"use strict";
	var game, el, dots, set;
	set = function (i, j) {
		var dot;
		dot = dots[j + i * game.cells.length];
		dot.className = (game.cells[i][j].alive) ? 'cell alive' : 'cell dead';
	};
	var _ = {
		setup : function (game1, elementId) {
			var i, j, dot;
			game = game1;
			el = document.getElementById(elementId === undefined ? 'simpleRenderer' : elementId);
			for (i = 0; i < game.cells.length; i++) {
				for (j = 0; j < game.cells[i].length; j++) {
					dot = document.createElement('a');
					dot.addEventListener('click', _.touch(i, j), false);
					el.appendChild(dot);
					dot = null;
				}
				el.appendChild(document.createElement('br'));
			}
			dots = el.getElementsByTagName('a');
		},
		refresh : function () {
			var i, j;
			for (i = 0; i < game.cells.length; i++) {
				for (j = 0; j < game.cells[i].length; j++) {
					//window.setTimeout(set, 6, i, j);
					set(i, j);
				}
			}
		},
		touch : function(x, y) {
			return function() { game.touch(x, y); _.refresh(); };
		}
	};
	return _;
};