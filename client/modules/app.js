
var appPlayer = angular.module('MusicPlayer', ['ngRoute', 'ngCookies', 'ngMaterial', 'ngAnimate']); // ngMaterial is for the Progress Bar
appPlayer.config(function($routeProvider, $mdThemingProvider) { // $mdThemingProvider, for the Progress Bar
    $routeProvider
        .when('/home', {
          controller: 'HomeController',
          templateUrl: '../views/min/home.html'
        })
        .when('/', {
          controller: 'SplashController',
          templateUrl: '../views/min/splash.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    // Progress Bar theme set.
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette('orange')
});

