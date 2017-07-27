function getValues() {
    return document.getElementById('course-container').value.replace(/\s/g, '').split(',');
}


function setBatch() {
    var bat_source = "set homeDir=%cd%\n";

    getValues().forEach(function (course) {

        bat_source += `call cd %homeDir%
                    call cd ${course}
                    call dir /s /b *.${getFileType()} >> ../HTMLfiles.${getOutputType()}\n`
    });


    // Change the file path names to brightspace urls
    // We already have the csv file, so pull that in and change it


    document.querySelector("a").href = 'data:text/plain;base64,' + btoa(bat_source);
}



function enableButton() {
    document.getElementById('batch-download').classList = '';
    document.getElementById('batch-download').setAttribute('download', 'HTMLCrawler.bat');
}

function getFileType() {
    var el = document.getElementById('filetype');
    return el.options[el.selectedIndex].text;
}

function getOutputType() {
    var el = document.getElementById('output');
    return el.options[el.selectedIndex].text;
}
