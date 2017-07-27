set homeDir=%cd%\n
call cd %homeDir%
call -replace 'C\:\\Users','http://localhost' >> ../changedFileNames.txt\n