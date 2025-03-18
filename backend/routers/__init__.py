# backend/routers/__init__.py
from routers.invoice import router as invoices_router
from routers.templates import router as templates_router
from routers.users import router as users_router
from routers.payments import router as payments_router
from routers.wishlist import router as wishlist_router

__all__ = [
    'invoices_router',
    'templates_router',
    'users_router',
    'payments_router',
    'wishlist_router',
]