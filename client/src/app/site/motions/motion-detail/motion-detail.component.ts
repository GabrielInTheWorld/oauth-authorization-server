import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from 'src/app/core/models/base.component';
import { MotionService } from '../motion.service';
import { Motion } from '../model/motion';

@Component({
  selector: 'app-motion-detail',
  templateUrl: './motion-detail.component.html',
  styleUrls: ['./motion-detail.component.scss']
})
export class MotionDetailComponent extends BaseComponent implements OnInit {
  public motionForm: FormGroup;

  public await = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private motionService: MotionService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      console.log('params', params);
      let title = '';
      let description = '';
      if (params.id) {
        const motion = await this.motionService.get(params.id);
        console.log('motion', motion);
        title = motion.title;
        description = motion.description;
      }
      this.initForm(title, description);
      this.await = false;
    });
  }

  public confirm(): void {
    console.log('motionForm', this.motionForm.value);
    const title = this.motionForm.value.motionTitle;
    const description = this.motionForm.value.motionDescription;
    this.motionService.create(title, description).then(() => this.router.navigateByUrl('motions'));
  }

  public cancel(): void {
    this.router.navigateByUrl('motions');
  }

  private initForm(title: string = '', description: string = ''): void {
    this.motionForm = this.fb.group({
      motionTitle: [title, Validators.required],
      motionDescription: description
    });
  }
}
