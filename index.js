import { createClient } from "@supabase/supabase-js";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import env from "dotenv";

let app = express();
let entries = [];
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
env.config();

const supabase = createClient(process.env.SUPABASEURL, process.env.SUPABASEANONKEY);

app.get("/", async (req, res) => {
  const { data, error } = await supabase.from("entries").select("*");
  entries = data;
  console.log(entries);
  res.render("index.ejs", { entries });
});

app.get("/createpost", (req, res) => {
  res.render("post.ejs");
});

app.post("/sort", async (req, res) => {
  const sortBy = req.body.sortBy;
  const level = req.body.ascDesc;
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order(`${sortBy}`, { ascending: level == "ascending" ? true : false });
  console.log(data);
  res.render("index.ejs", { entries });
});

app.post("/update", async (req, res) => {
  const { data, error } = await supabase.from("entries").select("*").eq("id", `${req.body.updateItemId}`);
  const result = data;
  res.render("update.ejs", { result: result[0] });
});

app.post("/setupdate", async (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  const title = req.body.updatedTitle;
  const body = req.body.updatedBody;
  const rating = req.body.updatedRating;
  const date = await getFormattedDate();
  const isbn = req.body.updatedIsbn;
  const img = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

  await supabase
    .from("entries")
    .update([{ title: `${title}`, body: `${body}`, rating: `${rating}`, date: `${date}`, isbn: `${isbn}`, img: `${img}` }])
    .eq("id", `${id}`);
  res.redirect("/");
});

app.post("/submit", async (req, res) => {
  const title = req.body.title;
  const body = req.body.description;
  const rating = req.body.rating;
  const date = await getFormattedDate();
  const isbn = req.body.isbn;
  const img = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

  await supabase.from("entries").insert([{ title: `${title}`, body: `${body}`, rating: `${rating}`, date: `${date}`, isbn: `${isbn}`, img: `${img}` }]);

  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  await supabase.from("entries").delete().eq("id", `${req.body.deleteItemId}`);
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("success");
});

async function getFormattedDate() {
  const today = new Date(); // Get the current date
  const year = today.getFullYear(); // Get the full year (e.g., 2025)
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1 and pad with 0 if needed
  const day = String(today.getDate()).padStart(2, "0"); // Pad the day with 0 if it's a single digit
  return `${year}-${month}-${day}`; // Combine into YYYY-MM-DD format
}
