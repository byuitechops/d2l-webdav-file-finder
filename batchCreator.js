var fs = require('fs');

function setBatch() {
    var bat_source = "set homeDir=%cd%\n";

    getValues().forEach(function (course) {
        bat_source +=
            `call cd %homeDir%
    call cd ${course}
    call dir /s /b *.html >> ../HTMLfiles.csv\n`
    });

    // Change the file path names to brightspace urls
    // We already have the csv file, so pull that in and change it
    var htmlFiles = fs.readFileSync('HTMLfiles.csv', 'utf8');
    htmlFiles = d3.csvParse(htmlFiles);
    console.log(htmlFiles);

    document.querySelector("a").href = 'data:text/plain;base64,' + btoa(bat_source);
}

function getValues() {
    return document.getElementById('course-container').value.replace(/\s/g, '').split(',');
}
