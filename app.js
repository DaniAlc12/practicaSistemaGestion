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

//--COOKIES--
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(cookieParser());
app.use(session({
    secret: "clave para sesiones",
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        maxAge: 1000 * 60 * 30,
    }
}));

app.get("/", (req, res) => {
  res.render("index");
});

//Catalogo de libros
const { leerLibros } = require("./funciones");
app.get("/catalogo", async (req, res) => {
    const libros = await leerLibros();
    res.render("catalogo", { libros });
});

//Registro de usuarios
const Usuario = require("./models/Usuario");
const { registrarUsuario } = require("./funciones");
app.get("/register", (req, res) => {
    res.render("register", {
        username:"",
        password:"",
        email:"",
    });
});

app.post("/register", async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  let errores = [];

  if(!username || username.trim().length < 2){
      errores.push("El nombre de usuario debe tener al menos 2 caracteres.");
  }
  if(!password || password.length < 6){
      errores.push("La contraseña debe tener al menos 6 caracteres.");
  }
  if(!email){
      errores.push("Debe haber un correo electrónico válido.");
  }

  if(errores.length){
    return res
        .status(400)
        .render("register", {username,email,password,errores});
  }

  res.render("resultadoRegister",{
        username,
        password,
        email,
        role: "invitado"
    });

    const nuevoUsuario = new Usuario(username, password, email, [] , "invitado");
    registrarUsuario(nuevoUsuario);
    console.log("Usuario registrado:", nuevoUsuario);
});

//Registro de admin
app.get("/crearAdmin", (req, res) => {
    res.render("crearAdmin", {
        username:"",
        password:"",
        email:"",
        role:""
    });
});

app.post("/crearAdmin", async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const role = req.body.role;

  let errores = [];

  if(!username || username.trim().length < 2){
      errores.push("El nombre de usuario debe tener al menos 2 caracteres.");
  }
  if(!password || password.length < 6){
      errores.push("La contraseña debe tener al menos 6 caracteres.");
  }
  if(!email){
      errores.push("Debe haber un correo electrónico válido.");
  }

  if(errores.length){
    return res
        .status(400)
        .render("crearAdmin", {username,email,password,role,errores});
  }

  res.render("resultadoRegister",{
        username,
        password,
        email,
        role
    });

    const nuevoUsuario = new Usuario(username, password, email, [] ,role);
    registrarUsuario(nuevoUsuario);
    console.log("Usuario registrado:", nuevoUsuario);
});

//Login de usuarios
const { leerUsuarios } = require("./funciones");
app.get("/login", (req, res) => {
    res.render("login", {
        username:"",
        password:"",
        email:"",
    });
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const usuarios = await leerUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.username === username && u.password === password && u.email === email);
    if(usuarioEncontrado){
        req.session.usuario = usuarioEncontrado;
        return res.redirect("/perfil");

    }

    res.status(401).render("login", {
        error: "Usuario o contraseña incorrectos.",
    }); 
    
});

//Middleware de autenticación
function requiereAuth(req, res, next){
    if(req.session.usuario) return next();
    res.redirect("/login");
}

app.get("/perfil", requiereAuth, (req ,res) => {
    const user = req.session.usuario;
    const role = req.session.usuario.role;
    res.render("perfil", {
        user,
        role
    });
});

app.listen(PORT, () => {
  console.log(`Servidor web escuchando en http://localhost:${PORT}`);
});