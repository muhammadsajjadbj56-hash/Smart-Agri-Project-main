@echo off

REM Frontend
start cmd /k "cd frontend && npm start"

REM Backend
start cmd /k "cd backend && npm start"

REM Flask Backend
start cmd /k "cd flask-backend && python app.py"