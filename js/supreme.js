const CHECK_URL = {
	item: () => {
		var url = location.href;
		if (url.indexOf("http://www.supremenewyork.com/shop/") != -1) {
			var forbidden = ['cart', 'all', 'sizing', 'shipping', 'terms', 'faq'];
			var path = url.split("/").slice(-1)[0];
			
			return !forbidden.includes(path);
		}
		else
			return false;
	},
	checkout: () => location.href.split("/").slice(-1)[0] === "checkout"
}

if (CHECK_URL.checkout()) {
	chrome.runtime.sendMessage({msg: "runningCheckout"}, function(rep) {
		if (rep) {
			var d = rep[0];
			var options = rep[1];
			var store = rep[2];

			if (options.autoFill) {
				fill(document.getElementById("order_billing_country"), d.country);
				fill(document.getElementById("order_billing_name"), d.fullname);
				fill(document.getElementById("order_email"), d.email);
				fill(document.getElementById("order_tel"), d.phone);
				fill(document.getElementById("bo"), d.addr1);
				fill(document.getElementById("oba3"), d.addr2);
				if (store === "gb")
					fill(document.getElementById("order_billing_address_3"), d.addr3);
				fill(document.getElementById("order_billing_zip"), d.zip);
				fill(document.getElementById("order_billing_city"), d.city);

				if (store === "us")
					fill(document.getElementById("order_billing_state"), d.state);
				
				fill(document.getElementById("card_details").childNodes[0].childNodes[1], d.credit_num);
				if (store === "gb")
					fill(document.getElementById("credit_card_type"), d.credit_type);

				fill(document.getElementById("credit_card_month"), d.credit_month);
				fill(document.getElementById("credit_card_year"), d.credit_year);
				fill(document.getElementById("vval") || document.getElementById("orcer"), d.credit_cvv);

				document.querySelector('.has-checkbox.terms').classList.add("hover");

				document.querySelector('.terms > .icheckbox_minimal').classList.add("hover");
				setTimeout(() => {
					document.querySelector('.terms > .icheckbox_minimal').classList.add("active");
					setTimeout(() => {
						document.querySelector('.terms > .icheckbox_minimal').classList.remove("active");
						document.querySelector('.terms > .icheckbox_minimal').classList.add("checked");
						document.querySelector('.terms > .icheckbox_minimal').classList.remove("hover");
						document.getElementsByName("order[terms]").forEach(e => e.click())
					}, 150);
				}, 150);

				if (options.autoSubmit) {
					setTimeout(() => {
						/*
						* Does not work actually. The code below should enable the captcha but this is in jQuery,
						* I want to use pure JS only.

						document.getElementsByName("commit")[0].trigger($.Event( "click", { originalEvent: true } ));
						*/
					}, 500);
				}
			}
		}
	});
} else {
	/*
		QUICK BUY BUTTON
	*/
	setInterval(function() {
		if (CHECK_URL.item() && !document.getElementById("quickbuy")) {
			var addBtn = document.getElementById('add-remove-buttons') || false;
			var btn = document.createElement("input");

			btn.id = "quickbuy";
		    btn.type = "button";
		    btn.value = "instant buy";
		    btn.className = "button";
		    btn.style = "background-color: #000000; border-color: #000000; margin-top: 30px;";
		    btn.onclick = function() {
		    	var item_name = document.title.split("Supreme: ")[1];
		    	if (confirm("Do you confirm the instant purchase of " + item_name + "? By confirm you'll be redirected to checkout page. If autofill and autosubmit are enabled the item will be purchase automatically.")) {
		    		document.getElementsByName("commit")[0].click();
		    		setTimeout(function() {
		    			location.href = "https://www.supremenewyork.com/checkout";
		    		}, 150);
		    	}
		    };
		    if (addBtn) {
		    	var className = addBtn.childNodes[0].className;
				if (className.indexOf("sold-out") == -1 && className != "button remove")
					addBtn.insertBefore(btn, addBtn.childNodes[2]);
		    }
		}
	}, 350);
}

function fill(el, value) {
	if (el.tagName === "INPUT") {
		var timeout = 75;
		for (var l of value) {
			setTimeout(function(letter) {
				return function()
				{
					el.dispatchEvent(new KeyboardEvent('keyup', {'key': letter, 'code': letter.charCodeAt(0)}));
					el.value = el.value + letter;
				}
			}(l), timeout += 75)	
		}
	}
	else if (el.tagName === "SELECT")
	{
		var evt = document.createEvent("HTMLEvents");	
		evt.initEvent("change", false, true);
		el.value = value;
		el.dispatchEvent(evt);
	}
}