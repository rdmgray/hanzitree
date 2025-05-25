CREATE TABLE characters (
    character TEXT PRIMARY KEY,
    unicode TEXT,
    radical TEXT,
    stroke_count INTEGER,
    ids_sequence TEXT,
    structure_type TEXT,
    direct_components TEXT,  -- Will store JSON array
    all_components TEXT,     -- Will store JSON array
    source TEXT
); 