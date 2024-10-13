import inquirer from 'inquirer'; 
import db from '../../connection/connection.js'; 
import startApp from '../../app/startApp.js';
import {promoteToManager, demoteManager} from './assign.js';

function updateEmployeeRole(): void {
    db.query('SELECT * FROM employee', (err: Error | null, employeeRes: any) => {
      if (err) throw err;
  
      const employees = employeeRes.rows.map((employee: { first_name: string; last_name: string; id: number; }) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      }));
  
      db.query('SELECT * FROM role', (err: Error | null, roleRes: any) => {
        if (err) throw err;
  
        const roles = roleRes.rows.map((role: { title: string; id: number; }) => ({
          name: role.title,
          value: role.id
        }));
  
        inquirer.prompt([
          {
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee to update their role:',
            choices: employees
          },
          {
            type: 'list',
            name: 'role_id',
            message: 'Select the new role:',
            choices: roles
          }
        ]).then((answer) => {
          db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answer.role_id, answer.employee_id], (err: Error | null) => {
            if (err) throw err;
            console.log('Updated employee role.');
            startApp();
          });
  
        });
  
      });
  
    });
  
  }

  function updateManagers(){
    inquirer
      .prompt(
        {
          type: 'list',
          name: 'update',
          message: 'Would you like to promote or demote an employee?',
          choices: [
            'Promote an employee',
            'Demote a manager',
            'Exit'
          ]
        }
      ).then(res =>{
        switch(res.update){
          case 'Promote an employee':
            promoteToManager();
            break;
          case 'Demote a manager':
            demoteManager();
            break;
          default:
            return startApp();
        }
      });
  }
  
  function updateEmployeeManagers(){
    db.query('SELECT * FROM employee', (err, employeesRes) => {
      if(err) throw err;
  
      const employees = employeesRes.rows.map(employee => ({
        name: `${employee.first_name } ${ employee.last_name}`,
        value: employee.id
      }));
  
      db.query('SELECT * FROM employee WHERE is_manager = TRUE', (err, employeesRes) => {
        if(err) throw err;
    
          const managers = employeesRes.rows.map(manager => ({
            name: `${manager.first_name } ${ manager.last_name}`,
            value: manager.id
          }));
  
          if(managers.length === 0){
            console.log("There are no available managers");
            return startApp();
          }
  
          managers.push({name:'None', value: null});
  
          inquirer
            .prompt([ 
              {
                type: 'list',
                name: 'updateEmpManager',
                message:' Select an employee.',
                choices: employees
              },
              {
                type:'list',
                name:'selectManager',
                message:'Select a manager to change to.',
                choices: managers
              }
            ])
            .then(res => {
              console.log(res);
  
              if(res.updateEmpManager !== res.selectManager){
                db.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [res.selectManager, res.updateEmpManager], (err) =>{
                  if(err) throw err;
    
                  startApp();
                });
              }else{
                console.log('You cannot select yourself. Select another option.');
                startApp();
              }
  
              
            });
        }
      );
  
    });
  }

  export {updateEmployeeManagers, updateEmployeeRole, updateManagers};