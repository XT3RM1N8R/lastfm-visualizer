var count = 0;
function loadArtist() {$.ajax({
  type : 'POST',
  url : 'http://ws.audioscrobbler.com/2.0/',
  data : 'method=artist.getinfo&' +
    'artist=C418&' +
    'api_key=b3f2f0cebcbe4c5df205da9d999fce5c&' +
    'format=json',
  dataType : 'jsonp',
  success : function(data) {
    $('#success #artistName').html(data.artist.name);
    count = count + 1;
    $('#success #count').html(count);
  },
  error : function(code, message){
    $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
  }
});}