import inquirer from 'inquirer';
import db from '../connection/connection.js';
import selectView from '../menu/view-menu.js';
import { selectAdd, selectDelete, updateEmployees } from '../menu/action-menu.js';
function startApp() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View',
            'Add',
            'Delete',
            'Update',
            'Exit'
        ]
    }).then((answer) => {
        switch (answer.action) {
            case 'View':
                selectView();
                break;
            case 'Add':
                selectAdd();
                break;
            case 'Delete':
                selectDelete();
                break;
            case 'Update':
                updateEmployees();
                break;
            default:
                db.end();
                process.exit();
        }
    });
}
export default startApp;
