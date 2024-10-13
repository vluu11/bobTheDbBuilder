import db from './db.js';
function viewDepartments(startApp) {
    db.query('SELECT * FROM department', (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        startApp();
    });
}
function viewRoles(startApp) {
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
function viewEmployees(startApp) {
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
function viewManagers(startApp) {
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
export { viewDepartments, viewRoles, viewEmployees, viewManagers };
