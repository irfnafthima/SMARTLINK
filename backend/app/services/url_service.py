from datetime import datetime, timezone
from app.models import db, Url, ClickEvent
from app.utils.validators import validate_url, validate_custom_alias, generate_short_code

class UrlService:
    @staticmethod
    def create_url(original_url: str, custom_alias: str = None, base_url: str = "http://localhost:3000"):
        # Validate original url
        valid_url, err_url = validate_url(original_url)
        if not valid_url:
            return None, err_url, 400

        original_url = original_url.strip()

        # Handle custom alias
        if custom_alias:
            custom_alias = custom_alias.strip()
            valid_alias, err_alias = validate_custom_alias(custom_alias)
            if not valid_alias:
                return None, err_alias, 400

            # Check uniqueness
            existing = Url.query.filter_by(short_code=custom_alias).first()
            if existing:
                return None, "Custom alias is already in use", 409
            short_code = custom_alias
        else:
            # Generate unique random code
            attempts = 0
            while attempts < 10:
                short_code = generate_short_code(7)
                if not Url.query.filter_by(short_code=short_code).first():
                    break
                attempts += 1
            else:
                return None, "Failed to generate unique short code. Please try again.", 500

        base = base_url.rstrip("/")
        short_url = f"{base}/s/{short_code}"

        new_url = Url(
            original_url=original_url,
            short_code=short_code,
            short_url=short_url,
            click_count=0
        )
        db.session.add(new_url)
        db.session.commit()

        return new_url, "", 201

    @staticmethod
    def get_all_urls(search_query: str = None):
        query = Url.query
        if search_query:
            pattern = f"%{search_query.strip()}%"
            query = query.filter(
                (Url.original_url.ilike(pattern)) | (Url.short_code.ilike(pattern))
            )
        return query.order_by(Url.created_at.desc()).all()

    @staticmethod
    def get_url_by_id(url_id: int):
        return db.session.get(Url, url_id)

    @staticmethod
    def get_url_by_code(code: str):
        return Url.query.filter_by(short_code=code).first()

    @staticmethod
    def update_url(url_id: int, new_original_url: str = None, new_short_code: str = None, base_url: str = "http://localhost:3000"):
        url_obj = db.session.get(Url, url_id)
        if not url_obj:
            return None, "URL not found", 404

        # Validate and update original URL if provided
        if new_original_url is not None:
            valid_url, err_url = validate_url(new_original_url)
            if not valid_url:
                return None, err_url, 400
            url_obj.original_url = new_original_url.strip()

        # Validate and update short code if provided and different
        if new_short_code is not None:
            new_code = new_short_code.strip()
            if new_code != url_obj.short_code:
                valid_alias, err_alias = validate_custom_alias(new_code)
                if not valid_alias:
                    return None, err_alias, 400

                # Check uniqueness among other URLs
                existing = Url.query.filter(Url.short_code == new_code, Url.id != url_id).first()
                if existing:
                    return None, "Short code is already in use by another link", 409

                url_obj.short_code = new_code
                base = base_url.rstrip("/")
                url_obj.short_url = f"{base}/s/{new_code}"

        url_obj.updated_at = datetime.now(timezone.utc)
        # Preserve click_count and click events
        db.session.commit()
        return url_obj, "", 200

    @staticmethod
    def delete_url(url_id: int):
        url_obj = db.session.get(Url, url_id)
        if not url_obj:
            return False, "URL not found", 404
        db.session.delete(url_obj)
        db.session.commit()
        return True, "URL deleted successfully", 200

    @staticmethod
    def regenerate_code(url_id: int, base_url: str = "http://localhost:3000"):
        url_obj = db.session.get(Url, url_id)
        if not url_obj:
            return None, "URL not found", 404

        attempts = 0
        while attempts < 10:
            new_code = generate_short_code(7)
            if not Url.query.filter_by(short_code=new_code).first():
                break
            attempts += 1
        else:
            return None, "Failed to generate unique short code", 500

        base = base_url.rstrip("/")
        url_obj.short_code = new_code
        url_obj.short_url = f"{base}/s/{new_code}"
        url_obj.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return url_obj, "", 200

    @staticmethod
    def record_click(url_obj: Url, referrer: str = None, user_agent: str = None):
        url_obj.click_count = (url_obj.click_count or 0) + 1
        url_obj.updated_at = datetime.now(timezone.utc)

        click = ClickEvent(
            url_id=url_obj.id,
            referrer=referrer[:512] if referrer else None,
            user_agent=user_agent[:512] if user_agent else None,
            clicked_at=datetime.now(timezone.utc)
        )
        db.session.add(click)
        db.session.commit()
