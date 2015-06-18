'use strict';

angular.module('mommodApp')
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
\n\
test test test test test test test test test test test.\n\
\n\
```\n\
<?php\n\
// test\n\
echo \'test\';\n\
```\n\
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
