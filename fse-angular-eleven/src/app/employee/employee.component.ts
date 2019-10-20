import { Component, OnInit } from '@angular/core';

import { Employee } from '../employee';
import { EMPLOYEES } from '../employees-mock';

import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  
  employees: Employee[];
  selectedEmployee: Employee;

  constructor(private empService: EmployeeService) { }

  onEditClicked(employee: Employee) {
  }

  ngOnInit(): void {
    this.empService.getEmployees()
      .subscribe(employees => this.employees = employees);    
  }
}
