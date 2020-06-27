import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-motion-detail',
  templateUrl: './motion-detail.component.html',
  styleUrls: ['./motion-detail.component.scss']
})
export class MotionDetailComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => console.log('params', params));
  }
}
