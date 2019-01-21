import * as express from 'express';
import { WebhookClient, Card, Suggestion } from 'dialogflow-fulfillment';

import { ClassRoom } from '../models/ClassRoom';
import { Computer } from '../models/Computer';
import { Directory } from '../models/Directory';
import { User } from '../models/User';

const INTENT_NAMES: string[] = [
    '0. Welcome',
    '1. Any computer free?', // INTENT_ANY_COMPUTER_FREE_IDX
    '2. Want to reserve?', // INTENT_WANT_TO_RESERVE_IDX
    '3. Your student nb?', // INTENT_YOUR_STUDENT_NB_IDX
    '4. Your student name?', // INTENT_YOUR_STUDENT_NAME_IDX
    '98. Bye',
    '99. Fallback message'
];

const INTENT_WELCOME_IDX: number = 0;
const INTENT_ANY_COMPUTER_FREE_IDX: number = 1;
const INTENT_WANT_TO_RESERVE_IDX: number = 2;
const INTENT_YOUR_STUDENT_NB_IDX: number = 3;
const INTENT_YOUR_STUDENT_NAME_IDX: number = 4;

export class ComputersController {
    private schoolDirectory: Directory = new Directory();
    private computerRoom: ClassRoom = new ClassRoom();
    private dialogFlowIntentMap: Map<string, (agent: WebhookClient) => void>;

    public static getInstance(): ComputersController {
        if (ComputersController.instance === undefined) {
            ComputersController.instance = new ComputersController();
        }
        return ComputersController.instance;
    }

    private static instance: ComputersController;

    private constructor() {
        // 1. Business logic setup
        this.computerRoom.name = 'c200';
        this.computerRoom.directory = this.schoolDirectory;

        for (let i = 0; i < 10; i++) {
            const oneComputer: Computer = new Computer();
            oneComputer.name = 'comp-20' + i;
            this.computerRoom.computers.push(oneComputer);
        }

        // 2. Logic flow for dialog setup
        this.dialogFlowIntentMap = new Map();
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_WELCOME_IDX], this.welcome.bind(this));
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_ANY_COMPUTER_FREE_IDX], this.anyComputerFree.bind(this));
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_WANT_TO_RESERVE_IDX], this.wantToReserve.bind(this));
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_YOUR_STUDENT_NB_IDX], this.yourStudentNb.bind(this));
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_YOUR_STUDENT_NAME_IDX], this.yourStudentName.bind(this));
    }

    public getRouter(router: express.Router = express.Router()): express.Router {
        const itentMap: Map<string, (agent: WebhookClient) => void> = this.dialogFlowIntentMap;
        const handleRequest = (request: express.Request, response: express.Response): void => {
            new WebhookClient({ request, response }).handleRequest(itentMap);
        };
        return router.post('/fulfillment/computers', handleRequest);
    }

    private welcome(agent: WebhookClient): void {
        console.log('>>> Welcome');
        agent.add('Bienvenue sur le système de réservation d\'ordinateurs du collège Saint Louis. ');
        const appCard: Card = new Card({
            imageUrl: 'https://stlouis-ordi.appspot.com/images/logo-app.png',
            text: 'Tout arrive à l\'école',
            title: 'St Louis Ordi'
        });
        agent.add(appCard);
        agent.add('Que puis je faire pour vous aujourd\'hui ? ')
        const anyComputerFreeSuggestion: Suggestion = new Suggestion('Des ordis libres ?');
        const wantToeserveSuggestion: Suggestion = new Suggestion('Réserver un ordi.');
        agent.add(anyComputerFreeSuggestion);
        agent.add(wantToeserveSuggestion);
    }

    private anyComputerFree(agent: WebhookClient): void {
        console.log('>>> Any computer free?');
        const anyComputerFree: boolean = this.computerRoom.anyComputerFree();
        if (!anyComputerFree) {
            agent.add('Désolé, il n\'y a plus d\'ordinateurs libres !');
        }
        else {
            agent.add('Oui, il y a des ordinateurs libres.');
            const wantToeserveSuggestion: Suggestion = new Suggestion('Réserver un ordi.');
            const byeSuggestion: Suggestion = new Suggestion('Bye ?');
            agent.add(wantToeserveSuggestion);
            agent.add(byeSuggestion);
        }
    }

    private wantToReserve(agent: WebhookClient): void {
        console.log('>>> Want to reserve');
        const anyComputerFree: boolean = this.computerRoom.anyComputerFree();
        if (!anyComputerFree) {
            agent.add('Désolé, il n\'y a plus d\'ordinateurs libres !');
        }
        else {
            agent.add('Pas de problème, quel est votre numéro d\'étudiant ?');
        }
    }

    private yourStudentNb(agent: WebhookClient): void {
        console.log('>>> Your student number', agent.parameters);
        const anyComputerFree: boolean = this.computerRoom.anyComputerFree();
        if (!anyComputerFree) {
            agent.add('Désolé, il n\'y a plus d\'ordinateurs libres !');
        }
        else {
            // Get all numbers spelled out
            const studentNbParts: string[] = ['' + agent.parameters.number];
            for (let idx = 1; idx < 16; idx += 1) {
                const currentNumber: number = agent.parameters['number' + idx];
                if (currentNumber !== undefined) {
                    studentNbParts.push('' + currentNumber);
                }
            }
            // Assemble the given numbers
            const studentNb: number = parseInt(studentNbParts.join(''));
            // Check if the student is known
            const student: User = this.schoolDirectory.searchById(studentNb);
            if (student === null) {
                // Ask for the student name before
                const conversation: DialogflowConversation = agent.conv();
                conversation.ask('C\'est la première fois que je vois ce numéro d\'étudiant. Quel est votre prénom ? ');
                agent.add(conversation);
                agent.context.set({
                    name: 'context',
                    lifespan: 10,
                    parameters: { studentNb: '' + studentNb }
                });
            }
            else {
                const computer: Computer = this.computerRoom.reserveComputer(studentNb);
                agent.add('Voilà ' + student.name + ', l\'ordinateur ' + computer.name + ' a été réservé pour vous.');
                const byeSuggestion: Suggestion = new Suggestion('Bye ?');
                agent.add(byeSuggestion);
            }
        }
    }

    private yourStudentName(agent: WebhookClient): void {
        console.log('>>> Your student name', agent.parameters);
        const anyComputerFree: boolean = this.computerRoom.anyComputerFree();
        if (!anyComputerFree) {
            agent.add('Désolé, il n\'y a plus d\'ordinateurs libres !');
        }
        else {
            try {
                const context: any = agent.context.get('context');
                console.log('*****', context);
                const name: string = context.parameters.name;
                const studentNb: number = parseInt(context.parameters.studentNb);
                console.log('*****', studentNb, 'w/', name);
                const student: User = this.schoolDirectory.createUser(studentNb);
                student.name = name;
                const computer: Computer = this.computerRoom.reserveComputer(studentNb);
                agent.add('Voilà ' + name + ', l\'ordinateur « ' + computer.name + ' » a été réservé pour vous.');
                const byeSuggestion: Suggestion = new Suggestion('Bye ?');
                agent.add(byeSuggestion);
                agent.context.delete('studentNb');
            } catch (error) {
                console.log('****', error);
                agent.add('Petit problème technique, ré-essayer un peu plus tard. Merci.')
            }
        }
    }
}
