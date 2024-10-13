import inquirer from 'inquirer';
import startApp from '../app/startApp.js';
import { viewDepartments, viewEmployees, viewManagers, viewRoles, viewEmployeesByDepartment, viewEmployeesByManager, viewTotalBudget } from './views/view.js';
function selectView() {
    inquirer
        .prompt({
        type: 'list',
        name: 'view',
        message: 'What would you like to add?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'View all managers',
            'View employees by managers',
            'View employees by department',
            'View total utilized budget',
            'Exit'
        ]
    })
        .then(res => {
        switch (res.view) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'View all managers':
                viewManagers();
                break;
            case 'View employees by managers':
                viewEmployeesByManager();
                break;
            case 'View employees by department':
                viewEmployeesByDepartment();
                break;
            case 'View total utilized budget':
                viewTotalBudget();
                break;
            default:
                return startApp();
        }
    });
}
export default selectView;
