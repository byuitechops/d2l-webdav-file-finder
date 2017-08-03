const fs = require('fs');
const sjs = require('shelljs');
const shell = require('electron').shell;
const fr = new FileReader();
var homeDir = sjs.pwd();

var dropbox = document.getElementById('course-container');
dropbox.addEventListener('dragenter', dragenter, false);
dropbox.addEventListener('dragover', dragover, false);
dropbox.addEventListener('dragleave', leavedrag, false);
dropbox.addEventListener('drop', drop, false);

function getValues() {
    return dropbox.value.replace(/\s/g, '').split(',');
}

function getFileType() {
    var el = document.getElementById('filetype');
    return el.options[el.selectedIndex].text;
}

function getOutputType() {
    var el = document.getElementById('output');
    return el.options[el.selectedIndex].text;
}

function receiveFile() {
    fr.readAsText(document.getElementById('dropbox').files[0])
}

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
    dropbox.style.borderColor = '#0076C6';
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
    dropbox.style.borderColor = '#0076C6';
}

function leavedrag(e) {
    dropbox.style.borderColor = 'rgb(169, 169, 169)';
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;
    var files = dt.files;

    var split = files[0].name.split('.');
    if (split[split.length - 1] != 'csv' &&
        split[split.length - 1] != 'txt') {
        document.getElementById('course-container').placeholder = 'Please provide a ".csv" or ".txt" file';
        document.getElementById('course-container').value = '';
    } else {
        fr.readAsText(files[0]);
    }

    dropbox.style.borderColor = 'rgb(169, 169, 169)';
}

fr.onloadend = function (evt) {
    var courseString = '';
    fr.result.split('\n').forEach(function (course) {
        courseString += course.replace('\r', ', ');
    });

    if (courseString[courseString.length - 2] === ',') {
        courseString = courseString.substring(0, courseString.length - 2);
    }

    document.getElementById('course-container').value = courseString;
};

function openURL(el) {
    shell.openExternal(el.getAttribute('data-url'));
}

function getCourseNames() {
    var full = [];
    sjs.cd(homeDir);
    fs.readFile('allCourses.txt', 'utf-8', (err, data) => {
        data.split('href').forEach(function (string) {
            var splitString = string.substring(string.indexOf('"') + 1, string.lastIndexOf('"') - 1).split('/');
            full.push(splitString[splitString.length - 1]);
        });

        findActionCourses(full);
    });
}

function findActionCourses(full) {
    var courseOUs = getValues();
    var actionCourses = [];
    courseOUs.forEach(function (courseOU) {
        full.forEach(function (courseName) {
            if (courseName.includes(courseOU + '-')) {
                actionCourses[courseOU] = courseName;
                return false;
            }
        });
    });


    retrieveFiles(actionCourses);
}

function printCourseFiles(courses, fileArray) {
    document.getElementById('results-container').innerHTML = '';
    courses.forEach((course) => {
        document.getElementById('results-container').innerHTML +=
            '<h4>' + course + '</h4>';
        fileArray[course].forEach((file) => {
            document.getElementById('results-container').innerHTML +=
                `<div class="course-container">
              <div data-url="https://byui.brightspace.com/d2l/lp/manageFiles/main.d2l?ou=${file}"
              onclick="openURL(this)" class="link">
                  ${file}
              </div>
              <span class="fill-auto"></span>
              <div class="small-btn-container">
                  <button class="btn-small green" onclick="onclick="openURL(this)">View</button>
                  <button class="btn-small red" onclick="onclick="openURL(this)">Edit</button>
                  <button class="btn-small" onclick="onclick="openURL(this)">Download</button>
              </div>
          </div>`;
        });
    });
}

function retrieveFiles(courses) {
    var fileArray = [];
    courses.forEach((course) => {
        if (course === '') {
            return;
        };

        // Navigate to the Z drive
        sjs.cd('Z:/');

        // Navigate into the course folder
        sjs.cd(course);

        // Retrieve the files we want, and then push them to the fileArray
        fileArray[course] = sjs.ls('-R', '*.' + getFileType())
    });
    printCourseFiles(courses, fileArray);
}
