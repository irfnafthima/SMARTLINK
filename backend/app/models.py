from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def utc_now():
    return datetime.now(timezone.utc)

class Url(db.Model):
    __tablename__ = "urls"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    original_url = db.Column(db.String(2048), nullable=False)
    short_code = db.Column(db.String(64), unique=True, index=True, nullable=False)
    short_url = db.Column(db.String(512), nullable=False)
    click_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationship to click events with cascade delete
    clicks = db.relationship(
        "ClickEvent",
        backref="url",
        lazy="dynamic",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "original_url": self.original_url,
            "short_code": self.short_code,
            "short_url": self.short_url,
            "click_count": self.click_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ClickEvent(db.Model):
    __tablename__ = "click_events"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    url_id = db.Column(
        db.Integer,
        db.ForeignKey("urls.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    clicked_at = db.Column(db.DateTime, default=utc_now, index=True, nullable=False)
    referrer = db.Column(db.String(512), nullable=True)
    user_agent = db.Column(db.String(512), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "url_id": self.url_id,
            "clicked_at": self.clicked_at.isoformat() if self.clicked_at else None,
            "referrer": self.referrer,
            "user_agent": self.user_agent,
        }
