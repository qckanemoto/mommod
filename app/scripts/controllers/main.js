'use strict';

angular.module('mommodApp')
    .controller('MainCtrl', ['$scope', 'mockTopic', 'mockComments', function ($scope, mockTopic, mockComments) {
        $scope.myUserName = 'user1';

        $scope.topic = mockTopic;
        $scope.comments = mockComments;

        $scope.replyings = [];
        $scope.reply = function (commentId) {
            $scope.replyings[commentId] = true;
        };
        $scope.cancelReply = function (commentId) {
            $scope.replyings[commentId] = undefined;
        };
        $scope.isReplying = function (commentId) {
            return $scope.replyings[commentId];
        };

        $scope.isStarred = function (stargazers) {
            return stargazers.indexOf($scope.myUserName) > -1;
        };

        $scope.isEditing = true;
        $scope.editingContent = '';
    }])
;
