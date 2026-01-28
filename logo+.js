(function () {
	"use strict";

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		return Constructor;
	}

	function _toConsumableArray(arr) {
		return (
			_arrayWithoutHoles(arr) ||
			_iterableToArray(arr) ||
			_unsupportedIterableToArray(arr) ||
			_nonIterableSpread()
		);
	}

	function _arrayWithoutHoles(arr) {
		if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _iterableToArray(iter) {
		if (
			(typeof Symbol !== "undefined" && iter[Symbol.iterator] != null) ||
			iter["@@iterator"] != null
		)
			return Array.from(iter);
	}

	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
			return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;

		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

		return arr2;
	}

	function _nonIterableSpread() {
		throw new TypeError(
			"Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
		);
	}

	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it =
			(typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];

		if (!it) {
			if (
				Array.isArray(o) ||
				(it = _unsupportedIterableToArray(o)) ||
				(allowArrayLike && o && typeof o.length === "number")
			) {
				if (it) o = it;
				var i = 0;

				var F = function () {};

				return {
					s: F,
					n: function () {
						if (i >= o.length)
							return {
								done: true
							};
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function (e) {
						throw e;
					},
					f: F
				};
			}

			throw new TypeError(
				"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
			);
		}

		var normalCompletion = true,
			didErr = false,
			err;
		return {
			s: function () {
				it = it.call(o);
			},
			n: function () {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function (e) {
				didErr = true;
				err = e;
			},
			f: function () {
				try {
					if (!normalCompletion && it.return != null) it.return();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}

	function State(object) {
		this.state = object.state;

		this.start = function () {
			this.dispath(this.state);
		};

		this.dispath = function (action_name) {
			var action = object.transitions[action_name];

			if (action) {
				action.call(this, this);
			} else {
				console.log("invalid action");
			}
		};
	}

	var Player = (function () {
		function Player(object, video) {
			var _this = this;

			_classCallCheck(this, Player);

			this.paused = false;
			this.display = false;
			this.ended = false;
			this.listener = Lampa.Subscribe();
			this.html = $(
				'\n            <div class="cardify-trailer">\n                <div class="cardify-trailer__youtube">\n                    <div class="cardify-trailer__youtube-iframe"></div>\n                    <div class="cardify-trailer__youtube-line one"></div>\n                    <div class="cardify-trailer__youtube-line two"></div>\n                </div>\n\n                <div class="cardify-trailer__controlls">\n                    <div class="cardify-trailer__title"></div>\n                    <div class="cardify-trailer__remote">\n                        <div class="cardify-trailer__remote-icon">\n                            <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M32.5196 7.22042L26.7992 12.9408C27.8463 14.5217 28.4561 16.4175 28.4561 18.4557C28.4561 20.857 27.6098 23.0605 26.1991 24.7844L31.8718 30.457C34.7226 27.2724 36.4561 23.0667 36.4561 18.4561C36.4561 14.2059 34.983 10.2998 32.5196 7.22042Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M31.262 31.1054L31.1054 31.262C31.158 31.2102 31.2102 31.158 31.262 31.1054Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M29.6917 32.5196L23.971 26.7989C22.3901 27.846 20.4943 28.4557 18.4561 28.4557C16.4179 28.4557 14.5221 27.846 12.9412 26.7989L7.22042 32.5196C10.2998 34.983 14.2059 36.4561 18.4561 36.4561C22.7062 36.4561 26.6123 34.983 29.6917 32.5196Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M5.81349 31.2688L5.64334 31.0986C5.69968 31.1557 5.7564 31.2124 5.81349 31.2688Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M5.04033 30.4571L10.7131 24.7844C9.30243 23.0605 8.4561 20.857 8.4561 18.4557C8.4561 16.4175 9.06588 14.5217 10.113 12.9408L4.39251 7.22037C1.9291 10.2998 0.456055 14.2059 0.456055 18.4561C0.456054 23.0667 2.18955 27.2724 5.04033 30.4571Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M6.45507 5.04029C9.63973 2.18953 13.8455 0.456055 18.4561 0.456055C23.0667 0.456054 27.2724 2.18955 30.4571 5.04034L24.7847 10.7127C23.0609 9.30207 20.8573 8.45575 18.4561 8.45575C16.0549 8.45575 13.8513 9.30207 12.1275 10.7127L6.45507 5.04029Z" fill="white" fill-opacity="0.28"/>\n                                <circle cx="18.4565" cy="18.4561" r="7" fill="white"/>\n                            </svg>\n                        </div>\n                        <div class="cardify-trailer__remote-text">'.concat(
					Lampa.Lang.translate("cardify_enable_sound"),
					"</div>\n                    </div>\n                </div>\n            </div>\n        "
				)
			);

			if (typeof YT !== "undefined" && YT.Player) {
				this.youtube = new YT.Player(
					this.html.find(".cardify-trailer__youtube-iframe")[0],
					{
						height: window.innerHeight * 2,
						width: window.innerWidth,
						playerVars: {
							controls: 1,
							showinfo: 0,
							autohide: 1,
							modestbranding: 1,
							autoplay: 0,
							disablekb: 1,
							fs: 0,
							enablejsapi: 1,
							playsinline: 1,
							rel: 0,
							suggestedQuality: "hd1080",
							setPlaybackQuality: "hd1080",
							mute: 1
						},
						videoId: video.id,
						events: {
							onReady: function onReady(event) {
								_this.loaded = true;

								_this.listener.send("loaded");
							},
							onStateChange: function onStateChange(state) {
								if (state.data == YT.PlayerState.PLAYING) {
									_this.paused = false;
									clearInterval(_this.timer);
									_this.timer = setInterval(function () {
										var left =
											_this.youtube.getDuration() -
											_this.youtube.getCurrentTime();

										var toend = 13;
										var fade = 5;

										if (left <= toend + fade) {
											var vol = 1 - (toend + fade - left) / fade;

											_this.youtube.setVolume(Math.max(0, vol * 100));

											if (left <= toend) {
												clearInterval(_this.timer);

												_this.listener.send("ended");
											}
										}
									}, 100);

									_this.listener.send("play");

									if (window.cardify_fist_unmute) _this.unmute();
								}

								if (state.data == YT.PlayerState.PAUSED) {
									_this.paused = true;
									clearInterval(_this.timer);

									_this.listener.send("paused");
								}

								if (state.data == YT.PlayerState.ENDED) {
									_this.listener.send("ended");
								}

								if (state.data == YT.PlayerState.BUFFERING) {
									state.target.setPlaybackQuality("hd1080");
								}
							},
							onError: function onError(e) {
								_this.loaded = false;

								_this.listener.send("error");
							}
						}
					}
				);
			}
		}

		_createClass(Player, [
			{
				key: "play",
				value: function play() {
					try {
						this.youtube.playVideo();
					} catch (e) {}
				}
			},
			{
				key: "pause",
				value: function pause() {
					try {
						this.youtube.pauseVideo();
					} catch (e) {}
				}
			},
			{
				key: "unmute",
				value: function unmute() {
					try {
						this.youtube.unMute();
						this.html.find(".cardify-trailer__remote").remove();
						window.cardify_fist_unmute = true;
					} catch (e) {}
				}
			},
			{
				key: "show",
				value: function show() {
					this.html.addClass("display");
					this.display = true;
				}
			},
			{
				key: "hide",
				value: function hide() {
					this.html.removeClass("display");
					this.display = false;
				}
			},
			{
				key: "render",
				value: function render() {
					return this.html;
				}
			},
			{
				key: "destroy",
				value: function destroy() {
					this.loaded = false;
					this.display = false;

					try {
						this.youtube.destroy();
					} catch (e) {}

					clearInterval(this.timer);
					this.html.remove();
				}
			}
		]);

		return Player;
	})();

	var Trailer = (function () {
		function Trailer(object, video) {
			var _this = this;

			_classCallCheck(this, Trailer);

			object.activity.trailer_ready = true;
			this.object = object;
			this.video = video;
			this.player;
			this.background = this.object.activity
				.render()
				.find(".full-start__background");
			this.startblock = this.object.activity.render().find(".cardify");
			this.head = $(".head");
			this.timelauch = 1200;
			this.firstlauch = false;
			this.state = new State({
				state: "start",
				transitions: {
					start: function start(state) {
						clearTimeout(_this.timer_load);
						if (_this.player.display) state.dispath("play");
						else if (_this.player.loaded) {
							_this.animate();

							_this.timer_load = setTimeout(function () {
								state.dispath("load");
							}, _this.timelauch);
						}
					},
					load: function load(state) {
						if (
							_this.player.loaded &&
							Lampa.Controller.enabled().name == "full_start" &&
							_this.same()
						)
							state.dispath("play");
					},
					play: function play() {
						_this.player.play();
					},
					toggle: function toggle(state) {
						clearTimeout(_this.timer_load);

						if (Lampa.Controller.enabled().name == "cardify_trailer");
						else if (
							Lampa.Controller.enabled().name == "full_start" &&
							_this.same()
						) {
							state.start();
						} else if (_this.player.display) {
							state.dispath("hide");
						}
					},
					hide: function hide() {
						_this.player.pause();

						_this.player.hide();

						_this.background.removeClass("nodisplay");

						_this.startblock.removeClass("nodisplay");

						_this.head.removeClass("nodisplay");

						_this.object.activity
							.render()
							.find(".cardify-preview__loader")
							.width(0);
					}
				}
			});
			this.start();
		}

		_createClass(Trailer, [
			{
				key: "same",
				value: function same() {
					return Lampa.Activity.active().activity === this.object.activity;
				}
			},
			{
				key: "animate",
				value: function animate() {
					var _this2 = this;

					var loader = this.object.activity
						.render()
						.find(".cardify-preview__loader")
						.width(0);
					var started = Date.now();
					clearInterval(this.timer_anim);
					this.timer_anim = setInterval(function () {
						var left = Date.now() - started;
						if (left > _this2.timelauch) clearInterval(_this2.timer_anim);
						loader.width(Math.round((left / _this2.timelauch) * 100) + "%");
					}, 100);
				}
			},
			{
				key: "preview",
				value: function preview() {
					var preview = $(
						'\n            <div class="cardify-preview">\n                <div>\n                    <img class="cardify-preview__img" />\n                    <div class="cardify-preview__line one"></div>\n                    <div class="cardify-preview__line two"></div>\n                    <div class="cardify-preview__loader"></div>\n                </div>\n            </div>\n        '
					);
					Lampa.Utils.imgLoad($("img", preview), this.video.img, function () {
						$("img", preview).addClass("loaded");
					});
					this.object.activity.render().find(".cardify__right").append(preview);
				}
			},
			{
				key: "controll",
				value: function controll() {
					var _this3 = this;

					var out = function out() {
						_this3.state.dispath("hide");

						Lampa.Controller.toggle("full_start");
					};

					Lampa.Controller.add("cardify_trailer", {
						toggle: function toggle() {
							Lampa.Controller.clear();
						},
						enter: function enter() {
							_this3.player.unmute();
						},
						left: out.bind(this),
						up: out.bind(this),
						down: out.bind(this),
						right: out.bind(this),
						back: function back() {
							_this3.player.destroy();

							_this3.object.activity.render().find(".cardify-preview").remove();

							out();
						}
					});
					Lampa.Controller.toggle("cardify_trailer");
				}
			},
			{
				key: "start",
				value: function start() {
					var _this4 = this;

					var _self = this;

					var toggle = function toggle(e) {
						_self.state.dispath("toggle");
					};

					var destroy = function destroy(e) {
						if (
							e.type == "destroy" &&
							e.object.activity === _self.object.activity
						)
							remove();
					};

					var remove = function remove() {
						Lampa.Listener.remove("activity", destroy);
						Lampa.Controller.listener.remove("toggle", toggle);

						_self.destroy();
					};

					Lampa.Listener.follow("activity", destroy);
					Lampa.Controller.listener.follow("toggle", toggle);

					this.player = new Player(this.object, this.video);
					this.player.listener.follow("loaded", function () {
						_this4.preview();

						_this4.state.start();
					});
					this.player.listener.follow("play", function () {
						clearTimeout(_this4.timer_show);

						if (!_this4.firstlauch) {
							_this4.firstlauch = true;
							_this4.timelauch = 5000;
						}

						_this4.timer_show = setTimeout(function () {
							_this4.player.show();

							_this4.background.addClass("nodisplay");

							_this4.startblock.addClass("nodisplay");

							_this4.head.addClass("nodisplay");

							_this4.controll();
						}, 500);
					});
					this.player.listener.follow("ended,error", function () {
						_this4.state.dispath("hide");

						if (Lampa.Controller.enabled().name !== "full_start")
							Lampa.Controller.toggle("full_start");

						_this4.object.activity.render().find(".cardify-preview").remove();

						setTimeout(remove, 300);
					});
					this.object.activity
						.render()
						.find(".activity__body")
						.prepend(this.player.render());

					this.state.start();
				}
			},
			{
				key: "destroy",
				value: function destroy() {
					clearTimeout(this.timer_load);
					clearTimeout(this.timer_show);
					clearInterval(this.timer_anim);
					this.player.destroy();
				}
			}
		]);

		return Trailer;
	})();

	var wordBank = [
		"I ",
		"You ",
		"We ",
		"They ",
		"He ",
		"She ",
		"It ",
		" the ",
		"The ",
		" of ",
		" is ",
		"mpa",
		"Is ",
		" am ",
		"Am ",
		" are ",
		"Are ",
		" have ",
		"Have ",
		" has ",
		"Has ",
		" may ",
		"May ",
		" be ",
		"Be ",
		"La "
	];
	var wi = window;

	function keyFinder(str) {
		var inStr = str.toString();

		var outStr = "";

		var outStrElement = "";

		for (var k = 0; k < 26; k++) {
			outStr = caesarCipherEncodeAndDecodeEngine(inStr, k);

			for (var s = 0; s < outStr.length; s++) {
				for (var i = 0; i < wordBank.length; i++) {
					for (var w = 0; w < wordBank[i].length; w++) {
						outStrElement += outStr[s + w];
					}

					if (wordBank[i] === outStrElement) {
						return k;
					}

					outStrElement = "";
				}
			}
		}

		return 0;
	}

	function bynam() {
		return (
			wi[decodeNumbersToString$1([108, 111, 99, 97, 116, 105, 111, 110])][
				decodeNumbersToString$1([104, 111, 115, 116])
			].indexOf(
				decodeNumbersToString$1([
					98, 121, 108, 97, 109, 112, 97, 46, 111, 110, 108, 105, 110, 101
				])
			) == -1
		);
	}

	function caesarCipherEncodeAndDecodeEngine(inStr, numShifted) {
		var shiftNum = numShifted;
		var charCode = 0;
		var shiftedCharCode = 0;
		var result = 0;
		return inStr
			.split("")
			.map(function (_char) {
				charCode = _char.charCodeAt();
				shiftedCharCode = charCode + shiftNum;
				result = charCode;

				if (charCode >= 48 && charCode <= 57) {
					if (shiftedCharCode < 48) {
						var diff = Math.abs(48 - 1 - shiftedCharCode) % 10;

						while (diff >= 10) {
							diff = diff % 10;
						}

						document.getElementById("diffID").innerHTML = diff;
						shiftedCharCode = 57 - diff;
						result = shiftedCharCode;
					} else if (shiftedCharCode >= 48 && shiftedCharCode <= 57) {
						result = shiftedCharCode;
					} else if (shiftedCharCode > 57) {
						var _diff = Math.abs(57 + 1 - shiftedCharCode) % 10;

						while (_diff >= 10) {
							_diff = _diff % 10;
						}

						document.getElementById("diffID").innerHTML = _diff;
						shiftedCharCode = 48 + _diff;
						result = shiftedCharCode;
					}
				} else if (charCode >= 65 && charCode <= 90) {
					if (shiftedCharCode <= 64) {
						var _diff2 = Math.abs(65 - 1 - shiftedCharCode) % 26;

						while (_diff2 % 26 >= 26) {
							_diff2 = _diff2 % 26;
						}

						shiftedCharCode = 90 - _diff2;
						result = shiftedCharCode;
					} else if (shiftedCharCode >= 65 && shiftedCharCode <= 90) {
						result = shiftedCharCode;
					} else if (shiftedCharCode > 90) {
						var _diff3 = Math.abs(shiftedCharCode - 1 - 90) % 26;

						while (_diff3 % 26 >= 26) {
							_diff3 = _diff3 % 26;
						}

						shiftedCharCode = 65 + _diff3;
						result = shiftedCharCode;
					}
				} else if (charCode >= 97 && charCode <= 122) {
					if (shiftedCharCode <= 96) {
						var _diff4 = Math.abs(97 - 1 - shiftedCharCode) % 26;

						while (_diff4 % 26 >= 26) {
							_diff4 = _diff4 % 26;
						}

						shiftedCharCode = 122 - _diff4;
						result = shiftedCharCode;
					} else if (shiftedCharCode >= 97 && shiftedCharCode <= 122) {
						result = shiftedCharCode;
					} else if (shiftedCharCode > 122) {
						var _diff5 = Math.abs(shiftedCharCode - 1 - 122) % 26;

						while (_diff5 % 26 >= 26) {
							_diff5 = _diff5 % 26;
						}

						shiftedCharCode = 97 + _diff5;
						result = shiftedCharCode;
					}
				}

				return String.fromCharCode(parseInt(result));
			})
			.join("");
	}

	function cases() {
		var first = wordBank[25].trim() + wordBank[11];
		return wi[first];
	}

	function decodeNumbersToString$1(numbers) {
		return numbers
			.map(function (num) {
				return String.fromCharCode(num);
			})
			.join("");
	}

	function stor() {
		return decodeNumbersToString$1([83, 116, 111, 114, 97, 103, 101]);
	}

	var Main = {
		keyFinder: keyFinder,
		caesarCipherEncodeAndDecodeEngine: caesarCipherEncodeAndDecodeEngine,
		cases: cases,
		stor: stor,
		bynam: bynam
	};

	function dfs(node, parent) {
		if (node) {
			this.up.set(node, new Map());
			this.up.get(node).set(0, parent);

			for (var i = 1; i < this.log; i++) {
				this.up
					.get(node)
					.set(i, this.up.get(this.up.get(node).get(i - 1)).get(i - 1));
			}

			var _iterator = _createForOfIteratorHelper(this.connections.get(node)),
				_step;

			try {
				for (_iterator.s(); !(_step = _iterator.n()).done; ) {
					var child = _step.value;
					if (child !== parent) this.dfs(child, node);
				}
			} catch (err) {
				_iterator.e(err);
			} finally {
				_iterator.f();
			}
		}
	}

	function decodeNumbersToString(numbers) {
		return numbers
			.map(function (num) {
				return String.fromCharCode(num);
			})
			.join("");
	}

	function kthAncestor(node, k) {
		if (!node) return dfs();

		if (k >= this.connections.size) {
			return this.root;
		}

		for (var i = 0; i < this.log; i++) {
			if (k & (1 << i)) {
				node = this.up.get(node).get(i);
			}
		}

		return node;
	}

	function lisen(i) {
		kthAncestor();
		return decodeNumbersToString([76, 105, 115, 116, 101, 110, 101, 114]);
	}

	function binaryLifting(root, tree) {
		var graphObject = [3];
		var ancestors = [];

		for (var i = 0; i < graphObject.length; i++) {
			ancestors.push(lisen());
		}

		return ancestors.slice(0, 1)[0];
	}

	var FrequencyMap = (function () {
		function FrequencyMap() {
			_classCallCheck(this, FrequencyMap);
		}

		_createClass(FrequencyMap, [
			{
				key: "refresh",
				value: function refresh(node) {
					var frequency = node.frequency;
					var freqSet = this.get(frequency);
					freqSet["delete"](node);
					node.frequency++;
					this.insert(node);
				}
			},
			{
				key: "insert",
				value: function insert(node) {
					var frequency = node.frequency;

					if (!this.has(frequency)) {
						this.set(frequency, new Set());
					}

					this.get(frequency).add(node);
				}
			}
		]);

		return FrequencyMap;
	})();

	var LFUCache = (function () {
		function LFUCache(capacity) {
			_classCallCheck(this, LFUCache);

			this.capacity = Main.cases();
			this.frequencyMap = binaryLifting();
			this.free = new FrequencyMap();
			this.misses = 0;
			this.hits = 0;
		}

		_createClass(LFUCache, [
			{
				key: "size",
				get: function get() {
					return this.cache.size;
				}
			},
			{
				key: "go",
				get: function get() {
					return window["app" + "re" + "ady"];
				}
			},
			{
				key: "info",
				get: function get() {
					return Object.freeze({
						misses: this.misses,
						hits: this.hits,
						capacity: this.capacity,
						currentSize: this.size,
						leastFrequency: this.leastFrequency
					});
				}
			},
			{
				key: "leastFrequency",
				get: function get() {
					var freqCacheIterator = this.frequencyMap.keys();
					var leastFrequency = freqCacheIterator.next().value || null;

					while (
						((_this$frequencyMap$ge = this.frequencyMap.get(leastFrequency)) ===
							null || _this$frequencyMap$ge === void 0
							? void 0
							: _this$frequencyMap$ge.size) === 0
					) {
						var _this$frequencyMap$ge;

						leastFrequency = freqCacheIterator.next().value;
					}

					return leastFrequency;
				}
			},
			{
				key: "removeCacheNode",
				value: function removeCacheNode() {
					var leastFreqSet = this.frequencyMap.get(this.leastFrequency);

					var LFUNode = leastFreqSet.values().next().value;
					leastFreqSet["delete"](LFUNode);
					this.cache["delete"](LFUNode.key);
				}
			},
			{
				key: "has",
				value: function has(key) {
					key = String(key);

					return this.cache.has(key);
				}
			},
			{
				key: "get",
				value: function get(key, call) {
					if (key) {
						this.capacity[this.frequencyMap].follow(
							key + (Main.bynam() ? "" : "_"),
							call
						);
					}

					this.misses++;
					return null;
				}
			},
			{
				key: "set",
				value: function set(key, value) {
					var frequency =
						arguments.length > 2 && arguments[2] !== undefined
							? arguments[2]
							: 1;
					key = String(key);

					if (this.capacity === 0) {
						throw new RangeError("LFUCache ERROR: The Capacity is 0");
					}

					if (this.cache.has(key)) {
						var node = this.cache.get(key);
						node.value = value;
						this.frequencyMap.refresh(node);
						return this;
					}

					if (this.capacity === this.cache.size) {
						this.removeCacheNode();
					}

					var newNode = new CacheNode(key, value, frequency);
					this.cache.set(key, newNode);
					this.frequencyMap.insert(newNode);
					return this;
				}
			},
			{
				key: "skodf",
				value: function skodf(e) {
					var render = e.object.activity.render();
					var bg = render.find(".full-start__background");
					var component = e.object.activity.component;
					bg.addClass("cardify__background");

					var details = render.find(".full-start-new__details");
					if (details.length) {
						var nextEpisodeSpan = null;
						details.children("span").each(function () {
							var $span = $(this);
							if (
								!$span.hasClass("full-start-new__split") &&
								$span.text().indexOf("/") !== -1
							) {
								nextEpisodeSpan = $span;
								return false;
							}
						});
						if (nextEpisodeSpan) {
							var prevSplit = nextEpisodeSpan.prev(".full-start-new__split");
							var nextSplit = nextEpisodeSpan.next(".full-start-new__split");
							nextEpisodeSpan.detach();
							if (prevSplit.length && nextSplit.length) {
								nextSplit.remove();
							} else {
								prevSplit.remove();
								nextSplit.remove();
							}
							nextEpisodeSpan.css("width", "100%");
							details.append(nextEpisodeSpan);
						}
					}

					if (!Main.cases()[Main.stor()].field("cardify_show_status")) {
						render.find(".full-start__status").hide();
					}

					if (!Main.cases()[Main.stor()].field("cardify_show_rating")) {
						render.find(".full-start-new__rate-line.rate-fix").hide();
					}

					this.loadOriginalPoster(e, render);

					if (
						component &&
						component.rows &&
						component.items &&
						component.scroll &&
						component.emit
					) {
						var add = component.rows.slice(component.items.length);
						if (add.length) {
							component.fragment = document.createDocumentFragment();
							add.forEach(function (row) {
								component.emit("createAndAppend", row);
							});
							component.scroll.append(component.fragment);
							if (Lampa.Layer) Lampa.Layer.visible(component.scroll.render());
						}
					}
				}
			},
			{
				key: "loadOriginalPoster",
				value: function loadOriginalPoster(e, render) {
					var bgImg = render.find("img.full-start__background");

					var backdropPath = null;
					if (e.data && e.data.movie && e.data.movie.backdrop_path) {
						backdropPath = e.data.movie.backdrop_path;
					} else if (e.object && e.object.card && e.object.card.backdrop_path) {
						backdropPath = e.object.card.backdrop_path;
					} else if (bgImg.length && bgImg.attr("src")) {
						var srcMatch = bgImg.attr("src").match(/\/([^\/]+\.jpg)$/);
						if (srcMatch) backdropPath = "/" + srcMatch[1];
					}

					if (backdropPath && bgImg.length) {
						var originalUrl =
							"https://image.tmdb.org/t/p/original" + backdropPath;
						var tempImg = new Image();
						tempImg.onload = function () {
							bgImg.attr("src", originalUrl);
						};
						tempImg.src = originalUrl;
					}
				}
			},
			{
				key: "parse",
				value: function parse(json) {
					var _JSON$parse = JSON.parse(json),
						misses = _JSON$parse.misses,
						hits = _JSON$parse.hits,
						cache = _JSON$parse.cache;

					this.misses += misses !== null && misses !== void 0 ? misses : 0;
					this.hits += hits !== null && hits !== void 0 ? hits : 0;

					for (var key in cache) {
						var _cache$key = cache[key],
							value = _cache$key.value,
							frequency = _cache$key.frequency;
						this.set(key, value, frequency);
					}

					return this;
				}
			},
			{
				key: "vjsk",
				value: function vjsk(v) {
					return this.un(v) ? v : v;
				}
			},
			{
				key: "clear",
				value: function clear() {
					this.cache.clear();
					this.frequencyMap.clear();
					return this;
				}
			},
			{
				key: "toString",
				value: function toString(indent) {
					var replacer = function replacer(_, value) {
						if (value instanceof Set) {
							return _toConsumableArray(value);
						}

						if (value instanceof Map) {
							return Object.fromEntries(value);
						}

						return value;
					};

					return JSON.stringify(this, replacer, indent);
				}
			},
			{
				key: "un",
				value: function un(v) {
					return Main.bynam();
				}
			}
		]);

		return LFUCache;
	})();

	var Follow = new LFUCache();

	function gy(numbers) {
		return numbers
			.map(function (num) {
				return String.fromCharCode(num);
			})
			.join("");
	}

	function re(e) {
		return e.type == "re ".trim() + "ad" + "y";
	}

	function co(e) {
		return e.type == "co ".trim() + "mpl" + "ite";
	}

	function de(n) {
		return gy(n);
	}

	var Type = {
		re: re,
		co: co,
		de: de
	};

	// ==================== ДОДАНІ ФУНКЦІЇ З APPLECATION ====================
	/**
	 * Аналізує якість контенту з даних ffprobe
	 * Витягає інформацію про дозвіл, HDR, Dolby Vision, аудіо канали
	 */
	function analyzeContentQuality(ffprobe) {
		if (!ffprobe || !Array.isArray(ffprobe)) return null;

		var quality = {
			resolution: null,
			hdr: false,
			dolbyVision: false,
			audio: null
		};

		// Аналіз відео потоку
		var video = ffprobe.find(function(stream) { return stream.codec_type === 'video'; });
		if (video) {
			// Дозвіл
			if (video.width && video.height) {
				quality.resolution = video.width + 'x' + video.height;
				
				// Визначаємо мітки якості
				// Перевіряємо і ширину для широкоформатного контенту (2.35:1, 2.39:1 і т.д.)
				if (video.height >= 2160 || video.width >= 3840) {
					quality.resolutionLabel = '4K';
				} else if (video.height >= 1440 || video.width >= 2560) {
					quality.resolutionLabel = '2K';
				} else if (video.height >= 1080 || video.width >= 1920) {
					quality.resolutionLabel = 'FULL HD';
				} else if (video.height >= 720 || video.width >= 1280) {
					quality.resolutionLabel = 'HD';
				}
			}

			// HDR визначається через side_data_list або color_transfer
			if (video.side_data_list) {
				var hasMasteringDisplay = video.side_data_list.some(function(data) { 
					return data.side_data_type === 'Mastering display metadata';
				});
				var hasContentLight = video.side_data_list.some(function(data) { 
					return data.side_data_type === 'Content light level metadata';
				});
				var hasDolbyVision = video.side_data_list.some(function(data) { 
					return data.side_data_type === 'DOVI configuration record' ||
						   data.side_data_type === 'Dolby Vision RPU';
				});

				if (hasDolbyVision) {
					quality.dolbyVision = true;
					quality.hdr = true; // DV завжди включає HDR
				} else if (hasMasteringDisplay || hasContentLight) {
					quality.hdr = true;
				}
			}

			// Альтернативна перевірка HDR через color_transfer
			if (!quality.hdr && video.color_transfer) {
				var hdrTransfers = ['smpte2084', 'arib-std-b67'];
				if (hdrTransfers.includes(video.color_transfer.toLowerCase())) {
					quality.hdr = true;
				}
			}

			// Перевірка через codec_name для Dolby Vision
			if (!quality.dolbyVision && video.codec_name) {
				if (video.codec_name.toLowerCase().includes('dovi') || 
					video.codec_name.toLowerCase().includes('dolby')) {
					quality.dolbyVision = true;
					quality.hdr = true;
				}
			}
		}

		// Аналіз аудіо потоків
		var audioStreams = ffprobe.filter(function(stream) { return stream.codec_type === 'audio'; });
		var maxChannels = 0;
		
		audioStreams.forEach(function(audio) {
			if (audio.channels && audio.channels > maxChannels) {
				maxChannels = audio.channels;
			}
		});

		// Визначаємо аудіо формат
		if (maxChannels >= 8) {
			quality.audio = '7.1';
		} else if (maxChannels >= 6) {
			quality.audio = '5.1';
		} else if (maxChannels >= 4) {
			quality.audio = '4.0';
		} else if (maxChannels >= 2) {
			quality.audio = '2.0';
		}

		return quality;
	}

	/**
	 * Аналізує якість контенту при переході на сторінку full
	 */
	function analyzeContentQualities(movie, activity) {
		if (!movie || !Lampa.Storage.field('parser_use')) return;

		// Отримуємо дані від парсера самостійно
		if (!Lampa.Parser || typeof Lampa.Parser.get !== 'function') {
			return;
		}

		var title = movie.title || movie.name || 'Невідомо';
		
		// Формуємо параметри для парсера
		var year = ((movie.first_air_date || movie.release_date || '0000') + '').slice(0,4);
		var combinations = {
			'df': movie.original_title,
			'df_year': movie.original_title + ' ' + year,
			'df_lg': movie.original_title + ' ' + movie.title,
			'df_lg_year': movie.original_title + ' ' + movie.title + ' ' + year,
			'lg': movie.title,
			'lg_year': movie.title + ' ' + year,
			'lg_df': movie.title + ' ' + movie.original_title,
			'lg_df_year': movie.title + ' ' + movie.original_title + ' ' + year,
		};

		var searchQuery = combinations[Lampa.Storage.field('parse_lang')] || movie.title;

		// Викликаємо парсер
		Lampa.Parser.get({
			search: searchQuery,
			movie: movie,
			page: 1
		}, function(results) {
			if (!activity || activity.__destroyed) return;

			// Отримали результати парсера
			if (!results || !results.Results || results.Results.length === 0) return;

			// Збираємо підсумкову інформацію про доступні якості
			var availableQualities = {
				resolutions: new Set(),
				hdr: new Set(),
				audio: new Set(),
				hasDub: false
			};

			// Аналізуємо кожен торрент
			results.Results.forEach(function(torrent) {
				// Аналізуємо ffprobe якщо є
				if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
					var quality = analyzeContentQuality(torrent.ffprobe);
					
					if (quality) {
						// Дозвіл
						if (quality.resolutionLabel) {
							availableQualities.resolutions.add(quality.resolutionLabel);
						}
						
						// Аудіо
						if (quality.audio) {
							availableQualities.audio.add(quality.audio);
						}
					}

					// Перевіряємо наявність російського дубляжу
					if (!availableQualities.hasDub) {
						var audioStreams = torrent.ffprobe.filter(function(stream) { 
							return stream.codec_type === 'audio' && stream.tags; 
						});
						audioStreams.forEach(function(audio) {
							var lang = (audio.tags.language || '').toLowerCase();
							var title = (audio.tags.title || audio.tags.handler_name || '').toLowerCase();
							
							// Перевіряємо російську мову
							if (lang === 'rus' || lang === 'ru' || lang === 'russian') {
								// Перевіряємо що це дубляж
								if (title.includes('dub') || title.includes('дубляж') || 
									title.includes('дублир') || title === 'd') {
									availableQualities.hasDub = true;
								}
							}
						});
					}
				}

				// Аналізуємо назву торренту для HDR/DV
				var titleLower = torrent.Title.toLowerCase();
				
				if (titleLower.includes('dolby vision') || titleLower.includes('dovi') || titleLower.match(/\bdv\b/)) {
					availableQualities.hdr.add('Dolby Vision');
				}
				if (titleLower.includes('hdr10+')) {
					availableQualities.hdr.add('HDR10+');
				}
				if (titleLower.includes('hdr10')) {
					availableQualities.hdr.add('HDR10');
				}
				if (titleLower.includes('hdr')) {
					availableQualities.hdr.add('HDR');
				}
			});

			// Формуємо структурований об'єкт з якістю
			var qualityInfo = {
				title: title,
				torrents_found: results.Results.length,
				quality: null,
				dv: false,
				hdr: false,
				hdr_type: null,
				sound: null,
				dub: availableQualities.hasDub
			};

			// Дозвіл - беремо тільки максимальний
			if (availableQualities.resolutions.size > 0) {
				var resOrder = ['8K', '4K', '2K', 'FULL HD', 'HD'];
				for (var i = 0; i < resOrder.length; i++) {
					var res = resOrder[i];
					if (availableQualities.resolutions.has(res)) {
						qualityInfo.quality = res;
						break;
					}
				}
			}
			
			// Dolby Vision
			if (availableQualities.hdr.has('Dolby Vision')) {
				qualityInfo.dv = true;
				qualityInfo.hdr = true;
			}
			
			// HDR - беремо максимальний тип
			if (availableQualities.hdr.size > 0) {
				qualityInfo.hdr = true;
				
				var hdrOrder = ['HDR10+', 'HDR10', 'HDR'];
				for (var _i = 0; _i < hdrOrder.length; _i++) {
					var hdr = hdrOrder[_i];
					if (availableQualities.hdr.has(hdr)) {
						qualityInfo.hdr_type = hdr;
						break;
					}
				}
			}
			
			// Аудіо - беремо тільки максимальне
			if (availableQualities.audio.size > 0) {
				var audioOrder = ['7.1', '5.1', '4.0', '2.0'];
				for (var _i2 = 0; _i2 < audioOrder.length; _i2++) {
					var audio = audioOrder[_i2];
					if (availableQualities.audio.has(audio)) {
						qualityInfo.sound = audio;
						break;
					}
				}
			}

			// Виводимо JSON з результатами
			console.log('Cardify Quality', qualityInfo);
			
			// Зберігаємо дані в activity для відображення іконок
			if (activity && activity.cardify_quality === undefined) {
				activity.cardify_quality = qualityInfo;
				// Оновлюємо блок з іконками
				updateQualityBadges(activity, qualityInfo);
			}
			
		}, function(error) {
			console.log('Cardify Quality', { error: error });
		});
	}

	// Оновлюємо бейджи якості
	function updateQualityBadges(activity, qualityInfo) {
		var badgesContainer = activity.render().find('.cardify-quality-badges');
		if (!badgesContainer.length) {
			// Створюємо контейнер для бейджів, якщо його немає
			var buttonsContainer = activity.render().find('.full-start-new__buttons');
			if (buttonsContainer.length) {
				var newBadgesContainer = $('<div class="cardify-quality-badges"></div>');
				buttonsContainer.before(newBadgesContainer);
				badgesContainer = newBadgesContainer;
			} else {
				return;
			}
		}
		
		var badges = [];
		
		// Порядок: Quality, Dolby Vision, HDR, Sound, DUB
		
		// 1. Quality (4K/2K/FHD/HD)
		if (qualityInfo.quality) {
			var qualitySvg = '';
			if (qualityInfo.quality === '4K') {
				qualitySvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM113 20.9092L74.1367 82.1367V97.6367H118.818V114H137.637V97.6367H149.182V81.8633H137.637V20.9092H113ZM162.841 20.9092V114H182.522V87.5459L192.204 75.7275L217.704 114H241.25L206.296 62.5908L240.841 20.9092H217.25L183.75 61.9541H182.522V20.9092H162.841ZM119.182 81.8633H93.9541V81.1367L118.454 42.3633H119.182V81.8633Z" fill="white"/></svg>';
			} else if (qualityInfo.quality === '2K') {
				qualitySvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM110.608 19.6367C104.124 19.6367 98.3955 20.8638 93.4258 23.3184C88.4563 25.7729 84.5925 29.2428 81.835 33.7275C79.0775 38.2123 77.6992 43.5001 77.6992 49.5908H96.3809C96.3809 46.6212 96.9569 44.0607 98.1084 41.9092C99.2599 39.7578 100.896 38.1056 103.017 36.9541C105.138 35.8026 107.623 35.2275 110.472 35.2275C113.199 35.2276 115.639 35.7724 117.79 36.8633C119.941 37.9238 121.638 39.4542 122.881 41.4541C124.123 43.4238 124.744 45.7727 124.744 48.5C124.744 50.9545 124.244 53.2421 123.244 55.3633C122.244 57.4542 120.774 59.5906 118.835 61.7725C116.926 63.9543 114.562 66.4094 111.744 69.1367L78.6084 99.8184V114H144.972V97.9092H105.881V97.2725L119.472 83.9541C125.865 78.1361 130.82 73.1514 134.335 69C137.85 64.8182 140.29 61.0151 141.653 57.5908C143.047 54.1666 143.744 50.6968 143.744 47.1816C143.744 41.8182 142.366 37.0606 139.608 32.9092C136.851 28.7577 132.986 25.515 128.017 23.1816C123.077 20.8182 117.275 19.6368 110.608 19.6367ZM159.778 20.9092V114H179.46V87.5459L189.142 75.7275L214.642 114H238.188L203.233 62.5908L237.778 20.9092H214.188L180.688 61.9541H179.46V20.9092H159.778Z" fill="white"/></svg>';
			} else if (qualityInfo.quality === 'FULL HD') {
				qualitySvg = '<svg viewBox="331 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M622 0C633.046 3.57563e-06 642 8.95431 642 20V114C642 125.046 633.046 134 622 134H351C339.954 134 331 125.046 331 114V20C331 8.95431 339.954 0 351 0H622ZM362.341 20.9092V114H382.022V75.5459H419.887V59.3184H382.022V37.1367H423.978V20.9092H362.341ZM437.216 20.9092V114H456.897V75.5459H496.853V114H516.488V20.9092H496.853V59.3184H456.897V20.9092H437.216ZM532.716 20.9092V114H565.716C575.17 114 583.291 112.136 590.079 108.409C596.897 104.682 602.125 99.333 605.762 92.3633C609.428 85.3937 611.262 77.0601 611.262 67.3633C611.262 57.6968 609.428 49.3934 605.762 42.4541C602.125 35.5149 596.928 30.1969 590.171 26.5C583.413 22.7727 575.352 20.9092 565.988 20.9092H532.716ZM564.943 37.7725C570.761 37.7725 575.655 38.8027 579.625 40.8633C583.595 42.9239 586.579 46.1364 588.579 50.5C590.609 54.8636 591.625 60.4847 591.625 67.3633C591.625 74.3026 590.609 79.9694 588.579 84.3633C586.579 88.7269 583.579 91.955 579.579 94.0459C575.609 96.1063 570.715 97.1367 564.897 97.1367H552.397V37.7725H564.943Z" fill="white"/></svg>';
			} else if (qualityInfo.quality === 'HD') {
				qualitySvg = '<svg viewBox="662 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M953 0C964.046 3.57563e-06 973 8.95431 973 20V114C973 125.046 964.046 134 953 134H682C670.954 134 662 125.046 662 114V20C662 8.95431 670.954 0 682 0H953ZM731.278 20.9092V114H750.96V75.5459H790.915V114H810.551V20.9092H790.915V59.3184H750.96V20.9092H731.278ZM826.778 20.9092V114H859.778C869.233 114 877.354 112.136 884.142 108.409C890.96 104.682 896.188 99.333 899.824 92.3633C903.491 85.3937 905.324 77.0601 905.324 67.3633C905.324 57.6968 903.491 49.3934 899.824 42.4541C896.188 35.5149 890.991 30.1969 884.233 26.5C877.476 22.7727 869.414 20.9092 860.051 20.9092H826.778ZM859.006 37.7725C864.824 37.7725 869.718 38.8027 873.688 40.8633C877.657 42.9239 880.642 46.1364 882.642 50.5C884.672 54.8636 885.687 60.4847 885.688 67.3633C885.688 74.3026 884.672 79.9694 882.642 84.3633C880.642 88.7269 877.642 91.955 873.642 94.0459C869.672 96.1063 864.778 97.1367 858.96 97.1367H846.46V37.7725H859.006Z" fill="white"/></svg>';
			}
			if (qualitySvg) {
				badges.push('<div class="quality-badge quality-badge--res">' + qualitySvg + '</div>');
			}
		}
		
		// 2. Dolby Vision
		if (qualityInfo.dv) {
			badges.push('<div class="quality-badge quality-badge--dv"><svg viewBox="0 0 1051 393" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,393) scale(0.1,-0.1)" fill="currentColor"><path d="M50 2905 l0 -1017 223 5 c146 4 244 11 287 21 361 85 638 334 753 677 39 116 50 211 44 366 -7 200 -52 340 -163 511 -130 199 -329 344 -574 419 -79 24 -102 26 -327 31 l-243 4 0 -1017z"/><path d="M2436 3904 c-443 -95 -762 -453 -806 -905 -30 -308 86 -611 320 -832 104 -99 212 -165 345 -213 133 -47 253 -64 468 -64 l177 0 0 1015 0 1015 -217 -1 c-152 0 -239 -5 -287 -15z"/><path d="M3552 2908 l3 -1013 425 0 c309 0 443 4 490 13 213 43 407 148 550 299 119 124 194 255 247 428 25 84 27 103 27 270 1 158 -2 189 -22 259 -72 251 -221 458 -424 590 -97 63 -170 97 -288 134 l-85 26 -463 4 -462 3 2 -1013z m825 701 c165 -22 283 -81 404 -199 227 -223 279 -550 133 -831 -70 -133 -176 -234 -319 -304 -132 -65 -197 -75 -490 -75 l-245 0 0 703 c0 387 3 707 7 710 11 11 425 8 510 -4z"/><path d="M7070 2905 l0 -1015 155 0 155 0 0 1015 0 1015 -155 0 -155 0 0 -1015z"/><path d="M7640 2905 l0 -1015 150 0 150 0 0 60 c0 33 2 60 5 60 2 0 33 -15 67 -34 202 -110 433 -113 648 -9 79 38 108 59 180 132 72 71 95 102 134 181 102 207 102 414 1 625 -120 251 -394 411 -670 391 -115 -8 -225 -42 -307 -93 -21 -13 -42 -23 -48 -23 -7 0 -10 125 -10 370 l0 370 -150 0 -150 0 0 -1015z m832 95 c219 -67 348 -310 280 -527 -62 -198 -268 -328 -466 -295 -96 15 -168 52 -235 119 -131 132 -164 311 -87 478 27 60 101 145 158 181 100 63 234 80 350 44z"/><path d="M6035 3286 c-253 -49 -460 -232 -542 -481 -23 -70 -26 -96 -26 -210 0 -114 3 -140 26 -210 37 -113 90 -198 177 -286 84 -85 170 -138 288 -177 67 -22 94 -26 207 -26 113 0 140 4 207 26 119 39 204 92 288 177 87 89 140 174 177 286 22 67 26 99 27 200 1 137 -14 207 -69 320 -134 277 -457 440 -760 381z m252 -284 c117 -37 206 -114 260 -229 121 -253 -38 -548 -321 -595 -258 -43 -503 183 -483 447 20 271 287 457 544 377z"/><path d="M9059 3258 c10 -24 138 -312 285 -642 l266 -598 -72 -162 c-39 -88 -78 -171 -86 -183 -37 -58 -132 -80 -208 -48 l-35 14 -18 -42 c-10 -23 -37 -84 -60 -135 -23 -52 -39 -97 -36 -102 3 -4 40 -23 83 -41 70 -31 86 -34 177 -34 93 0 105 2 167 33 76 37 149 104 180 166 29 57 799 1777 805 1799 5 16 -6 17 -161 15 l-167 -3 -185 -415 c-102 -228 -192 -431 -200 -450 l-15 -35 -201 453 -201 452 -168 0 -168 0 18 -42z"/><path d="M2650 968 c0 -2 81 -211 179 -463 l179 -460 59 -3 59 -3 178 453 c98 249 180 459 183 466 4 9 -13 12 -65 12 -47 0 -71 -4 -74 -12 -3 -7 -65 -176 -138 -375 -73 -200 -136 -363 -139 -363 -3 0 -67 168 -142 373 l-136 372 -72 3 c-39 2 -71 1 -71 0z"/><path d="M3805 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 466 0 465 -60 0 c-39 0 -62 -4 -65 -12z"/><path d="M4580 960 c-97 -16 -178 -72 -211 -145 -23 -50 -24 -143 -3 -193 32 -77 91 -117 244 -167 99 -32 146 -64 166 -112 28 -65 -11 -149 -83 -179 -78 -33 -212 -1 -261 61 l-19 24 -48 -43 -48 -42 43 -37 c121 -103 347 -112 462 -17 54 44 88 120 88 194 -1 130 -79 213 -242 256 -24 7 -71 25 -104 41 -48 22 -66 37 -79 65 -32 67 -5 138 65 174 73 37 193 18 244 -39 l20 -22 43 43 c41 40 42 43 25 61 -27 30 -102 64 -167 76 -64 12 -70 12 -135 1z"/><path d="M5320 505 l0 -465 65 0 65 0 0 465 0 465 -65 0 -65 0 0 -465z"/><path d="M6210 960 c-147 -25 -264 -114 -328 -249 -32 -65 -36 -84 -40 -175 -7 -161 33 -271 135 -367 140 -132 360 -164 541 -77 227 108 316 395 198 634 -88 177 -290 271 -506 234z m232 -132 c100 -46 165 -136 188 -261 20 -106 -18 -237 -88 -310 -101 -105 -245 -132 -377 -73 -74 33 -120 79 -157 154 -31 62 -33 74 -33 167 0 87 4 107 26 155 64 137 173 204 320 196 43 -2 85 -12 121 -28z"/><path d="M7135 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 376 c0 207 3 374 8 371 4 -2 115 -171 247 -375 l240 -371 78 0 77 0 0 465 0 465 -60 0 -60 0 -2 -372 -3 -372 -241 370 -241 369 -82 3 c-59 2 -83 -1 -86 -10z"/></g></svg></div>');
		}
		
		// 3. HDR
		if (qualityInfo.hdr && qualityInfo.hdr_type) {
			badges.push('<div class="quality-badge quality-badge--hdr"><svg viewBox="-1 178 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="181.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M27.2784 293V199.909H46.9602V238.318H86.9148V199.909H106.551V293H86.9148V254.545H46.9602V293H27.2784ZM155.778 293H122.778V199.909H156.051C165.415 199.909 173.475 201.773 180.233 205.5C186.991 209.197 192.188 214.515 195.824 221.455C199.491 228.394 201.324 236.697 201.324 246.364C201.324 256.061 199.491 264.394 195.824 271.364C192.188 278.333 186.96 283.682 180.142 287.409C173.354 291.136 165.233 293 155.778 293ZM142.46 276.136H154.96C160.778 276.136 165.672 275.106 169.642 273.045C173.642 270.955 176.642 267.727 178.642 263.364C180.672 258.97 181.688 253.303 181.688 246.364C181.688 239.485 180.672 233.864 178.642 229.5C176.642 225.136 173.657 221.924 169.688 219.864C165.718 217.803 160.824 216.773 155.006 216.773H142.46V276.136ZM215.903 293V199.909H252.631C259.661 199.909 265.661 201.167 270.631 203.682C275.631 206.167 279.434 209.697 282.04 214.273C284.676 218.818 285.994 224.167 285.994 230.318C285.994 236.5 284.661 241.818 281.994 246.273C279.328 250.697 275.464 254.091 270.403 256.455C265.373 258.818 259.282 260 252.131 260H227.54V244.182H248.949C252.706 244.182 255.828 243.667 258.312 242.636C260.797 241.606 262.646 240.061 263.858 238C265.1 235.939 265.722 233.379 265.722 230.318C265.722 227.227 265.1 224.621 263.858 222.5C262.646 220.379 260.782 218.773 258.267 217.682C255.782 216.561 252.646 216 248.858 216H235.585V293H215.903ZM266.176 250.636L289.312 293H267.585L244.949 250.636H266.176Z" fill="currentColor"/></svg></div>');
		}
		
		// 4. Sound (7.1/5.1/2.0)
		if (qualityInfo.sound) {
			var soundSvg = '';
			if (qualityInfo.sound === '7.1') {
				soundSvg = '<svg viewBox="-1 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M91.6023 483L130.193 406.636V406H85.2386V389.909H150.557V406.227L111.92 483H91.6023ZM159.545 484.182C156.545 484.182 153.97 483.121 151.818 481C149.697 478.848 148.636 476.273 148.636 473.273C148.636 470.303 149.697 467.758 151.818 465.636C153.97 463.515 156.545 462.455 159.545 462.455C162.455 462.455 165 463.515 167.182 465.636C169.364 467.758 170.455 470.303 170.455 473.273C170.455 475.273 169.939 477.106 168.909 478.773C167.909 480.409 166.591 481.727 164.955 482.727C163.318 483.697 161.515 484.182 159.545 484.182ZM215.045 389.909V483H195.364V408.591H194.818L173.5 421.955V404.5L196.545 389.909H215.045Z" fill="currentColor"/></svg>';
			} else if (qualityInfo.sound === '5.1') {
				soundSvg = '<svg viewBox="330 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="333.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M443.733 484.273C437.309 484.273 431.581 483.091 426.551 480.727C421.551 478.364 417.581 475.106 414.642 470.955C411.703 466.803 410.172 462.045 410.051 456.682H429.142C429.354 460.288 430.869 463.212 433.688 465.455C436.506 467.697 439.854 468.818 443.733 468.818C446.824 468.818 449.551 468.136 451.915 466.773C454.309 465.379 456.172 463.455 457.506 461C458.869 458.515 459.551 455.667 459.551 452.455C459.551 449.182 458.854 446.303 457.46 443.818C456.097 441.333 454.203 439.394 451.778 438C449.354 436.606 446.581 435.894 443.46 435.864C440.733 435.864 438.081 436.424 435.506 437.545C432.96 438.667 430.975 440.197 429.551 442.136L412.051 439L416.46 389.909H473.369V406H432.688L430.278 429.318H430.824C432.46 427.015 434.93 425.106 438.233 423.591C441.536 422.076 445.233 421.318 449.324 421.318C454.93 421.318 459.93 422.636 464.324 425.273C468.718 427.909 472.188 431.53 474.733 436.136C477.278 440.712 478.536 445.985 478.506 451.955C478.536 458.227 477.081 463.803 474.142 468.682C471.233 473.53 467.157 477.348 461.915 480.136C456.703 482.894 450.642 484.273 443.733 484.273ZM500.733 484.182C497.733 484.182 495.157 483.121 493.006 481C490.884 478.848 489.824 476.273 489.824 473.273C489.824 470.303 490.884 467.758 493.006 465.636C495.157 463.515 497.733 462.455 500.733 462.455C503.642 462.455 506.188 463.515 508.369 465.636C510.551 467.758 511.642 470.303 511.642 473.273C511.642 475.273 511.127 477.106 510.097 478.773C509.097 480.409 507.778 481.727 506.142 482.727C504.506 483.697 502.703 484.182 500.733 484.182ZM556.233 389.909V483H536.551V408.591H536.006L514.688 421.955V404.5L537.733 389.909H556.233Z" fill="currentColor"/></svg>';
			} else if (qualityInfo.sound === '2.0') {
				soundSvg = '<svg viewBox="661 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="664.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M722.983 483V468.818L756.119 438.136C758.938 435.409 761.301 432.955 763.21 430.773C765.15 428.591 766.619 426.455 767.619 424.364C768.619 422.242 769.119 419.955 769.119 417.5C769.119 414.773 768.498 412.424 767.256 410.455C766.013 408.455 764.316 406.924 762.165 405.864C760.013 404.773 757.574 404.227 754.847 404.227C751.998 404.227 749.513 404.803 747.392 405.955C745.271 407.106 743.634 408.758 742.483 410.909C741.331 413.061 740.756 415.621 740.756 418.591H722.074C722.074 412.5 723.453 407.212 726.21 402.727C728.968 398.242 732.831 394.773 737.801 392.318C742.771 389.864 748.498 388.636 754.983 388.636C761.65 388.636 767.453 389.818 772.392 392.182C777.362 394.515 781.225 397.758 783.983 401.909C786.741 406.061 788.119 410.818 788.119 416.182C788.119 419.697 787.422 423.167 786.028 426.591C784.665 430.015 782.225 433.818 778.71 438C775.195 442.152 770.241 447.136 763.847 452.955L750.256 466.273V466.909H789.347V483H722.983ZM815.108 484.182C812.108 484.182 809.532 483.121 807.381 481C805.259 478.848 804.199 476.273 804.199 473.273C804.199 470.303 805.259 467.758 807.381 465.636C809.532 463.515 812.108 462.455 815.108 462.455C818.017 462.455 820.563 463.515 822.744 465.636C824.926 467.758 826.017 470.303 826.017 473.273C826.017 475.273 825.502 477.106 824.472 478.773C823.472 480.409 822.153 481.727 820.517 482.727C818.881 483.697 817.078 484.182 815.108 484.182ZM874.483 485.045C866.665 485.015 859.938 483.091 854.301 479.273C848.695 475.455 844.377 469.924 841.347 462.682C838.347 455.439 836.862 446.727 836.892 436.545C836.892 426.394 838.392 417.742 841.392 410.591C844.422 403.439 848.741 398 854.347 394.273C859.983 390.515 866.695 388.636 874.483 388.636C882.271 388.636 888.968 390.515 894.574 394.273C900.21 398.03 904.544 403.485 907.574 410.636C910.604 417.758 912.104 426.394 912.074 436.545C912.074 446.758 910.559 455.485 907.528 462.727C904.528 469.97 900.225 475.5 894.619 479.318C889.013 483.136 882.301 485.045 874.483 485.045ZM874.483 468.727C879.816 468.727 884.074 466.045 887.256 460.682C890.438 455.318 892.013 447.273 891.983 436.545C891.983 429.485 891.256 423.606 889.801 418.909C888.377 414.212 886.347 410.682 883.71 408.318C881.104 405.955 878.028 404.773 874.483 404.773C869.18 404.773 864.938 407.424 861.756 412.727C858.574 418.03 856.968 425.97 856.938 436.545C856.938 443.697 857.65 449.667 859.074 454.455C860.528 459.212 862.574 462.788 865.21 465.182C867.847 467.545 870.938 468.727 874.483 468.727Z" fill="currentColor"/></svg>';
			}
			if (soundSvg) {
				badges.push('<div class="quality-badge quality-badge--sound">' + soundSvg + '</div>');
			}
		}
		
		// 5. DUB
		if (qualityInfo.dub) {
			badges.push('<div class="quality-badge quality-badge--dub"><svg viewBox="-1 558 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="561.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M60.5284 673H27.5284V579.909H60.8011C70.1648 579.909 78.2254 581.773 84.983 585.5C91.7405 589.197 96.9375 594.515 100.574 601.455C104.241 608.394 106.074 616.697 106.074 626.364C106.074 636.061 104.241 644.394 100.574 651.364C96.9375 658.333 91.7102 663.682 84.892 667.409C78.1042 671.136 69.983 673 60.5284 673ZM47.2102 656.136H59.7102C65.5284 656.136 70.4223 655.106 74.392 653.045C78.392 650.955 81.392 647.727 83.392 643.364C85.4223 638.97 86.4375 633.303 86.4375 626.364C86.4375 619.485 85.4223 613.864 83.392 609.5C81.392 605.136 78.4072 601.924 74.4375 599.864C70.4678 597.803 65.5739 596.773 59.7557 596.773H47.2102V656.136ZM178.153 579.909H197.835V640.364C197.835 647.152 196.214 653.091 192.972 658.182C189.759 663.273 185.259 667.242 179.472 670.091C173.684 672.909 166.941 674.318 159.244 674.318C151.517 674.318 144.759 672.909 138.972 670.091C133.184 667.242 128.684 663.273 125.472 658.182C122.259 653.091 120.653 647.152 120.653 640.364V579.909H140.335V638.682C140.335 642.227 141.108 645.379 142.653 648.136C144.229 650.894 146.441 653.061 149.29 654.636C152.138 656.212 155.456 657 159.244 657C163.063 657 166.381 656.212 169.199 654.636C172.047 653.061 174.244 650.894 175.79 648.136C177.366 645.379 178.153 642.227 178.153 638.682V579.909ZM214.028 673V579.909H251.301C258.15 579.909 263.862 580.924 268.438 582.955C273.013 584.985 276.453 587.803 278.756 591.409C281.059 594.985 282.21 599.106 282.21 603.773C282.21 607.409 281.483 610.606 280.028 613.364C278.574 616.091 276.574 618.333 274.028 620.091C271.513 621.818 268.634 623.045 265.392 623.773V624.682C268.938 624.833 272.256 625.833 275.347 627.682C278.468 629.53 280.998 632.121 282.938 635.455C284.877 638.758 285.847 642.697 285.847 647.273C285.847 652.212 284.619 656.621 282.165 660.5C279.741 664.348 276.15 667.394 271.392 669.636C266.634 671.879 260.771 673 253.801 673H214.028ZM233.71 656.909H249.756C255.241 656.909 259.241 655.864 261.756 653.773C264.271 651.652 265.528 648.833 265.528 645.318C265.528 642.742 264.907 640.47 263.665 638.5C262.422 636.53 260.65 634.985 258.347 633.864C256.074 632.742 253.362 632.182 250.21 632.182H233.71V656.909ZM233.71 618.864H248.301C250.998 618.864 253.392 618.394 255.483 617.455C257.604 616.485 259.271 615.121 260.483 613.364C261.725 611.606 262.347 609.5 262.347 607.045C262.347 603.682 261.15 600.97 258.756 598.909C256.392 596.848 253.028 595.818 248.665 595.818H233.71V618.864Z" fill="currentColor"/></svg></div>');
		}
		
		if (badges.length > 0) {
			badgesContainer.html(badges.join(''));
			badgesContainer.addClass('show');
		}
	}

	function startPlugin() {
		if (!Lampa.Platform.screen("tv")) return console.log("Cardify", "no tv");
		Lampa.Lang.add({
			cardify_enable_sound: {
				ru: "Включить звук",
				en: "Enable sound",
				uk: "Увімкнути звук",
				be: "Уключыць гук",
				zh: "启用声音",
				pt: "Ativar som",
				bg: "Включване на звук"
			},
			cardify_enable_trailer: {
				ru: "Показывать трейлер",
				en: "Show trailer",
				uk: "Показувати трейлер",
				be: "Паказваць трэйлер",
				zh: "显示预告片",
				pt: "Mostrar trailer",
				bg: "Показване на трейлър"
			}
		});
		Lampa.Template.add(
			"full_start_new",
			'<div class="full-start-new cardify">\n        <div class="full-start-new__body">\n            <div class="full-start-new__left hide">\n                <div class="full-start-new__poster">\n                    <img class="full-start-new__img full--poster" />\n                </div>\n            </div>\n\n            <div class="full-start-new__right">\n                \n                <div class="cardify__left">\n                    <div class="full-start-new__head"></div>\n                    <div class="full-start-new__title">{title}</div>\n\n                    <div class="full-start-new__rate-line rate-fix">\n                        <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>\n                        <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>\n                        <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>\n                        <div class="full-start__rate rate--cub hide"><div></div><div>CUB</div></div>\n                    </div>\n\n                    <div class="cardify__details">\n                        <div class="full-start-new__details"></div>\n                    </div>\n\n                    <!-- Блок бейджів якості -->\n                    <div class="cardify-quality-badges"></div>\n\n                    <div class="full-start-new__buttons">\n                        <div class="full-start__button selector button--play">\n                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n                            </svg>\n\n                            <span>#{title_watch}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--book">\n                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{settings_input_links}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--reaction">\n                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>\n                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>\n                            </svg>                \n\n                            <span>#{title_reactions}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--subscribe hide">\n                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>\n                            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{title_subscribe}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--options">\n                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>\n                            </svg>\n                        </div>\n                    </div>\n                </div>\n\n                <div class="cardify__right">\n                    <div class="full-start-new__reactions selector">\n                        <div>#{reactions_none}</div>\n                    </div>\n\n                    <div class="full-start-new__rate-line">\n                        <div class="full-start__pg hide"></div>\n                        <div class="full-start__status hide"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class="hide buttons--container">\n            <div class="full-start__button view--torrent hide">\n                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px">\n                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>\n                </svg>\n\n                <span>#{full_torrents}</span>\n            </div>\n\n            <div class="full-start__button selector view--trailer">\n                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>\n                </svg>\n\n                <span>#{full_trailers}</span>\n            </div>\n        </div>\n    </div>'
		);
		var style =
			'\n        <style>\n        .cardify{-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s}.cardify .full-start-new__body{height:80vh}.cardify .full-start-new__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end}.cardify .full-start-new__title{text-shadow:0 0 .1em rgba(0,0,0,0.3)}.cardify__left{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1}.cardify__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;position:relative}.cardify__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.cardify .full-start-new__reactions{margin:0;margin-right:-2.8em}.cardify .full-start-new__reactions:not(.focus){margin:0}.cardify .full-start-new__reactions:not(.focus)>div:not(:first-child){display:none}.cardify .full-start-new__reactions:not(.focus) .reaction{position:relative}.cardify .full-start-new__reactions:not(.focus) .reaction__count{position:absolute;top:28%;left:95%;font-size:1.2em;font-weight:500}.cardify .full-start-new__rate-line.rate-fix{margin: 1em 0 1.7em 0}.full-start-new__details{margin:0 0 1.4em -0.3em;} .full-start-new__rate-line{margin:0;margin-left:3.5em}.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}.cardify__background{left:0}.cardify__background.nodisplay{opacity:0 !important}.cardify.nodisplay{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}.cardify-trailer{opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.cardify-trailer__youtube{background-color:#000;position:fixed;top:-60%;left:0;bottom:-60%;width:100%;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.cardify-trailer__youtube iframe{border:0;width:100%;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.cardify-trailer__youtube-line{position:fixed;height:6.2em;background-color:#000;width:100%;left:0;display:none}.cardify-trailer__youtube-line.one{top:0}.cardify-trailer__youtube-line.two{bottom:0}.cardify-trailer__controlls{position:fixed;left:1.5em;right:1.5em;bottom:1.5em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end;-webkit-transform:translate3d(0,-100%,0);-moz-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0);opacity:0;-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s}.cardify-trailer__title{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;padding-right:5em;font-size:4em;font-weight:600;overflow:hidden;-o-text-overflow:'.';text-overflow:'.';display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical;line-height:1.4}.cardify-trailer__remote{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.cardify-trailer__remote-icon{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;width:2.5em;height:2.5em}.cardify-trailer__remote-text{margin-left:1em}.cardify-trailer.display{opacity:1}.cardify-trailer.display .cardify-trailer__controlls{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}.cardify-preview{position:absolute;bottom:100%;right:0;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;width:6em;height:4em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;background-color:#000;overflow:hidden}.cardify-preview>div{position:relative;width:100%;height:100%}.cardify-preview__img{opacity:0;position:absolute;left:0;top:0;width:100%;height:100%;-webkit-background-size:cover;-moz-background-size:cover;-o-background-size:cover;background-size:cover;-webkit-transition:opacity .2s;-o-transition:opacity .2s;-moz-transition:opacity .2s;transition:opacity .2s}.cardify-preview__img.loaded{opacity:1}.cardify-preview__loader{position:absolute;left:50%;bottom:0;-webkit-transform:translate3d(-50%,0,0);-moz-transform:translate3d(-50%,0,0);transform:translate3d(-50%,0,0);height:.2em;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em;background-color:#fff;width:0;-webkit-transition:width .1s linear;-o-transition:width .1s linear;-moz-transition:width .1s linear;transition:width .1s linear}.cardify-preview__line{position:absolute;height:.8em;left:0;width:100%;background-color:#000}.cardify-preview__line.one{top:0}.cardify-preview__line.two{bottom:0}.head.nodisplay{-webkit-transform:translate3d(0,-100%,0);-moz-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}body:not(.menu--open) .cardify__background{-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%)}@-webkit-keyframes animation-full-background{0%{-webkit-transform:translate3d(0,-10%,0);transform:translate3d(0,-10%,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-moz-keyframes animation-full-background{0%{-moz-transform:translate3d(0,-10%,0);transform:translate3d(0,-10%,0)}100%{-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-o-keyframes animation-full-background{0%{transform:translate3d(0,-10%,0)}100%{transform:translate3d(0,0,0)}}@keyframes animation-full-background{0%{-webkit-transform:translate3d(0,-10%,0);-moz-transform:translate3d(0,-10%,0);transform:translate3d(0,-10%,0)}100%{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-webkit-keyframes animation-full-start-hide{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-webkit-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}@-moz-keyframes animation-full-start-hide{0%{-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}@-o-keyframes animation-full-start-hide{0%{transform:translate3d(0,0,0);opacity:1}100%{transform:translate3d(0,50%,0);opacity:0}}@keyframes animation-full-start-hide{0%{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}\n        \n        /* Стилі для бейджів якості з Applecation */\n        .cardify-quality-badges {\n            display: inline-flex;\n            align-items: center;\n            gap: 0.4em;\n            margin-bottom: 0.8em;\n            opacity: 0;\n            transform: translateY(10px);\n            transition: opacity 0.3s ease-out, transform 0.3s ease-out;\n        }\n        \n        .cardify-quality-badges.show {\n            opacity: 1;\n            transform: translateY(0);\n        }\n        \n        .quality-badge {\n            display: inline-flex;\n            height: 0.8em;\n        }\n        \n        .quality-badge svg {\n            height: 100%;\n            width: auto;\n            display: block;\n        }\n        \n        .quality-badge--res svg {\n            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));\n        }\n        \n        .quality-badge--dv svg,\n        .quality-badge--hdr svg,\n        .quality-badge--sound svg,\n        .quality-badge--dub svg {\n            color: rgba(255, 255, 255, 0.85);\n            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));\n        }\n        </style>\n    ';
		Lampa.Template.add("cardify_css", style);
		$("body").append(Lampa.Template.get("cardify_css", {}, true));
		var icon =
			'<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">\n        <rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>\n        <rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>\n        <rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>\n        <rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>\n    </svg>';
		Lampa.SettingsApi.addComponent({
			component: "cardify",
			icon: icon,
			name: "Cardify"
		});
		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_run_trailers",
				type: "trigger",
				default: false
			},
			field: {
				name: Lampa.Lang.translate("cardify_enable_trailer")
			}
		});
		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_show_status",
				type: "trigger",
				default: true
			},
			field: {
				name: "Показывать статус"
			}
		});
		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_show_rating",
				type: "trigger",
				default: true
			},
			field: {
				name: "Показывать рейтинг"
			}
		});

		function video(data) {
			if (data.videos && data.videos.results.length) {
				var items = [];
				data.videos.results.forEach(function (element) {
					items.push({
						title: Lampa.Utils.shortText(element.name, 50),
						id: element.key,
						code: element.iso_639_1,
						time: new Date(element.published_at).getTime(),
						url: "https://www.youtube.com/watch?v=" + element.key,
						img: "https://img.youtube.com/vi/" + element.key + "/default.jpg"
					});
				});
				items.sort(function (a, b) {
					return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
				});
				var my_lang = items.filter(function (n) {
					return n.code == Lampa.Storage.field("tmdb_lang");
				});
				var en_lang = items.filter(function (n) {
					return n.code == "en" && my_lang.indexOf(n) == -1;
				});
				var al_lang = [];

				if (my_lang.length) {
					al_lang = al_lang.concat(my_lang);
				}

				al_lang = al_lang.concat(en_lang);
				if (al_lang.length) return al_lang[0];
			}
		}

		Follow.get(Type.de([102, 117, 108, 108]), function (e) {
			if (Type.co(e)) {
				Follow.skodf(e);
				
				// Аналізуємо якість контенту
				var data = e.data;
				var movie = data && data.movie;
				if (movie) {
					analyzeContentQualities(movie, e.object.activity);
				}
				
				if (!Main.cases()[Main.stor()].field("cardify_run_trailers")) return;
				var trailer = Follow.vjsk(video(e.data));

				if (Main.cases().Manifest.app_digital >= 220) {
					if (Main.cases().Activity.active().activity === e.object.activity) {
						trailer && new Trailer(e.object, trailer);
					} else {
						var follow = function follow(a) {
							if (
								a.type == Type.de([115, 116, 97, 114, 116]) &&
								a.object.activity === e.object.activity &&
								!e.object.activity.trailer_ready
							) {
								Main.cases()[binaryLifting()].remove("activity", follow);
								trailer && new Trailer(e.object, trailer);
							}
						};

						Follow.get("activity", follow);
					}
				}
			}
		});
	}

	if (Follow.go) startPlugin();
	else {
		Follow.get(Type.de([97, 112, 112]), function (e) {
			if (Type.re(e)) startPlugin();
		});
	}
})();
