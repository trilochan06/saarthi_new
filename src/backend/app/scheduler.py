from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from .config import settings
from .datasets import refresh_all

scheduler = BackgroundScheduler()

def start_scheduler():
    # Run once at startup
    refresh_all()

    # Then refresh periodically
    scheduler.add_job(
        refresh_all,
        trigger=IntervalTrigger(minutes=settings.DATA_REFRESH_MINUTES),
        id="refresh_datasets_job",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()
