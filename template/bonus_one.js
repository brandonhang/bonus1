/* This script enables the predictive search capabilities of the associated HTML document.  It 
 * grabs a JSON object from the Matt Bowytz API, parses it for searchable terms, and stores it
 * in an array.  A regular expression, with properly escaped special characters, is then used
 * to match text in the search bar with terms in the array.  A list of search terms is 
 * displayed should the text match any terms from the array.  "Submitting" the form redirects
 * the user to the first result in the list should any be present.
 */

$(document).ready(function() {
	var $jsonArray;					// Array of json search terms
	var searchResults = [];		// Array of search results
	$.ajax({
		url: 'http://www.mattbowytz.com/simple_api.json',
		type: 'GET',
		datatype: 'json',
		data: { data: 'all' },
		success: function(data) {
			$jsonArray = $.merge(data.data.interests, data.data.programming);		// Creates a single array from the interests and programming sections
			$jsonArray.sort(function(a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());				// Case insensitive sorting of the array
			});
		}
	});
	$('.flexsearch-input').on('keyup input', function(e) {			// Event listener gets search results whenever a key is pressed
		var text = $(this).val();
		if (text) {								// Only does work if there is text in the search bar
			searchResults.length = 0;					// Resets the array of search results
			var moddedString = escapeSymbols(text);				// Escapes special Javascript characters .[()|\+*^
			var regex = new RegExp("\^" + moddedString, "i");		// Creates a regular expression from the input
			$.each($jsonArray, function(index, value) {
				if (regex.test(value) === true) {			// Adds search terms to the results array if a match is found
					var boldResult = "<strong>" +					// Makes matched sections of the string bolded (like Google)
							[value.slice(0, text.length), "</strong>", value.slice(text.length)].join('');
					searchResults.push('<li><a href="http://www.google.com/search?q=' + value +
							'">' + boldResult + '</a></li>');
				}
			});
			if (searchResults.length == 0) {					// Displays a message if no successful search terms were found
				searchResults.push("<li>You ain't got no search results, Lieutenant Dan!</li>");
			}
			$('.flexsearch-list li').remove();				// Removes the currently displayed list items from the DOM
			$.each(searchResults, function(index, value) {
				$('.flexsearch-list').append(value);			// Appends the search terms from the array to the DOM
			});
			if ($('.flexsearch-results-wrapper').is(":hidden")) {		// Shows the results if they are not visible
				$('.flexsearch-results-wrapper').show();
			}
		}
		else {
			if ($('.flexsearch-results-wrapper').is(":visible")) {		// Hides the results if no text is entered in the search bar
				$('.flexsearch-results-wrapper').hide();
			}
		}
	});
	$('.flexsearch-form').submit(function(e) { 						// Event listener redirects the user to the first search result upon form submission
		if (typeof searchResults !== "undefined" && searchResults.length > 0) {		// Only works if the list is not "null" and it contains at least 1 item
			var url = searchResults[0];
			if (url.slice(0, 12) == "<li><a href=") {			// Checks to see if the item contains a valid url
				url = url.slice(13, url.indexOf('"><'));			// Gets the url from the html link
				e.preventDefault();
				document.location.href = url;
			}
		}
	});
	console.log('Keepin\'n it clean with an external script!');
});

function escapeSymbols(input) {				// This function escapes special Javascript characters by inserting a backslash before it
	for (i = input.length - 1; i >= 0; i--) {			// Loops through the string character by character (in reverse)
		if (/[\^\*\(\)\+\\\|\[\.]/.test(input.charAt(i))) {
			input = input.slice(0, i) + "\\" + input.slice(i, input.length);		// Inserts a backslash before the special character
		}
	}
	return input;
}
