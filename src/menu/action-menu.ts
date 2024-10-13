import inquirer from 'inquirer'; 
import startApp from '../app/startApp.js';
import {addDepartment, addEmployee, addRole} from './actions/add.js';
import {deleteDepartment, deleteEmployee, deleteRole} from './actions/delete.js';
import {updateEmployeeManagers, updateEmployeeRole, updateManagers} from './actions/update.js';

function selectAdd(){
    inquirer
    .prompt(
        {
            type: 'list',
            name: 'add',
            message: 'What would you like to add?',
            choices: [
                'Add department',
                'Add role',
                'Add employee',
                'Exit'
            ]
        }
    )
    .then(res => {
        switch(res.add){
            case 'Add department':
                addDepartment();
                break;
            case 'Add role':
                addRole();
                break;
            case 'Add employee':
                addEmployee();
                break;
            default:
                return startApp();
        }
    })
}

function selectDelete(){
    inquirer
    .prompt(
        {
            type: 'list',
            name: 'delete',
            message: 'What would you like to Delete?',
            choices: [
                'Delete department',
                'Delete role',
                'Delete employee',
                'Exit'
            ]
        }
    )
    .then(res => {
        switch(res.delete){
            case 'Delete department':
                deleteDepartment();
                break;
            case 'Delete role':
                deleteRole();
                break;
            case 'Delete employee':
                deleteEmployee();
                break;
            default:
                return startApp();
        }
    })
}

function updateEmployees(){
    inquirer
    .prompt(
        {
            type: 'list',
            name: 'update',
            message: 'What would you like to Delete?',
            choices: [
                'Update employee managers',
                'Update employee role',
                'Update manager',
                'Exit'
            ]
        }
    )
    .then(res => {
        switch(res.update){
            case 'Update employee managers':
                updateEmployeeManagers();
                break;
            case 'Update employee role':
                updateEmployeeRole();
                break;
            case 'Update manager':
                updateManagers();
                break;
            default:
                return startApp();
        }
    })
}
   
export {selectAdd, selectDelete, updateEmployees};