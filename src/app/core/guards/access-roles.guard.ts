import { CanActivateFn, Router } from "@angular/router"
import { inject } from "@angular/core"
import { SnacksService } from "@shared/snacks.service"
import { catchError, of, switchMap } from "rxjs"
import { TAcRole } from "@core/models/user.models"
import { UserCoreService } from "@core/services/user-core.service"

export const roleGuard = (role:TAcRole[]):CanActivateFn => {
    return () => {
        const userCoreService = inject(UserCoreService)
        const router = inject(Router)
        const snackService = inject(SnacksService)
        if (role.includes(userCoreService.userData.role)) {
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