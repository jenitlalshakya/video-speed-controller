chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.get(null, (data) => {
		if (Object.keys(data).length === 0) {
			chrome.storage.sync.set({
				step: 0.25,
				fixedSpeed: 2.0,
				increaseKey: "]",
				decreaseKey: "[",
				enabled: true
			});
		}
	});
});
