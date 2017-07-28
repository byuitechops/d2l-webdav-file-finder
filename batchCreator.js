var prompt = require('prompt');
var fs = require('fs');


function main() {
    // Read in the settings file
    var settings = fs.readFileSync('settings.json', 'utf8');

    // Prompt the user with the default settings
    getValues(settings, function (error, values) {
        // Now, give the values to the setBatch function

    });
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
                default: settings.ouNumbersFile
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

        console.log(response);

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


    // Change the file path names to brightspace urls
    // We already have the csv file, so pull that in and change it
    var readFile = fs.readFileSync(`HTMLfiles.${values.outputFileType}`, 'utf8');
    console.log(readFile);
}
