<?php

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'tv_tracker');

// TMDB API Key
// IMPORTANT: It is recommended to set the TMDB_API_KEY as an environment variable for security.
// Example: putenv('TMDB_API_KEY=your_api_key_here');
define('TMDB_API_KEY', getenv('TMDB_API_KEY'));

?>
