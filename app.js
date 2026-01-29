const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;
const dayjs = require("dayjs");
require("dayjs/locale/es");
dayjs.locale("es");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.render("index");
});

//Catalogo de libros
const { leerLibros } = require("./funciones");
app.get("/catalogo", async (req, res) => {
    const libros = await leerLibros();
    res.render("catalogo", { libros });
});

app.listen(PORT, () => {
  console.log(`Servidor web escuchando en http://localhost:${PORT}`);
});