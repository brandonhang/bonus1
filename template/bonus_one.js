/* This script enables the predictive search capabilities of the associated HTML document.  It 
 * grabs a JSON object from the Matt Bowytz API, parses it for searchable terms, and stores it
 * in an array.  A regular expression, with properly escaped special characters, is then used
 * to match text in the search bar with terms in the array.  A list of search terms is 
 * displayed should the text match any terms from the array.  "Submitting" the form redirects
 * the user to the first result in the list should any be present.
 */

$(document).ready(function() {
	var $jsonArray;					// Array of json search terms
	var $searchResults = [];		// Array of search results
	$.ajax({
		url: 'http://www.mattbowytz.com/simple_api.json',
		type: 'GET',
		datatype: 'json',
		data: { data: 'all' },
		success: function(data) {
			$jsonArray = $.merge(data.data.interests, data.data.programming);
			$jsonArray.sort(function(a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
		}
	});
	$('.flexsearch-input').on('keyup input', function(e) {
		var $text = $(this).val();
		if ($text) {
			$searchResults.length = 0;
			var $moddedString = escapeSymbols($text);
			var $regex = new RegExp("\^" + $moddedString, "i");
			$.each($jsonArray, function(index, value) {
				if ($regex.test(value) === true) {
					var $boldResult = "<strong>" +
							[value.slice(0, $text.length), "</strong>", value.slice($text.length)].join('');
					$searchResults.push('<li><a href="http://www.google.com/search?q=' + value +
							'">' + $boldResult + '</a></li>');
				}
			});
			if ($searchResults.length == 0) {
				$searchResults.push("<li>You ain't got no search results, Lieutenant Dan!</li>");
			}
			$('.flexsearch-list li').remove();
			$.each($searchResults, function(index, value) {
				$('.flexsearch-list').append(value);
			});
			if ($('.flexsearch-results-wrapper').is(":hidden")) {
				$('.flexsearch-results-wrapper').show();
			}
		}
		else {
			if ($('.flexsearch-results-wrapper').is(":visible")) {
				$('.flexsearch-results-wrapper').hide();
			}
		}
	});
	$('.flexsearch-form').submit(function(e) { 
		if (typeof $searchResults !== "undefined" && $searchResults.length > 0) {
			var $url = $searchResults[0];
			if ($url.slice(0, 12) == "<li><a href=") {
				$url = $url.slice(13, $url.indexOf('"><'));
				console.log($url);
				e.preventDefault();
				document.location.href = $url;
			}
		}
	});
	console.log('Keepin\'n it clean with an external script!');
});

function escapeSymbols($input) {
	for (i = $input.length - 1; i >= 0; i--) {
		if (/[\^\*\(\)\+\\\|\[\.]/.test($input.charAt(i))) {
			$input = $input.slice(0, i) + "\\" + $input.slice(i, $input.length);
		}
	}
	return $input;
}
