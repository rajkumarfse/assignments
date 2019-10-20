import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css']
})
export class EmployeeAddComponent implements OnInit {

  employeeAddForm: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder, private empService: EmployeeService) { }

  ngOnInit() {
    this.employeeAddForm = this.formBuilder.group({
      'name': [null, Validators.required],
      'age': [null, Validators.required],
      'email': [null, Validators.required]
    });
  }

  onFormSubmit(form: NgForm) {
    this.empService.addEmployee(form)
      .subscribe(employee => this.router.navigate(['/employees']));
  }

}
