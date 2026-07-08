@echo off
rd /s /q c:\!Development\!Projects\Prod-Server-3A\dist\public\apps\ssngrx

mkdir c:\!Development\!Projects\Prod-Server-3A\dist\public\apps\ssngrx

xcopy /s /y c:\!Development\!Projects\Auth-Server-Frontend\dist\standalone-signals\browser c:\!Development\!Projects\Prod-Server-3A\dist\public\apps\ssngrx
