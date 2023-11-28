CREATE INDEX idx_fts_on_property_data ON property_data USING gin(to_tsvector('english', pin || ' ' || taxpayer || ' ' || address));
