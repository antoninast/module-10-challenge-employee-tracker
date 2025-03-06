-- Active: 1740443878277@@127.0.0.1@5432@employee_tracker2
INSERT INTO department (name)
VALUES
('Accounting'),
('Information Security'),
('Client Services');

INSERT INTO role (title, salary, department_id)
VALUES
('Accountant Manager', 160000, 1),
('Information Security Manager', 170000, 2),
('Customer Support Manager', 165000, 3),
('Junior Accountant', 60000, 1),
('Information Security Level 1', 70000, 2),
('Customer Support Level 1', 65000, 3);

INSERT INTO employee (first_name, last_name, role_id)
VALUES
('Anne', 'Sirena', 1),
('John', 'Lage', 2),
('Kenneth', 'Jackson', 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Daniella', 'Zeyn', 1, 1),
('George', 'Mach', 2, 2),
('Alina', 'Wednesday', 3, 3);
