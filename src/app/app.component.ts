import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'polarmachine';
  version = environment.version;
  issuesLink = environment.issuesLink;
  personalLink = 'https://polarfox.me/';
}
