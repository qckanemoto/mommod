'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', ['$scope', '$routeParams', '$anchorScroll', '$timeout', 'mockTopic', 'mockComments', function ($scope, $routeParams, $anchorScroll, $timeout, mockTopic, mockComments) {

        $timeout(function () {
            $anchorScroll();
        }, 1000);

        $scope.myUserName = 'user1';

        $scope.topicId = $routeParams.topicId;
        $scope.commentId = $routeParams.commentId;

        $scope.topic = mockTopic;
        $scope.comments = mockComments;

        $scope.replyTo = null;
        $scope.commentContent = '';

        $scope.isStarred = function (stargazers) {
            return stargazers.indexOf($scope.myUserName) > -1;
        };
    }])
;
