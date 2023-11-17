import {Component, NgZone, OnInit, Output, Renderer2, RendererFactory2} from '@angular/core';
import {StorageService} from "./storage.service";
import {Xer} from "./model/xer";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  baseRef = 'https://twitter.com/';
  title = '𝕏plorer';
  _xersList: Xer[] = [];
  get xers(): Xer[] {
    return this._xersList;
  };
  private renderer: Renderer2;

  constructor(renderFactory: RendererFactory2, private storageService: StorageService, private ngZone: NgZone) {
    this.renderer = renderFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    this.storageService.getSortOrder();
    this.setTheme();
    this.setMembers();
    this.watchStorage();
  }

  setTheme() {
    this.storageService.fetchTheme().subscribe((theme) => {
      console.log('isDark = ', theme.isDark);
      // remove both themes
      this.renderer.removeClass(document.body, 'dark-theme');
      this.renderer.removeClass(document.body, 'light-theme');
      // add theme
      if (theme.isDark) {
        this.renderer.addClass(document.body, 'dark-theme');
      } else {
        this.renderer.addClass(document.body, 'light-theme');
      }
    })
  }

  setMembers() {
    this.storageService.fetchXers().subscribe((xerList: Xer[]) => {
      this.ngZone.run(() => {
        this._xersList = [...xerList];
        for (let xer of this._xersList) {
          console.log("xer = ", xer);
        }
      });
    });
  }

  handleProfileClick(xer: Xer) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => {
      var tabId = tabs[0].id;
      chrome.tabs.update({
        url: this.baseRef + xer.handle.substring(1),
      });
    });
  }
  handleDelete(xer: Xer) {
    this.storageService.delete(xer);
  }
  watchStorage() {
    this.storageService.storageChanged.subscribe((changed) => {
      console.log('Detected changes to local');
      this.setMembers();
    });
  }
  trackByFn(index: number, item: any) {
    return item.handle;
  }

  formatName(xerName:String) {
    if (xerName.length > 50) {
      return xerName.substring(0, 50) + '...';
    } else {
      return xerName + ' '.repeat(50 - xerName.length);
    }
  }
}
