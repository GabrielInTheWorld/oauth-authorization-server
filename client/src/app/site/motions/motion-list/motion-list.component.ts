import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MotionService } from '../motion.service';
import { Motion } from '../model/motion';

@Component({
  selector: 'app-motion-list',
  templateUrl: './motion-list.component.html',
  styleUrls: ['./motion-list.component.scss']
})
export class MotionListComponent implements OnInit {
  public motions: Motion[];

  constructor(private router: Router, private route: ActivatedRoute, private motionService: MotionService) {}

  ngOnInit(): void {
    this.getAllMotions();
  }

  public createMotion(): void {
    this.router.navigate(['./new'], { relativeTo: this.route });
  }

  public goToMotion(id: string): void {
    this.router.navigate(['./', id], { relativeTo: this.route });
  }

  private async getAllMotions(): Promise<void> {
    this.motions = await this.motionService.getAll();
    console.log('motions', this.motions);
  }
}
