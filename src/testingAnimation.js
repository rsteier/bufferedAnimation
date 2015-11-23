define(['bufferedAnimation'], function (bufferedAnimation) {

	var testingAnimation = function (	initialShowDelay,
									minShowTime,
									hideDelay) {
		var self = {
				showing: false
			},
			fsm,
			showAnimation = function () {
				this.showing = true;
			},
			hideAnimation = function () {
				this.showing = false;
			},
			initialShowDelay = 700,
			minShowTime = 2000,
			hideDelay = 50;
			
		fsm = new bufferedAnimation(
			showAnimation,
			hideAnimation,
			initialShowDelay,
			minShowTime,
			hideDelay
		);

		self.show = function () {
			fsm.show();
		};
		self.hide = function () {
			fsm.hide();
		};

		return self;
	};
	return testingAnimation; 
});