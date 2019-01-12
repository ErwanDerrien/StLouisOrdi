import { User } from "./User";

export class Computer {
    name: string;
    users: User[] = [];

    public assignUser(user: User): boolean {
        if (this.users.length === 4) {
            // Maximun capacity reached
            return false;
        }
        if (this.getUserIndex(user) !== -1) {
            // Already assigned
            return false;
        }

        this.users.push(user);
        return true;
    }

    public freeUser(user: User): boolean {
        // Get the user position
        const userIndex: number = this.getUserIndex(user);

        // Stop the process if the user is not found
        if (userIndex === -1) {
            return false;
        }

        // Remove the user at the found position
        this.users.splice(userIndex, 1);
        return true;
    }

    public freeAllUsers(): boolean {
        // Reset the user list if it is not yet empty
        if (this.users.length !== 0) {
            this.users.length = 0;
        }
        return true;
    }

    public getUserIndex(user: User): number {
        // Check if the user list is empty
        if (this.users.length === 0) {
            return -1;
        }

        // Loop through the user list and check with the given user
        for (let index = 0; index < this.users.length; index++) {
            const currentUser: User = this.users[index];
            if (currentUser === user) {
                return index;
            }
        }

        // In case the user is not in the use list
        return -1; // No found
    }
}