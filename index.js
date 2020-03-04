'use strict';


const searchURLLyrics = 'https://orion.apiseeds.com/api/music/lyric/'

const apiKeyYT = 'AIzaSyCr7kUuR61548bvZBXipsACkn1HNw9-Gmk'; 
const searchURLYT = 'https://www.googleapis.com/youtube/v3/search';


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayLyrics(responseJson) {
  // if there are previous results, remove them
  $('#results-lyrics').empty();
  console.log(responseJson);
  //converts text data into legible standard lyric format
  const resultsLyrics = JSON.stringify(responseJson.result.track.text).replace(/\\n/g, "<br>").replace(/\\r/g, "");
  if (responseJson.result.probability < 80) {
    alert("Sorry, we couldn't find the lyrics for that song! Watch some videos instead.");
  }
  /*Allow probability 'NaN' for edge cases where search only has partial match (i.e. Beatles vs. the Beatles)*/
  else if (responseJson.result.probability >= 80 || 'NaN') {
    $('#results-lyrics').append(
      `<li><h3>${responseJson.result.artist.name}</h3></li>
      <li><h3>${responseJson.result.track.name}</h3></li>
      <li><p>${resultsLyrics}</p>
      </li>
      <li><h4>${responseJson.result.copyright.notice}</h4></li>`
    ); 
  } 
  $('#results').removeClass('hidden');
};

function getLyrics (searchArtist, searchTrack) {
  const apiKeyLyrics = 'd4jz1w6ptBcfxtzp5Htm88nZjHbCQfX6IsZ5XSDEQeoFkem6dklHOXgfJXvTFSeD'
  console.log(searchArtist, searchTrack);
  fetch(`https://orion.apiseeds.com/api/music/lyric/${searchArtist}/${searchTrack}?apikey=${apiKeyLyrics}`) 
  .then(response => {
      if (response.ok) {
        
        return response.json();
      }
      throw new Error(response.error);
    })
    .then(responseJson => displayLyrics(responseJson))
    .catch(err => {
    //if song not found in lyrics database or user only searches for artist, return videos instead
      $('#js-error-message').html("<h3>Sorry, we couldn't find the lyrics for that song but here are some related videos!</h3>");
    });
}


function getYouTubeVideos(searchYT, maxResults=3) {
  const params = {
    key: apiKeyYT,
    q: searchYT,
    part: 'snippet',
    maxResults,
    type: 'video',
    videoEmbeddable: 'true'
  };
  const queryString = formatQueryParams(params)
  const urlYT = searchURLYT + '?' + queryString;

  console.log(urlYT);

  fetch(urlYT)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').html(`<h3>Something went wrong: Please try again later.</h3>`);
    });
}

function displayResults(responseJson) {
  console.log(responseJson);
  // if there are previous results, remove them
  $('#results-videos').empty();
  // iterate through the items array
  for (let i = 0; i < responseJson.items.length; i++){
    $('#results-videos').append(
      `<li><h3>${responseJson.items[i].snippet.title}</h3></li>
      <li><p>${responseJson.items[i].snippet.description}</p></li>
      <li><div class='iframe-container'><iframe src='https://www.youtube.com/embed/${responseJson.items[i].id.videoId}' width='400' height='300' allowfullscreen frameborder='0' class='video'></iframe></div>
      </li>`
    )};
  //display the results section  
  $('#results').removeClass('hidden');
};


function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    $('#results-lyrics').empty();
    const searchArtist = $('#js-search-artist').val();
    const searchTrack = $('#js-search-track').val();
    //pass single string as youtube search parameter
    const searchYT = searchArtist + " " + searchTrack;
    getLyrics(searchArtist, searchTrack);
    getYouTubeVideos(searchYT);
    //remove any error messages from previous searh
    $('#js-error-message').text("");
    $('#js-search-artist').val("");
    $('#js-search-track').val("");
  });
}

$(watchForm);