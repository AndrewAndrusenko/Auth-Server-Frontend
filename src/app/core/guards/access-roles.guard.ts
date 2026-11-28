import { CanActivateFn, Router } from "@angular/router"
import { inject } from "@angular/core"
import { SnacksService } from "@shared/snacks.service"
import { catchError, of, switchMap } from "rxjs"
import { TAcRole } from "@core/models/user.models"
import { Store } from "@ngrx/store"
import { coreFeature } from "@core/ngrx/core.reducer"

export const roleGuard = (role:TAcRole[]):CanActivateFn => {
    return () => {
        const userData = inject(Store).selectSignal(coreFeature.selectUserData)
        const router = inject(Router)
        const snackService = inject(SnacksService)
        if (userData() && role.includes(userData()!.role)) {
            return true
        } else {
            return snackService.openSnackObserve('You do not have the required access role','Okay','error-snackBar')
            .pipe(
                switchMap(()=>(router.navigate(['/register']))),
                catchError(() => of(false)) 
            )
        }
    }
}