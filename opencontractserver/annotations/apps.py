from django.apps import AppConfig
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.utils.translation import gettext_lazy as _


class AnnotationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "opencontractserver.annotations"
    verbose_name = _("Annotations")

    def ready(self):
        try:
            import opencontractserver.annotations.signals  # noqa F401
            from opencontractserver.annotations.models import (
                Annotation,
                Note,
                Relationship,
            )
            from opencontractserver.annotations.signals import (  # Relationship signals
                ANNOT_CREATE_UID,
                NOTE_CREATE_UID,
                REL_CREATE_UPDATE_UID,
                REL_DELETE_UID,
                REL_M2M_SOURCES_UID,
                REL_M2M_TARGETS_UID,
                process_annot_on_create_atomic,
                process_note_on_create_atomic,
                process_relationship_m2m_changed,
                process_relationship_on_change_atomic,
                process_relationship_on_delete,
            )

            post_save.connect(
                process_annot_on_create_atomic,
                sender=Annotation,
                dispatch_uid=ANNOT_CREATE_UID,
            )
            post_save.connect(
                process_note_on_create_atomic,
                sender=Note,
                dispatch_uid=NOTE_CREATE_UID,
            )

            # Relationship signals
            post_save.connect(
                process_relationship_on_change_atomic,
                sender=Relationship,
                dispatch_uid=REL_CREATE_UPDATE_UID,
            )
            post_delete.connect(
                process_relationship_on_delete,
                sender=Relationship,
                dispatch_uid=REL_DELETE_UID,
            )
            m2m_changed.connect(
                process_relationship_m2m_changed,
                sender=Relationship.source_annotations.through,
                dispatch_uid=REL_M2M_SOURCES_UID,
            )
            m2m_changed.connect(
                process_relationship_m2m_changed,
                sender=Relationship.target_annotations.through,
                dispatch_uid=REL_M2M_TARGETS_UID,
            )
        except ImportError:
            pass
