'use strict';

angular.module('mommodApp')
    .factory('assertSignedIn', ['$rootScope', '$location', function ($rootScope, $location) {
        return function () {
            if (!$rootScope.currentUser) {
                $location.path('/');
            }
        };
    }])

    // cache api access to parse.com.
    .factory('cachedParseQuery', ['$cacheFactory', function ($cacheFactory) {
        return function (parseQuery, method, force) {
            force = force || false;
            var parseCache = $cacheFactory.get('parseQuery') || $cacheFactory('parseQuery');
            var key = JSON.stringify(parseQuery) + '#' + method;

            if ((parseCache.get(key) != undefined) && !force) {
                return Parse.Promise.as(parseCache.get(key));
            }

            return parseQuery[method]()
                .done(function (result) {
                    parseCache.put(key, result);
                    return Parse.Promise.as(result);
                })
        };
    }])

    // api access to parse.com.
    .factory('parse', ['cachedParseQuery', function (cachedParseQuery) {
        return {
            getTopic: function (topicId, force) {
                force = force || false;
                var query = new Parse.Query('Topic');
                return cachedParseQuery(query.equalTo('objectId', topicId).include('user'), 'first', force)
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
                        var joinersPromise = cachedParseQuery(query.containedIn('objectId', userIds).ascending('username'), 'find');

                        return Parse.Promise.when(Parse.Promise.as(topic), joinersPromise);
                    })
                ;
            },
            getComments: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery(query.equalTo('topic', topic).include('user').ascending('createdAt'), 'find', force);
            },
            getStargazers: function (comment, force) {
                force = force || false;
                return cachedParseQuery(comment.relation('stargazers').query().ascending('username'), 'find', force);
            },
            postTopic: function (form) {
            },
            postComment: function (form) {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(true);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess(Parse.User.current().id, true);
                acl.setWriteAccess(Parse.User.current().id, true);

                var comment = new Parse.Object('Comment');
                return comment
                    .set('content', form.content)
                    .set('user', Parse.User.current())
                    .set('topic', form.topic)
                    .set('replyTo', form.replyTo)
                    .setACL(acl)
                    .save()
                ;
            },
            starComment: function (comment, star) {
                var stargazers = comment.relation('stargazers');
                if (star) {
                    stargazers.add(Parse.User.current());
                } else {
                    stargazers.remove(Parse.User.current());
                }
                var that = this;
                return comment.save()
                    .done(function (comment) {
                        return that.getStargazers(comment, true);
                    })
                ;
            },
            updateTopic: function (topic, form) {
                _.pairs(form).forEach(function (pair) {
                    topic.set(pair[0], pair[1]);
                });
                return topic.save();
            },
            updateComment: function (comment, form) {
                _.pairs(form).forEach(function (pair) {
                    comment.set(pair[0], pair[1]);
                });
                return comment.save();
            },
            deleteComment: function (comment) {
                return comment.destroy();
            }
        };
    }])
;
