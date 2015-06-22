'use strict';

angular.module('mommodApp')
    .factory('assertSignedIn', ['$rootScope', '$location', function ($rootScope, $location) {
        return function () {
            if (!$rootScope.currentUser) {
                $location.path('/');
            }
        };
    }])
    .factory('cachedParseQuery', ['$cacheFactory', function ($cacheFactory) {
        return function (parseQuery, method) {
            var parseCache = $cacheFactory.get('parseQuery') || $cacheFactory('parseQuery');

            var key = JSON.stringify(parseQuery) + '#' + method;

            if (parseCache.get(key) != undefined) {
                return Parse.Promise.as(parseCache.get(key));
            }

            var promise = new Parse.Promise();
            parseQuery[method]()
                .done(function (result) {
                    parseCache.put(key, result);
                    promise.resolve(result);
                })
                .fail(function (error) {
                    promise.reject(error);
                })
            ;
            return promise;
        };
    }])
    .constant('mockThread', [
        {
            id: 2,
            content: 'test comment',
            stargazers: [
                'user1'
            ],
            created_at: new Date(),
            updated_at: null
        },
        {
            id: 4,
            content: 'test comment',
            stargazers: [
                'user2',
                'user3'
            ],
            created_at: new Date(),
            updated_at: null
        },
        {
            id: 5,
            content: 'test comment',
            stargazers: [
                'user1',
                'user2'
            ],
            created_at: new Date(),
            updated_at: null
        },
        {
            id: 6,
            content: 'test comment',
            stargazers: [
                'user1',
                'user2',
                'user3'
            ],
            created_at: new Date(),
            updated_at: null
        }
    ])
;
