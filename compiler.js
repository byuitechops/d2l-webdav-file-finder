var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './',
    outputDirectory: '../',
    authors: 'Zach Williams & Scott ..something',
    exe: 'FileFinder.exe'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));