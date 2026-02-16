const fs = require('fs/promises');
const DATA_DIR = "./data";

//Funcion para añadir y leer los libros desde un archivo JSON
async function leerLibros(){
    let libros=[];
    try{
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log(`Carpeta ${DATA_DIR} creada o ya existe.`);
        const data = await fs.readFile(`${DATA_DIR}/libros.json`, 'utf-8');
        const librosJson = JSON.parse(data);
        console.log("Libros leídos correctamente.");
        return librosJson;
    }catch(err){
        console.error("Error al leer los libros:", err);
    }
}
async function addLibro(nuevoLibro) {
    let libros = [];
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log(`Carpeta ${DATA_DIR} lista.`);
        const contenido = await fs.readFile(`${DATA_DIR}/libros.json`, "utf-8").catch(() => "[]");
        libros = await leerLibros();
        if(libros.find(l => l.id === nuevoLibro.id || l.titulo === nuevoLibro.titulo)){
            console.error("Error: El ID o título del libro ya existe.");
            return { success: false, message: "El ID o título del libro ya existe." };
        }
        libros = JSON.parse(contenido);
        libros.push(nuevoLibro);
        await fs.writeFile(`${DATA_DIR}/libros.json`, JSON.stringify(libros, null, 2), "utf-8");
        console.log(`Fichero ${DATA_DIR}/libros.json guardado.`);
        return { success: true };
    }catch(error){
        console.error("Error al registrar el libro:", error);
        return { success: false, message: "Error al registrar el libro." };
    }
}
//Funciones para registrar y leer usuarios desde un archivo JSON
async function registrarUsuario(nuevoUsuario) {
    let usuarios = [];
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log(`Carpeta ${DATA_DIR} lista.`);
        const contenido = await fs.readFile(`${DATA_DIR}/usuarios.json`, "utf-8").catch(() => "[]");
        usuarios = await leerUsuarios();
        if(usuarios.find(u => u.username === nuevoUsuario.username)){
            console.error("Error: El nombre de usuario ya existe.");
            return { success: false, message: "El nombre de usuario ya existe." };
        }
        usuarios = JSON.parse(contenido);
        usuarios.push(nuevoUsuario);
        await fs.writeFile(`${DATA_DIR}/usuarios.json`, JSON.stringify(usuarios, null, 2), "utf-8");
        console.log(`Fichero ${DATA_DIR}/usuarios.json guardado.`);
        return { success: true };
    }catch(error){
        console.error("Error al registrar el usuario:", error);
        return { success: false, message: "Error al registrar el usuario." };
    }
}

async function leerUsuarios() {
    try{
        const data = await fs.readFile(`${DATA_DIR}/usuarios.json`, "utf-8");
        const usuarios = JSON.parse(data);
        console.log("Usuarios leídos:", usuarios);
        return usuarios;
    }catch(error){
        console.error("Error al leer los usuarios:", error);
    }
}

leerLibros();
module.exports = { addLibro,leerLibros, registrarUsuario, leerUsuarios };