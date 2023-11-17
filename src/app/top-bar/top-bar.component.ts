import { Component } from '@angular/core';
import {isNgContainer} from "@angular/compiler";
import {StorageService} from "../storage.service";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  constructor(private storageService:StorageService) {
  }

  resetSort() {
    this.storageService.setSortOrder(0);
  }

  toggleSort() {
    const sortOrder = this.storageService.sortOrder <= 0 ? 1 : -1;
    this.storageService.setSortOrder(sortOrder);
  }
}
