'use strict';

var HOST;
var socket;
localStorage.BOT_RUNNING = 0;
localStorage.data = localStorage.data || "{}";
localStorage.options = localStorage.options || "{}";
(function initHost() {
	if (!localStorage.store)
		return setTimeout(initHost, 500)
	else
		HOST = `ws.${localStorage.store}.copit.fr`;
})();

chrome.runtime.onMessage.addListener((req, sender, rep) => {
	switch(req.msg) {
		case 'start':
			Supreme.getTabId()
				.then(tabId => {
					var datas = localStorage.data ? JSON.parse(localStorage.data) : {};
					var options = localStorage.options ? JSON.parse(localStorage.options) : {};

					Supreme.updateUrl(tabId, "http://www.supremenewyork.com/shop")
						.then(() => {
							Supreme.injectJS(tabId,
								`document.getElementsByClassName("logo")[0].innerHTML = '<div class="bogo"><div class="sup"><p>Cop It</p></div></div>';` +
								`document.getElementsByTagName("time")[0].innerHTML = "Waiting for the new drop..."`);
							if (options.autoStart) {
								socket = new WebSocket(`ws://${HOST}/newdrop`);

								socket.onopen = () => {
									var ping = setInterval(() => {
										if (socket && socket.readyState === WebSocket.OPEN)
											socket.send('ping');
										else {
											socket.close();
											clearInterval(ping);
										}
									}, 10000);
								};
								socket.onmessage = () => {
							 		Supreme.startCop(tabId);
							 		socket.close();
							 		clearInterval(ping);
								}
							} else {
								Supreme.startCop(tabId);
							}
						})
				}, () => {
					alert("You must have a tab on supremenewyork.com to start the bot");
				})
			break;
		case 'restock':
			Supreme.getTabId()
				.then(tabId => {
					var datas = localStorage.data ? JSON.parse(localStorage.data) : {};
					var keywords = localStorage.keywords ? JSON.parse(localStorage.keywords) : {};
					socket = new WebSocket(`ws://${HOST}/restock`);
					localStorage.BOT_RUNNING = 1;

					socket.onopen = () => {
						var ping = setInterval(() => {
							if (socket && socket.readyState === WebSocket.OPEN)
								socket.send('ping');
							else {
								socket.close();
								clearInterval(ping);
							}
						}, 10000);
					};
					socket.onmessage = event => {
						var item = JSON.parse(event.data);
	
						for (var keyword of Object.values(keywords)) {
							keyword = JSON.parse(keyword);
							if (item.url.split('/')[2] == keyword.category) {
								if (keyword.color == " " || item.color.toLowerCase().replace(/[^\x20-\x7E]/g, '').indexOf(keyword.color) > -1) {
									var allkeywords = keyword.keywords.split(" ");
									var matches = 0;
									allkeywords.forEach(kw => {
										if (item.name.toLowerCase().replace(/[^\x20-\x7E]/g, '').indexOf(kw) > -1)
											matches++;
									})
									if (matches === allkeywords.length) {
										localStorage.BOT_RUNNING = 0;
										Supreme.copItem(tabId, item.url);
										socket.close();
										clearInterval(ping);
										break;
									}
								}
							}
						}
					};
				}, () => {
					alert("You must have a tab on supremenewyork.com to wait for restock");
				})
			break;
		case 'cop':
			rep([JSON.parse(localStorage.keywords), JSON.parse(localStorage.options)]);
			break;
		case 'updateRemoveImages':
			req.enabled
				? Supreme.removeImages()
				: chrome.webRequest.onBeforeRequest.removeListener(Supreme.listenerHandle);
			break;
		case 'runningCheckout':
			rep([JSON.parse(localStorage.data), JSON.parse(localStorage.options), localStorage.store]);
			break;
		case 'stop':
			localStorage.BOT_RUNNING = 0;
			socket.close();
			break;
	}
});

const Supreme = {
	getTabId: function() {
		return new Promise(function(accept, reject) {
			chrome.tabs.query({}, tabs => {
				for (var tab in tabs) {
		    		if (tabs[tab].url.indexOf("supremenewyork.com") > -1) {
		    			accept(parseInt(tabs[tab].id));
		    			break;
		    		}
		    		else if (tab == tabs.length - 1)
		    			reject();
		    	}
			})
		})
	},
	updateUrl: (tabId, url) => {
		return new Promise(function(accept) {
		    chrome.tabs.update(tabId, { url: url }, () => {
				chrome.tabs.onUpdated.addListener(function listenTab(tabnumber, info, tab) {
					if (tab.url.indexOf(url) > -1 && info.status == "complete") {
						chrome.tabs.onUpdated.removeListener(listenTab)
						accept()
					}
				})
			});
		})
	},
	startCop: tabId => chrome.tabs.executeScript(tabId, { file: '/js/purchase.js' }),
	injectJS: (tabId, js) => chrome.tabs.executeScript(tabId, { code: js }),
	copItem: function(tabId, url) {
		this.updateUrl(tabId, "http://www.supremenewyork.com" + url)
			.then(() => {
				chrome.tabs.executeScript(tabId, {
					code: 'document.getElementsByName("commit")[0].click();setTimeout(() => {location.href = "https://www.supremenewyork.com/checkout"}, 150);'
				});
			});
	},
	removeImages: function() {
		chrome.webRequest.onBeforeRequest.addListener(
			this.listenerHandle,
			{
				urls: [
				   '*://*.cloudfront.net/*.jpg',
				   '*://*.cloudfront.net/*.png'
				]
			},
			['blocking']
		)
	},
	listenerHandle: function() {
		return { cancel: true }
	}
};
