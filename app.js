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

  if(errores.length > 0){
        return res.status(400).render("register", { username, password, email, role, errores });
    }

    const nuevoUsuario = new Usuario(username, password, email, [] , "invitado");
    const resultado = await registrarUsuario(nuevoUsuario);
    if (!resultado.success) {
        return res.status(400).render("register", { 
            username, email, password, 
            errores: [resultado.message] 
        });
    }
    res.render("resultadoRegister", { username, password, email, role: "invitado" });
});

//Registro de admin
app.get("/crearAdmin",requiereAuth,requiereAdmin, (req, res) => {
    res.render("crearAdmin", {
        username:"",
        password:"",
        email:"",
        role:""
    });
});

app.post("/crearAdmin",requiereAuth,requiereAdmin, async (req, res) => {

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

  if(errores.length > 0){
        return res.status(400).render("crearAdmin", { username, password, email, role, errores });
    }

  res.render("resultadoRegister",{
        username,
        password,
        email,
        role
    });

    const nuevoUsuario = new Usuario(username, password, email, [] ,role);
    const resultado = await registrarUsuario(nuevoUsuario);
    console.log("Usuario registrado:", nuevoUsuario);
    if (!resultado.success) {
        errores.push(resultado.message);
        return res.status(400).render("crearAdmin", { username, password, email, role, errores });
    }
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

//Añadir libros (solo para admin)
const Libro = require("./models/Libro");
const { addLibro } = require("./funciones");

app.get("/addLibro",requiereAuth,requiereAdmin, (req, res) => {
    res.render("addLibro", {
        id:"",
        titulo:"",
        autor:"",
        stock:"",
        categoria:""
    });


});

app.post("/addLibro",requiereAuth,requiereAdmin, async (req, res) => {

  const id = req.body.id;
  const titulo = req.body.titulo;
  const autor = req.body.autor;
  const stock = req.body.stock;
  const categoria = req.body.categoria;


  let errores = [];

  if(!id){
      errores.push("Debe haber un ID válido.");
  }
  if(!titulo || titulo.trim().length < 2){
      errores.push("El título debe tener al menos 2 caracteres.");
  }
  if(!autor || autor.trim().length < 2){
      errores.push("El autor debe tener al menos 2 caracteres.");
  }
  if(!stock || stock < 0){
      errores.push("El stock debe ser un número positivo.");
  }
  if(!categoria || categoria.trim().length < 2){
      errores.push("La categoría debe tener al menos 2 caracteres.");
  }

  if(errores.length > 0){
        return res.status(400).render("addLibro", { id, titulo, autor, stock, categoria, errores });
    }

    const nuevoLibro = new Libro(id, titulo, autor, stock, categoria);
    const resultado = await addLibro(nuevoLibro);
    console.log("Libro añadido:", nuevoLibro);
    if (!resultado.success) {
        errores.push(resultado.message);
        return res.status(400).render("addLibro", { id, titulo, autor, stock, categoria, errores });
    }
    
    res.redirect("/catalogo");

});
//Middleware de autenticación
function requiereAuth(req, res, next){
    if(req.session.usuario) return next();
    res.redirect("/login");
}

function requiereAdmin(req, res, next){
    if(req.session.usuario && req.session.usuario.role === "admin") return next();
    res.status(403).send("Acceso denegado. Solo administradores pueden acceder a esta página.");
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