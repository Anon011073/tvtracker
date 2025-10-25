<?php
<?php
// File: api/tmdb.php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php'; // Include config to get the API key

$endpoint = $_GET['endpoint'] ?? '';
$params = $_GET;
unset($params['endpoint']);

$baseUrl = 'https://api.themoviedb.org/3' . $endpoint;
$params['api_key'] = TMDB_API_KEY; // Use the constant from config.php

$fullUrl = $baseUrl . '?' . http_build_query($params);

// Use a context to handle potential errors from file_get_contents
$context = stream_context_create(['http' => ['ignore_errors' => true]]);
$response = file_get_contents($fullUrl, false, $context);

// Check for HTTP errors
if (strpos($http_response_header[0], '200') === false) {
    http_response_code(502); // Bad Gateway
    echo json_encode(['error' => 'Failed to fetch data from TMDB', 'details' => $http_response_header[0]]);
    exit;
}

echo $response;
