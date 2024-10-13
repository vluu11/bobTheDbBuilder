import inquirer from 'inquirer'; 
import db from '../../connection/connection.js'; 
import startApp from '../../app/startApp.js';

function addDepartment(): void {
    inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'Enter department name:'
    }).then((answer) => {
      db.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err: Error | null) => {
        if (err) throw err;
        console.log(`Added department: ${answer.name}`);
        startApp();
      });
  
    });
  
  }
  
  function addRole(): void {
    db.query('SELECT * FROM department', (err: Error | null, res: any) => {
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
      ]).then((answer) => {
        db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answer.title, answer.salary, answer.department_id], (err: Error | null) => {
          if (err) throw err;
          console.log(`Added role: ${answer.title}`);
          startApp();
  
        });
  
      });
  
    });
  
  }
  
  function addEmployee(): void {
    db.query('SELECT * FROM role', (err: Error | null, roleRes: any) => {
      if (err) throw err;
  
      if (roleRes.rows.length === 0) {
        console.log("No roles available. Please add a role first.");
        return startApp(); 
      }
  
      const roles = roleRes.rows.map((role: { title: string; id: number; }) => ({
        name: role.title,
        value: role.id
      }));
  
      db.query('SELECT * FROM employee', (err: Error | null, employeeRes: any) => {
        if (err) throw err;
  
        const managers = employeeRes.rows.map((employee: { first_name: string; last_name: string; id: number; }) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }));
  
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
        ]).then((answer) => {
          if (answer.manager_id !== -1) {
            const selectedManager = employeeRes.rows.find((emp: { id: number; is_manager: boolean; }) => emp.id === answer.manager_id);
            
            if (selectedManager && !selectedManager.is_manager) {
              console.log('The selected employee is not a manager. Please select a valid manager.');
              return startApp();
            }
          }
  
          db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager) VALUES ($1, $2, $3, $4, $5)', 
                   [answer.first_name, answer.last_name, answer.role_id, answer.manager_id === -1 ? null : answer.manager_id, false], 
                   (err: Error | null) => {
            if (err) throw err;
            console.log(`Added employee: ${answer.first_name} ${answer.last_name}`);
            startApp();
  
          });
  
        });
  
      });
  
    });
  
  }

  export {addDepartment, addEmployee, addRole};