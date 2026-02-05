const fs = require('fs/promises');
const DATA_DIR = "./data";

//Funcion para leer los libros desde un archivo JSON
async function leerLibros(){
    let libros=[];
    try{
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log(`Carpeta ${DATA_DIR} creada o ya existe.`);
        const data = await fs.readFile(`${DATA_DIR}/libros.json`, 'utf-8');
        const librosJson = JSON.parse(data);
        libros.push(...librosJson);
        console.log("Libros leídos correctamente.");
        return libros;
    }catch(err){
        console.error("Error al leer los libros:", err);
    }
}

//Funciones para registrar y leer usuarios desde un archivo JSON
async function registrarUsuario(nuevoUsuario) {
    let usuarios = [];
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log(`Carpeta ${DATA_DIR} lista.`);
        const contenido = await fs.readFile(`${DATA_DIR}/usuarios.json`, "utf-8").catch(() => "[]");
        usuarios = JSON.parse(contenido);
        usuarios.push(nuevoUsuario);
        await fs.writeFile(`${DATA_DIR}/usuarios.json`, JSON.stringify(usuarios, null, 2), "utf-8");
        console.log(`Fichero ${DATA_DIR}/usuarios.json guardado.`);
    }catch(error){
        console.error("Error al registrar el usuario:", error);
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
module.exports = { leerLibros, registrarUsuario, leerUsuarios };