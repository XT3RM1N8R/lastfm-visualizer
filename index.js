var count = 0;
function loadArtist() {
  jQuery.ajax({
    type : 'GET',
    url : 'http://ws.audioscrobbler.com/2.0/',
    data : 'method=artist.getinfo&' +
      'artist=C418&' +
      'api_key=b3f2f0cebcbe4c5df205da9d999fce5c&' +
      'format=json',
    dataType : 'json',
    success : function(data) {
      $('#success #artistName').html(JSON.stringify(data, null, 2));
      count = count + 1;
      $('#success #count').html(count);
    },
    error : function(code, message){
      $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
    }
  });
}