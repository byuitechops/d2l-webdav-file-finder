const fs = require('fs');
const sjs = require('shelljs');
const shell = require('electron').shell;
const fr = new FileReader();

var dropbox = document.getElementById("course-container");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("dragleave", leavedrag, false);
dropbox.addEventListener("drop", drop, false);

function getValues() {
    return document.getElementById('course-container').value.replace(/\s/g, '').split(',');
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

fr.onloadend = function(evt) {
    var courseString = '';
    fr.result.split('\n').forEach(function(course) {
        courseString += course.replace('\r', ', ');
    });
    if (courseString[courseString.length - 2] === ',') {
        courseString = courseString.substring(0, courseString.length - 2);
    }
    document.getElementById('course-container').value = courseString;
}

// Use ShellJS to get all files of where we want to look

// Return all of them as clickable links

function filterForFileType(courseOU) {
    var splitter = courseOU.split('/');
    var splitter = splitter[splitter.length - 1].split('.');
    return (splitter[splitter.length - 1] === getFileType());
}

function openURL(el) {
    shell.openExternal(el.getAttribute('data-url'));
}

function retrieveFiles() {
    var courseOUs = dropbox.value.replace(/\s/g, '').split(',');
    var extension = getFileType();
    var outputType = getOutputType();
    var resContainer = document.getElementById('results-container');
    
    resContainer.innerHTML = '';
    
    courseOUs.forEach(function(courseOU) {
        
        var results = sjs.ls('-R', './TestFileStructure/' + courseOU).filter(filterForFileType);
        
        resContainer.innerHTML += '<h4>' + courseOU + '</h4>';
        
        if (results.length) {
            results.forEach(function (result) {
            resContainer.innerHTML += 
                `<div class="course-container">
                    <div data-url="https://byui.brightspace.com/d2l/lp/manageFiles/main.d2l?ou=${courseOU}"
                    onclick="openURL(this)" class="link">
                        ${result}
                    </div>
                    <span class="fill-auto"></span>
                    <div class="small-btn-container">
                        <button class="btn-small green" onclick="onclick="openURL(this)">View</button>
                        <button class="btn-small red" onclick="onclick="openURL(this)">Edit</button>
                        <button class="btn-small" onclick="onclick="openURL(this)">Download</button>
                    </div>
                </div>`
            });
        } else {
            resContainer.innerHTML += 'No results found.';
        }
    });
}