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
            .when('/notifications', {
                templateUrl: 'views/notifications.html',
                controller: 'NotificationsCtrl'
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
        // extend Parse.User first of all.
        Parse.User.extend({
            getDisplayName: function () {
                return this.get('displayName') || this.get('username');
            },
            getAvatarUrl: function () {
                return this.get('avatarUrl') || 'images/default-avatar.png';
            }
        });

        // automatically refresh $rootScope models after location is changed.
        $rootScope.$on('$locationChangeSuccess', function () {
            $rootScope.currentUser = Parse.User.current();
            if (Parse.User.current()) {
                parse.getNotifications().done(function (notifications) {
                    $rootScope.notifications = _.groupBy(notifications, function (notification) {
                        return notification.get('read') ? 'read' : 'unread';
                    });
                    $timeout();
                });
            } else {
                $rootScope.notifications = null;
            }
            $timeout();
        });
    }])
;

'use strict';

angular.module('mommodApp')
    .controller('MainCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'ngToast',
        function ($scope, $rootScope, $location, $timeout, ngToast) {

            if (Parse.User.current()) {
                $location.path('list');
            }

            $scope.tab = 0;
            $scope.user = {
                username: '',
                email: '',
                password: ''
            };

            $scope.signIn = function () {
                $rootScope.spinner = true;
                Parse.User.logIn($scope.user.username, $scope.user.password)
                    .done(function () {
                        $location.path('list');
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };

            $scope.signUp = function () {
                $rootScope.spinner = true;
                var user = new Parse.User();
                user
                    .set('username', $scope.user.username)
                    .set('email', $scope.user.email)
                    .set('password', $scope.user.password)
                    .signUp()
                    .done(function () {
                        $location.path('list');
                        ngToast.create({
                            className: 'success',
                            content: 'Successfully signed up :)',
                            timeout: 3000
                        });
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };
        }
    ])
;

'use strict';

angular.module('mommodApp')
    .controller('ListCtrl', [
        '$scope', '$rootScope', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topics = [];
            $scope.joinerCounts = [];
            $scope.commentCounts = [];
            $scope.lastCommentedAts = [];

            // get topics.
            $rootScope.spinner = true;
            parse.getTopics()
                .then(function (topics) {
                    $scope.topics = topics;

                    // get lastCommentedAts.
                    var promise = Parse.Promise.as();
                    topics.forEach(function (topic) {
                        promise = promise
                            .then(function () {
                                return parse.getLastCommentedAt(topic);
                            })
                            .done(function (lastCommentedAt) {
                                $scope.lastCommentedAts[topic.id] = lastCommentedAt;
                            })
                        ;
                    });
                    return Parse.Promise.when(Parse.Promise.as(topics), promise);
                })
                .then(function (topics) {
                    // count joiners.
                    topics.forEach(function (topic) {
                        var count = _.keys(topic.getACL().toJSON()).length;
                        $scope.joinerCounts[topic.id] = count;
                    });

                    // count comments.
                    var promise = Parse.Promise.as();
                    topics.forEach(function (topic) {
                        promise = promise
                            .then(function () {
                                return parse.countComments(topic);
                            })
                            .done(function (count) {
                                $scope.commentCounts[topic.id] = count;
                            })
                            .fail(function () {
                                $scope.counts.comments.push('-');
                            })
                        ;
                    });
                    return promise;
                })
                .done(function () {
                    $rootScope.spinner = false;
                    $timeout();
                })
                .fail(function (error) {
                    ngToast.create('[' + error.code + '] ' + error.message);
                    $rootScope.spinner = false;
                    $timeout();
                })
            ;
        }
    ])
;

'use strict';

angular.module('mommodApp')
    .controller('NewCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.title = '';
            $scope.content = '';

            $scope.createTopic = function () {
                $rootScope.spinner = true;
                parse.postTopic({
                    title: $scope.title,
                    content: $scope.content
                })
                    .done(function (topic) {
                        $location.path('topic/' + topic.id);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };
        }
    ])
;

'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', [
        '$scope', '$rootScope', '$location', '$anchorScroll', '$routeParams', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $anchorScroll, $routeParams, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topic = null;
            $scope.comments = [];
            $scope.joinsers = [];
            $scope.replyTo = null;
            $scope.commentContent = '';
            $scope.lastCommentedAt = null;

            // add property of editing content which is separated from original content to topic/comment object.
            var makeEditable = function (obj) {
                obj.isEditing = false;
                obj.editingContent = obj.get('content');
                if (obj.get('title') != undefined) {
                    obj.editingTitle = obj.get('title');
                }
                return obj;
            };

            // get topic, comments.
            $rootScope.spinner = true;
            parse.getTopic($routeParams.topicId)
                .then(function (topic, joiners) {
                    $scope.topic = makeEditable(topic);
                    $scope.joiners = joiners;
                    return Parse.Promise.when(Parse.Promise.as(topic), parse.getLastCommentedAt($scope.topic));
                })
                .then(function (topic, lastCommentedAt) {
                    $scope.lastCommentedAt = lastCommentedAt;
                    return parse.getComments(topic);
                })
                .done(function (comments) {
                    $scope.comments = _.map(comments, function (comment) {
                        return makeEditable(comment);
                    });
                    $rootScope.spinner = false;
                    $timeout();
                    $timeout($anchorScroll);  // anchorScroll after comments are rendered.
                })
                .fail(function (error) {
                    $location.path('list');
                    ngToast.create('[' + error.code + '] ' + error.message);
                    $rootScope.spinner = false;
                    $timeout();
                })
            ;

            //-------------------------------------------------------------------------------------
            // scope functions.
            //-------------------------------------------------------------------------------------

            $scope.postComment = function () {
                $rootScope.spinner = true;
                parse.postComment({
                    content: $scope.commentContent,
                    topic: $scope.topic,
                    replyTo: $scope.replyTo
                })
                    .done(function (comment, comments) {
                        $scope.commentContent = '';
                        $scope.replyTo = null;
                        $scope.comments = _.map(comments, function (comment) {
                            return makeEditable(comment);
                        });
                        $scope.lastCommentedAt = new Date();
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };

            $scope.deleteComment = function (comment) {
                if (confirm('Delete this comment?')) {
                    $rootScope.spinner = true;
                    parse.deleteComment(comment)
                        .done(function (comment, comments) {
                            $scope.comments = _.map(comments, function (comment) {
                                return makeEditable(comment);
                            });
                            $rootScope.spinner = false;
                            $timeout();
                        })
                        .fail(function (error) {
                            ngToast.create('[' + error.code + '] ' + error.message);
                            $rootScope.spinner = false;
                            $timeout();
                        })
                    ;
                }
            };

            $scope.updateTopic = function (topic) {
                $rootScope.spinner = true;
                parse.updateTopic(topic, {
                    title: topic.editingTitle,
                    content: topic.editingContent
                })
                    .done(function (topic) {
                        $scope.topic = makeEditable(topic);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };

            $scope.updateComment = function (comment) {
                $rootScope.spinner = true;
                parse.updateComment(comment, { content: comment.editingContent })
                    .done(function (comment) {
                        var index = _.findIndex($scope.comments, { id: comment.id });
                        $scope.comments[index] = makeEditable(comment);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };

            // close or reopen topic.
            $scope.updateTopicClosed = function (topic, closed) {
                if (confirm((closed ? 'Close' : 'Reopen') + ' this topic?')) {
                    $rootScope.spinner = true;
                    parse.updateTopic(topic, { closed: closed })
                        .done(function (topic) {
                            $scope.topic = makeEditable(topic);
                            $rootScope.spinner = false;
                            $timeout();
                        })
                        .fail(function (error) {
                            ngToast.create('[' + error.code + '] ' + error.message);
                            $rootScope.spinner = false;
                            $timeout();
                        })
                    ;
                }
            };
        }
    ])
;

'use strict';

angular.module('mommodApp')
    .controller('JoinersCtrl', [
        '$scope', '$rootScope', '$location', '$routeParams', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $routeParams, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topic = null;
            $scope.joiners = [];
            $scope.usernames = [];
            $scope.usernameToAdd = '';

            // get topic and joiners, and all usernames for typeahead..
            $rootScope.spinner = true;
            parse.getTopic($routeParams.topicId)
                .then(function (topic) {
                    var promise = new Parse.Promise();

                    // reject user don't have read access.
                    if (!topic) {
                        promise.reject({code: '000', message: 'You have no read access.'});
                        return promise;
                    }

                    $scope.topic = topic;

                    // reject user don't have write access.
                    if (Parse.User.current() && !topic.getACL().getWriteAccess(Parse.User.current().id)) {
                        promise.reject({code: '000', message: 'You have no write access.'});
                        return promise;
                    }

                    // get joiners.
                    return parse.getJoiners(topic);
                })
                .then(function (joiners) {
                    $scope.joiners = joiners;

                    // get all usernames.
                    return parse.getUsernames()
                        .done(function (usernames) {
                            usernames = _.reject(usernames, function (username) {
                                var joinernames = _.map(joiners, function (joiner) {
                                    return joiner.get('username');
                                });
                                return _.contains(joinernames, username);
                            });
                            $scope.usernames = usernames;
                        })
                    ;
                })
                .done(function () {
                    $rootScope.spinner = false;
                    $timeout();
                })
                .fail(function (error) {
                    if ($scope.topic) {
                        $location.path('topic/' + $scope.topic.id);
                    } else {
                        $location.path('list');
                    }
                    ngToast.create('[' + error.code + '] ' + error.message);
                    $rootScope.spinner = false;
                    $timeout();
                })
            ;

            $scope.addJoiner = function () {
                $rootScope.spinner = true;
                parse.addJoiner($scope.topic, $scope.usernameToAdd)
                    .done(function (user, joiners) {
                        $scope.joiners = joiners;
                        $scope.usernameToAdd = '';
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };

            $scope.removeJoiner = function (user) {
                if (confirm('Remove "' + user.get('username') + '"?')) {
                    parse.removeJoiner($scope.topic, user)
                        .done(function (user) {
                            var index = _.findIndex($scope.joiners, {id: user.id});
                            delete $scope.joiners[index];
                            $scope.joiners = _.compact($scope.joiners);
                            $rootScope.spinner = false;
                            $timeout();
                        })
                        .fail(function (error) {
                            ngToast.create('[' + error.code + '] ' + error.message);
                            $rootScope.spinner = false;
                            $timeout();
                        })
                    ;
                }
            };
        }
    ])
;

'use strict';

angular.module('mommodApp')
    .controller('AccountCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.user = Parse.User.current();
            $scope.avatarFile = null;

            $scope.form = {
                profile: {
                    username: Parse.User.current().get('username'),
                    email: Parse.User.current().get('email'),
                    displayName: Parse.User.current().get('displayName'),
                    password: ''
                },
                setting: {}
            };

            // get setting.
            parse.getSetting(Parse.User.current())
                .done(function (setting) {
                    $scope.form.setting.notification = setting.get('notification');
                    $timeout();
                });

            $scope.updateProfile = function () {
                $rootScope.spinner = true;
                if ($scope.form.profile.password == '') {
                    delete $scope.form.profile.password;
                }
                parse.updateUser($scope.form.profile, $scope.avatarFile)
                    .done(function () {
                        $scope.form.profile.password = '';
                        $scope.avatarFile = null;
                        ngToast.create({
                            className: 'success',
                            content: 'Profile is successfully updated.',
                            timeout: 3000
                        });
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    });
            };

            $scope.saveSetting = function () {
                $rootScope.spinner = true;
                parse.saveSetting($scope.form.setting)
                    .done(function () {
                        ngToast.create({
                            className: 'success',
                            content: 'Setting is successfully updated.',
                            timeout: 3000
                        });
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    });
            };
        }
    ])
;

'use strict';

angular.module('mommodApp')
    .controller('NotificationsCtrl', [
        '$scope', '$rootScope', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.notifications = [];

            // get notifications.
            $rootScope.spinner = true;
            parse.getNotifications()
                .done(function (notifications) {
                    $scope.notifications = notifications;
                    $rootScope.spinner = false;
                    $timeout();
                })
                .fail(function (error) {
                    ngToast.create('[' + error.code + '] ' + error.message);
                    $rootScope.spinner = false;
                    $timeout();
                })
            ;

            $scope.toggleRead = function (notification) {
                parse.updateNotification(notification, { read: !notification.get('read') })
                    .done(function (updated) {
                        notification.set('read', updated.get('read'));
                        $timeout();
                    });
            };
        }
    ])
;

'use strict';

angular.module('mommodApp')

    // constants.
    .constant('constants', function () {
        return {
            notificationType: {
                mentioned: 'NOTIFICATION_TYPE_MENTIONED',
                starred: 'NOTIFICATION_TYPE_STARRED',
                invited: 'NOTIFICATION_TYPE_INVITED'
            }
        };
    })

    // assert signed in.
    .factory('assertSignedIn', ['$location', function ($location) {
        return function () {
            if (!Parse.User.current()) {
                $location.path('/');
            }
        };
    }])

    // cache api access to parse.com.
    .factory('cachedParseQuery', ['$cacheFactory', function ($cacheFactory) {
        return {
            use: function (parseQuery, method, force) {
                force = force || false;
                var parseCache = $cacheFactory.get('parseQuery') || $cacheFactory('parseQuery');
                var key = JSON.stringify(parseQuery) + '#' + method;

                if ((parseCache.get(key) !== undefined) && !force) {
                    return Parse.Promise.as(parseCache.get(key));
                }

                return parseQuery[method]()
                    .done(function (result) {
                        if (result == undefined) {
                            result = null;
                        }
                        parseCache.put(key, result);
                        return Parse.Promise.as(result);
                    })
            },
            destroy: function () {
                $cacheFactory.get('parseQuery') && $cacheFactory.get('parseQuery').removeAll();
            }
        }
    }])

    // api access to parse.com.
    .factory('parse', ['cachedParseQuery', 'constants', function (cachedParseQuery, constants) {
        return {
            getTopics: function (force) {
                force = force || false;
                var query = new Parse.Query('Topic');
                return cachedParseQuery.use(query.include('user').descending('updatedAt'), 'find', force);
            },
            getTopic: function (topicId, force) {
                force = force || false;
                var query = new Parse.Query('Topic');
                return cachedParseQuery.use(query.equalTo('objectId', topicId).include('user'), 'first', force)
                    .done(function (topic) {
                        // reject user don't have read access.
                        if (!topic) {
                            var promise = new Parse.Promise();
                            promise.reject({ code: -1, message: 'You have no read access.' });
                            return promise;
                        }
                        // get joiners.
                        var userIds = _.keys(topic.getACL().toJSON());
                        query = new Parse.Query('_User');
                        var joinersPromise = cachedParseQuery.use(query.containedIn('objectId', userIds).ascending('username'), 'find');

                        return Parse.Promise.when(Parse.Promise.as(topic), joinersPromise);
                    })
                ;
            },
            postTopic: function (form) {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(false);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess(Parse.User.current().id, true);
                acl.setWriteAccess(Parse.User.current().id, true);

                var that = this;

                var topic = new Parse.Object('Topic');
                return topic
                    .set('title', form.title)
                    .set('content', form.content)
                    .set('user', Parse.User.current())
                    .setACL(acl)
                    .save()
                    .done(function (topic) {
                        that.getTopics(true);  // update topic list.
                        return Parse.Promise.as(topic);
                    });
            },
            updateTopic: function (topic, form) {
                _.pairs(form).forEach(function (pair) {
                    topic.set(pair[0], pair[1]);
                });
                return topic.save();
            },
            getLastCommentedAt: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery.use(query.equalTo('topic', topic).descending('createdAt'), 'first', force)
                    .done(function (comment) {
                        if (comment) {
                            return Parse.Promise.as(comment.createdAt);
                        }
                        return Parse.Promise.as(null);
                    });
            },
            getComments: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery.use(query.equalTo('topic', topic).include('user').ascending('createdAt'), 'find', force);
            },
            countComments: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery.use(query.equalTo('topic', topic), 'count', force);
            },
            postComment: function (form) {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(false);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess(Parse.User.current().id, true);
                acl.setWriteAccess(Parse.User.current().id, true);

                var that = this;

                var comment = new Parse.Object('Comment');
                return comment
                    .set('content', form.content)
                    .set('user', Parse.User.current())
                    .set('topic', form.topic)
                    .set('replyTo', form.replyTo)
                    .setACL(acl)
                    .save()
                    .done(function (comment) {
                        return Parse.Promise.when(
                            Parse.Promise.as(comment),
                            that.getComments(comment.get('topic'), true)   // update comment list.
                        );
                    });
            },
            updateComment: function (comment, form) {
                _.pairs(form).forEach(function (pair) {
                    comment.set(pair[0], pair[1]);
                });
                return comment.save();
            },
            deleteComment: function (comment) {
                var that = this;
                return comment.destroy()
                    .done(function (comment) {
                        return Parse.Promise.when(
                            comment,
                            that.getComments(comment.get('topic'), true)    // update comment list.
                        );
                    });
            },
            getStargazers: function (comment, force) {
                force = force || false;
                var query = new Parse.Query('Star');
                return cachedParseQuery.use(query.equalTo('comment', comment).ascending('user'), 'find', force)
                    .done(function (stars) {
                        var stargazers = _.map(stars, function (star) {
                            return star.get('user');
                        });
                        return Parse.Promise.as(stargazers);
                    });
            },
            getStargazersCollection: function (comments, force) {
                force = force || false;
                var collection = [];
                var that = this;
                var promise = Parse.Promise.as();
                comments.forEach(function (comment) {
                    promise = promise
                        .then(function () {
                            return that.getStargazers(comment, force);
                        })
                        .done(function (stargazers) {
                            collection[comment.id] = stargazers;
                            return Parse.Promise.as();
                        })
                    ;
                });
                return promise
                    .done(function () {
                        return Parse.Promise.as(collection);
                    });
            },
            star: function (comment) {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(false);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess(Parse.User.current().id, true);
                acl.setWriteAccess(Parse.User.current().id, true);
                var star = new Parse.Object('Star');
                return star
                    .set('user', Parse.User.current())
                    .set('comment', comment)
                    .setACL(acl)
                    .save()
                    .done(function () {
                        return Parse.Promise.as();
                    });
            },
            unstar: function (comment) {
                var query = new Parse.Query('Star');
                return query.equalTo('comment', comment).equalTo('user', Parse.User.current()).first()
                    .done(function (star) {
                        return star.destroy();
                    });
            },
            getUsernames: function (force) {
                force = force || false;
                var query = new Parse.Query('_User');
                return cachedParseQuery.use(query.select(['username']), 'find', force)
                    .done(function (users) {
                        var usernames = _.map(users, function (user) {
                            return user.get('username');
                        });
                        return Parse.Promise.as(usernames);
                    });
            },
            getJoiners: function (topic, force) {
                force = force || false;
                var userIds = _.keys(topic.getACL().toJSON());
                var query = new Parse.Query('_User');
                return cachedParseQuery.use(query.containedIn('objectId', userIds).ascending('username'), 'find', force);
            },
            addJoiner: function (topic, username) {
                var that = this;
                var query = new Parse.Query('_User');
                return cachedParseQuery.use(query.equalTo('username', username), 'first')
                    .then(function (user) {
                        if (!user) {
                            var promise = new Parse.Promise();
                            promise.reject({ code: '000', message: 'No such user.' });
                            return promise;
                        }
                        topic.getACL().setReadAccess(user.id, true);
                        return Parse.Promise.when(
                            topic.save(),
                            Parse.Promise.as(user)
                        );
                    })
                    .done(function (topic, user) {
                        // save notification.
                        var message = Parse.User.current().getDisplayName() +  ' invited you to the topic #' + topic.id + ' "' + topic.get('title') + '".';
                        that.addNotification(user, message, '#/topic/' + topic.id);

                        return Parse.Promise.when(
                            Parse.Promise.as(user),
                            that.getJoiners(topic, true)    // update joiner list.
                        );
                    });
            },
            removeJoiner: function (topic, user) {
                topic.getACL().setReadAccess(user.id, false);
                return topic.save()
                    .done(function () {
                        return Parse.Promise.as(user)
                    });
            },
            updateUser: function (form, avatarFile) {
                var user = Parse.User.current();
                _.pairs(form).forEach(function (pair) {
                    user.set(pair[0], pair[1]);
                });

                var promise = Parse.Promise.as();

                // save avatarFile and get uploaded file's url first.
                if (avatarFile) {
                    var parseFile = new Parse.File(avatarFile.name, avatarFile);
                    promise = promise
                        .then(function () {
                            return parseFile.save();
                        })
                        .done(function () {
                            user.set('avatarUrl', parseFile.url());
                            return Parse.Promise.as();
                        });
                }

                // save user.
                return promise
                    .done(function () {
                        return user.save();
                    });
            },
            getSetting: function (user, force) {
                force = force || false;
                var query = new Parse.Query('Setting');
                return cachedParseQuery.use(query.equalTo('user', Parse.User.current()), 'first', force);

            },
            saveSetting: function (form) {
                return this.getSetting(form.user)
                    .done(function (setting) {
                        if (!setting) {
                            setting = new Parse.Object('Setting');
                            var acl = new Parse.ACL();
                            acl.setPublicReadAccess(false);
                            acl.setPublicWriteAccess(false);
                            acl.setReadAccess(Parse.User.current().id, true);
                            acl.setWriteAccess(Parse.User.current().id, true);
                            setting
                                .setACL(acl)
                                .set('user', Parse.User.current());
                        }
                        _.pairs(form).forEach(function (pair) {
                            setting.set(pair[0], pair[1]);
                        });
                        return setting.save();
                    });
            },
            getNotifications: function (force) {
                force = force || false;
                var query = new Parse.Query('Notification');
                return cachedParseQuery.use(query.equalTo('user', Parse.User.current()).descending('createdAt'), 'find', force);
            },
            addNotification: function (user, message, link) {
                var notification = new Parse.Object('Notification');
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(false);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess(Parse.User.current().id, true);
                acl.setWriteAccess(Parse.User.current().id, true);
                return notification
                    .set('user', user)
                    .set('message', message)
                    .set('link', link)
                    .set('type', constants.notificationType.invited)
                    .set('read', false)
                    .setACL(acl)
                    .save();
            },
            updateNotification: function (notification, form) {
                _.pairs(form).forEach(function (pair) {
                    notification.set(pair[0], pair[1]);
                });
                return notification.save();
            }
        };
    }])
;

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

    // set file object to model via input[type=file].
    .directive('fileModel', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            scope: {
                fileModel: '='
            },
            link: function (scope, elem, attr) {
                elem.on('change', function () {
                    scope.fileModel = elem[0].files[0];
                    $timeout();
                });
                scope.$watch('fileModel', function () {
                    if (!scope.fileModel) {
                        elem.val(null);
                        $timeout();
                    }
                })
            }
        };
    }])
;
