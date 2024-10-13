INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager)
VALUES 
('John', 'Doe', 1, NULL, FALSE), 
('Jane', 'Smith', 2, NULL, TRUE), 
('Emily', 'Johnson', 3, 2, FALSE);

INSERT INTO role (title, salary)
VALUES 
('Engineering', 60000), 
('Sales Rep', 50000),
('Intern', 70000); 

INSERT INTO department (name)
VALUES
('Engineer'),
('Sales'),
('Legal');