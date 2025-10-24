<?php

// Use a more robust path to include the config file
require_once __DIR__ . '/../config.php';

function getDbConnection() {
    $conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

    if ($conn->connect_error) {
        // Use a proper error response instead of die()
        http_response_code(500);
        echo json_encode(['error' => "Database connection failed: " . $conn->connect_error]);
        exit;
    }

    return $conn;
}

?>
