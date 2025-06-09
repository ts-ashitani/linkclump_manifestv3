var CURRENT_VERSION = "5";

function SettingsManager() {}

SettingsManager.prototype.load = function(callback) {
	chrome.storage.local.get(['settings'], function(result) {
		try {
			if (result.settings) {
				callback(JSON.parse(result.settings));
			} else {
				// データが存在しない場合は初期化
				var settings = getDefaultSettings();
				callback(settings);
			}
		} catch(error) {
			var settings = getDefaultSettings();
			settings.error = "Error: "+error+"|Data:"+result.settings;
			callback(settings);
		}
	});
};

SettingsManager.prototype.save = function(settings, callback) {
	// remove any error messages from object (shouldn't be there)
	if (settings.error !== undefined) {
		delete settings.error;
	}
	
	chrome.storage.local.set({
		'settings': JSON.stringify(settings)
	}, function() {
		if (callback) callback();
	});
};

SettingsManager.prototype.isInit = function(callback) {
	chrome.storage.local.get(['version'], function(result) {
		callback(result.version !== undefined);
	});
};

SettingsManager.prototype.isLatest = function(callback) {
	chrome.storage.local.get(['version'], function(result) {
		callback(result.version === CURRENT_VERSION);
	});
};

SettingsManager.prototype.init = function(callback) {
	// create default settings for first time user
	var settings = getDefaultSettings();

	// save settings to store
	chrome.storage.local.set({
		'settings': JSON.stringify(settings),
		'version': CURRENT_VERSION
	}, function() {
		if (callback) callback(settings);
	});
	
	return settings;
};

SettingsManager.prototype.update = function(callback) {
	var self = this;
	this.isInit(function(isInitialized) {
		if (!isInitialized) {
			self.init(callback);
		} else {
			if (callback) callback();
		}
	});
};

// デフォルト設定を取得する関数
function getDefaultSettings() {
	return {
		"actions": {
			"101": {
				"mouse": 0,  // left mouse button
				"key": 90,   // z key
				"action": "tabs",
				"color": "#FFA500",
				"options": {
					"smart": 0,
					"ignore": [0],
					"delay": 0,
					"close": 0,
					"block": true,
					"reverse": false,
					"end": false
				}
			}
		},
		"blocked": []
	};
}
