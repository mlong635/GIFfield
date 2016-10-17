tune.controller('SplashController', ['$scope', '$location', 'socket', '$cookies', 'userName',
  function ($scope, $location, socket, $cookies, userName) {
    $scope.submit = function() {
      if ($scope.text) {
        $cookies.put('username', $scope.text);
        userName.user($scope.text);
        socket.emit('username', $cookies.get('username'));
        $location.path('/home', true);
      }
    }
  }
]);
