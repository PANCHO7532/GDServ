@ECHO OFF
REM This file is used to automatize commits to GitHub by generating random commit messages or whatever
REM It may not be required or relevant for other projects where this file is spotted
REM You may ask, "why not ignore this file from uploading to GitHub or any git", well... if someone ever wonder why
REM this project has strange commit names, then, this is the reason.
TITLE "Upload to git"
SET /A randomNumber = %RANDOM% * 100
ECHO [INFO] Pushing to remote repo, accept? REMEMBER TO REMOVE EVERY TOKEN AND SENSITIVE INFO FFS
SET /P ANSW="[PROMPT] Write 'yes' but separated if you're ready: "
IF "%ANSW%" == "y e s" (
    git add .
    git commit -m "P7RND_%randomNumber%"
    git push origin master
    ECHO [INFO] Upload script done!
) else (
    ECHO [ERROR] Aborting...
)