appPlayer.controller('HomeController', ['$scope', 'socket', 'playerFactory', 'userName',
        function($scope, socket, playerFactory, userName) {
            // Sound manager is a audio player library with hundreds of methods available,
            // The setup we have should be enough for a MVP.
            SC.initialize({
                client_id: '8af4a50e36c50437ca44cd59756301ae'
            });
            
            $scope.isPlaying = false;
            $scope.newSongCounter = 1;

            $scope.playlist = [
                { artist: 'Michael Jackson', songName: 'Wanna Be Startin Somethin', trackID: '/tracks/172001532' },
                { artist: 'Michael Jackson', songName: 'Baby Be Mine', trackID: '/tracks/33018061'},
                { artist: 'Michael Jackson', songName: 'The Girl is Mine', trackID: '/tracks/50851680'},
                { artist: 'Michael Jackson', songName: 'Thriller', trackID: '/tracks/205736706'},
                { artist: 'Michael Jackson', songName: 'Beat It', trackID:  '/tracks/100623452'},
                { artist: 'Michael Jackson', songName: 'Billie Jean', trackID: '/tracks/145377501'},
                { artist: 'Michael Jackson', songName: 'Human Nature', trackID: '/tracks/164797447'},
                { artist: 'Michael Jackson', songName: 'P.Y.T. (Pretty Young Thing)', trackID:  '/tracks/117673524'},
                { artist: 'Michael Jackson', songName: 'The Lady in My Life', trackID: '/tracks/146210294'}
            ];

            $scope.track = $scope.playlist[0].trackID;

            $scope.addToPlaylist = function(song){
              var newSongPlaylist = song.match(/\/playlists\/\d*/g);
              var newSongTracks = song.match(/\/tracks\/\d*/g);
              var newSong = newSongPlaylist || newSongTracks;
              var obj = { artist: 'unknown artist', songName: 'unknown song'+$scope.newSongCounter, trackID: newSong };
              $scope.newSongCounter++;
              socket.emit('songAdded', obj);
              $scope.playlist.unshift(obj);

              $scope.newSong = "";
            };

            socket.on('songAdded', function (obj){
              $scope.playlist.unshift(obj);
              $scope.newSongCounter++;
            });



            $scope.playThisSong = function (index){

                if($scope.isPlaying) $scope.pause();
                $scope.track = $scope.playlist[index].trackID;
                socket.emit('playThisSong', index);
                SC.stream($scope.track, function(player){
                    console.log('player', player);
                    playerFactory.player = player;
                });
                $scope.play();
            };

            socket.on('playThisSong', function(index){
                console.log("socket.on playthisSong");
                if($scope.isPlaying) $scope.pause();
                $scope.track = $scope.playlist[index].trackID;
                SC.stream($scope.track, function(player){
                    console.log('player', player);
                    playerFactory.player = player;
                });
                $scope.play();
            });

            SC.stream($scope.track, function(player) {
                console.log('player', player);
                playerFactory.player = player;
            });

            $scope.play = function() {
                console.log("$scope.play()");
                console.log("player from fac", playerFactory.player);
                if (playerFactory.player && !playerFactory.isPlaying) {
                    playerFactory.isPlaying = true;
                    $scope.isPlaying = true;
                    playerFactory.player.play();
                    console.log('after play', playerFactory.player.id);
                    socket.emit("playNpause", {
                        id: playerFactory.player.id,
                        status: 'play'
                    });
                }
            }

            $scope.pause = function() {
                if (playerFactory.isPlaying) {
                    console.log('player from fac', playerFactory.player);
                    playerFactory.isPlaying = false;
                    $scope.isPlaying = false;
                    playerFactory.player.pause();
                    socket.emit("playNpause", {
                        id: playerFactory.player.id,
                        status: 'pause'
                    });
                }
            }
            //LISTENING --

            //PLAY WHEN HEARD from SOCKETS
            socket.on("playNpause", function(obj) {
                console.log('we heard you', obj);

                if (!playerFactory.isPlaying && obj.status === "play") {
                    SC.stream($scope.track, function(player) {
                        console.log('player', player);
                        playerFactory.player = player;
                        playerFactory.isPlaying = true;
                        $scope.isPlaying = true;
                        playerFactory.player.play();
                    });
                }

                if (obj.status === "pause") {
                    playerFactory.player.pause();
                    playerFactory.isPlaying = false;
                    $scope.isPlaying = false;
                }

            });

            /// chat controller stuff

            $scope.user = false;
            $scope.typing = false;
            $scope.TYPING_TIMER_LENGTH = 4000; // this is how quick the "[other user] is typing" message will go away
            $scope.chatSend = function() {
                socket.emit('chat message', $scope.chatMsg);
                $scope.chatMsg = "";
                return false;
            }

            $scope.chatMessages = [];

            socket.on('chat message', function(msg) {
                $scope.chatMessages.push(msg);
            });

            $scope.updateTyping = function() {
                $scope.typing = true;
                socket.emit('typing', userName.name);
                var lastTypingTime = (new Date()).getTime();

                setTimeout(function() {
                    var typingTimer = (new Date()).getTime();
                    var timeDiff = typingTimer - lastTypingTime;
                    if (timeDiff >= $scope.TYPING_TIMER_LENGTH && $scope.typing) {
                        socket.emit('stop typing');
                        $scope.typing = false;
                    }
                }, $scope.TYPING_TIMER_LENGTH);
            };

            // Whenever the server emits 'typing', show the typing message
            socket.on('typing', function(data) {

                data.typing = true;
                $scope.typingMessage = data.name + " is typing";

                if (!$scope.chatMessages.includes($scope.typingMessage)) {
                    $scope.chatMessages.push($scope.typingMessage);
                }
            });

            // Whenever the server emits 'stop typing', kill the typing message
            socket.on('stop typing', function(data) {
                data.typing = false;

                var i = $scope.chatMessages.indexOf($scope.typingMessage);
                $scope.chatMessages.splice(i, 1);
            });

        }
    ])
    .controller('LandingPage', ['$scope', '$location', 'userName', 'socket', function($scope, $location, userName, socket) {
        var name = '';
        $scope.submit = function() {
            if ($scope.text) {
                name = userName.user(this.text);
            }
            socket.emit('username', userName.name);
            $location.path('/home', false)
        }
    }])
    .factory('playerFactory', function() {
        var singleton = {};
        singleton.player = null;
        singleton.isPlaying = false;
        return singleton;
    })
    .factory('socket', function($rootScope) {
        var socket = io.connect();

        return {
            on: function(eventName, callback) {
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },

            emit: function(eventName, data, callback) {
                socket.emit(eventName, data, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    })
                })
            }
        };
    })
    .factory('userName', function() {
        var userSet = {};
        userSet.name = '';
        userSet.user = function(userVal) {
            userSet.name = userVal;
        };

        return userSet;
    });