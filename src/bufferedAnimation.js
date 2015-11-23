define(['machina'], function (machina) {
	var bufferedAnimation = function (	showFn,
										hideFn,
										initialShowDelay,
										minShowTime,
										hideDelay) {
		var self = {},
			unresolvedShows = 0,
			_showFn,
			_hideFn,
			_initialShowDelay,
			_minShowTime,
			_hideDelay,
			sm,
			_init = function () {
				_showFn = showFn;
				_hideFn = hideFn;
				_initialShowDelay = initialShowDelay;
				_minShowTime = minShowTime;
				_hideDelay = hideDelay;
			},
			_initializeFSM = function () {
				sm = new machina.Fsm({
					initialize: function () {},
					namespace: 'bufferedAnimation',//TODO: what does this do?
					initialState: 'idle',
					states: {
						idle: {
							_onEnter: function () {
								this.on('showCalled', function () {
									var sm = this;
									sm.handle('moveToBeforeShow');
								});
							},
							moveToBeforeShow: 'beforeShow',
							_onExit: function () {}
						},
						beforeShow: {
							_onEnter: function () {
								setTimeout(function () {
									var sm = this;
									if (unresolvedShows === 0) {
										sm.handle('abandonPreShowProtocol');
									} else if (unresolvedShows > 0) {
										sm.handle('initiateShowingProtocol');
									}
								}.bind(this), _initialShowDelay);
							},
							abandonPreShowProtocol: 'idle',//go directly to other state
							initiateShowingProtocol: 'forceShowing',//go directly to state
							_onExit: function () {}
						},
						forceShowing: {
							_onEnter: function () {
								_showFn();
								setTimeout(function () {
									var sm = this;
									sm.handle('waitForPendingHides');
								}.bind(this), _minShowTime);
							},
							waitForPendingHides: 'waitingForPendingHides',
							_onExit: function () {}
						},
						waitingForPendingHides: {
							_onEnter: function () {
								if (unresolvedShows === 0) {
									sm.handle('initiateHidingProtocol')
								} else {
									this.on('hideCalled', function () {
										var sm = this;
										if (unresolvedShows === 0) {
											sm.handle('initiateHidingProtocol')
										}
									}.bind(this));
								}
							},
							initiateHidingProtocol: 'hidingProtocol',
							_onExit: function () {
								this.off('hideCalled');
							}
						},
						hidingProtocol: {
							_onEnter: function () {
								var sm = this;
								sm.on('showCalled', function () {
									var sm = this;
									sm.handle('reinstantiateHidingProcotol');
									//TODO: need to cancel the timeout below
								}.bind(sm));
								setTimeout(function () {
									var sm = this;
									sm.handle('hideAnimation');
								}.bind(this), _hideDelay);
							},
							reinstantiateHidingProcotol: 'waitingForPendingHides',
							hideAnimation: function () {
								_hideFn();
								this.handle('idle');
							},
							_onExit: function () {
								this.off('showCalled');
							}
						}
					}
				});
			};
		_init();
		_initializeFSM();

		self.show = function () {
			unresolvedShows++;
			sm.emit('showCalled');
		};
		self.hide = function () {
			unresolvedShows--;
			sm.emit('hideCalled');
		};

		return self;
	};
	return bufferedAnimation;
});