define(['bufferedAnimation', 'testingAnimation'], function(bufferedAnimation, testingAnimation) {
	var initialShowDelay = 700,
		minShowTime = 2000,
		hideDelay = 50;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
	describe('The "beforeShow" state works correctly as it', function () {
		var tester,//TODO: make this an object to reduce overhead of instantiating this
		//for each test suite. Write memo about how this caused confusion when spanning
		//across multiple test suites
			isCurrentlyShowing = null,
			showAnimation = function () {
				isCurrentlyShowing = true;
			},
			hideAnimation = function () {
				isCurrentlyShowing = false;
			};
		beforeEach(function () {
			isCurrentlyShowing = null;
			tester = new bufferedAnimation(
				showAnimation,
				hideAnimation,
				initialShowDelay,
				minShowTime,
				hideDelay
			);
		});
		afterEach(function () {
			isCurrentlyShowing = null;
			tester = null;
		});
		it('never triggers the showAnimation when one show is resolved beforeShow the initialShowDelay', function (done) {
			tester.show();
			setTimeout(tester.hide, initialShowDelay/2);

			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(null);
				done();
			}.bind(tester), initialShowDelay/1.1);
		});

		it('never triggers the showAnimation when multiple shows are resolved beforeShow the initialShowDelay', function (done) {
			//shows
			tester.show();
			setTimeout(tester.show, initialShowDelay/9)
			setTimeout(tester.show, initialShowDelay/8)
			setTimeout(tester.show, initialShowDelay/7)

			//hides
			setTimeout(tester.hide, initialShowDelay/6)
			setTimeout(tester.hide, initialShowDelay/5)
			setTimeout(tester.hide, initialShowDelay/4)
			setTimeout(tester.hide, initialShowDelay/3)

			//test
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(null);
				done();
			}.bind(tester), initialShowDelay/1.1);
		});

		it('triggers the showAnimation when a show is not resolved before the initialShowDelay', function (done) {
			tester.show();
			setTimeout(tester.hide, initialShowDelay * 1.1);

			//test that showAnimation isn't called before initialShowDelay countdown completes
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(null);
			}, initialShowDelay * .9);

			//test that showAnimation is called after initialShowDelay countdown completes
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(true);
				done();
			}, initialShowDelay * 1.1);
		});
		it("triggers the showAnimation when multiple shows aren't resolved before the initialShowDelay", function (done) {
			//shows
			tester.show();
			setTimeout(tester.show, initialShowDelay/9);
			setTimeout(tester.show, initialShowDelay/8);
			setTimeout(tester.show, initialShowDelay/7);

			//hides
			setTimeout(tester.hide, initialShowDelay/6);
			setTimeout(tester.hide, initialShowDelay/5);
			setTimeout(tester.hide, initialShowDelay/4);

			//test that showAnimation isn't called before initialShowDelay countdown completes
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(null);
			}, initialShowDelay * .9);

			//test that showAnimation is called after initialShowDelay countdown completes
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(true);
				done();
			}, initialShowDelay * 1.1);
		});
	});

	describe('The "waitingForPendingHides" state works correctly as it', function () {
		var tester,
			isCurrentlyShowing = null,
			showAnimation = function () {
				isCurrentlyShowing = true;
			},
			hideAnimation = function () {
				isCurrentlyShowing = false;
			};
		beforeEach(function () {
			isCurrentlyShowing = null;
			tester = new bufferedAnimation(
				showAnimation,
				hideAnimation,
				initialShowDelay,
				minShowTime,
				hideDelay
			);
		});
		afterEach(function () {
			isCurrentlyShowing = null;
			tester = null;
		});
		
		//show/hide balanced
		it("no pending hides coming into this state will immediately 'initiateHidingProtocol'", function (done) {
			var hideTime = initialShowDelay + (minShowTime * 0.1),
				beforeMinShowTime = initialShowDelay + (minShowTime * 0.9),
				afterMinShowTime = initialShowDelay + (minShowTime * 1.1);

			tester.show();
			setTimeout(tester.hide, hideTime);

			//test that hiding doesn't get called before minShowTime countdown completes
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(true);
			}, beforeMinShowTime);

			//test that hiding has happened after minShowTime countdown completes
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(false);
				done();
			}, afterMinShowTime);
		});

		//one pending hide
		it("one pending hide coming into this state will 'initiateHidingProtocol' once it is resolved", function (done) {
			var hideTime = initialShowDelay + (minShowTime * 1.5),
				beforeHideDelayCountdown =	hideTime + (hideDelay * 0.9), 
				afterHideDelayCountdown = 	hideTime + (hideDelay * 1.1);
			tester.show();
			setTimeout(tester.hide, hideTime);

			//test that hiding doesn't happen before the hideDelay countdown completes		
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(true);
			}, beforeHideDelayCountdown);

			//test that hiding happens after the hideDelay countdown completes
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(false);
				done();
			}, afterHideDelayCountdown);
		});

		//multiple pending hides
		it("many pending hides coming into this state will 'initiateHidingProtocol' once all are resolved", function (done) {
			//shows
			tester.show();
			setTimeout(tester.show, initialShowDelay/9)
			setTimeout(tester.show, initialShowDelay/8)
			setTimeout(tester.show, initialShowDelay/7)

			//hides
			var timeOfLastShowResolving = initialShowDelay + (minShowTime * 3);
			setTimeout(tester.hide, initialShowDelay + (minShowTime * 1.1));
			setTimeout(tester.hide, initialShowDelay + (minShowTime * 1.5));
			setTimeout(tester.hide, initialShowDelay + (minShowTime * 2));
			setTimeout(tester.hide, timeOfLastShowResolving);

			//test that the hiding doesn't happen before the time of last show resolving
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(true);
			}, timeOfLastShowResolving + (hideDelay * .9));

			//test that the hiding happens after the time of last show resolving
			setTimeout(function () {
				expect(isCurrentlyShowing).toBe(false);
				done();
			}, timeOfLastShowResolving + (hideDelay * 1.1));
		});
	});
});