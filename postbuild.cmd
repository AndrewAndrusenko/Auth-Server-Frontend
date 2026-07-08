@echo off
rd /s /q c:\!Development\!Projects\prod-server-ts-express\dist\public\apps\ssngrx

mkdir c:\!Development\!Projects\prod-server-ts-express\dist\public\apps\ssngrx

xcopy /s /y c:\!Development\!Projects\stanalone-18\standalone-signals\dist\standalone-signals\browser c:\!Development\!Projects\prod-server-ts-express\dist\public\apps\ssngrx
