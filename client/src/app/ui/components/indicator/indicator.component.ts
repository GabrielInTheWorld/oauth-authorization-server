import { Component, OnInit, Input } from '@angular/core';

export type IndicatorColor = 'white' | 'red' | 'green';

@Component({
  selector: 'app-indicator',
  templateUrl: './indicator.component.html',
  styleUrls: ['./indicator.component.scss']
})
export class IndicatorComponent implements OnInit {
  @Input()
  public color: IndicatorColor = 'white';

  public constructor() {}

  public ngOnInit(): void {}
}
