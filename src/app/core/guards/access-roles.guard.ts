import { CanActivateFn, Router } from "@angular/router"
import { TAcRole } from "../../features/auth/models/auth.model"
import { inject } from "@angular/core"
import { AuthService } from "../../features/auth/services/auth.service"
import { SnacksService } from "@shared/snacks.service"
import { catchError, of, switchMap } from "rxjs"

export const roleGuard = (role:TAcRole[]):CanActivateFn => {
    return () => {
        const authService = inject(AuthService)
        const router = inject(Router)
        const snackService = inject(SnacksService)
        if (role.includes(authService.userData.role)) {
            return true
        } else {
            return snackService.openSnackObserve('You do not have the required access role','Okay','error-snackBar')
            .pipe(
                switchMap(()=>(router.navigate(['/']))),
                catchError(() => of(false)) 
            )
        }
    }
}