'use strict';

const DIFFERENT_SIZE =
	{
		"pants":
				'<button type="button" class="button-size"><p class="size-num"></p>30</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>32</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>34</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>36</button>',
		"shorts":
				'<button type="button" class="button-size"><p class="size-num"></p>Small</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>Medium</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>Large</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>XLarge</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>30</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>32</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>34</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>36</button>',
	    "shoes":
	    		'<button type="button" class="button-size"><p class="size-num"></p>US 7 / UK 6</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 7.5 / UK 6.5</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 8 / UK 7</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 8.5 / UK 7.5</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 9 / UK 8</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 9.5 / UK 8.5</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 10 / UK 9</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 10.5 / UK 9.5</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 11 / UK 10</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 11.5 / UK 10.5</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>US 12 / UK 11</button>',
		"default":
				'<button type="button" class="button-size"><p class="size-num"></p>Small</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>Medium</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>Large</button>' +
				'<button type="button" class="button-size"><p class="size-num"></p>XLarge</button>'
	};

$(document).ready(function() {
	setInterval(bogoPlay, 6000);
	//first run
	if (!localStorage.store)
	{
		fadeIn(document.querySelector('.region'));

		document.querySelectorAll('.region img').forEach(e => {
			e.onclick = function() {
				localStorage.store = this.getAttribute('store');
				fadeOut(document.querySelector('.region'), () =>
					fadeIn(document.querySelector('.menu')));
			};
		})
	}
	else
		fadeIn(document.querySelector('.menu'));

	/*
		<navigation>
	*/
	document.querySelectorAll("td").forEach(el => {
		el.onclick = function() {
			var page = el.getAttribute('toggle');
			fadeOut(document.querySelector('.menu'), () =>
				fadeIn(document.getElementById(page)));
		}
	});

	document.querySelectorAll("a > .left").forEach(el => {
		el.onclick = function() {
			var page = this.parentElement.parentElement.getAttribute('id');
			fadeOut(document.getElementById(page), () => fadeIn(document.querySelector('.menu')));
		}
	});
	
	/*
		</navigation>
	*/

	/*
		<features>
	*/
		(function displayOption() {
			var options = JSON.parse(localStorage.options);

			Object.keys(options).forEach(key => {
				if (!options[key])
					document.querySelector(`[name=${key}]`).classList.add("disabled");
			});
		})();

		function saveOption() {
			var data = {};
			document.querySelectorAll('.option').forEach(el => {
				var name = el.getAttribute('name');
				data[name] = !el.classList.contains("disabled");
			});
			localStorage.options = JSON.stringify(data);
		}

		$(".option").click(function() {
			//enable only if parent is not disabled
			if ($(this).hasClass("disabled") && !$(this).parent().prev().hasClass("disabled"))
				$(this).removeClass("disabled");
			else {
				$(this).addClass("disabled");

				//disable children
				if ($(this).next("ul")[0] === $(this).next()[0])
					$(this).next().find("li").addClass("disabled");
			}
			//then store data
			saveOption();
		});

		//we should update this function on click
		$("[name=removeAssets]").click(function() {
			chrome.runtime.sendMessage({msg: "updateRemoveImages", enabled: !$(this).hasClass("disabled")});
		});
	/*
		</features>
	*/


	/*
		<keywords>
	*/
	/* JUST ADD HELPERS */
		(function displayKeywords() {
			var keywords = localStorage.keywords;
			if (keywords) {
				if ($("#keywords table").children().eq(0).text() === "No keywords set")
					$("#keywords table").children().eq(0).remove();
				
				keywords = JSON.parse(keywords);
				Object.keys(keywords).forEach(key => {
					var e = JSON.parse(keywords[key]);
					$("#keywords table").append(`<tr id="${key}"><td><b>Keywords:</b> ${e.keywords}<br> <b>Color:</b> ${e.color}<br> <b>Category:</b> ${e.category}<br> <b>Size order:</b> ${e.size.join()}</td><td><p align="center">X</p></td></tr>`);
				})
			}
		})();

		function storeKeywords(category, color, kwds, size) {
			var keywords = !localStorage.keywords ? {} : JSON.parse(localStorage.keywords);
			var id = parseInt(Object.keys(keywords).sort().pop()) + 1;
			id = isNaN(id) ? 0 : id;
			var data = {
				category: category,
				color: color.toLowerCase(),
				keywords: kwds.toLowerCase(),
				size: size
			};

			keywords[id] = JSON.stringify(data);
			localStorage.keywords = JSON.stringify(keywords);
		}

		if ($("#keywords table").children().length === 0)
			$("#keywords table").append(`<tr><td><i>No keywords set</i></td><td></td></tr>`);

		//click on cross
		function enableRemoveCross() {
			$(".item-list > table td:nth-child(2)").click(function() {
				var e = $(this).parent();
				var keywords = JSON.parse(localStorage.keywords);
				delete keywords[e.attr("id")];
				localStorage.keywords = JSON.stringify(keywords);

				e.fadeOut(300, () => {
					e.remove();
					if ($("#keywords table").children().length === 0)
						$("#keywords table").append(`<tr><td><i>No keywords set</i></td><td></td></tr>`);
				});
			});
		}
		enableRemoveCross();

		//change size select
		$("#category").change(function() {
			var isInArray = $.inArray($(this).val(), Object.keys(DIFFERENT_SIZE));
			if (isInArray > -1)
				$("#sizes").html(DIFFERENT_SIZE[$(this).val()]);
			else
				$("#sizes").html(DIFFERENT_SIZE.default);
			enableSizingButtons();
		});

		//size order number
		function enableSizingButtons() {
			$(".button-size").click(function() {
				if ($(this).hasClass('active')) {
					var num, activeLen;

					num = parseInt($(this).children("p").text());
					$(this).children("p").text(null);
					$(this).removeClass('active');
					activeLen = $(".button-size.active p").length;

					//algo to change number
					while (num <= activeLen) {
						$(".button-size.active p").each(function(i) {
							var currentNum = parseInt($(this).text());
							if (currentNum === num + 1) {
								$(this).text(num);
								return false;
							}
						});
						num++;
					}
				}
				else {
					$(this).addClass('active');
					$(this).children("p").text($(".button-size.active").length);
				}
			})
		}
		enableSizingButtons();

		//add keyword to table/stored
		$("#keywords .submit").click(function() {
			var keywords = !localStorage.keywords ? {} : JSON.parse(localStorage.keywords);
			var id = parseInt(Object.keys(keywords).sort().pop()) + 1;
			id = isNaN(id) ? 0 : id;
			var category = $("#category").val();
			var color = $("#color").val();
			var kwds = $("#kwds").val();
			var size = [];
			var i = 1;

			while (i <= $(".button-size.active p").length) {
				$(".button-size.active").each(function() {
					var sizeVal = $(this).html().split("</p>")[1];
					if (i === parseInt($(this).children("p").text())) {
						size.push(sizeVal);
						return false;
					}
				});
				i++;
			}
			if ($("#keywords table").children().eq(0).text() === "No keywords set")
				$("#keywords table").children().eq(0).remove();
			storeKeywords(category, color, kwds, size);
			$("#keywords table")
				.fadeOut(500, function() {
					$(this)
						.append(`<tr id="${id}"><td><b>Keywords:</b> ${kwds}<br> <b>Color:</b> ${color}<br> <b>Category:</b> ${category}<br> <b>Size order:</b> ${size.join()}</td><td><p align="center">X</p></td></tr>`)
						.fadeIn(500, () => enableRemoveCross());
				});
			$("#category, #color, #kwds").val(null);
			$(".button-size.active p").html(null);
			$(".button-size.active").removeClass('active');
			enableRemoveCross();
		})
	/*
		</keywords>
	*/

	/*
		<details>
	*/
		var requiredShipping = ["fullname", "email", "phone", "addr1", "city", "zip", "country"];
		var requiredBilling = ["credit_type", "credit_num", "credit_month", "credit_year", "credit_cvv"];
		var details = JSON.parse(localStorage.data);
		
		(function showDataByRegion() {
			if (!localStorage.store)
				return setTimeout(showDataByRegion, 500);
			else if (localStorage.store === "us") {
				$(".form-group").eq(9).css("display", "none"); //address 3 form
				$(".form-group").eq(12).css("display", "block"); //state form
				document.getElementById("state").style.display = 'block';
				requiredShipping.push("state");
			}
		})();

		//fill both
		generateExpireDate();
		$("#billing, #shipping").children(".form-group").children("input,select").each((_, e) => {
			var id = e.id;
			$(`#${id}`).val(details[id]);
		});

		$(".right-arrow").click(function() {
			$("#shipping").fadeOut("fast", () => $("#billing").fadeIn());
		});
		$(".left-arrow").click(function() {
			$("#billing").fadeOut("fast", () => $("#shipping").fadeIn());
		});

		$("#shipping .submit").click(function() {
			$("#shipping .form-group").removeClass("invalid");

			var data = localStorage.data ? JSON.parse(localStorage.data) : {};
			var error = false;

			requiredShipping.forEach(input => {
				input = $("#" + input);
				if (!input.val()) {
					error = true;
					input.parent().addClass("invalid").addClass("shake");
					setTimeout(() => input.parent().removeClass("shake"), 400);
				}
			});

			if (!error) {
				$("#shipping .form-group").each(function() {
					var input = $(this).children("input, select");
					data[input.attr("id")] = input.val();
				});

				localStorage.data = JSON.stringify(data);
				$.notify("Shipping details have been updated.", "success", {
					autoHide: true,
  					autoHideDelay: 3000
				});
			}
		});

		$("#billing .submit").click(function() {
			$("#billing .form-group").removeClass("invalid");

			var data = localStorage.data ? JSON.parse(localStorage.data) : {};
			var error = false;

			requiredBilling.forEach(input => {
				input = $("#" + input);
				if (!input.val()) {
					error = true;
					input.parent().addClass("invalid").addClass("shake");
					setTimeout(() => input.parent().removeClass("shake"), 400);
				}
			});

			if (!error) {
				$("#billing .form-group").each(function() {
					$(this).children("input, select").each(function() {
						data[$(this).attr("id")] = $(this).val();
					})
				});

				localStorage.data = JSON.stringify(data);
				$.notify("Billing details have been updated.", "success", {
					autoHide: true,
  					autoHideDelay: 3000
				});
			}
		});

		function generateExpireDate() {
			const expireMonth = document.getElementById("credit_month")
			for (var m = 1; m <= 12; m++) {
				m = m.toString()
				m = m.length < 2 ? "0" + m : m
				var option = document.createElement("option")
				option.text = m, option.value = m
				expireMonth.add(option)
			}

			const expireYear = document.getElementById("credit_year"), currentYear = new Date().getFullYear()
			for (var y = currentYear; y <= currentYear + 10; y++) {
				var option = document.createElement("option")
				option.text = y, option.value = y
				expireYear.add(option)
			}
		};
	/*
		</details>
	*/
});


