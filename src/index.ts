
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

function viewEmployees(): void {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.is_manager,
                        (SELECT CONCAT(manager.first_name, ' ', manager.last_name) FROM employee manager WHERE manager.id = employee.manager_id) AS manager
                 FROM employee
                 LEFT JOIN role ON employee.role_id = role.id
                 LEFT JOIN department ON role.department_id = department.id`;
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res.rows);
    startApp();
  });
}

function viewManagers(): void {
  const query = `
    SELECT 
      managers.id, 
      managers.first_name, 
      managers.last_name, 
      role.title, 
      department.name AS department, 
      role.salary, 
      managers.is_manager
    FROM managers
    LEFT JOIN role ON managers.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
  `;

  db.query(query, (err, res) => {
    if (err) {
      console.error("Error fetching managers:", err);
      return; // Exit the function on error
    }
    console.table(res.rows);
    startApp(); // Call the startApp function after displaying the managers
  });
}

function addDepartment(): void {
  inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Enter department name:'
  }).then((answer: Answers) => {
    db.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err) => {
      if (err) throw err;
      console.log(`Added department: ${answer.name}`);
      startApp();
    });
  });
}

function addRole(): void {
  db.query('SELECT * FROM department', (err, res) => {
    if (err) throw err;

    const departments = res.rows.map((department: { name: string; id: number; }) => ({
      name: department.name,
      value: department.id
    }));

    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter role name:',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter salary amount:',
      },
      {
        type: 'list',
        name: 'department_id',
        message: 'Select the department for this role:',
        choices: departments
      }
    ]).then((answer: Answers) => {
      db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answer.title, answer.salary, answer.department_id], (err) => {
        if (err) throw err;
        console.log(`Added role: ${answer.title}`);
        startApp();
      });
    });
  });
}
