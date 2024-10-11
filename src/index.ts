
import inquirer, { Answers } from 'inquirer'; // import Inquirer for prompts
import db from './db.js'; // import your PostgreSQL connection

function startApp(): void {
  inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'View all managers',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Promote to Manager',
      'Demote manager',
      'Update employee role',
      'Exit'
    ]
  }).then((answer: Answers) => {
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
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Promote to Manager':
        promoteToManager();
        break;
      case 'Demote manager':
        demoteManager();
        break;
      case 'Update employee role':
        updateEmployeeRole();
        break;
      default:
        db.end();
        process.exit();
    }
  });
}

function viewDepartments(): void {
  db.query('SELECT * FROM department', (err, res) => {
    if (err) throw err;
    console.table(res.rows);
    startApp();
  });
}
