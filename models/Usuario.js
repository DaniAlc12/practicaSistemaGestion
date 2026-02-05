class Usuario{

    constructor(username, password, email, librosAlquilados){
        this.username = username;
        this.password = password;
        this.email = email;
        this.librosAlquilados = librosAlquilados;
    }
    
}

module.exports = Usuario;