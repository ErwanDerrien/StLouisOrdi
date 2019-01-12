import { Directory } from "../models/Directory";
import { ClassRoom } from "../models/ClassRoom";
import { Computer } from "../models/Computer";

// Define school directory
const schoolDirectory: Directory = new Directory();

// Define the class room with contains the computers
const computerRoom: ClassRoom = new ClassRoom();
computerRoom.name = 'c200';
computerRoom.directory = schoolDirectory;

// Add 10 computers to the class room
for (let i = 0; i < 10; i++) {
    const oneComputer: Computer = new Computer();
    oneComputer.name = 'comp-20' + i;
    computerRoom.computers.push(oneComputer);
}

// With one user of id: '123', get a computer, and print the computer name
const firstReservedComputer: Computer = computerRoom.reserveComputer(123);
console.log('Computer reserved for 123:', firstReservedComputer.name);

// With a second user of id: '456', get a computer, and print the computer name
const secondReservedComputer: Computer = computerRoom.reserveComputer(456);
console.log('Computer reserved for 456:', secondReservedComputer.name);

// User of id: '123' gives back his computer
computerRoom.freeComputer(123);

// With a third user of id: '789', get a computer, and print the computer name
const thirdReservedComputer: Computer = computerRoom.reserveComputer(789);
console.log('Computer reserved for 789:', thirdReservedComputer.name);

console.log('Who is in the directory:', schoolDirectory);