'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', ['$scope', '$routeParams', 'mockTopic', 'mockComments', 'assertSignedIn', function ($scope, $routeParams, mockTopic, mockComments, assertSignedIn) {
        assertSignedIn();

        $scope.myUserName = 'user1';

        $scope.topicId = $routeParams.topicId;

        $scope.topic = mockTopic;
        $scope.comments = mockComments;

        $scope.replyTo = null;
        $scope.commentContent = '';

        $scope.submission = {};
        $scope.$watch('submission', function () {
            if ($scope.submission.submit) {
            }
        });

        $scope.isStarred = function (comment) {
            return comment.stargazers.indexOf($scope.myUserName) > -1;
        };
        $scope.toggleStar = function (comment) {
            var idx = comment.stargazers.indexOf($scope.myUserName);
            if (idx == -1) {
                comment.stargazers.push($scope.myUserName);
            } else {
                delete comment.stargazers[idx];
                comment.stargazers = _.compact(comment.stargazers);
            }
        };
    }])
;