/*
	bogo animation
*/
function bogoPlay() {
	var input = $('#name');
	var name = input.html();
	var nameLen = name.length;
	var text = name === "Cop It" ? "Supreme" : "Cop It";
	var textLen = 0;

	var erase = function() {
		return new Promise(function(end){
			var removeChar = setInterval(function() {
				if (nameLen >= 0)
					input.html(name.substr(0, nameLen--));
				else {
					clearInterval(removeChar);
					end();
				}
			}, 50);
		});
	}

	var type = function() {
		input.html(text.substr(0, textLen++));
	    if(textLen < text.length+1)
	        setTimeout(type, 50);
	    else
	        nameLen = 0;
	}

	erase().then(type);
}

function fadeIn(el, fn) {
	el.style.display = "block";
	el.style.opacity = 0;

	var tick = function() {
		el.style.opacity = +el.style.opacity + 0.05;

		if (+el.style.opacity < 1) {
			(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 4)
		} else if (fn !== undefined)
			fn();
	};
	tick();
}

function fadeOut(el, fn) {
	el.style.display = "block";
	el.style.opacity = 1;

	var tick = function() {
		el.style.opacity = el.style.opacity - 0.05;

		if (el.style.opacity > 0) {
			(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 4)
		} else {
			if (fn !== undefined)
				fn();
			el.style.display = "none";
		}
	};
	tick();
}
