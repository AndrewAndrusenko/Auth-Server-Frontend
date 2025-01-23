import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmBsComponent } from './confirm-bs.component';

describe('ConfirmBsComponent', () => {
  let component: ConfirmBsComponent;
  let fixture: ComponentFixture<ConfirmBsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmBsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmBsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
