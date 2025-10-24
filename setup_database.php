<?php

echo "Dropping existing tables...\n";
include 'drop_tables.php';

echo "\nCreating new tables...\n";
include 'setup.php';

echo "\nDatabase setup complete.\n";

?>