'use strict';

angular.module('mommodApp')

    // offer markdown editor.
    .directive('markdownEditor', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/markdown-editor.html',
            scope: {
                content: '='
            },
            link: function (scope, elem, attr) {
                scope.required = 'required' in attr;
                scope.isEditing = true;
            }
        };
    })

    // add href feature to any element.
    .directive('anyHref', ['$location', function ($location) {
        return {
            restrict: 'A',
            scope: {
                href: '@anyHref'
            },
            link: function (scope, elem, attr) {
                elem.on('click', function () {
                    var buf = scope.href.replace(/^#/, '').split('#');
                    var url = buf[0] + (buf[1] ? '#' + buf[1] : '');
                    scope.$apply(function () {
                        $location.url(url);
                    });
                });
            }
        };
    }])

    // add class to the specified element by location hash.
    .directive('hashFocusedClass', ['$location', function ($location) {
        return {
            restrict: 'A',
            scope: {
                hashFocusedClass: '@',
                hash: '@'
            },
            link: function (scope, elem, attr) {
                if ($location.hash() == scope.hash) {
                    elem.addClass(scope.hashFocusedClass);
                }
            }
        };
    }])

    // autofocus after every rendering.
    .directive('autofocus', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, elem, attr) {
                elem.focus();
            }
        };
    })

    // turn on/off spinner-modal by true/false of 'trigger'.
    .directive('spinnerModal', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/spinner-modal.html',
            scope: {
                trigger: '='
            },
            link: function (scope, elem, attr) {
                elem.modal({
                    backdrop: 'static',
                    keyboard: false,
                    show: false
                });
                scope.$watch('trigger', function () {
                    elem.modal(scope.trigger ? 'show' : 'hide');
                });
            }
        };
    })

    // hide element when current user don't have write access to the Parse.Object.
    .directive('parseHide', function () {
        return {
            restrict: 'A',
            scope: {
                parseHide: '='
            },
            link: function (scope, elem, attr) {
                scope.$watch('parseHide', function () {
                    if (scope.parseHide) {
                        if (!scope.parseHide.getACL().getWriteAccess(Parse.User.current())) {
                            elem.hide();
                        }
                    }
                });
            }
        };
    })

    // star/unstar button with caching stargazer list.
    .directive('starButton', ['$cacheFactory', '$timeout', 'parse', function ($cacheFactory, $timeout, parse) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/star-button.html',
            scope: {
                comment: '='
            },
            link: function (scope, elem, attr) {
                var stargazersCache = $cacheFactory.get('stargazers') || $cacheFactory('stargazers');
                scope.spinner = true;
                parse.getStargazers(scope.comment, true)
                    .done(function (stargazers) {
                        stargazersCache.put(scope.comment.id, stargazers);
                        scope.spinner = false;
                        $timeout();
                    })
                ;

                scope.isStarred = function (comment) {
                    if (!Parse.User.current()) {
                        return false;
                    }
                    var stargazers = stargazersCache.get(comment.id);
                    return !!_.findWhere(stargazers, { id: Parse.User.current().id });  // cast to boolean.
                };

                scope.countStargazers = function (comment) {
                    return _.toArray(stargazersCache.get(comment.id)).length;
                };

                scope.toggleStar = function (comment) {
                    scope.spinner = true;
                    if (scope.isStarred(comment)) {
                        parse.unstar(comment).done(function () {
                            var stargazers = stargazersCache.get(comment.id);
                            var index = _.findIndex(stargazers, { id: Parse.User.current().id });
                            delete stargazers[index];
                            stargazers = _.compact(stargazers);
                            stargazersCache.put(comment.id, stargazers);
                            scope.spinner = false;
                            $timeout();
                        });
                    } else {
                        parse.star(comment).done(function () {
                            var stargazers = stargazersCache.get(comment.id);
                            stargazers.push(Parse.User.current());
                            stargazersCache.put(comment.id, stargazers);
                            scope.spinner = false;
                            $timeout();
                        });
                    }
                };
            }
        };
    }])
;
