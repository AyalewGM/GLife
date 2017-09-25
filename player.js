gameOfLife.player = function (game, screens) {
	"use strict";
	var i, playerId, refreshScreens, _;
	for (i = 0; i < screens.length; i++) {
		screens[i].setup(game);
	}
	refreshScreens = function () {
		var i;
		for (i = 0; i < screens.length; i++) {
			screens[i].refresh();
		}
	};
	_ = {
		speed : 100,
		play : function () {
			playerId = window.setInterval(_.step, _.speed);
		},
		on : function () {
			refreshScreens();
		},
		step : function () {
			game.progress();
			refreshScreens();
		},
		stop : function () {
			if (playerId) {
				window.clearInterval(playerId);
			}
		}
	};
	return _;
};
