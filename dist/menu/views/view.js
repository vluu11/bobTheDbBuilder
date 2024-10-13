import inquirer from 'inquirer';
import db from '../../connection/connection.js';
import startApp from '../../app/startApp.js';
function viewDepartments() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        startApp();
    });
}
function viewRoles() {
    const query = `SELECT role.id, role.title, department.name AS department, role.salary
                   FROM role
                   LEFT JOIN department ON role.department_id = department.id`;
    db.query(query, (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        startApp();
    });
}
function viewEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.is_manager,
                          (SELECT CONCAT(manager.first_name, ' ', manager.last_name) FROM employee manager WHERE manager.id = employee.manager_id) AS manager
                   FROM employee
                   LEFT JOIN role ON employee.role_id = role.id
                   LEFT JOIN department ON role.department_id = department.id`;
    db.query(query, (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        startApp();
    });
}
function viewManagers() {
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
            return;
        }
        console.table(res.rows);
        startApp();
    });
}
function viewEmployeesByManager() {
    db.query('SELECT * FROM employee WHERE is_manager = TRUE', (err, employeesRes) => {
        if (err)
            throw err;
        const managers = employeesRes.rows.map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            id: manager.id
        }));
        if (managers.length === 0) {
            console.log('No managers found.');
            return startApp();
        }
        const managersList = managers.map(manager => ({
            name: manager.name,
            value: manager.id
        }));
        inquirer.prompt({
            type: 'list',
            name: 'selectedManager',
            message: 'Select a manager to view their employees:',
            choices: managersList
        })
            .then(answer => {
            const selectedManagerId = answer.selectedManager;
            db.query('SELECT * FROM employee WHERE manager_id = $1', [selectedManagerId], (err, res) => {
                if (err)
                    throw err;
                if (res.rows.length === 0) {
                    console.log('No employees found for the selected manager.');
                }
                else {
                    console.table(res.rows);
                }
                startApp();
            });
        });
    });
}
function viewEmployeesByDepartment() {
    db.query('SELECT * FROM department', (err, departmentRes) => {
        if (err)
            throw err;
        const departments = departmentRes.rows.map(department => ({
            name: department.name,
            value: department.id
        }));
        inquirer
            .prompt({
            type: 'list',
            name: 'selectedDepartment',
            message: "Select department to view employees.",
            choices: departments
        })
            .then(res => {
            db.query('SELECT * FROM employee WHERE role_id = $1', [res.selectedDepartment], (err, selectedDepartmentRes) => {
                if (err)
                    throw err;
                if (selectedDepartmentRes.rows.length === 0) {
                    console.log('No employees found for the selected manager.');
                }
                else {
                    console.log(res);
                    console.table(selectedDepartmentRes.rows);
                }
                startApp();
            });
        });
    });
}
function viewTotalBudget() {
    db.query('SELECT * FROM employee', (err, employeesRes) => {
        if (err)
            throw err;
        const roleIds = employeesRes.rows.map(employee => employee.role_id);
        const salaryPromises = roleIds.map(roleId => {
            return new Promise((resolve, reject) => {
                db.query('SELECT salary FROM role WHERE id = $1', [roleId], (err, budgetRes) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const salary = budgetRes.rows.length > 0 ? Number(budgetRes.rows[0].salary) : 0;
                        resolve(salary);
                    }
                });
            });
        });
        Promise.all(salaryPromises)
            .then((salaries) => {
            const totalBudget = salaries.reduce((total, salary) => total + salary, 0);
            console.log(`Total Budget: $${totalBudget}`);
            startApp();
        })
            .catch(err => {
            console.error('Error retrieving salaries:', err);
            startApp();
        });
    });
}
export { viewDepartments, viewEmployees, viewManagers, viewRoles, viewEmployeesByDepartment, viewEmployeesByManager, viewTotalBudget };
