var prompt = require('prompt');
var fs = require('fs');
var d3 = require('d3-dsv');
var path = require('path');
var cmd = require('node-cmd');


function main() {
    // Read in the settings file
    var settings = readFile('settings.json');
    settings = JSON.parse(settings);

    // Prompt the user with the default settings
    getValues(settings, function (error, values) {
        // Now, give the values to the setBatch function
        console.log(values);
    });
}

/**
 * This function reads any file given it by the program.
 * 
 * @param   {string} filename The filename of a file to read
 * @returns {string} The string of the read file
 */
function readFile(filename) {
    var readData;

    readData = fs.readFileSync(filename, 'utf8');

    return readData;
}


function getValues(settings, callback) {
    // Let's make a CLI to get all the information that we need
    var cli = {
        properties: {
            domain: {
                description: "Enter Domain(Example: byui)",
                type: "string",
                default: settings.domain
            },
            ouNumbers: {
                description: "Enter Filename of the file that contains the ouNumbers you are searching for",
                type: "string",
                default: settings.ouNumbersFile,
                pattern: /.csv/g,
                message: 'You must enter a csv filename (Example: ouNumbers.csv)'
            },
            fileType: {
                description: "Filetype you are looking for",
                type: "string",
                default: settings.fileType
            },
            outputFileType: {
                description: "The type of file you want for the output",
                type: "string",
                default: settings.outputFileType
            }
        }
    }

    prompt.start();
    prompt.get(cli, function (error, response) {
        if (error) {
            console.error('There was an error while prompting.  ERROR: ' + error);
            callback(error);
            return;
        }

        // Read in the csv
        var ouNumbers = readFile(response.ouNumbers);
        ouNumbers = d3.csvParse(ouNumbers);

        response.ouNumbers = ouNumbers.columns;

        callback(null, response);
        return;
    });
}


function setBatch(values) {
    var bat_source = "set homeDir=%cd%\n";

    values.ouNumbers.forEach(function (course) {
        bat_source += `call cd %homeDir%
                    call cd ${course}
                    call dir /s /b *.${values.fileType} >> ../HTMLfiles.${values.outputFileType}\n`
    });

    cmd.get('HTMLCrawler.bat', function (err, data, stderr) {
        // Change the file path names to brightspace urls
        // We already have the csv file, so pull that in and change it
        var readFile = fs.readFileSync(`HTMLfiles.${values.outputFileType}`, 'utf8');
        console.log(readFile);
    });
}

// Run main
main();
