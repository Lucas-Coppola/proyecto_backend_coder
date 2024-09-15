export class UserDto {
    constructor(user){
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.username;
        this.cart = user.cart
        this.age = user.age
        this.password = user.password;
        this.fullname = `${user.first_name} ${user.last_name}`;
    }
}

export class UserDtoCurrent {
    constructor({first_name, last_name, email, age, role}){
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.cart = user.cart
        this.age = age
        this.fullname = `${first_name} ${last_name}`
        this.role = role
    }
}