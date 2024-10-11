CREATE TABLE department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
  id SERIAL PRIMARY KEY,
  title VARCHAR(30) UNIQUE NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INTEGER NOT NULL REFERENCES department(id)
);

CREATE TABLE employee (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES role(id),
  manager_id INTEGER REFERENCES employee(id),
  is_manager BOOLEAN 
);

CREATE TABLE managers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INTEGER NOT NULL REFERENCES role(id),
    manager_id INTEGER NOT NULL REFERENCES employee(manager_id),
    is_manager BOOLEAN
)

INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager)
VALUES 
('John', 'Doe', 1, NULL, FALSE), -- John Doe, not a manager
('Jane', 'Smith', 2, NULL, TRUE), -- Jane Smith, manager of John Doe
('Emily', 'Johnson', 3, 2, FALSE); -- Emily Johnson, reports to Jane Smith