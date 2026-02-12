class Usuario{

    constructor(username, password, email, librosAlquilados,role){
        this.username = username;
        this.password = password;
        this.email = email;
        this.librosAlquilados = librosAlquilados;
        this.role = role;
    }
    
}

module.exports = Usuario;