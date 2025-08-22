import logging

from django.db import transaction
from django.utils import timezone

from opencontractserver.analyzer.models import Analysis
from opencontractserver.types.enums import PermissionTypes
from opencontractserver.utils.permissioning import set_permissions_for_obj_to_user

logger = logging.getLogger(__name__)


def create_and_setup_analysis(
    analyzer, user_id, corpus_id=None, doc_ids=None, corpus_action=None
):

    logger.info(
        f"create_and_setup_analysis called - analyzer: {analyzer.id if analyzer else None}, user_id: {user_id}"
    )
    logger.info(
        f"corpus_id: {corpus_id}, doc_ids: {doc_ids}, corpus_action: {corpus_action}"
    )

    try:
        with transaction.atomic():
            # Always create a new analysis instead of reusing existing ones
            analysis = Analysis(
                analyzer=analyzer,
                analyzed_corpus_id=corpus_id,
                creator_id=user_id,
                corpus_action=corpus_action,
            )
            analysis.save()
            logger.info(f"Created new analysis: {analysis.id}")

            analysis.analysis_completed = None
            analysis.analysis_started = timezone.now()

            analysis.save()
            logger.info(
                f"Updated analysis {analysis.id} - started: {analysis.analysis_started}"
            )

            set_permissions_for_obj_to_user(user_id, analysis, [PermissionTypes.CRUD])

            if doc_ids is not None:
                logger.info(f"Adding documents {doc_ids} to analysis {analysis.id}")
                analysis.analyzed_documents.add(*doc_ids)

        logger.info(
            f"Successfully created/updated analysis: {analysis.id} for analyzer: {analyzer.id}"
        )

    except Exception as e:
        logger.error(f"Error in create_and_setup_analysis: {e}", exc_info=True)
        raise

    return analysis
