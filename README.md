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
npm install browserify
```

run browserify

browserify tabulator.js index-server.js  > packed.js

run in console mode (command line tool)

```node index.js```

Using index.js
==============

In terminal you can use commands

```
/prev - previous page
/next - next page
/category name - set category
/limit number - change limit of records at one page
/labels string - add labels to request
/ordering field asc - order by field asc, field = caption or labels or category
/ordering field desc - order by field desc, field = caption or labels or category
/quit - exit app
/search string - request to database
In categories, labels and caption you can use conditions:
+word - word must be found
?word - word maybe be found
-word - word must be excluded
+-word - must not be like word
?-word - may not be like word
Split words by commas, for example:
word,+word2,-word3
```

for example:
```
/category test,+-other
/labels tag1,+-tag2,?-tag3
/limit 50
/ordering category desc
/search Something one,+Something other
/download 1 15
/quit
```

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

1.) Must include BOTH  substrings ```USSR``` and ```1945```
2.) Must exclude substring ```1941``` and
3.) May include substring ENG or 1944

Also, you can turn on uppercase mode changing default value of variable ```upper_mode```
