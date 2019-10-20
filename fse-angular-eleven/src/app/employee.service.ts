import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { Employee } from './employee';
import { EMPLOYEES } from './employees-mock';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor() { }

  getEmployees(): Observable<Employee[]> {
    return of(EMPLOYEES);
  }

  getEmployeeById(empId): Observable<Employee> {
    let found = EMPLOYEES.filter(employee => employee.id == empId);
    return of(found.pop());
  }

  addEmployee(employee): Observable<Employee> {
    let lastId = Math.max.apply(Math, EMPLOYEES.map(function(o) { return o.id; }));
    lastId = lastId > 0 ? lastId : 0;
    EMPLOYEES.push({
      id: ++lastId,
      name: employee.name, 
      age: employee.age, 
      email: employee.email
    });    
    return of(employee);
  }

  editEmployee(employee): Observable<Employee> {    
    for(var i = 0; i < EMPLOYEES.length; i++) {
      if(EMPLOYEES[i].id == employee.id) {
        EMPLOYEES[i] = {
          id: EMPLOYEES[i].id,
          name: employee.name,
          age: employee.age,
          email: employee.email
        };
        console.log(EMPLOYEES[i]);
        break;
      }
    }    
    return of(employee);
  }

  deleteEmployee(empId): Observable<Boolean> {
    for(var i = 0; i < EMPLOYEES.length; i++) {
        if(EMPLOYEES[i].id == empId) {
          EMPLOYEES.splice(i, 1);
          break;
        }
    }
    console.log(EMPLOYEES);
    return of(true);
  }

}