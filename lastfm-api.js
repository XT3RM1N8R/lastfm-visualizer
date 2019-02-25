let API_KEY = 'b3f2f0cebcbe4c5df205da9d999fce5c';

var userList;

var count = 0;


function quickRequest(type, url, headers, data, dataType, callback) {
  jQuery.ajax({
    type : type,
    url : url,
    headers: headers,
    data : data,
    dataType : dataType,
    success : callback,
    error : function(code, message){
      $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
    }
  });
}

function quickRequestLastfm(data, callback) {
  let type = 'GET';
  let url = 'http://ws.audioscrobbler.com/2.0/';
  let headers = {};
  data.format = 'json';
  data.api_key = API_KEY;
  let dataType = 'json';
  quickRequest(type, url, headers, data, dataType, callback);
}

function getArtistInfo(artist, callback) {
  quickRequestLastfm(
    {
      method: 'artist.getinfo',
      artist: artist
    },
    callback);
}

function getUserFriends(username, callback) {
  quickRequestLastfm(
    {
      method: 'user.getFriends',
      user: username
    },
    callback);
}

function getChartTopArtists(artistNumber) {
  let callback = function(data) {
    let artistList = data.artists.artist;
    let json_data = [];
    for (let artist in artistList) {
      json_data.push({
        name: artistList[artist].name
      });
    }
    $('#success #test').html(JSON.stringify(json_data, null, 2));
  };
  let MAX_PER_PAGE = 100; // The API returns erratic results after 119 artists per page
  if (artistNumber > MAX_PER_PAGE) {
    artistNumber = MAX_PER_PAGE;
  }
  quickRequestLastfm(
    {
      method: 'chart.getTopArtists',
      page: '1', // Page selection
      limit: artistNumber // Results per page
    },
    callback);
}

var track_scrobbles = [];
function getUserRecentTracks(username) {
  let callback = function(data) {
    let trackList = data.recenttracks.track;
    let track_data = [];
    for (let track in trackList) {
      if (!trackList[track].date) {
        continue;
      }
      track_data.push({
        name: trackList[track].name,
        album: trackList[track].album['#text'],
        artist: trackList[track].artist['#text'],
        time: trackList[track].date.uts
      });
    }
    track_scrobbles = track_data;
    //$('#result').html(JSON.stringify(track_data, null, 2));
    AggregateTrackData(track_scrobbles);
    BuildUserListenGraph(aggregatedTrackData);
    StackedAreaChartExample();
  };
  quickRequestLastfm(
    {
      method: 'user.getRecentTracks',
      limit: 200, // Max limit
      user: username,
      page: '1' // Page selection
    },
    callback);
}

var aggregatedTrackData = [];
function AggregateTrackData(trackArray) {
  trackArray.forEach(function(element) {
    var tempTime = new Date(element.time * 1000);
    element.time = +d3.time.hour.floor(tempTime);
    console.log(element.time);
  });
  aggregatedTrackData = d3.nest()
    .key(function(d) {return d.artist;})
    .key(function(d) {
      console.log('the time: ' + d.time);
      return d.time;})
    .rollup(function(d) {return d.length;})
    .entries(trackArray);
  console.log('Entry here: ' + aggregatedTrackData);
  console.log(JSON.stringify(aggregatedTrackData, null, 2));
  aggregatedTrackData.forEach(function(element) {
    element.values = element.values.map(function(item) {
        return Object.values(item);
    });
  });
  console.log(aggregatedTrackData);
  console.log(JSON.stringify(aggregatedTrackData, null, 2));
}

function testRequest() {
  let callback = function(data) {
      $('#result').html(JSON.stringify(data, null, 2));
    };
  getUserRecentTracks($('#textInput').val());
}