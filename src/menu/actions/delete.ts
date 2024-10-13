import inquirer from 'inquirer'; 
import db from '../../connection/connection.js'; 
import startApp from '../../app/startApp.js';

function deleteDepartment(){
    db.query('SELECT * FROM department', (err, departmentRes) => {
      if(err) throw err;
  
      const departments= departmentRes.rows.map(department => ({
        name: department.name,
        value: department.id
      }));
  
      inquirer
        .prompt(
          [{
            type:'list',
            name:'selectedDepartment',
            message:'Select a department to delete',
            choices: departments
          },
          {
            type:'confirm',
            name:'confirmation',
            message:'Are you sure? Deleting a department will, delete all roles associated with this department.'
          }
        ]
        )
        .then(res => {
  
          if(res.confirmation){
            db.query('SELECT * FROM employee WHERE role_id = $1', [res.selectedDepartment], (err, employeeRes) => {
              if(err) throw err;
    
              if(employeeRes.rows.length > 0){
                console.log('Cannot delete.There are currently employees that occupy a role in this department.');
    
                startApp();
              }else{
                db.query('DELETE FROM role WHERE department_id = $1', [res.selectedDepartment], (err) => {
                  if(err) throw err;
        
                  db.query('DELETE FROM department WHERE id = $1', [res.selectedDepartment], (err) => {
                    if(err) throw err;
        
                    console.log('Department was successfully deleted');
                    startApp();
                  });
      
                });
              }
            });
  
          }else{
            startApp();
          }
  
        });
  
    });
  
  }
  
  function deleteRole(){
  
    db.query('SELECT * FROM role', (err, roleRes) => {
      if(err) throw err;
  
      const roles = roleRes.rows.map(role => ({
        name: role.title,
        value: role.id
      }))
  
      inquirer
        .prompt(
          {
            type: 'list',
            name: 'selectedRole',
            message: 'Select a role to delete',
            choices: roles
          }
        )
        .then(res => {
  
          db.query('SELECT * FROM employee WHERE role_id = $1', [res.selectedRole], (err, employeeRes) => {
            if(err) throw err;
  
            if(employeeRes.rows.length > 0){
              console.log('Cannot delete.There are currently employees that occupy this role.');
  
              startApp();
            }else{
              db.query('DELETE FROM role WHERE id = $1', [res.selectedRole], (err) => {
                if(err) throw err;
      
                console.log('Role was sucessfully delted.');
  
                startApp();
  
              });
            }
          });
  
        });
  
    });
  }
  
  function deleteEmployee() {
    db.query('SELECT * FROM employee', (err, employeeRes) => {
      if (err) throw err;
  
      const employees = employeeRes.rows.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee
      }));
  
      inquirer
        .prompt({
          type: 'list',
          name: 'selectedEmployee',
          message: 'Select an employee to delete',
          choices: employees
        })
        .then(res => {
          const selectedEmployee = res.selectedEmployee;
  
          db.query('SELECT * FROM employee WHERE manager_id = $1', [selectedEmployee.id], (err, managerRes) => {
            if (err) throw err;
  
            if (managerRes.rows.length > 0) {
  
              db.query('UPDATE employee SET manager_id = NULL WHERE manager_id = $1', [selectedEmployee.id], (err) => {
                if (err) throw err;
  
                console.log('Employees under this manager will have their manager_id set to NULL.');
              });
            }
  
     
            db.query('DELETE FROM managers WHERE first_name = $1 AND last_name = $2', [selectedEmployee.first_name, selectedEmployee.last_name], (err) => {
              if (err) throw err;
  
            
              db.query('DELETE FROM employee WHERE id = $1', [selectedEmployee.id], (err) => {
                if (err) throw err;
  
                console.log('Employee successfully deleted.');
                startApp();
              });
            });
          });
        });
    });
  }

  export{deleteDepartment, deleteEmployee, deleteRole};