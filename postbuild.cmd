@echo off
rd /s /q c:\JS\JSP\prod-server-ts-express\dist\public\apps\ssngrx

mkdir c:\JS\JSP\prod-server-ts-express\dist\public\apps\ssngrx

xcopy /s /y c:\JS\JSP\stanalone-18\standalone-signals\dist\standalone-signals\browser c:\JS\JSP\prod-server-ts-express\dist\public\apps\ssngrx
