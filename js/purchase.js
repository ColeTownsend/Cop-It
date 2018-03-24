chrome.runtime.sendMessage({msg: "cop"}, function(rep) {
	let keywords = rep[0];
	let options = rep[1];
	let id = keywords.firstKey();
	let retryCount = 0;

	(function find(id) {
		if (keywords[id]) {
			let current = JSON.parse(keywords[id]);

			document.getElementsByTagName("time")[0].innerHTML = `Copping item: "${current.keywords}"`;
			getPage('/shop/all/' + current.category, pageContent => {
				searchItem(current, pageContent)
					.then(url => {
						getPage(url, doc => {
							url = doc.getElementById("cart-addf").getAttribute("action");
							getSizeId(doc.getElementById("size") || doc.getElementById("s"), current.size, sizeId => {
								let style = (doc.getElementById("style") || doc.getElementById("s")).value;
								post(url, "utf8=✓&style=" + style + "&size=" + sizeId)
									.then(() => find(id.nextKey(keywords)));
							});
						})
					},
					() => {
						find(id.nextKey(keywords))
					});
			});
		} else {
			let re = new RegExp(" cart=([^; ]{1})");
			let itemInCart = re.exec(document.cookie) !== null
							? parseInt(re.exec(document.cookie)[1])
							: 0;	

			if (itemInCart > 0 && !isNaN(itemInCart))
					location.href = options.checkCart
						? "http://www.supremenewyork.com/shop/cart"
						: "https://www.supremenewyork.com/checkout";
			else {
				if (options.retryIfNotFound && retryCount < 10) {
					retryCount++;
					id = keywords.firstKey();
					find(id);
				}
				else
					alert("No items found. Keywords are not correct or items are soldout.");
			}
		}
	})(id);
});

function getSizeId(select, sizes, fn) {
	let sizeId;

	if (select.type === "hidden")
		return fn(select.value);
	else if (sizes.length === 0)
		return fn(select[0].value);

	sizes.reverse().forEach((size, i, arr) => {
		for (option of select) {
			let text = option != undefined ? option.innerText : size;

			if (text === size)
				sizeId = option.value;
		}
		if (i === arr.length - 1)
			return fn(sizeId);
	});
}

function searchItem(keyword, dom) {
	return new Promise((found, notfound) => {
		// EU / US keywords finds function
		chrome.runtime.sendMessage({msg: "store"}, store => {
			if (store !== 'jpn') {
				let items = dom.getElementsByTagName("article").length
					? dom.getElementsByTagName("article")
					: dom.getElementById("container").childNodes;
				let END = false;

				if (items.length != 0) {
					Array.prototype.forEach.call(items, (item, itemId, itemArr) => {
						if (item.childNodes) {
							let item_url = item.innerHTML.match(/\s*(href)=\"([^"]+)"/)[2];
							let item_name = item.innerText.toLowerCase().replace(/[^\x20-\x7E]/g, '');
							let item_color = item.childNodes[0].childNodes[2].childNodes[0].textContent.toLowerCase().replace(/[^\x20-\x7E]/g, '');
							let item_soldout = item.innerHTML.replace(/[^\x20-\x7E]/g, '').indexOf("sold out") > -1;
							let matches = 0;
							let colorFound;

							keyword.keywords.split(" ").forEach((word, i, arr) => {
								if (item_name.indexOf(word) > -1)
									matches++;
								if (i === arr.length - 1) {
									colorFound = keyword.color === ' ' || item_color.indexOf(keyword.color) > -1;
									if (matches == arr.length && colorFound && !item_soldout) {
										return found(item_url);
									} else if (itemId === itemArr.length - 1) {
										return notfound();
									}
								}
							})
						}
					});
				}
			} else {
				// JPN keywords finds function
				chrome.runtime.sendMessage({msg: "alt_data"}, function(itemsData) {
					let items = dom.getElementsByTagName("article").length
					? dom.getElementsByTagName("article")
					: dom.getElementById("container").childNodes;
					let END = false;

					if (items.length != 0) {
						Array.prototype.forEach.call(items, (item, itemId, itemArr) => {
							if (item.childNodes) {
								let item_url = item.innerHTML.match(/\s*(href)=\"([^"]+)"/)[2];
								let item_alt = item.querySelector('img').alt;
								let itemData = itemsData.items.find(el => el.alt === item_alt);
								let item_soldout = item.innerHTML.replace(/[^\x20-\x7E]/g, '').indexOf("sold out") > -1;
								let item_name = itemData.name.toLowerCase();
								let item_color = itemData.color.toLowerCase();
								let matches = 0;
								let colorFound;

								keyword.keywords.split(" ").forEach((word, i, arr) => {
									if (item_name.indexOf(word) > -1)
										matches++;
									if (i === arr.length - 1) {
										colorFound = keyword.color === ' ' || item_color.indexOf(keyword.color) > -1;
										if (matches == arr.length && colorFound && !item_soldout) {
											return found(item_url);
										} else if (itemId === itemArr.length - 1) {
											return notfound();
										}
									}
								})
							}
						});
					}
				})
			}
		});
	});
}

function getPage(url, go) {
	get(url)
		.then(html => {
			let dom = new DOMParser();
			let doc = dom.parseFromString(html, "text/html");
			go(doc);
		});
}

function get(url)
{
	return new Promise(function(accept) {
		let xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
	            accept(xmlHttp.responseText);
	    }
	    xmlHttp.ontimeout = () => accept(get(url));
	    xmlHttp.timeout = 1000;
	    xmlHttp.open("GET", url, true);
	    xmlHttp.send(null);
	});
}

function post(url, params)
{
	return new Promise(function(accept) {
		let xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
	        	accept();
	    }
	    xmlHttp.ontimeout = () => accept(post(url, params));
	    xmlHttp.timeout = 1000;
	    xmlHttp.open("POST", url, true);
	    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xmlHttp.send(params);
	});
}

Object.prototype.firstKey = function() {
	for (let i in this)
		return parseInt(i);
};

Number.prototype.nextKey = function(arr) {
	for (let i in arr) {
		if (i > this)
			return parseInt(i);
	}
	return -1;
}