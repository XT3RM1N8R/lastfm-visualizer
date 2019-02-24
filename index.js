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

function getChartTopArtists() {
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
  quickRequestLastfm(
    {
      method: 'chart.getTopArtists',
      page: '1', // Page offset
      limit: '100' // Results per page
    },
    callback);
}



function testRequest() {
  let callback = function(data) {
      $('#success #test').html(JSON.stringify(data, null, 2));
    };
  getChartTopArtists();
}