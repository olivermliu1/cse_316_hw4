//SQL commands for creating DB and table
//might not need to createnew db, just use existing one
//CREATE DATABASE course_builder;
//CREATE TABLE courseIds(id INTEGER, PRIMARY KEY (id));
const express = require('express')
const app = express();
const url = require('url')

var mysql = require('mysql');

//temporary instead of DB
let added = [];
//create database only once
//let db_created = 0;


var con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "pass4root",
  database: "course_builder"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//setUpCourseIdTable()

app.get('/', (req, res) => {
    writeSearch(req, res)
})

app.get('/schedule', (req, res) => {
    writeSchedule(req, res)
})

function writeSearch(req, res){
    res.writeHead(200, { "Content-Type": "text/html"})
    let query = url.parse(req.url, true).query//to implement

    let search = query.search 
    let searchString = String(search).toUpperCase()
    let filter // ti
    
    let html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body style="margin: 100px, 100px, 100px, 100px;">
    <h1 >Stony Brook University</h1>
    <h2>Department of Computer Science</h2>
    <p>Seach for class</p>
    <form action="/" method="GET" class="">
            <label for="search">Name</label>
            <input type="text" name="search">
            <input type="submit" value="submit">       
    </form>
    `
    let found = []
    //course code: e.g. 316
    for(i = 0; i < courses.length; i++){
        //e.g. CSE316 or cse 316
        if(searchString.includes('CSE')){
            searchString.replace('CSE', '')
            searchString.replace(' ', '')
        }
        //course code
        if(courses[i][1] == searchString){
            found.push(i)
        }
        //instructor name e.g. fodor, paul fodor
        if(String(courses[i][13]).toUpperCase().includes(searchString) && searchString.length > 2){
            found.push(i)
        }

        

    }
    let day
    //Monday Classes
    if(searchString.includes('M') || searchString.includes('MON') || searchString.includes('MONDAY')){
        day = 'M'
    }
    if(searchString.includes('TU') || searchString.includes('TUE') || searchString.includes('TUESDAY')){
        day = 'TU'
    }
    if(searchString.includes('W') || searchString.includes('WED') || searchString.includes('WEDNESDAY')){
        day = 'W'
    }
    if(searchString.includes('TH') || searchString.includes('THU') || searchString.includes('THURSDAY')){
        day = 'TH'
    }
    if(searchString.includes('F') || searchString.includes('FRI') || searchString.includes('FRIDAY')){
        day = 'F'
    }

    for(i = 0; i < courses.length; i++){
        if(String(courses[i][4]).toUpperCase().includes(day))
            found.push(i)
    }
    //instructor name:

    //adding found courses for display
    for(i = 0; i < found.length; i++){
        current = courses[found[i]]
        html += `
        <h3>CSE ${current[1]} ${current[2]} ${current[3]}</h3>
        <p>Instructor: ${current[13]}</p>
        <p>${current[4]} ${current[5]} - ${current[6]}</p>
        <p>${current[10]}</p>
        <form action='/schedule' method='get'>
            <button name="add" value="${found[i]}"> Add Class</button>
        </form>
        `
    }
    res.write(html + '\n\n</body>\n</html>')
    res.end()

}






function writeSchedule(req, res){
    let query = url.parse(req.url, true).query//to implement
    let addQuery = query.add
    let sql = `INSERT INTO courseids (id) VALUES (${query.add})`

    con.query(sql, (err, result) => {
        if(err) throw err
        //console.log(result);
        //console.log(`courses ${query.add} inserted!`)
})

    added.push(addQuery)

    let html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Schedule</title>
    <style type = text/css>
        table, tr, th, td {
            border: 1px solid black;
            height: 50px;
            vertical-align: bottom;
            padding: 15px;
            text-align: left;
        }
        
    </style>
</head>
<body style="margin: 20%;">
    <h1>Stony Brook University</h1>
    <h2>Department of Computer Science</h2>
    
    <form action="/" method="GET" class="">
        <button name="" value="">Back to Search</button>    
    </form>

    <h3>My Schedule</h3>
    <table>
    <tr>
        <th> Mon </th>
        <th> Tue </th>
        <th> Wed </th>
        <th> Thu </th>
        <th> Fri </th>
    </tr>
    <tr>
        <td> Mon </td>
        <td> Tue </td>
        <td> Wed </td>
        <td> Thu </td>
        <td> Fri </td>
    </tr>
    </table>
    `

    //adding each class
    // for(i = 0; i < added.length; i++){
    //     html += `<p>${courses[added[i]]}</p>`
    // }
    dbCourses = []
    sql = `SELECT * FROM courseids`
    con.query(sql, (err, result) => {
        if(err) throw err
        // for(let item of result)
        //     dbCourses.push(parseInt(item.id))
        //console.log('in JSON:')
        //console.log(result)

        //console.log('internally');
        for(i = 0; i < result.length; i++)
            dbCourses.push(parseInt(result[i].id))
        
        //console.log(dbCourses)

        //let res = JSON.parse(result)
        //console.log('parsed' + res)
        //setTimeout(getDay, 1000)
        html = html.replace('<td> Mon </td>', getDay(result, 1))
        html = html.replace('<td> Tue </td>', getDay(result, 2))
        html = html.replace('<td> Wed </td>', getDay(result, 3))
        html = html.replace('<td> Thu </td>', getDay(result, 4))
        html = html.replace('<td> Fri </td>', getDay(result, 5))
        //console.log('courses displayed')

        res.writeHead(200, { "Content-Type": "text/html"})
        res.write(html + '\n\n</body>\n</html>')
        res.end()
        
    })

    //console.log('externally: ')
    //console.log(dbCourses)

    
    //console.log("something wrong here...")
    //console.log('global: ' + dbCourses)
   

    
}

