from fastapi import FastAPI, Request
from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import groups, expenses, balances, members, settlements
from .errors import error_code
import os

allow_origins = os.getenv("ALLOW_ORIGINS", "")
origins = [o.strip() for o in allow_origins.split(",") if o.strip()]

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Equa API", version="1.7.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Error-Code"],
)


@app.exception_handler(StarletteHTTPException)
async def add_error_code(request: Request, exc: StarletteHTTPException):
    response = await http_exception_handler(request, exc)
    response.headers["X-Error-Code"] = error_code(exc.detail, exc.status_code)
    return response


@app.exception_handler(RequestValidationError)
async def add_validation_error_code(request: Request, exc: RequestValidationError):
    response = await request_validation_exception_handler(request, exc)
    response.headers["X-Error-Code"] = error_code(exc.errors(), response.status_code)
    return response


app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(balances.router)
app.include_router(members.router)
app.include_router(settlements.router)


@app.get("/health")
def health():
    return {"status": "ok", "app": "equa"}
