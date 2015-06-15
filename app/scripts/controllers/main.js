'use strict';

angular.module('mommodApp')
    .controller('MainCtrl', ['$scope', 'sampleMarkdownContent', function ($scope, sampleMarkdownContent) {
        $scope.content = sampleMarkdownContent;
    }])
;
