// ***************************** Soundservice Factory *********************************
tune.factory('soundService', function($http) {
  var getArtist = function(tracknumber, cb) {
    //sends a GET request to SoundCloud API with the inputed 'tracknumber'
    return SC.get('/tracks', {
      q: tracknumber
    }, function(tracks) {
      if (tracks.length > 0) {
        return cb(tracks[0]);
      } else {
        return cb('No songs found');
      }
    })
  };

  //returns getArtist method and playList array -- to populate it when audio Objects (audioObj);
  return {
    getArtist: getArtist
  };
})
