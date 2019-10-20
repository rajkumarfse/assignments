import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee';

@Component({
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.css']
})
export class EmployeeEditComponent implements OnInit {

  employeeEditForm: FormGroup;
  _id: number;
  employee: Employee;

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder, private empService: EmployeeService) { }

  ngOnInit() {    
    this.employeeEditForm = this.formBuilder.group({
      'name': [null, Validators.required],
      'age': [null, Validators.required],
      'email': [null, Validators.required]
    });
    this.getEmployee(this.route.snapshot.params['id']);
  }

  getEmployee(id: string) {
    this.empService.getEmployeeById(id)
      .subscribe(employee => {
        this.employee = employee;
        this.employeeEditForm.setValue({
          name: this.employee.name,
          age: this.employee.age,
          email: this.employee.email,
        });
      });
  }

  onFormSubmit(form: Employee) {
    console.log('edit submit');
    console.log(form);
    this.employee.name = form.name;
    this.employee.age = form.age;
    this.employee.email = form.email;
    console.log(this.employee);

    this.empService.editEmployee(this.employee)
      .subscribe(employee => this.router.navigate(['/employees']));
  }

}
