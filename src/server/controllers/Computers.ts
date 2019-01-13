import * as express from 'express';
import { WebhookClient } from 'dialogflow-fulfillment';

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
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_ANY_COMPUTER_FREE_IDX], this.anyComputerFree.bind(this));
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_WANT_TO_RESERVE_IDX], this.wantToReserve.bind(this));
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_YOUR_STUDENT_NB_IDX], this.yourStudentNb.bind(this));
        this.dialogFlowIntentMap.set(INTENT_NAMES[INTENT_YOUR_STUDENT_NAME_IDX], this.yourStudentName.bind(this));
    }

    public getRouter(router: express.Router = express.Router()): express.Router {
        const itentMap: Map<string, (agent: WebhookClient) => void> = this.dialogFlowIntentMap;
        const handleRequest = (request: express.Request, response: express.Response): void => {
            // request.body = HACK;
            new WebhookClient({ request, response }).handleRequest(itentMap);
        };

        router.get('/fulfillment/computers', handleRequest);
        return router.post('/fulfillment/computers', handleRequest);
    }

    private anyComputerFree(agent: WebhookClient): void {
        const anyComputerFree: boolean = this.computerRoom.anyComputerFree();
        if (anyComputerFree) {
            agent.add('Oui, il y a des ordinateurs libres.');
        }
        else {
            agent.add('Désolé, il n\'y a plus d\'ordinateurs libres !');
        }
    }

    private wantToReserve(agent: WebhookClient): void {
        const anyComputerFree: boolean = this.computerRoom.anyComputerFree();
        if (!anyComputerFree) {
            agent.add('Désolé, il n\'y a plus d\'ordinateurs libres !');
        }
        else {
            console.log('wantToReserve', agent.parameters);
            agent.add('Pas de problème, quel est votre numéro d\'étudiant ?');
        }
    }

    private yourStudentNb(agent: WebhookClient): void {
        const anyComputerFree: boolean = this.computerRoom.anyComputerFree();
        if (!anyComputerFree) {
            agent.add('Désolé, il n\'y a plus d\'ordinateurs libres !');
        }
        else {
            // const studentNb = parseInt(agent.paramters['@studentNb']);
            console.log('yourStudentNb', agent.parameters);
            const studentNb = parseInt('123');
            const student: User = this.schoolDirectory.searchById(studentNb);
            if (student === null) {
                const conversation: DialogflowConversation = agent.conv();
                conversation.ask('Quel est votre nom ?');
                agent.add(conversation);
            }
            else {
                agent.add('Avoir le nom de ' + student.id);
            }
        }
    }

    private yourStudentName(agent: WebhookClient): void {
        const anyComputerFree: boolean = this.computerRoom.anyComputerFree();
        if (!anyComputerFree) {
            agent.add('Désolé, il n\'y a plus d\'ordinateurs libres !');
        }
        else {
            console.log('yourStudentName', agent.parameters);
            agent.add('Maintenant qu\'on a le nom complet, procédons à la réservation');
        }
    }
}

// const HACK: any = {
//     responseId: '84752a4c-55f4-4993-ae0a-1af41c3bfa62',
//     session: 'projects/saintlouisorditest/agent/sessions/6bc27b81-26c6-34d9-822e-9ebb9dc67c7e',
//     queryResult: {
//         queryText: 'Des ordis libres ?',
//         parameters: {
//             Ordinateurs: '',
//             number: ''
//         },
//         fulfillmentText: 'What is the Ordinateurs?',
//         fulfillmentMessages: [{
//             text: {
//                 text: ['What is the Ordinateurs?']
//             }
//         }],
//         outputContexts: [
//             {
//                 name: 'projects/saintlouisorditest/agent/sessions/6bc27b81-26c6-34d9-822e-9ebb9dc67c7e/contexts/combien_d\'ordis_libres_?_dialog_params_ordinateurs',
//                 lifespanCount: 1,
//                 parameters: { number: '', 'Ordinateurs.original': '', 'number.original': '', Ordinateurs: '' }
//             }, {
//                 name: 'projects/saintlouisorditest/agent/sessions/6bc27b81-26c6-34d9-822e-9ebb9dc67c7e/contexts/combien_d\'ordis_libres_?_dialog_context',
//                 lifespanCount: 2,
//                 parameters: { number: '', 'Ordinateurs.original': '', 'number.original': '', Ordinateurs: '' }
//             }, {
//                 name: 'projects/saintlouisorditest/agent/sessions/6bc27b81-26c6-34d9-822e-9ebb9dc67c7e/contexts/b9c8192e-3d39-4a15-a0b6-12e08c766c62_id_dialog_context',
//                 lifespanCount: 2,
//                 parameters: { number: '', 'Ordinateurs.original': '', 'number.original': '', Ordinateurs: '' }
//             }
//         ],
//         intent: {
//             name: 'projects/saintlouisorditest/agent/intents/b9c8192e-3d39-4a15-a0b6-12e08c766c62',
//             displayName: '2. Want to reserve?'
//         },
//         intentDetectionConfidence: 1,
//         languageCode: 'fr'
//     },
//     originalDetectIntentRequest: { payload: {} },
// };