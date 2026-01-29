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

leerLibros();
module.exports = { leerLibros };