import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from 'src/app/core/services/http.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  constructor(private http: HttpService) {}

  ngOnInit(): void {}

  public sendGreet(): void {
    this.http.get('greet', { username: 'hello', password: 'world' }).then(answer => console.log('answer', answer));
  }
}
