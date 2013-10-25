define(["lib/jquery/jquery-1.10.2.min"], 
	function(){
	/**
	* Social Sharing
	* @class Social Sharing
	* 
	* Collection of methods to share app with social media sites
	*/

	var _page = {
		title: encodeURIComponent($("meta[property='og:title']").attr("content")),
		summary: encodeURIComponent($("meta[property='og:description']").attr("content")),
		url: encodeURIComponent($("meta[property='og:url']").attr("content")),
		thumbnail: encodeURIComponent($("meta[property='og:image']").attr("content")),
		twitterHandle: encodeURIComponent($("meta[name='twitter:site']").attr("content").replace("@",""))
	};

	var _shareOptions = {
		title: _page.title,
		summary: _page.summary,
		url: _page.url,
		thumbnail: _page.thumbnail,
		twitterText: _page.title,
		twitterHandle: _page.twitterHandle,
		hashtags: 'storymap'
	};

	getBitlyURL();

	function getBitlyURL(){
		var urls = ["http://api.bitly.com/v3/shorten?callback=?", "https://api-ssl.bitly.com/v3/shorten?callback=?"];
		var url = location.protocol == 'http:' ? urls[0] : urls[1];

		$.getJSON(url,{
			"format": "json",
			"apiKey": "R_14fc9f92e48f7c78c21db32bd01f7014",
			"login": "esristorymaps",
			"longUrl": decodeURIComponent(_shareOptions.url)
		},function(response)
		{
			if( ! response || ! response || ! response.data.url )
				return;

			_shareOptions.url = encodeURIComponent(response.data.url);
		});
	}

	$("#social .social-share").click(function(){
		if ($(this).hasClass("icon-facebook")) {
			var facebookOptions = '&p[title]=' + _shareOptions.title
				+ '&p[summary]=' + _shareOptions.summary
				+ '&p[url]=' + _shareOptions.url
				+ '&p[image]=' + _shareOptions.thumbnail;

			window.open(
				'http://www.facebook.com/sharer.php?s=100' + facebookOptions, 
				'Facebook sharing', 
				'toolbar=0,status=0,width=626,height=436'
			);
		}
		else if($(this).hasClass("icon-twitter")) {
			var twitterOptions = 'text=' + _shareOptions.twitterText
				+ '&url=' + _shareOptions.url
				+ '&via=' + _shareOptions.twitterHandle
				+ '&hashtags=' + _shareOptions.hashtags;

			window.open(
				'https://twitter.com/intent/tweet?' + twitterOptions, 
				'Tweet', 
				'toolbar=0,status=0,width=626,height=436'
			);
		}
		else{
			$("#bitly-link").attr("href",decodeURIComponent(_shareOptions.url)).html(decodeURIComponent(_shareOptions.url));

			$(".bitly-modal").addClass("visible");
		}
	});

});