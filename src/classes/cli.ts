import inquirer from 'inquirer';
import { QueryResult } from "pg";
import { pool } from "../connection.js";

class Cli {
  private getAllEmployees(): any {
    const employees: any = [];
    const employeesData: any = [];

    pool.query(
      "SELECT * FROM employee",
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          result.rows.forEach((el) => {
            employees.push(`${el.first_name} ${el.last_name}`);
            employeesData.push({ id: el.id, name: `${el.first_name} ${el.last_name}` });
          });
        }
      }
    );

    return { employees, employeesData };
  }

  private getAllRoles() {
    const roles: string[] = [];
    const rolesData: { id: number, title: string }[] = [];

    pool.query(
      "SELECT * FROM role",
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          result.rows.forEach((el) => {
            roles.push(el.title);
            rolesData.push({ id: el.id, title: el.title });
          });
        }
      }
    );

    return { roles, rolesData };
  }

  private getAllDepartments() {
    const departments: string[] = [];
    const departmentsData: { id: number, name: string }[] = [];

    pool.query(
      "SELECT * FROM department",
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          result.rows.forEach((el) => {
            departments.push(el.name);
            departmentsData.push({ id: el.id, name: el.name })
          });
        }
      }
    );

    return { departments, departmentsData };
  }

  startCli() {
    inquirer
      .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Update an employee manager',
          'View employees by manager',
          'Delete department',
          'Delete role',
          'Delete employee',
          'View combined salaries by department'
        ],
      },
    ])
    .then((res) => {
      switch (res.action) {
        case 'View all departments':
          this.viewAllDepartments();
          break;
        case 'View all roles':
          this.viewAllRoles();
          break;
        case 'View all employees':
          this.viewAllEmployees();
          break;
        case 'Add a department':
          this.addDepartment();
          break;
        case 'Add a role':
          this.addRole();
          break;
        case 'Add an employee':
          this.addEmployee();
          break;
        case 'Update an employee role':
          this.updateEmployeeRole();
          break;
        case 'Update an employee manager':
          this.updateEmployeeManager();
          break;
        case 'View employees by manager':
          this.viewEmployeesByManager();
          break;
        case 'Delete department':
          this.deleteDepartment();
          break;
        case 'Delete role':
          this.deleteRole();
          break;
        case 'Delete employee':
          this.deleteEmployee();
          break;
        case 'View combined salaries by department':
          this.viewCombinedSalariesByDepartment();
          break;
        default:
          process.exit(0);
      }
    });
  }

  viewAllDepartments() {
    pool.query(
      "SELECT * FROM department",
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          console.log('');
          console.table(result.rows);
        }
      }
    );
    this.startCli();
  }

  viewAllRoles() {
    pool.query(
      `SELECT role.id,
      role.title,
      department.name as department,
      role.salary
      FROM role
      JOIN department ON role.department_id = department.id`,
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          console.log('');
          console.table(result.rows);
        }
      }
    );
    this.startCli();
  }

  viewAllEmployees() {
    pool.query(
      `SELECT 
      employee.id AS id,
      employee.first_name,
      employee.last_name,
      role.title AS title,
      department.name AS department,
      role.salary AS salary,
      m.first_name || ' ' || m.last_name AS manager
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
      JOIN employee m ON employee.manager_id = m.id;`,
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          console.log('');
          console.table(result.rows);
        }
      }
    );
    this.startCli();
  }

  addDepartment() {
    inquirer
      .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the new department?',
      }
    ])
    .then((res) => {
      if (res.name) {
        pool.query(`INSERT INTO department (name) VALUES ('${res.name}')`,
          (err: Error, result: QueryResult) => {
            if (err) {
              console.log(err);
            } else if (result) {
              console.log('');
              console.log(`Department "${res.name}" was added successfully`);
            }
          }
        );
      } else {
        console.log('Department name cannot be blank');
      }
      this.startCli();
    });
  }

  addRole() {
    const departments = this.getAllDepartments().departments;
    const departmentsData = this.getAllDepartments().departmentsData;
    
    setTimeout(() => {
      inquirer
        .prompt([
        {
          type: 'input',
          name: 'title',
          message: 'What is the title for the new role?',
        },
        {
          type: 'number',
          name: 'salary',
          message: 'What is the salary for the new role?',
        },
        {
          type: 'list',
          name: 'department',
          message: 'In which department is the new role?',
          choices: departments
        }
      ])
      .then((res) => {
        if (res.title && res.salary && res.department) {
          const selectedDepartment = departmentsData.filter((el) => el.name === res.department);
          pool.query(`
            INSERT INTO role (title, salary, department_id)
            VALUES ('${res.title}', ${res.salary}, ${selectedDepartment[0].id})`,
            (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log('');
                console.log(`Role "${res.title}" was added successfully`);
              }
            }
          );
        } else {
          console.log('Title, salary and department id cannot be blank');
        }
        this.startCli();
      });
    }, 1000);
  }

  addEmployee() {
    const roles = this.getAllRoles().roles;
    const rolesData = this.getAllRoles().rolesData;
    const managers = this.getAllEmployees().employees;
    managers.push('None');
    const managersData = this.getAllEmployees().employeesData;

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'firstName',
          message: 'What is the first name of the new employee?',
        },
        {
          type: 'input',
          name: 'lastName',
          message: 'What is the last name of the new employee?',
        },
        {
          type: 'list',
          name: 'role',
          message: 'What is the role of the new employee?',
          choices: roles,
        },
        {
          type: 'list',
          name: 'manager',
          message: "What is the id of the new emoployee's manager",
          choices: managers,
        }
      ])
      .then((res) => {
        if (res.firstName && res.lastName && res.role) {
          const selectedRole: { id: number, title: string }[] = rolesData.filter((el) => el.title === res.role);
          const selectedManager: { id: number, name: string }[] = managersData.filter((el: { name: any; }) => el.name === res.manager);

          let query = '';
          if (selectedManager[0]) {
            query = `
            INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ('${res.firstName}', '${res.lastName}', '${selectedRole[0].id}' , '${selectedManager[0].id}')`;
          } else {
            query = `
            INSERT INTO employee (first_name, last_name, role_id)
            VALUES ('${res.firstName}', '${res.lastName}', '${selectedRole[0].id}')`;
          }
          pool.query(query,
            (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log('');
                console.log(`Employee ${res.firstName} ${res.lastName} was added successfully`);
              }
            }
          );
        } else {
          console.log('First name, last name and role cannot be blank');
        }
        this.startCli();
      });
  }

  updateEmployeeRole() {
    const employees = this.getAllEmployees().employees;
    const employeesData = this.getAllEmployees().employeesData;
    const roles = this.getAllRoles().roles;
    const rolesData = this.getAllRoles().rolesData;

    setTimeout(() => {
      inquirer
        .prompt([
        {
          type: 'list',
          name: 'employee',
          message: "Which employee's role do you want to update?",
          choices: employees,
        },
        {
          type: 'list',
          name: 'newRole',
          message: 'What is the new role of the employee?',
          choices: roles,
        }
      ])
      .then((res) => {
        if (res.employee) {
          const selectedEmployee = employeesData.filter((el: { name: any; }) => el.name === res.employee);
          const selectedRole = rolesData.filter((el) => el.title === res.newRole);
          pool.query(`
              UPDATE employee
              SET role_id = ${selectedRole[0].id}
              WHERE id = ${selectedEmployee[0].id};`,
            (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log('');
                console.log(`New role of ${selectedEmployee[0].name} is ${selectedRole[0].title}`);
              }
            }
          );
        } else {
          console.log('Employee id and role id cannot be blank');
        }
        this.startCli();
      });
    }, 1000);
  }

  updateEmployeeManager() {
    const employees = this.getAllEmployees().employees;
    const employeesData = this.getAllEmployees().employeesData;

    setTimeout(() => {
      inquirer
        .prompt([
        {
          type: 'list',
          name: 'employeeId',
          message: "Whose employee's manager you want to change?",
          choices: employees
        },
        {
          type: 'list',
          name: 'managerId',
          message: 'What is the name of the new manager?',
          choices: employees
        }
      ])
      .then((res) => {
        if (res.employeeId && res.managerId) {
          const selectedEmployee = employeesData.filter((el: { name: any; }) => el.name === res.employeeId);
          const selectedManager = employeesData.filter((el: { name: any; }) => el.name === res.managerId);

          pool.query(`
              UPDATE employee
              SET manager_id = '${selectedManager[0].id}'
              WHERE id = ${selectedEmployee[0].id};`,
            (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log('');
                console.log(`New manager of ${selectedEmployee[0].name} is ${selectedManager[0].name}`);
              }
            }
          );
        } else {
          console.log('Employee id and role id cannot be blank');
        }
        this.startCli();
      });
    }, 1000);
  }

  viewEmployeesByManager() {
    pool.query(
      `SELECT 
        m.first_name AS manager_first_name,
        m.last_name AS manager_last_name,
        STRING_AGG(e.first_name || ' ' || e.last_name, ', ') AS employees
        FROM employee e
        LEFT JOIN employee m ON e.manager_id = m.id
        GROUP BY m.id, m.first_name, m.last_name;`,
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          console.log('');
          console.table(result.rows);
        }
      }
    );
    this.startCli();
  }

  deleteDepartment() {
    const departments = this.getAllDepartments().departments;

    setTimeout(() => {
      inquirer
      .prompt([
        {
          type: 'list',
          name: 'department',
          message: 'Which department do you want to delete?',
          choices: departments
        }
      ])
      .then((res) => {
        if (res.department) {
          pool.query(`DELETE FROM department WHERE department.name='${res.department}';`,
            (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log('');
                console.log(`Department ${res.department} was deleted successfully`);
              }
            }
          );
        } else {
          console.log('Department id cannot be blank');
        }
        this.startCli();
      });
    }, 1000);
  }

  deleteRole() {
    const roles = this.getAllRoles().roles;
    setTimeout(() => {
      inquirer
      .prompt([
      {
        type: 'list',
        name: 'role',
        message: 'What role do you want to delete?',
        choices: roles
      }
      ])
      .then((res) => {
        if (res.role) {
          pool.query(`DELETE FROM role WHERE role.title='${res.role}';`,
            (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log('');
                console.table(result.rows);
              }
            }
          );
        } else {
          console.log('Role id cannot be blank');
        }
        this.startCli();
      });
    }, 1000);
  }

  deleteEmployee() {
    const employees = this.getAllEmployees().employees;
    const employeesData = this.getAllEmployees().employeesData;

    setTimeout(() => {
      inquirer
      .prompt([
      {
        type: 'list',
        name: 'employee',
        message: 'Which employee do you want to delete?',
        choices: employees
      }
      ])
      .then((res) => {
        if (res.employee) {
          const selectedEmployee = employeesData.filter((el: { name: any; }) => el.name === res.employee);
          console.log('- - - - - -', selectedEmployee);
          pool.query(`DELETE FROM employee WHERE employee.id=${selectedEmployee[0].id};`,
            (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log('');
                console.table(result.rows);
              }
            }
          );
        } else {
          console.log('Employee id cannot be blank');
        }
        this.startCli();
      });
    }, 1000);
  }

  viewCombinedSalariesByDepartment() {
    pool.query(
      `SELECT d.name AS department,
      SUM(r.salary) AS total_salary
      FROM department d
      JOIN role r ON d.id = r.department_id
      GROUP BY d.name;
      `,
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          console.log('');
          console.table(result.rows);
        }
      }
    );
    this.startCli();
  }
}

export default Cli;