import { Injectable } from '@angular/core';
import {map, Observable, Subject} from "rxjs";
import {Theme} from "./model/theme";
import {Xer} from "./model/xer";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private  _storage = chrome.storage.sync;

  private _storageChanged = new Subject<boolean>();
  storageChanged = this._storageChanged.asObservable();

  sortOrder = 0;
  constructor() {
    this.watchStorage();
    this.getSortOrder();
  }

  getSortOrder() {
    this._storage.get(['sortOrder'], (result) => {
      if (chrome.runtime.lastError || !result.hasOwnProperty('sortOrder')) {
        console.log('sortOrder not set');
      } else {
        console.log('got sortObj', result);
        const sortObj = result['sortOrder'];
        console.log("Theme retrieved successfully:", sortObj);
        this.sortOrder = sortObj.sortOrder;
      }
    });
  }

  watchStorage() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        console.log('Storage changed ');
        this._storageChanged.next(true);
      }
    });
  }

  fetchTheme(): Observable<Theme> {
    return new Observable<Theme>(subscriber => {
      this._storage.get(['theme'], (result) => {
        if (chrome.runtime.lastError || !result.hasOwnProperty('theme')) {
          console.log('theme not set in store');
            const theme = { isDark: false };
            console.log("Theme retrieved successfully:", theme);
            subscriber.next({ isDark: true});
        } else {
            const theme = result['theme'];
            console.log("Theme retrieved successfully:", theme);
            subscriber.next(theme);
        }
        subscriber.complete();
      });
    }).pipe(
      map((theme:any) => {
        console.log("Got theme ", theme);
        return ({ isDark: theme.isDark });
      })
    );
  }

  fetchXers(): Observable<Xer[]> {
    return new Observable(subscriber => {
      this._storage.get(['members'], (result) => {
        const members = result['members'] || [];
        console.log("members = ", members);
        subscriber.next(members);
        subscriber.complete();
      });
    }).pipe(
      map((members:any) => {
        return members.map((m:any) => ({ handle: m.handle, name: m.name, image: m.handle}))
      })
    ).pipe(
      map((members:Xer[]) => {
        if (this.sortOrder == 0) return members;
        if (this.sortOrder < 0) {
          return members.sort((a, b) => a.name.localeCompare(b.name.toString()));
        }
        return members.sort((a, b) => b.name.localeCompare(a.name.toString()));
      })
    );
  }

  delete(xer: Xer) {
    this._storage.get(["members"], (result) => {
      const memList = result['members'] || [];
      console.log("Member list retrieved successfully:", memList);
      const updatedList = memList.filter((m:any) => m.handle !== xer.handle);
      this._storage.set({ members: updatedList }, () => {
        console.log("deleted xer from memList successfully.", );
      });
    });
  }

  setSortOrder(order:number) {
    this.sortOrder = order;
    console.log('setting sortOrder to ', this.sortOrder);
    this._storage.set({ sortOrder: order}, () => {
      console.log('set sort order to ', order);
      this._storageChanged.next(true);
    });
  }
}
