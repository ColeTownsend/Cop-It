'use strict';

let HOST;
let socket;
let itemsData;
let ping;

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
			if (localStorage.store === "jpn") {
				fetch("http://copit.fr/get_last_data.json")
					.then(rep => rep.json())
					.then(data => {
						itemsData = data
					})
			}
			Supreme.getTabId()
				.then(tabId => {
					let options = localStorage.options ? JSON.parse(localStorage.options) : {};

					Supreme.updateUrl(tabId, "http://www.supremenewyork.com/shop")
						.then(() => {
							Supreme.injectJS(tabId,
								`document.getElementsByClassName("logo")[0].innerHTML = '<div class="bogo"><div class="sup"><p>Cop It</p></div></div>';` +
								`document.getElementsByTagName("time")[0].innerHTML = "Waiting for the new drop..."`);

							if (options.autoStart && isBeforeTheDrop(new Date)) {
								socket = new WebSocket(`ws://${HOST}/newdrop`);

								socket.onopen = () => {
									ping = setInterval(() => {
										if (socket && socket.readyState === WebSocket.OPEN)
											socket.send('ping');
										else {
											socket.close();
											clearInterval(ping);
										}
									}, 5000);
								};
								socket.onmessage = event => {
									if (event.data !== "ping" && JSON.parse(event.data).nd) {
								 		Supreme.startCop(tabId);
								 		socket.close();
								 		clearInterval(ping);
							 		}
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
					let keywords = localStorage.keywords ? JSON.parse(localStorage.keywords) : {};
					socket = new WebSocket(`ws://${HOST}/restock`);
					localStorage.BOT_RUNNING = 1;

					socket.onopen = () => {
						ping = setInterval(() => {
							if (socket && socket.readyState === WebSocket.OPEN)
								socket.send('ping');
							else {
								socket.close();
								clearInterval(ping);
							}
						}, 5000);
					};
					socket.onmessage = event => {
						if (event.data !== "ping") {
							let item = JSON.parse(event.data);

							for (let keyword of Object.values(keywords)) {
								keyword = JSON.parse(keyword);
								if (item.url.split('/')[2] == keyword.category) {
									if (keyword.color == " " || item.color.toLowerCase().replace(/[^\x20-\x7E]/g, '').indexOf(keyword.color) > -1) {
										let allkeywords = keyword.keywords.split(" ");
										let matches = 0;
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
						}
					};
				}, () => {
					alert("You must have a tab on supremenewyork.com to wait for restock");
				})
			break;
		case 'alt_data':
			rep(itemsData);
			break;
		case 'store':
			rep(localStorage.store);
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
				for (let tab in tabs) {
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

function isBeforeTheDrop(date) {
	const day = date.getUTCDay()
	const hours = date.getUTCHours()
	const minutes = date.getUTCMinutes()

	switch(localStorage.store) {
		case 'gb':
			// If we're on Thursday and it's before 11 am UTC, we connect to the server to wait for the new drop
			return day === 4 && hours < 11
		case 'us':
			// The same except it's 4 pm UTC
			return day === 4 && hours < 16
		case 'jpn':
			// For japan this is on saturday and at 2 am UTC
			return day === 6 && hours < 2
	}

	return true
}
