let API_KEY = 'b3f2f0cebcbe4c5df205da9d999fce5c';

var userList;

let msTime = {
  second :    1000,
  minute:    60000,
  hour:    3600000,
  day:    86400000
};

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
  let url = 'https://ws.audioscrobbler.com/2.0/';
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
    PostRequestFollowUp();
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
function AggregateTrackData(trackArray) { // It's important to note that scrobbles are sorted in order of descending time
  trackArray.forEach(function(element) {    // Round the recorded times down to a certain timestep
    var tempTime = new Date(element.time * 1000); // Create a date from the UNIX time in seconds; must multiply by 1000 for milliseconds
    element.time = +d3.time.hour.floor(tempTime); // Round down to the nearest hour
  });
  var minTime = trackArray[trackArray.length-1].time;
  var maxTime = trackArray[0].time;
  
  aggregatedTrackData = d3.nest()           // Aggregate the data
    .key(function(d) {return d.artist;})    // Sort by artist
    .key(function(d) {return d.time;})      // Sort by time
    .rollup(function(d) {return d.length;}) // Count the number of scrobbles for this time and replace scrobble entries with this count
    .entries(trackArray);
  
  aggregatedTrackData.sort(function(a, b) {return b.values.length - a.values.length}); // Sort the artist series by number of entries they have (descending)
  if (aggregatedTrackData.length > 20) {                    // If the number of series is greater than 20,      *Note: We do this because of the color limit (d3.scale.category20()) and
    aggregatedTrackData = aggregatedTrackData.slice(0,20);  // take the top 20 series and trash the rest ;)            the performance limitations; 20 is a lot and it's laggy after that
  }
  
  aggregatedTrackData.forEach(function(element) {        // For each artist
    element.values = element.values.map(function(item) { // replace the set of properties with an array of their corresponding values
        return Object.values(item);
    });
  });
  
  // At this point, it's important to note that the scrobble times are sorted in order of descending time,
  // so the latest entries will be at the beginning of the array(s) and the earliest entries will be at the end
  var i, tmpTimePoint;
  aggregatedTrackData.forEach((function(element) {                                                    // For each artist
    for (i = 0, tmpTimePoint = maxTime; tmpTimePoint >= minTime; i++, tmpTimePoint -= msTime.hour) {  // step through the list of scrobbles and fill in zero data for the missing times
      if (element.values.length === i) {          // If there are no more time entries before the current tmpTimePoint, we have reached the end of the array,
        element.values.push([tmpTimePoint, 0]);   // so just add more entries at the end of the array
      } else if (element.values[i][0] < tmpTimePoint) { // If the scrobble time is before the current tmpTimePoint,
        element.values.splice(i, 0, [tmpTimePoint, 0]); // insert a missing time entry
      } else if (element.values[i][0] == tmpTimePoint) {    // If this time entry exists,
        if (typeof(element.values[i][0]) === "string") {    // check to see if our time value is stored in a string (due to d3.keys() coercion to string type)
          element.values[i][0] = +element.values[i][0];     // and clean the time entries so that they will be of number type and not string type
        }
      } else {
          console.log('You\'ve gone and fucked it up again! Maybe there was a value that was out of the domain of the timestep?');
      }
    }
  }));
}

var myChart;
function testRequest() {
  d3.selectAll('#chart1 > *').remove();
  d3.selectAll(".nvtooltip").remove();
  
  myChart = {svg: d3.select('#chart1')};
  myChart.width = parseInt(myChart.svg.style("width"));
  myChart.height = parseInt(myChart.svg.style("height"));
  myChart.svg.append("text")
    .attr("x", myChart.width / 2)
    .attr("y", myChart.height / 2)
    .attr("text-anchor", "middle")
    .style("font", "sans-serif")
    .style("font-size", function() {
      return Math.min(myChart.width, myChart.height) / 10;
    })
    .text("Loading...");
  let callback = function(data) {
      $('#result').html(JSON.stringify(data, null, 2));
    };
  getUserRecentTracks($('#textInput').val());
}

function PostRequestFollowUp() {
  AggregateTrackData(track_scrobbles);
  BuildUserListenGraph(aggregatedTrackData);
  d3.select('#chart1').selectAll("text").remove();
}