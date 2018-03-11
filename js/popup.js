'use strict';

let el;
let datas = localStorage.data ? JSON.parse(localStorage.data) : {};
let keywords = localStorage.keywords ? JSON.parse(localStorage.keywords) : {};
let options = localStorage.options ? JSON.parse(localStorage.options) : {};
let rotation_deg = 0;
let settingsRotation;
let footer = document.querySelector(".footer");
let rotate = function() {
	settingsRotation = setInterval(function() {
		anime({
			targets: '#settings',
			duration: 1000,
			rotate: rotation_deg++
		});
	}, 50);
};
rotate();

footer.onmouseover = function() {
	clearInterval(settingsRotation);

	anime.remove('#settings');
	anime({
		targets: '#settings',
		duration: 2000,
		translateX: -50,
		rotate: rotation_deg + 90
	});

	anime.remove('#text');
	anime({
		targets: '#text',
		duration: 2000,
		opacity: 1
	});
	document.querySelector("#text")
}
footer.onmouseleave = function() {
	anime.remove('#settings');
	anime({
		targets: '#settings',
		duration: 2000,
		translateX: 0,
		rotate: rotation_deg
	}).complete = rotate;

	anime.remove('#text');
	anime({
		targets: '#text',
		duration: 1000,
		opacity: 0
	});
}	

if (Object.keys(datas).length > 1 && Object.keys(keywords).length > 0 && options.enable)
{
	el = document.querySelector("#start");
	el.classList.remove('disabled');
	el.classList.add('start');
	el.removeAttribute('disabled');
	el.onclick = function() {
		chrome.runtime.sendMessage({msg: "start"});
		this.classList.add('disabled');
		this.classList.remove('start');
		this.value = "Bot running...";
		this.onclick = undefined
	}

	if (!parseInt(localStorage.BOT_RUNNING) && options.copOnRestock)
	{
		el = document.querySelector("#restock");
		el.classList.remove('disabled');
		el.classList.add('start');
		el.removeAttribute('disabled');
		el.onclick = function() {
			chrome.runtime.sendMessage({msg: "restock"});
			window.close();
		}
	}
	else if (parseInt(localStorage.BOT_RUNNING))
	{
		el = document.querySelector("#restock");
		el.removeAttribute('disabled');
		el.style.cursor = 'pointer';
		el.value = "Stop waiting restock"
		el.onclick = function() {
			chrome.runtime.sendMessage({msg: "stop"});
			window.close();
		}
	}
}

document.querySelector("#nbkws").innerHTML = `You set ${Object.keys(keywords).length} keywords.`;

document.querySelector(".footer").onclick = 
	() => chrome.tabs.create({url: location.href.replace("popup", "settings")});
