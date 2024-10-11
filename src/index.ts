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

function viewRoles(): void {
  const query = `SELECT role.id, role.title, department.name AS department, role.salary
                 FROM role
                 LEFT JOIN department ON role.department_id = department.id`;
  db.query(query, (err, res) => {
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

function addEmployee(): void {
    db.query('SELECT * FROM role', (err, roleRes) => {
      if (err) throw err;
  
      const roles = roleRes.rows.map((role: { title: string; id: number; }) => ({
        name: role.title,
        value: role.id
      }));
  
      db.query('SELECT * FROM employee', (err, employeeRes) => {
        if (err) throw err;
  
        const managers = employeeRes.rows.map((employee: { first_name: string; last_name: string; id: number; }) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        }));
  
        // Use -1 to indicate no manager
        managers.push({ name: 'None', value: -1 });
  
        inquirer.prompt([
          {
            type: 'input',
            name: 'first_name',
            message: 'Enter employee first name:',
          },
          {
            type: 'input',
            name: 'last_name',
            message: 'Enter employee last name:',
          },
          {
            type: 'list',
            name: 'role_id',
            message: 'Select the role for this employee:',
            choices: roles
          },
          {
            type: 'list',
            name: 'manager_id',
            message: 'Select the employee’s manager:',
            choices: managers
          }
        ]).then((answer: Answers) => {
          if (answer.manager_id !== -1) { // Check against -1
            const selectedManager = employeeRes.rows.find((emp: { id: number; is_manager: boolean; }) => emp.id === answer.manager_id);
            
            if (selectedManager && !selectedManager.is_manager) {
              console.log('The selected employee is not a manager. Please select a valid manager.');
              return startApp(); // Restart the app if the selected employee is not a manager
            }
          }
  
          db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager) VALUES ($1, $2, $3, $4, $5)', 
                   [answer.first_name, answer.last_name, answer.role_id, answer.manager_id === -1 ? null : answer.manager_id, false], 
                   (err) => {
            if (err) throw err;
            console.log(`Added employee: ${answer.first_name} ${answer.last_name}`);
            startApp();
          });
        });
      });
    });
  }
  

function updateEmployeeRole(): void {
  db.query('SELECT * FROM employee', (err, employeeRes) => {
    if (err) throw err;

    const employees = employeeRes.rows.map((employee: { first_name: string; last_name: string; id: number; }) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));

    db.query('SELECT * FROM role', (err, roleRes) => {
      if (err) throw err;

      const roles = roleRes.rows.map((role: { title: string; id: number; }) => ({
        name: role.title,
        value: role.id
      }));

      inquirer.prompt([
        {
          type: 'list',
          name: 'employee_id',
          message: 'Select the employee whose role you want to update:',
          choices: employees
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Select the new role for this employee:',
          choices: roles
        }
      ]).then((answer: Answers) => {
        db.query('UPDATE employee SET role_id = $1 WHERE id = $2', 
                 [answer.role_id, answer.employee_id], 
                 (err) => {
          if (err) throw err;
          console.log(`Updated employee's role to: ${answer.role_id}`);
        });

        db.query('UPDATE managers SET role_id = $1 WHERE id = $2', 
                 [answer.role_id, answer.employee_id], 
                 (err) => {
          if (err) throw err;
          console.log(`Updated manager's role to: ${answer.role_id}`);
          startApp();
        });
      });
    });
  });
}

function renderManagerTable(): void {
  // Query to get employees who are managers
  db.query('SELECT * FROM employee WHERE is_manager = TRUE', (err, employeeRes) => {
    if (err) throw err;

    // Check if any managers were found
    if (employeeRes.rows.length === 0) {
      console.log("No managers found.");
      return startApp(); // Use return to exit the function
    }

    db.query('SELECT * FROM managers', (err, managersRes) => {
      if (err) throw err;

      const currentManagers = managersRes.rows.map((manager: { id: number; }) => manager.id); // Get an array of current manager IDs

      // Prepare to insert managers into the 'managers' table
      employeeRes.rows.forEach((manager: { id: number; first_name: string; last_name: string; role_id: number; manager_id: number; is_manager: boolean; }) => {
        // Check if the manager is already in the managers table
        if (!currentManagers.includes(manager.id)) {
          db.query(
            'INSERT INTO managers (first_name, last_name, role_id, manager_id, is_manager) VALUES ($1, $2, $3, $4, $5)',
            [manager.first_name, manager.last_name, manager.role_id, manager.manager_id, manager.is_manager],
            (err) => {
              if (err) {
                console.error(`Error inserting manager ${manager.first_name} ${manager.last_name}:`, err);
              } else {
                console.log(`Manager ${manager.first_name} ${manager.last_name} added to managers table.`);
              }
            }
          );
        } else {
          console.log(`Manager ${manager.first_name} ${manager.last_name} already exists in the managers table.`);
        }
      });
    });
  });

  startApp();
}

function promoteToManager(): void {
  db.query('SELECT * FROM employee', (err, employeeRes) => {
    if (err) throw err;

    const employeesToBePromoted = employeeRes.rows.filter((employee: { is_manager: boolean; first_name: string; last_name: string; }) => employee.is_manager === false).map((employee: { first_name: string; last_name: string; id: number; }) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee
    }));

    console.log(employeesToBePromoted);

    inquirer.prompt({
      type: 'list',
      name: 'selectedPromotion',
      message: 'Who would you like to promote?',
      choices: employeesToBePromoted
    }).then((res: Answers) => {
      const selectedId = res.selectedPromotion.id;

      console.log(selectedId);

      db.query('UPDATE employee SET is_manager = TRUE WHERE id = $1', [selectedId], (err) => {
        if (err) throw err;
        startApp();
      });
    });
  });
}

function demoteManager(): void {
  // Step 1: Get the list of managers
  db.query('SELECT * FROM managers', (err, managerRes) => {
    if (err) throw err;

    const managersList = managerRes.rows.map((manager: { first_name: string; last_name: string; id: number; }) => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id // Use manager ID as the value for easy reference
    }));

    // Step 2: Prompt to select a manager to demote
    inquirer.prompt({
      type: 'list',
      name: 'selectDemotion',
      message: 'Select a manager to demote',
      choices: managersList
    }).then((res: Answers) => {
      const selectedId = res.selectDemotion; // Get the selected manager ID

      // Step 3: Update the employee's is_manager status to false
      db.query('UPDATE employee SET is_manager = false WHERE id = $1', [selectedId], (err) => {
        if (err) throw err;
        console.log(`Manager with ID ${selectedId} has been demoted.`);

        // Step 4: Remove the manager from the managers table
        db.query('DELETE FROM managers WHERE id = $1', [selectedId], (err) => {
          if (err) throw err;
          console.log(`Removed manager with ID ${selectedId} from the managers table.`);
          startApp(); // Restart the app after completion
        });
      });
    });
  });
}

renderManagerTable();
