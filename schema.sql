CREATE TABLE characters (
    character TEXT PRIMARY KEY,
    unicode TEXT,
    decomposition TEXT,
    atomic BOOLEAN,
    structure_idc TEXT,
    structure TEXT,
    component_1 TEXT,
    component_2 TEXT,
    component_3 TEXT,
    all_components TEXT,     -- Will store list
    good_start BOOLEAN,
); 