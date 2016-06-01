# magnetsdb-console-nodejs


Installation

put database to ram drive

install deps

```
npm install sqlite3
npm install express
npm install body-parser
npm install jade
npm install fs
npm install url
```

run in console mode (command line tool)

```node index.js```

run as web server without ajax interface

```node server.js```

run as web server with ajax interface

```node ajax-server.js```

default port is 44444

To exit from command line tool type command ```!quit``` 

Requests
============

Use + to point neсessary elements which MUST be in responce.
Use - to point unnecessary elements which MUST be excluded from responce.
Use , to split elements in request

So, ```+USSR,+1945,-1941,ENG,1944```  will fetch all records which

1.) Must include one of substrings ```USSR```, ```1945```
2.) Must exclude substring ```1941``` and
3.) May include substring ENG or 1944

Also, you can turn on uppercase mode changing default value of variable ```upper_mode```
