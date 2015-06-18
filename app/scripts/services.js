'use strict';

angular.module('mommodApp')
    .factory('assertSignedIn', ['$rootScope', '$location', function ($rootScope, $location) {
        return function () {
            if (!$rootScope.currentUser) {
                $location.path('/');
            }
        };
    }])
    .constant('mockTopic', {
        id: 1,
        title: 'test topic test topic',
        content: '\
# test\n\
\n\
test test test test test test test test.\n\
test test test test test test test test test test test.\n\
\n\
## test\n\
\n\
test test test test test test test test.\n\
\n\
* test\n\
  * test\n\
* test\n\
\n\
test test test test test test `test test` test test test.\n\
\n\
### test\n\
\n\
1. test\n\
  * test\n\
  * test\n\
1. test\n\
\n\
![](https://avatars2.githubusercontent.com/u/4360663)\n\
\n\
```\n\
<?php\n\
// test\n\
echo \'test\';\n\
```\n\
\n\
| test | test |\n\
| --- | --- |\n\
| aaa | aaa |\n\
| bbb | bbb |\n\
\n\
> test\n\
> > test\n\
> test\n\
\n\
http://test.com\n\
\n\
emoji :+1: emoji',
        created_at: new Date(),
        updated_at: null
    })
    .constant('mockComments', [
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
            id: 3,
            content: 'test comment',
            stargazers: [
                'user2'
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
