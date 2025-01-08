import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
let app = express();
let entries = [];


app.use(express.static("public"))

app.use(bodyParser.urlencoded({extended:true}))
app.use(morgan('dev'))


app.get("/", (req,res)=>{
res.render("index.ejs", {entries})
})

app.get("/createpost", (req,res)=>{
    res.render("post.ejs")
    })

app.post("/submit", (req,res)=>{   
    let title = req.body.title;
    let body = req.body.description;
    let content = `<div class="blog-element"><div class="image" style="background-image: url('../images/old-books.jpg')"></div><div class="content"><h3><strong>${title}</strong></h3><p>${body}</p></div></div>`;
    entries.push(content);
    res.render("index.ejs",{entries});
    })    

app.listen(3000,()=>{
    console.log("success")
})