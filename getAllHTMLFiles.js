/*eslint-env browser*/
/*eslint no-console:0*/
/*global d2lScrape*/


function main() {
    'use strict';

    d2lScrape.getTopicsWithUrlFromToc('10011', function (errOr, data) {
        console.log('topicsData: ');
        console.log(data);
    });
}

main();
