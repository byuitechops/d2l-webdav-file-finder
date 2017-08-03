const fs = require('fs');
const sjs = require('shelljs');
const shell = require('electron').shell;
const fr = new FileReader();
const async = require('async');
var homeDir = sjs.pwd();
var fileList = [];
var actionCourseList;

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
  fr.readAsText(document.getElementById('dropbox').files[0]);
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

fr.onloadend = function(evt) {
  var courseString = '';
  fr.result.split('\n').forEach(function(course) {
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
  return fs.readFile('allCourses.txt', 'utf-8', (err, data) => {
    data.split('href').forEach(function(string) {
      var splitString = string.substring(string.indexOf('"') + 1, string.lastIndexOf('"') - 1).split('/');
      full.push(splitString[splitString.length - 1]);
    });
    var courseOUs = getValues();
    var actionCourses = [];
    courseOUs.forEach(function(courseOU) {
      full.forEach(function(courseName) {
        if (courseName.includes(courseOU + '-')) {
          actionCourses.push(courseName);
          return false;
        }
      });
    });
    console.log(actionCourses);
    actionCourseList = actionCourses;
  });
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

function filterByString(file) {
  if (document.getElementById('search-filter').value.toLowerCase() != '') {
    return file.title.toLowerCase()
    .includes(document.getElementById('search-filter').value.toLowerCase());
  }
  return true;
}

function printDisplayList(displayList, course) {
  var container = document.getElementById('results-container');
  container.innerHTML += '<h4>' + course + '</h4>';
  displayList.forEach((file) => {
    container.innerHTML +=
    `<div class="course-container">
          <div onclick="openURL('https://byui.brightspace.com/d2l/le/` +
          `content/${course}/viewContent/${file.topicId}/View')" class="link">
              ${file.title}
          </div>
          <span class="fill-auto"></span>
          <div class="small-btn-container">
              <button class="btn-small red" onclick="openURL('https://byui.` +
              `brightspace.com/d2l/le/content/${course}/contentfile/` +
              `${file.topicId}/EditFile?fm=0')">Edit</button>
              <!--<button class="btn-small" onclick="openURL('https://byui.` +
              `brightspace.com/d2l/le/content/${course}/contentfile/` +
              `${file.topicId}/EditFile?fm=0')">Download</button>-->
          </div>
      </div>`;
  });
}

function downloadCSV() {
  var formatted = d3.csvFormat(fileList);
  download(formatted, 'AllHTMLFiles.csv', 'text/csv');
}

/* Our main function */
function main() {
  'use strict';
  document.getElementById('results-container').innerHTML = '';
  var displayList = [];
  var printList = [];
  var filteredList = [];

  function getFiles(course, callback) {
    d2lScrape.getTopicsWithUrlFromToc(course, function(error, data) {
      if (error) {callback(error);}
      if (!data) {
        console.log('ERROR ' + course);
      }
      filteredList = data.topics.filter(filterByString);
      filteredList = filteredList.filter(filterByType);
      filteredList.forEach((fileObject) => {
        fileObject.course = course;
        fileObject.editLink = `https://byui.` +
        `brightspace.com/d2l/le/content/${course}/contentfile/` +
        `${fileObject.topicId}/EditFile?fm=0`;
      });
      printDisplayList(filteredList, course);
      callback(null, filteredList);
    });
  }

  function retrieveFiles(course, callback) {
    if (course === '') {
      callback(err, null);
    };
    // Navigate to the Z drive
    sjs.cd('Z:/');
    // Navigate into the course folder
    sjs.cd(course);
    // Retrieve the files we want, and then push them to the fileArray
    //var list = (sjs.ls('-R', '*.' + getFileType()));
    var cp = require('child_process').exec;
    var list = cp('dir /b /s Z:\\' + course + '\\*.html', callback);
    //callback(null, list);
  }

  function enableButton() {
    document.getElementById('download-button').disabled = false;
    document.getElementById('download-button').classList.remove('disabled');
  }

  function divideAndConquer() {
    // Divide the numbers into more manageable chunks
    var divisionAmount = 25; // CHANGE THIS NUMBER TO ESTABLISH DIVISION AMOUNT
    var slicedOuNumbers = actionCourseList
    .reduce(function(accum, ouNumber, index) {
      if (index % divisionAmount === 0) {
        accum.push([]);
      }
      accum[accum.length - 1].push(ouNumber);
      return accum;
    }, []);
    return slicedOuNumbers;
  }

  function mapper(array, callback) {
    console.log(array);
    async.mapLimit(array, 25, retrieveFiles, (error, results) => {
        console.log(array, results);
        if (error) {
          callback(error);
        }
        /*var fullArray = results.reduce((total, array) => {
          return total.concat(array);
        }, []);*/
        enableButton();
        callback(null, results);
      });
  }

  getCourseNames();
  setTimeout(function() {
    async.mapSeries(divideAndConquer(), mapper, function(error, data) {
      console.log(data);
      // Callback will go
      // Reduce

      var courseList = data.reduce((flat, course) => {
        return flat.concat(course);
      }, []);

      /*fileList = courseList.reduce((flat, file) => {
        return flat.concat(file);
      }, []);*/

      console.log(fileList);
    });
  }, 2000);
}
