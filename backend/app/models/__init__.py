# Re-export all models so that alembic/env.py can import Base and see every
# table via `from app.models import Base`.  The side-effect imports below are
# intentional — SQLAlchemy registers tables on Base.metadata at import time.

from app.models.base import Base  # noqa: F401

# -- load all mapped models so metadata is fully populated -----------------
from app.models.user import User  # noqa: F401
from app.models.business import Business, BusinessMember  # noqa: F401
from app.models.refresh_token import RefreshToken  # noqa: F401
from app.models.bank_account import BankAccount  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.document_embedding import DocumentEmbedding  # noqa: F401
from app.models.invoice import Invoice  # noqa: F401
from app.models.invoice_line_item import InvoiceLineItem  # noqa: F401
from app.models.reconciliation import ReconciliationMatch, ReconciliationException  # noqa: F401
from app.models.settlement import Settlement  # noqa: F401
from app.models.cash_flow import CashFlowEntry  # noqa: F401
from app.models.forecast import Forecast  # noqa: F401
from app.models.report import Report  # noqa: F401
from app.models.ai_conversation import AIConversation  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.notification import Notification  # noqa: F401

__all__ = ["Base"]
