import pg from 'pg';
import express from "express";
import axios from 'axios';
import bodyParser from "body-parser";
import morgan from "morgan";
let app = express();
let entries = [];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('dev'));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "blogsite",
  password: "Nik26hil03!",
  port: 5432,
});
db.connect();

app.get("/", async (req,res)=>{
    const result = await db.query("Select * from entries");
    entries = result.rows;
    console.log(entries);
    res.render("index.ejs", {entries});
})

app.get("/createpost", (req,res)=>{
    res.render("post.ejs");
    });

app.post("/sort", async(req,res)=>{
    const sortBy = req.body.sortBy;
    const level = req.body.ascDesc;
    const result = await db.query(`SELECT * FROM entries ORDER BY ${sortBy} ${level};`);
    entries = result.rows;
    console.log(result.rows);
    res.render("index.ejs",{entries});
});

app.post("/update", async(req,res)=>{
    const bookData = await db.query(`select * from entries where id = ${req.body.updateItemId}`);
    const result = bookData.rows;
    res.render("update.ejs",({result:result[0]}));
    });

    app.post("/setupdate", async(req,res)=>{
        console.log(req.body);
        const id = req.body.id;
        const title = req.body.updatedTitle;
        const body = req.body.updatedBody;
        const rating = req.body.updatedRating;
        const date = await getFormattedDate();
        const isbn = req.body.updatedIsbn;
        const img = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
        await db.query("UPDATE entries SET title = $2, body = $3, rating = $4, date = $5, isbn = $6, image = $7 where id = $1",[id, title, body, rating, date, isbn, img]);
    res.redirect("/");    
    });

app.post("/delete", async(req, res) => {        
    await db.query(`delete from entries where id = ${req.body.deleteItemId}`);
    res.redirect("/");
    });

app.post("/submit", async (req,res)=>{   
    const title = req.body.title;
    const body = req.body.description;
    const rating = req.body.rating;
    const date = await getFormattedDate();
    const isbn = req.body.isbn;
    const img = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

    await db.query( `INSERT INTO entries (title, body, rating, date, isbn, image) VALUES ($1, $2, $3, $4, $5, $6)`, [title, body, rating, date, isbn, img]);
    res.redirect("/");
    })    

app.listen(3000,()=>{
    console.log("success")
})


async function getFormattedDate() {
    const today = new Date(); // Get the current date
    const year = today.getFullYear(); // Get the full year (e.g., 2025)
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1 and pad with 0 if needed
    const day = String(today.getDate()).padStart(2, '0'); // Pad the day with 0 if it's a single digit
    return `${year}-${month}-${day}`; // Combine into YYYY-MM-DD format
  }