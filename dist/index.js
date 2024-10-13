import inquirer from 'inquirer';
import db from './db.js';
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
function addDepartment() {
    inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter department name:'
    }).then((answer) => {
        db.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err) => {
            if (err)
                throw err;
            console.log(`Added department: ${answer.name}`);
            startApp();
        });
    });
}
function addRole() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err)
            throw err;
        const departments = res.rows.map((department) => ({
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
            db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answer.title, answer.salary, answer.department_id], (err) => {
                if (err)
                    throw err;
                console.log(`Added role: ${answer.title}`);
                startApp();
            });
        });
    });
}
function addEmployee() {
    db.query('SELECT * FROM role', (err, roleRes) => {
        if (err)
            throw err;
        if (roleRes.rows.length === 0) {
            console.log("No roles available. Please add a role first.");
            return startApp();
        }
        const roles = roleRes.rows.map((role) => ({
            name: role.title,
            value: role.id
        }));
        db.query('SELECT * FROM employee', (err, employeeRes) => {
            if (err)
                throw err;
            const managers = employeeRes.rows.map((employee) => ({
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
                    const selectedManager = employeeRes.rows.find((emp) => emp.id === answer.manager_id);
                    if (selectedManager && !selectedManager.is_manager) {
                        console.log('The selected employee is not a manager. Please select a valid manager.');
                        return startApp();
                    }
                }
                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager) VALUES ($1, $2, $3, $4, $5)', [answer.first_name, answer.last_name, answer.role_id, answer.manager_id === -1 ? null : answer.manager_id, false], (err) => {
                    if (err)
                        throw err;
                    console.log(`Added employee: ${answer.first_name} ${answer.last_name}`);
                    startApp();
                });
            });
        });
    });
}
function updateEmployeeRole() {
    db.query('SELECT * FROM employee', (err, employeeRes) => {
        if (err)
            throw err;
        const employees = employeeRes.rows.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));
        db.query('SELECT * FROM role', (err, roleRes) => {
            if (err)
                throw err;
            const roles = roleRes.rows.map((role) => ({
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
                db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answer.role_id, answer.employee_id], (err) => {
                    if (err)
                        throw err;
                    console.log('Updated employee role.');
                    startApp();
                });
            });
        });
    });
}
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
function renderManagerTable() {
    db.query('SELECT * FROM employee WHERE is_manager = TRUE', (err, employeeRes) => {
        if (err)
            throw err;
        if (employeeRes.rows.length === 0) {
            console.log("No managers found.");
            return startApp();
        }
        db.query('SELECT * FROM managers', (err, managersRes) => {
            if (err)
                throw err;
            const currentManagers = managersRes.rows.map(manager => manager.last_name);
            employeeRes.rows.forEach(manager => {
                if (!currentManagers.includes(manager.last_name)) {
                    db.query('INSERT INTO managers (first_name, last_name, role_id, manager_id, is_manager) VALUES ($1, $2, $3, $4, $5)', [manager.first_name, manager.last_name, manager.role_id, manager.manager_id || null, manager.is_manager], (err, res) => {
                        if (err) {
                            console.error(`Error inserting manager ${manager.first_name} ${manager.last_name}:`, err);
                        }
                        else {
                            console.log(`Manager ${manager.first_name} ${manager.last_name} added to managers table.`);
                        }
                    });
                }
                else {
                    console.log(`Manager ${manager.first_name} ${manager.last_name} already exists in the managers table.`);
                }
            });
        });
    });
}
function updateManagers() {
    inquirer
        .prompt({
        type: 'list',
        name: 'update',
        message: 'Would you like to promote or demote an employee?',
        choices: [
            'Promote an employee',
            'Demote a manager'
        ]
    }).then(res => {
        switch (res.update) {
            case 'Promote an employee':
                promoteToManager();
                break;
            case 'Demote a manager':
                demoteManager();
                break;
        }
    });
}
function updateEmployeeManagers() {
    db.query('SELECT * FROM employee', (err, employeesRes) => {
        if (err)
            throw err;
        const employees = employeesRes.rows.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));
        db.query('SELECT * FROM employee WHERE is_manager = TRUE', (err, employeesRes) => {
            if (err)
                throw err;
            const managers = employeesRes.rows.map(manager => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id
            }));
            if (managers.length === 0) {
                console.log("There are no available managers");
                return startApp();
            }
            managers.push({ name: 'None', value: null });
            inquirer
                .prompt([
                {
                    type: 'list',
                    name: 'updateEmpManager',
                    message: ' Select an employee.',
                    choices: employees
                },
                {
                    type: 'list',
                    name: 'selectManager',
                    message: 'Select a manager to change to.',
                    choices: managers
                }
            ])
                .then(res => {
                console.log(res);
                if (res.updateEmpManager !== res.selectManager) {
                    db.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [res.selectManager, res.updateEmpManager], (err) => {
                        if (err)
                            throw err;
                        startApp();
                    });
                }
                else {
                    console.log('You cannot select yourself. Select another option.');
                    startApp();
                }
            });
        });
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
function deleteDepartment() {
    db.query('SELECT * FROM department', (err, departmentRes) => {
        if (err)
            throw err;
        const departments = departmentRes.rows.map(department => ({
            name: department.name,
            value: department.id
        }));
        inquirer
            .prompt([{
                type: 'list',
                name: 'selectedDepartment',
                message: 'Select a department to delete',
                choices: departments
            },
            {
                type: 'confirm',
                name: 'confirmation',
                message: 'Are you sure? Deleting a department will, delete all roles associated with this department.'
            }
        ])
            .then(res => {
            if (res.confirmation) {
                db.query('SELECT * FROM employee WHERE role_id = $1', [res.selectedDepartment], (err, employeeRes) => {
                    if (err)
                        throw err;
                    if (employeeRes.rows.length > 0) {
                        console.log('Cannot delete.There are currently employees that occupy a role in this department.');
                        startApp();
                    }
                    else {
                        db.query('DELETE FROM role WHERE department_id = $1', [res.selectedDepartment], (err) => {
                            if (err)
                                throw err;
                            db.query('DELETE FROM department WHERE id = $1', [res.selectedDepartment], (err) => {
                                if (err)
                                    throw err;
                                console.log('Department was successfully deleted');
                                startApp();
                            });
                        });
                    }
                });
            }
            else {
                startApp();
            }
        });
    });
}
function deleteRole() {
    db.query('SELECT * FROM role', (err, roleRes) => {
        if (err)
            throw err;
        const roles = roleRes.rows.map(role => ({
            name: role.title,
            value: role.id
        }));
        inquirer
            .prompt({
            type: 'list',
            name: 'selectedRole',
            message: 'Select a role to delete',
            choices: roles
        })
            .then(res => {
            db.query('SELECT * FROM employee WHERE role_id = $1', [res.selectedRole], (err, employeeRes) => {
                if (err)
                    throw err;
                if (employeeRes.rows.length > 0) {
                    console.log('Cannot delete.There are currently employees that occupy this role.');
                    startApp();
                }
                else {
                    db.query('DELETE FROM role WHERE id = $1', [res.selectedRole], (err) => {
                        if (err)
                            throw err;
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
        if (err)
            throw err;
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
                if (err)
                    throw err;
                if (managerRes.rows.length > 0) {
                    db.query('UPDATE employee SET manager_id = NULL WHERE manager_id = $1', [selectedEmployee.id], (err) => {
                        if (err)
                            throw err;
                        console.log('Employees under this manager will have their manager_id set to NULL.');
                    });
                }
                db.query('DELETE FROM managers WHERE first_name = $1 AND last_name = $2', [selectedEmployee.first_name, selectedEmployee.last_name], (err) => {
                    if (err)
                        throw err;
                    db.query('DELETE FROM employee WHERE id = $1', [selectedEmployee.id], (err) => {
                        if (err)
                            throw err;
                        console.log('Employee successfully deleted.');
                        startApp();
                    });
                });
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
startApp();
