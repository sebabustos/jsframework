function showCourtain() {
	var courtain = $("<div id='divPostbackCourtain'></div>")
					.addClass("ui-widget-overlay")
					.css({
						position: "absolute",
						top: $(window).scrollTop(),
						left: $(window).scrollLeft(),
						width: $(window).width(),
						height: $(window).height(),
						zIndex: 9997
					})
					.appendTo($("body"));

	$("<img id='imgLoading' src='../images/indicator.gif' alt='Cargando'/>")
		.appendTo($("body"))
		.css({
			backgroundColor: "#BBBBBB",
			zIndex: 9998
		})
		.position({
			my: 'center center',
			at: 'center center',
			of: courtain
		});
	$(window).scroll(function () {
		$("#divPostbackCourtain").css({
			top: $(window).scrollTop(),
			left: $(window).scrollLeft()
		});
	});
}