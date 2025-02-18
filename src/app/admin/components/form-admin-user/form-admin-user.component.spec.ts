import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAdminUserComponent } from './form-admin-user.component';

describe('FormAdminUserComponent', () => {
  let component: FormAdminUserComponent;
  let fixture: ComponentFixture<FormAdminUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAdminUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAdminUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
