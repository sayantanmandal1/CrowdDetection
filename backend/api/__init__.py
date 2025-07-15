from fastapi import APIRouter
from .endpoints import map

router = APIRouter()
router.include_router(map.router) 