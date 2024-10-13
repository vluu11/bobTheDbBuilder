import inquirer from 'inquirer';
import db from '../connection/connection.js';
import startApp from '../app/startApp.js';
import renderManagerTable from '../views/render.js';
function promoteToManager() {
    db.query('SELECT * FROM employee WHERE is_manager = false', (err, res) => {
        if (err)
            throw err;
        const employees = res.rows.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));
        if (employees.length === 0) {
            console.log('No employees available to promote.');
            return startApp();
        }
        inquirer.prompt({
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee to promote to manager:',
            choices: employees
        }).then((answer) => {
            db.query('UPDATE employee SET is_manager = true WHERE id = $1', [answer.employee_id], (err) => {
                if (err)
                    throw err;
                renderManagerTable();
                console.log('Employee promoted to manager.');
                startApp();
            });
        });
    });
}
function demoteManager() {
    db.query('SELECT * FROM employee WHERE is_manager = true', (err, res) => {
        if (err)
            throw err;
        const managers = res.rows.map((manager) => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id
        }));
        if (managers.length === 0) {
            console.log('No managers available to demote.');
            return startApp();
        }
        inquirer.prompt({
            type: 'list',
            name: 'employee_id',
            message: 'Select the manager to demote:',
            choices: managers
        }).then((answer) => {
            db.query('UPDATE employee SET is_manager = false WHERE id = $1', [answer.employee_id], (err) => {
                if (err)
                    throw err;
                db.query('SELECT * FROM managers', (err, managersRes) => {
                    if (err)
                        throw err;
                    const employee = res.rows[0];
                    const managerToDelete = managersRes.rows.find(manager => manager.first_name === employee.first_name && manager.last_name === employee.last_name);
                    if (managerToDelete) {
                        db.query('DELETE FROM managers WHERE first_name = $1 AND last_name = $2', [managerToDelete.first_name, managerToDelete.last_name], (err) => {
                            if (err)
                                throw err;
                            console.log('Manager demoted and removed from the managers table.');
                            startApp();
                        });
                        db.query('UPDATE employee SET manager_id = NULL WHERE manager_id = $1', [answer.employee_id]);
                    }
                    else {
                        console.log('No matching manager found to delete.');
                        startApp();
                    }
                });
            });
        });
    });
}
export { promoteToManager, demoteManager };
