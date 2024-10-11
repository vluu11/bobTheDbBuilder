INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager)
VALUES 
('John', 'Doe', 1, NULL, FALSE), -- John Doe, not a manager
('Jane', 'Smith', 2, NULL, TRUE), -- Jane Smith, manager of John Doe
('Emily', 'Johnson', 3, 2, FALSE); -- Emily Johnson, reports to Jane Smith