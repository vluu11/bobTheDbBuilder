import inquirer from 'inquirer';
import db from '../connection/connection.js';
import { viewDepartments, viewEmployees, viewManagers, viewRoles, viewEmployeesByDepartment, viewEmployeesByManager, viewTotalBudget } from '../views/view.js';
import { addDepartment, addEmployee, addRole } from '../actions/add.js';
import { updateEmployeeManagers, updateEmployeeRole, updateManagers } from '../actions/update.js';
import { deleteDepartment, deleteEmployee, deleteRole } from '../actions/delete.js';
function startApp() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'View all managers',
            'View employees by managers',
            'View employees by department',
            'View total utilized budget',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update employee role',
            "Update employee's manager",
            'Update managers',
            'Delete a department',
            'Delete a role',
            'Delete an employee',
            'Exit'
        ]
    }).then((answer) => {
        switch (answer.action) {
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
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update employee role':
                updateEmployeeRole();
                break;
            case "Update employee's manager":
                updateEmployeeManagers();
                break;
            case 'Update managers':
                updateManagers();
                break;
            case 'Delete a department':
                deleteDepartment();
                break;
            case 'Delete a role':
                deleteRole();
                break;
            case 'Delete an employee':
                deleteEmployee();
                break;
            default:
                db.end();
                process.exit();
        }
    });
}
export default startApp;