function getDayAlt(lst, day){
    retStr = '<td>'
    
    if(day == 1){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('M')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }
    if(day == 2){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('TU')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }
    if(day == 3){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('W')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }
    if(day == 4){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('TH')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }
    if(day == 5){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('F')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }

    return retStr + '</td>'

}

function getDay(lstRaw, day){
    retStr = '<td>'
    lst = [];
    for(i = 0; i < lstRaw.length; i++)
        lst.push(lstRaw[i].id)

    //console.log('from get day raw: ')
    //console.log(lst)

    if(day == 1){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('M')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }
    if(day == 2){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('TU')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }
    if(day == 3){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('W')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }
    if(day == 4){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('TH')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }
    if(day == 5){
        for(i = 0; i < lst.length; i++){
            if(courses[lst[i]][4].includes('F')){
                current = courses[lst[i]]
                retStr += `\n ${current[5]} - ${current[6]}
                <br><br> CSE ${current[1]} ${current[2]}<hr> <br><br>
                `
            }
        }
    }

    return retStr + '</td>'

}





















function setUpDb(){
    //db_created = 1;
    let sql = 'CREATE DATABASE course_builder'
    con.query(sql, (err, result) => {
        if(err) throw err
        console.log(result);
        console.log("database created")
    })
}

//####
function setUpCourseIdTable(){
    let sql = `CREATE TABLE courseIds(id INTEGER, PRIMARY KEY (id))`
    con.query(sql, (err, result) => {
            if(err) throw err
            //console.log(result);
            console.log("table created")
    })
}


function setUpCoursesTable(){
    let sql = `CREATE TABLE courses(
        Department CHAR(3),
        Id CHAR(3),
        Component CHAR(3),
        Section VARCHAR(3),
        Days VARCHAR(10),
        StartTime VARCHAR(10),
        EndTime VARCHAR(10),
        StartDate VARCHAR(20),
        EndDate VARCHAR(20),
        Duration VARCHAR(3),
        InstructionMode VARCHAR(20),
        Building VARCHAR(30),
        Room VARCHAR(30),
        Instructor VARCHAR(100),
        Capacity VARCHAR(3),
        WaitlistCapacity VARCHAR(3),
        CombinedDescription VARCHAR(50),
        CombinedEnrollmentCap VARCHAR(3)
    )`
    con.query(sql, (err, result) => {
        if(err) throw err
        console.log(result);
        console.log("tables created")
    })
}

