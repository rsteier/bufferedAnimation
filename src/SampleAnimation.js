SampleAnimation = function () {
	var self = {},
		fsm,
		showAnimation = function () {},
		hideAnimation = function () {},
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

	return self;
}; 