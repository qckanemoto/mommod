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
        'hljs'
    ])
    .config(['$routeProvider', 'markedProvider', 'hljsServiceProvider', function ($routeProvider, markedProvider, hljsServiceProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/topic/:topicId', {
                templateUrl: 'views/topic.html',
                controller: 'TopicCtrl'
            })
            .when('/new', {
                templateUrl: 'views/new.html',
                controller: 'NewCtrl'
            })
            .when('/thread/:id', {
                templateUrl: 'views/thread.html',
                controller: 'ThreadCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        markedProvider
            .setOptions({
                gfm: true,
                tables: true,
                breaks: true,
                pedantic: false,
                sanitize: true,
                smartLists: true,
                smartypants: false,
                highlight: function (code) {
                    return hljs.highlightAuto(code).value;
                }
            });

        hljsServiceProvider
            .setOptions({
                tabReplace: '    '
            });
    }])
;
