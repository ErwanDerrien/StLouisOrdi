import { Computer } from "./Computer";
import { Directory } from "./Directory";
import { User } from "./User";

export class ClassRoom {
    name: string;
    directory: Directory = null;
    computers: Computer[] = [];

    public constructor() {
        // By default, there's no computer to the class room
    }

    public anyComputerFree(): boolean {
        // Check if there is any computers at all
        if (this.computers.length === 0) {
            return false;
        }

        // Check if any computer has an empty user list
        for (let index = 0; index < this.computers.length; index++) {
            const currentComputer: Computer = this.computers[index];
            if (currentComputer.users.length === 0) {
                return true;
            }
        }

        return false;
    }

    public reserveComputer(userId: number): Computer {
        // Check if any computer free 
        const availableComputer: boolean = this.anyComputerFree();
        if (availableComputer === false) {
            return null;
        }

        // Select free computer
        let freeComputerIndex: number = -1;
        for (let index = 0; index < this.computers.length; index++) {
            const currentComputer: Computer = this.computers[index];
            if (currentComputer.users.length === 0) {
                freeComputerIndex = index;
                break; // Stop the loop because we've just found a free computer
            }
        }
        const freeComputer: Computer = this.computers[freeComputerIndex];

        // Find user corresponding to userId
        let foundUser: User = this.directory.searchById(userId);
        if (foundUser === null) {
            this.directory.createUser(userId);
            foundUser = this.directory.searchById(userId);
        }

        // Add user to computer
        freeComputer.assignUser(foundUser);

        return freeComputer;
    }

    public freeComputer(userId: number): boolean {

        // Find user corresponding to userId
        let foundUser: User = this.directory.searchById(userId);

        // Find index of computer with foundUser & Find index of user on the computer
        for (let index = 0; index < this.computers.length; index++) {
            const currentComputer: Computer = this.computers[index];

            const foundUserIndex: number = currentComputer.getUserIndex(foundUser);

            if (foundUserIndex !== -1) {
                currentComputer.freeUser(foundUser);
                return true
            }
        }

        // Respond to a unsuccesful search
        return false
    }
}
