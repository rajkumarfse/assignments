import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { EmployeeService } from '../employee.service';
import { Employee } from '../employee';

@Component({
  selector: 'app-employee-delete',
  templateUrl: './employee-delete.component.html',
  styleUrls: ['./employee-delete.component.css']
})
export class EmployeeDeleteComponent implements OnInit {

  _id: number;
  employee: Employee;

  constructor(private router: Router, private route: ActivatedRoute, private empService: EmployeeService) { }

  ngOnInit() {
    this.getEmployee(this.route.snapshot.params['id']);
  }

  getEmployee(id: string) {
    this.empService.getEmployeeById(id)
      .subscribe(employee => this.employee = employee);
  }

  onCancelClicked(): void {
    this.router.navigate(['/employees']);
  }

  onDeleteClicked() {
    console.log(this.employee);    
    this.empService.deleteEmployee(this.employee.id)
      .subscribe((isDeleted) => {
        this.router.navigate(['/employees'])
      });
  }

}
