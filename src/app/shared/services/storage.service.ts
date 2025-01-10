/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { catchError, filter, Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { IndexDBConfig } from '../types/index-db-conffig'
export enum StorageType {
  Cookie,
  IndexDB,
  Seesiion
}
class Strategy {
  getData(key:string) {};
  setData <T>(key:string, data:T) {}
  clearStorage(key?:string,) {}
}
class StrategyCookie extends Strategy {
  constructor(private cookiesService:CookieService) {super()}
  override getData<T>(key:string): Observable<T|Error> {
    let result:T|Error|string
    try {
      result = this.cookiesService.get(key)
    } catch (error) {
      console.log('error cookiesService.get',error);
      result = error as Error
    }
    try {
      result = JSON.parse(result as string)
    } catch (error) {  }
    return of <T|Error>(result as T|Error).pipe(filter(data=>!(data instanceof Error )));
  }
  override setData<T>(key:string, data: T): Observable<T|Error> {
    this.cookiesService.set(key, JSON.stringify(data));
    return (this.cookiesService.get(key) === JSON.stringify(data)?  of(data) : of (new Error('Error saving cookies')))
  }
  override clearStorage (key:string, ):Observable<boolean> {
    try {
      this.cookiesService.delete(key) ;
      return of(true)
    } catch (error) {
      return of(false)
    }
  }
}
class StrategySession extends Strategy {
  constructor() {super()}
  override getData<T>(key:string): Observable<T|string|null> {
    try {
      let res = sessionStorage.getItem(key)
      return of(res)
    } catch (error) {
      return of(null)
    }
  }
  override setData<T>(key: string, data: T): Observable<T|boolean> {
    let dataStr:string = JSON.stringify(data)
    try {
      sessionStorage.setItem(key,dataStr)
      return of(true)
    } catch (error) {
      return of(false)
    }
  }
  override clearStorage (key?:string):Observable<boolean> {
    try {
      key? sessionStorage.removeItem(key):null
      return of(true)
    } catch (error) {
      return of(false)
    }
  }
}
class StrategyIndexDB extends Strategy {
  constructor(private indexDBservice:NgxIndexedDBService) {super()}
  override getData<T>(key:string): Observable<T> {
    return this.indexDBservice.getByIndex <T>(
      IndexDBConfig.objectStoresMeta[0].store,
      IndexDBConfig.objectStoresMeta[0].storeConfig.keyPath as string,
      key).pipe(
        // filter(data=>data!==undefined),
        catchError(err=>{
          console.log('error indexDBservice.getByIndex',err);
          return of(err)
        })); ;
  }
  override setData<T>(key: string, data: T): Observable<T|Error> {
      return this.indexDBservice.update <T|Error>(
        IndexDBConfig.objectStoresMeta[0].store,
        data
      ).pipe(catchError(err=>{
          console.log('error indexDBservice.update',err);
          return of(err)
        }));
  }
  override clearStorage ():Observable<boolean> {
    return this.indexDBservice.clear(IndexDBConfig.objectStoresMeta[0].store)
  }
}
export class AppStorage {
  constructor(private strategy:StrategyIndexDB|StrategyCookie|StrategySession) {
    this.strategy = strategy
  }
  getStorageData <T> (key:string):Observable<T|Error|string|null> {
    return this.strategy.getData(key)
  }
  setStorageData <T> (key:string,data:T):Observable<T|Error|boolean> {
    return this.strategy.setData(key,data)
  }
  clearStorageData (key?:string):Observable<boolean> {
    return this.strategy.clearStorage(key||'')
  }
}
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(
    private indexDBservice:NgxIndexedDBService,
    private cookiesService:CookieService
  ) { }
  initStorageObj(storageType:StorageType):AppStorage {
    switch (storageType) {
      case StorageType.Cookie :return new AppStorage (new StrategyCookie(this.cookiesService))
      case StorageType.IndexDB :  return new AppStorage (new StrategyIndexDB(this.indexDBservice))
      case StorageType.Seesiion :  return new AppStorage (new StrategySession())
    }
  }
}
