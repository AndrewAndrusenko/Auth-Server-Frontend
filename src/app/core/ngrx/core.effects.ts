import { Actions, createEffect, ofType } from "@ngrx/effects";
import { coreActions } from "./core.actions";
import { map, switchMap, tap } from "rxjs";
import { inject } from "@angular/core";
import { StorageService, StorageType } from "@core/services/storage.service";
import { IJWTInfo } from "../../features/auth/models/auth.model";
import { Router } from "@angular/router";

export const storageGetUserDataEffect = createEffect(
  (actions$ = inject(Actions), appStorage = inject(StorageService).storage(StorageType.IndexDB)) => 
    actions$.pipe(
      ofType(coreActions.storageGetUserData),
      tap(()=>console.log('storageGetUserData', )),

      switchMap(() => appStorage.getStorageData('jwtInfo')),
      map(val => {
         const userData = (val as {code:string, data:IJWTInfo})?.data;
         console.log('userData',userData )
         return userData? coreActions.storageGetUserDataSuccess(userData) : coreActions.storageGetUserDataFailure()
      })
    ),
    {functional:true} 
)
export const storageGetUserDataEffectSuccess = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => 
    actions$.pipe(
      ofType(coreActions.storageGetUserDataSuccess),
      tap(()=>console.log('success', )),
      tap(() => router.navigate(['apps']))
    ),
    {functional:true, dispatch: false}
)
export const storageGetUserDataEffectFailure = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => 
    actions$.pipe(
      ofType(coreActions.storageGetUserDataSuccess),
      tap(() => router.navigate(['register']))
    ),
    {functional:true, dispatch: false}
)