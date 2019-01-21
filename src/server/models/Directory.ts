import { User } from "./User";

export class Directory {
    users: User[] = [];

    public constructor() {
        // Creation of some users
        this.createUser(0).name = 'Administrateur';

        this.createUser(123).name = 'Étudiant testeur';
        this.createUser(1424134).name = 'Erwan';
    }

    public searchById(userId: number): User {
        // 1. Prepare result
        let foundUser: User = null;

        // 2. Check all existing users with the given identifier
        for (let index = 0; index < this.users.length; index++) {
            const currentUser: User = this.users[index];
            if (currentUser.id === userId) {
                foundUser = currentUser;
                break; // Optional command, to stop the search early
            }
        }

        // 3. Return reference of the found user
        return foundUser;
    }

    public createUser(userId: number): User {
        // 1. Check if user exist
        const existingUser = this.searchById(userId);
        if (existingUser !== null) {
            return existingUser;
        }

        // 2. Create the new user
        const newUser: User = new User();
        newUser.id = userId;
        newUser.name = 'No name yet!';

        // 3. Add the new user to the directory
        this.users.push(newUser);

        // 4. Return the reference of the new user
        return newUser;
    }
}