function setUpSavedTable(){
    let sql = `CREATE TABLE (
        Department CHAR(3),
        Id CHAR(3),
        Component CHAR(3),
        Section VARCHAR(3),
        Days VARCHAR(10),
        StartTime VARCHAR(10),
        EndTime VARCHAR(10),
        StartDate VARCHAR(20),
        EndDate VARCHAR(20),
        Duration VARCHAR(3),
        InstructionMode VARCHAR(20),
        Building VARCHAR(30),
        Room VARCHAR(30),
        Instructor VARCHAR(100),
        Capacity VARCHAR(3),
        WaitlistCapacity VARCHAR(3),
        CombinedDescription VARCHAR(50),
        CombinedEnrollmentCap VARCHAR(3)
    )`
    con.query(sql, (err, result) => {
        if(err) throw err
        console.log(result);
        console.log("tables created")
    })
}


const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on ${PORT}`))

let course1 = ["CSE","101","LEC","1","MWF","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","TBA","Kevin McDonnell","210","70"," ",""];												
let course2 = ["CSE","101","LAB","L01","M","12:00 PM","12:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Kevin McDonnell","30","10"," "," "];												
let course3 = ["CSE","101","LAB","L02","M","01:00 PM","01:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Kevin McDonnell","30","10"," "," "];												
let course4 = ["CSE","101","LAB","L03","TU","04:00 PM","04:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Kevin McDonnell","30","10"," "," "];												
let course5 = ["CSE","101","LAB","L04","TU","05:30 PM","06:23 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Kevin McDonnell","30","10"," "," "];												
let course6 = ["CSE","101","LAB","L05","W","12:00 PM","12:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Kevin McDonnell","30","10"," "," "];												
let course7 = ["CSE","101","LAB","L06","W","04:00 PM","04:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Kevin McDonnell","30","10"," "," "];												
let course8 = ["CSE","101","LAB","L07","TH","04:00 PM","04:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Kevin McDonnell","30","10"," "," "];												
let course9 = ["CSE","114","LEC","1","TUTH","04:00 PM","05:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Paul Fodor","120","44"," "," "];												
let course10 = ["CSE","114","LAB","L01","MW","07:00 PM","08:20 PM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2116","Paul Fodor","30","11"," "," "];												
let course11 = ["CSE","114","LAB","L02","TUTH","08:30 AM","09:50 AM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2116","Paul Fodor","30","11"," "," "];												
let course12 = ["CSE","114","LAB","L03","TUTH","10:00 AM","11:20 AM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2116","Paul Fodor","30","11"," "," "];												
let course13 = ["CSE","114","LAB","L04","TUTH","05:30 PM","06:50 PM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2116","Paul Fodor","30","11"," "," "];												
let course14 = ["CSE","114","LEC","2","TUTH","11:30 AM","12:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Praveen Tripathi","120","33"," "," "];												
let course15 = ["CSE","114","LAB","L07","MW","08:30 AM","09:50 AM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2116","Praveen Tripathi","30","11"," "," "];												
let course16 = ["CSE","114","LAB","L08","MW","10:00 AM","11:20 AM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2116","Praveen Tripathi","30","11"," "," "];												
let course17 = ["CSE","114","LAB","L09","MW","11:30 AM","12:50 PM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2116","Praveen Tripathi","30","11"," "," "];												
let course18 = ["CSE","114","LAB","L10","MW","02:30 PM","03:50 PM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2116","Praveen Tripathi","30","0"," "," "];												
let course19 = ["CSE","160","LEC","1","MW","05:30 PM","06:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Paul Fodor","50","0"," "," "];												
let course20 = ["CSE","161","LAB","L01","MW","07:00 PM","08:20 PM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2129","Paul Fodor","35","0"," "," "];												
let course21 = ["CSE","214","LEC","1","TUTH","08:30 AM","09:50 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Ahmad Esmaili","120","30"," "," "];												
let course22 = ["CSE","214","REC","R01","RETH","10:00 AM","10:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2129","Ahmad Esmaili","30","5"," "," "];												
let course23 = ["CSE","214","REC","R02","RETU","10:00 AM","10:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2129","Ahmad Esmaili","30","5"," "," "];												
let course24 = ["CSE","214","REC","R03","RETU","04:00 PM","04:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2129","Ahmad Esmaili","30","5"," "," "];												
let course25 = ["CSE","214","REC","R04","RETH","04:00 PM","04:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2129","Ahmad Esmaili","30","5"," "," "];												
let course26 = ["CSE","214","LEC","2","MWF","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","TBA","Pramod Ganapathi","120","0"," "," "];												
let course27 = ["CSE","214","REC","R06","RECF","02:30 PM","03:23 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Pramod Ganapathi","0","0"," "," "];												
let course28 = ["CSE","214","REC","R07","RECM","02:30 PM","03:23 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Pramod Ganapathi","30","5"," "," "];												
let course29 = ["CSE","214","REC","R08","RECW","02:30 PM","03:23 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Pramod Ganapathi","30","5"," "," "];												
let course30 = ["CSE","214","REC","R09","RECM","03:30 PM","04:23 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Pramod Ganapathi","30","5"," "," "];												
let course31 = ["CSE","215","LEC","1","TUTH","01:00 PM","02:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Christopher Kane","120","40"," "," "];												
let course32 = ["CSE","215","REC","R01","RECM","10:00 AM","10:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Christopher Kane","30","10"," "," "];												
let course33 = ["CSE","215","REC","R02","RECW","10:00 AM","10:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Christopher Kane","30","10"," "," "];												
let course34 = ["CSE","215","REC","R03","RECM","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Christopher Kane","30","10"," "," "];												
let course35 = ["CSE","215","REC","R04","RECW","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2129","Christopher Kane","30","10"," "," "];												
let course36 = ["CSE","215","LEC","2","MW","08:30 AM","09:50 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Pramod Ganapathi","120","40"," "," "];												
let course37 = ["CSE","215","REC","R06","RECW","01:00 PM","01:53 PM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Pramod Ganapathi","30","10"," "," "];												
let course38 = ["CSE","215","REC","R07","RECM","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2129","Pramod Ganapathi","30","10"," "," "];												
let course39 = ["CSE","215","REC","R08","RECW","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Pramod Ganapathi","30","10"," "," "];												
let course40 = ["CSE","215","REC","R09","RECF","09:00 AM","09:53 AM","25-Jan-21","19-May-21","53","In Person","COMPUTER SCI","2114","Pramod Ganapathi","0","0"," "," "];												
let course41 = ["CSE","216","LEC","1","MW","05:30 PM","06:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Ritwik Banerjee","180","25"," "," "];												
let course42 = ["CSE","216","REC","R01","RETU","10:00 AM","10:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","115","Ritwik Banerjee","30","10"," "," "];												
let course43 = ["CSE","216","REC","R02","RETH","10:00 AM","10:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","115","Ritwik Banerjee","30","10"," "," "];												
let course44 = ["CSE","216","REC","R03","RETU","09:00 AM","09:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","115","Ritwik Banerjee","30","10"," "," "];												
let course45 = ["CSE","216","REC","R04","RETU","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","115","Ritwik Banerjee","30","10"," "," "];												
let course46 = ["CSE","216","REC","R05","RETH","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","115","Ritwik Banerjee","30","10"," "," "];												
let course47 = ["CSE","216","REC","R06","RETU","12:00 PM","12:53 PM","25-Jan-21","19-May-21","53","In Person","TBA","115","Ritwik Banerjee","30","10"," "," "];												
let course48 = ["CSE","220","LEC","1","TUTH","01:00 PM","02:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Joydeep Mitra","180","48"," "," "];												
let course49 = ["CSE","220","REC","R01","RECM","10:00 AM","10:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","115","Joydeep Mitra","30","8"," "," "];												
let course50 = ["CSE","220","REC","R02","RECW","10:00 AM","10:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","115","Joydeep Mitra","30","8"," "," "];												
let course51 = ["CSE","220","REC","R03","RECM","11:00 AM","11:53 AM","25-Jan-21","19-May-21","53","In Person","TBA","115","Joydeep Mitra","30","8"," "," "];												
let course52 = ["CSE","220","REC","R05","RECM","12:00 PM","12:53 PM","25-Jan-21","19-May-21","53","In Person","TBA","115","Joydeep Mitra","30","8"," "," "];												
let course53 = ["CSE","220","REC","R06","RECW","12:00 PM","12:53 PM","25-Jan-21","19-May-21","53","In Person","TBA","115","Joydeep Mitra","30","8"," "," "];												
let course54 = ["CSE","220","REC","R07","RECM","02:30 PM","03:23 PM","25-Jan-21","19-May-21","53","In Person","TBA","115","Joydeep Mitra","30","8"," "," "];												
let course55 = ["CSE","300","LEC","1","TUTH","11:30 AM","12:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","TBA","35","0","CSE300.01/ISE300.01","35"];												
let course56 = ["CSE","300","LEC","2","TUTH","02:30 PM","03:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","TBA","35","0","CSE300.02/ISE300.02","35"];												
let course57 = ["CSE","300","LEC","3","TUTH","10:00 AM","11:20 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","TBA","35","0","CSE300.03/ISE300.03","35"];												
let course58 = ["CSE","300","LEC","4","TUTH","01:00 PM","02:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","TBA","35","0","CSE300.04/ISE300.04","35"];												
let course59 = ["CSE","300","LEC","5","TUTH","02:30 PM","03:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","TBA","35","0","CSE300.05/ISE300.05","35"];												
let course60 = ["CSE","300","LEC","6","MW","08:30 AM","09:50 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","TBA","35","0"," "," "];												
let course61 = ["CSE","303","LEC","1","MWF","12:00 PM","12:53 PM","25-Jan-21","19-May-21","53","In Person","TBA","TBA","Pramod Ganapathi","250","30"," "," "];												
let course62 = ["CSE","306","LEC","1","TUTH","10:00 AM","11:20 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Eugene Stark","150","20"," "," "];												
let course63 = ["CSE","307","LEC","1","TUTH","04:00 PM","05:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Joydeep Mitra","80","15"," "," "];												
let course64 = ["CSE","310","LEC","1","MW","04:00 PM","05:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Aruna Balasubramanian","200","50"," "," "];												
let course65 = ["CSE","311","LEC","1","TUTH","10:00 AM","11:20 AM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2120","Ahmad Esmaili","25","0","CSE311.01/ISE311.01","75"];												
let course66 = ["CSE","312","LEC","1","MW","02:30 PM","03:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Anthony Scarlatos","120","0","CSE312.01/ISE312.01","120"];												
let course67 = ["CSE","312","LEC","2","MW","07:00 PM","08:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Michael Tashbook","120","0","CSE312.02/ISE312.02","120"];												
let course68 = ["CSE","316","LEC","1","TUTH","10:00 AM","11:20 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Richard McKenna","120","20"," "," "];												
let course69 = ["CSE","320","LEC","1","TUTH","01:00 PM","02:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Eugene Stark","250","30"," "," "];												
let course70 = ["CSE","327","LEC","1","TUTH","04:00 PM","05:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Dimitrios Samaras","40","10"," "," "];												
let course71 = ["CSE","334","LEC","1","TUTH","11:30 AM","12:50 PM","25-Jan-21","19-May-21","80","In Person","COMPUTER SCI","2205","Anthony Scarlatos","11","0","CSE334.01/ISE334.01","40"];												
let course72 = ["CSE","337","LEC","1","TUTH","05:30 PM","06:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Michael Tashbook","100","0","CSE337.01/ISE337.01","100"];												
let course73 = ["CSE","351","LEC","1","TUTH","04:00 PM","05:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Praveen Tripathi","100","0"," "," "];												
let course74 = ["CSE","352","LEC","1","HTBA","01:00 AM","01:00 AM","25-Jan-21","19-May-21","0","In Person","TBA","TBA","Niranjan Balasubramanian","100","0"," "," "];												
let course75 = ["CSE","354","LEC","1","MW","04:00 PM","05:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Hansen Schwartz","100","20"," "," "];												
let course76 = ["CSE","371","LEC","1","TUTH","01:00 PM","02:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Anita Wasilewska","60","0","CSE/MAT371.01","60"];												
let course77 = ["CSE","373","LEC","1","TUTH","02:30 PM","03:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Rezaul Chowdhury","120","0","CSE373.01/MAT373.01","200"];												
let course78 = ["CSE","376","LEC","1","MW","08:30 AM","09:50 AM","25-Jan-21","19-May-21","80","In Person","TBA","120","Erez Zadok","80","0"," "," "];												
let course79 = ["CSE","380","LEC","1","TUTH","02:30 PM","03:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Richard McKenna","100","30"," "," "];												
let course80 = ["CSE","385","LEC","1","TUTH","11:30 AM","12:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Michael Bender","60","0"," "," "];												
let course81 = ["CSE","385","REC","R01","RETH","02:00 PM","02:53 PM","25-Jan-21","19-May-21","53","In Person","TBA","TBA","Michael Bender","60","0"," "," "];												
let course82 = ["CSE","416","LEC","1","TUTH","07:00 PM","08:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Robert Kelly","70","10"," "," "];												
let course83 = ["CSE","416","LEC","2","TUTH","11:30 AM","12:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Scott Stoller","70","10"," "," "];												
let course84 = ["CSE","506","LEC","1","TUTH","08:30 AM","09:50 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Dongyoon Lee","150","0"," "," "];												
let course85 = ["CSE","512","LEC","1","TUTH","10:00 AM","11:20 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Minh Hoai Nguyen","150","0"," "," "];												
let course86 = ["CSE","526","LEC","1","MF","01:00 PM","02:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Yanhong Liu","100","10"," "," "];												
let course87 = ["CSE","527","LEC","1","MW","07:00 PM","08:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Haibin Ling","120","0"," "," "];												
let course88 = ["CSE","532","LEC","1","TUTH","05:30 PM","06:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Michael Kifer","150","34"," "," "];												
let course89 = ["CSE","540","LEC","1","TUTH","02:30 PM","03:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Omkant Pandey","150","0"," "," "];												
let course90 = ["CSE","541","LEC","1","TUTH","04:00 PM","05:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Anita Wasilewska","120","15"," "," "];												
let course91 = ["CSE","544","LEC","1","TUTH","01:00 PM","02:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Anshul Gandhi","100","0"," "," "];												
let course92 = ["CSE","545","LEC","1","TUTH","11:30 AM","12:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Hansen Schwartz","150","28"," "," "];												
let course93 = ["CSE","548","LEC","1","MW","04:00 PM","05:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Rezaul Chowdhury","180","0","CSE548.01/AMS542.01","180"];												
let course94 = ["CSE","550","SEM","S01","TU","10:31 AM","11:30 AM","25-Jan-21","19-May-21","59","In Person","TBA","120","Predrag Krstic","20","0","DCS501.R01/ESE523.R01/CSE550.S","20"];												
let course95 = ["CSE","550","LEC","1","TU","09:30 AM","10:30 AM","25-Jan-21","19-May-21","60","In Person","TBA","120","Predrag Krstic","20","0","DCS501.01/ESE523.01/CSE550.01","20"];												
let course96 = ["CSE","555","LEC","1","TUTH","10:00 AM","11:20 AM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Joseph Mitchell","60","0","AMS545.01/CSE555.01","60"];												
let course97 = ["CSE","564","LEC","1","TUTH","07:00 PM","08:20 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Klaus Mueller","250","6"," "," "];												
let course98 = ["CSE","566","LEC","1","W","02:30 PM","05:20 PM","25-Jan-21","19-May-21","170","In Person","TBA","220","Arie Kaufman","30","0"," "," "];												
let course99 = ["CSE","600","SEM","S01","F","02:30 PM","03:30 PM","25-Jan-21","19-May-21","60","In Person","TBA","120","Samir Das","80","10"," "," "];												
let course100 = ["CSE","645","SEM","S01","TH","11:30 AM","12:50 PM","25-Jan-21","19-May-21","80","In Person","TBA","TBA","Paul Fodor; Michael Kifer; C Ramakrishnan; Yanhong Liu","30","0"," "," "];												
let courses = [course1,course2,course3,course4,course5,course6,course7,course8,course9,course10,course11,course12,course13,course14,course15,course16,course17,course18,course19,course20,course21,course22,course23,course24,course25,course26,course27,course28,course29,course30,course31,course32,course33,course34,course35,course36,course37,course38,course39,course40,course41,course42,course43,course44,course45,course46,course47,course48,course49,course50,course51,course52,course53,course54,course55,course56,course57,course58,course59,course60,course61,course62,course63,course64,course65,course66,course67,course68,course69,course70,course71,course72,course73,course74,course75,course76,course77,course78,course79,course80,course81,course82,course83,course84,course85,course86,course87,course88,course89,course90,course91,course92,course93,course94,course95,course96,course97,course98,course99,course100];
