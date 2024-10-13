import db from '../connection/connection.js';
import startApp from '../app/startApp.js';
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
export default renderManagerTable;
