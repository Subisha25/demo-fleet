@echo off
REM ============================================================================
REM GRACE CABS SAAS - SUBSCRIPTION LIFECYCLE SCHEDULED RUNNER
REM Designed for Windows Task Scheduler (Daily / 6-hourly execution)
REM ============================================================================

cd /d "D:\demobooking\demo-bookings\backend"
echo Starting Grace Cabs Subscription Lifecycle Evaluation at %DATE% %TIME% >> "D:\demobooking\demo-bookings\backend\logs\scheduler.log" 2>&1

npx ts-node src/scripts/runLifecycleScheduler.ts >> "D:\demobooking\demo-bookings\backend\logs\scheduler.log" 2>&1

echo Completed at %DATE% %TIME% with exit code %ERRORLEVEL% >> "D:\demobooking\demo-bookings\backend\logs\scheduler.log" 2>&1
exit /b %ERRORLEVEL%
