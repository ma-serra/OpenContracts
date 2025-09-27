"""
Signal handlers for Extract models.
"""
import logging
from django.db import transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

logger = logging.getLogger(__name__)

# Signal UIDs for Extract/Datacell
DATACELL_SAVE_UID = "process_datacell_on_save_uid_v1"
DATACELL_DELETE_UID = "process_datacell_on_delete_uid_v1"


@receiver(post_save, sender='extracts.Datacell', dispatch_uid=DATACELL_SAVE_UID)
def handle_datacell_save(sender, instance, **kwargs):
    """Handle datacell save."""
    # Currently a no-op as we use direct queries without caching
    pass


@receiver(post_delete, sender='extracts.Datacell', dispatch_uid=DATACELL_DELETE_UID)
def handle_datacell_delete(sender, instance, **kwargs):
    """Handle datacell delete."""
    # Currently a no-op as we use direct queries without caching
    pass