'use strict';

angular.module('mommodApp')
    .constant('mockTopic', {
        id: 1,
        title: 'test topic test topic',
        created_at: new Date(),
        updated_at: null
    })
    .constant('mockComments', [
        {
            id: 1,
            reply_to: null,
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
http://test.com\n',
            stargazers: [
                'user1',
                'user2'
            ],
            created_at: new Date(),
            updated_at: null
        },
        {
            id: 2,
            reply_to: 1,
            content: 'test comment',
            stargazers: [
                'user1'
            ],
            created_at: new Date(),
            updated_at: null
        },
        {
            id: 3,
            reply_to: 1,
            content: 'test comment',
            stargazers: [
                'user2'
            ],
            created_at: new Date(),
            updated_at: null
        },
        {
            id: 4,
            reply_to: 3,
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
            reply_to: 4,
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
            reply_to: 2,
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
