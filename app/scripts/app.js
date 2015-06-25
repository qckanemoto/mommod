'use strict';

angular
    .module('mommodApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'hc.marked',
        'hljs',
        'emoji',
        'ui.bootstrap',
        'ngToast'
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/new', {
                templateUrl: 'views/new.html',
                controller: 'NewCtrl'
            })
            .when('/list', {
                templateUrl: 'views/list.html',
                controller: 'ListCtrl'
            })
            .when('/topic/:topicId', {
                templateUrl: 'views/topic.html',
                controller: 'TopicCtrl'
            })
            .when('/topic/:topicId/joiners', {
                templateUrl: 'views/joiners.html',
                controller: 'JoinersCtrl'
            })
            .when('/account', {
                templateUrl: 'views/account.html',
                controller: 'AccountCtrl'
            })
            .otherwise({
                redirectTo: '/'
            })
        ;
    }])
    .config(['markedProvider', function (markedProvider) {
        markedProvider
            .setOptions({
                // todo: I don't know why but this kills autoscroll of ngView...
                //highlight: function (code) {
                //    return hljs.highlightAuto(code).value;
                //}
                gfm: true,
                tables: true,
                breaks: true,
                pedantic: false,
                sanitize: false,
                smartLists: true,
                smartypants: false
            })
        ;
    }])
    .config(['hljsServiceProvider', function (hljsServiceProvider) {
        hljsServiceProvider
            .setOptions({
                tabReplace: '    '
            });
    }])
    .config(['ngToastProvider', function (ngToastProvider) {
        ngToastProvider
            .configure({
                className: 'danger',
                additionalClasses: 'clickable',
                timeout: 5000,
                animation: 'slide' // or 'fade'
            })
        ;
    }])
    .controller('SignOutCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'cachedParseQuery',
        function ($scope, $rootScope, $location, $timeout, cachedParseQuery) {
            $scope.signOut = function () {
                if (confirm('Sign out?')) {
                    Parse.User.logOut();
                    cachedParseQuery.destroy();
                    $location.path('/');
                    $timeout();
                }
            };
        }
    ])
    .run(['$rootScope', '$timeout', 'parse', function ($rootScope, $timeout, parse) {
        $rootScope.$on('$locationChangeSuccess', function () {
            parse.loadCurrentUserWithAvatarUrl().done(function (user) {
                $rootScope.currentUser = user;
                $timeout();
            });
        });
    }])
;
