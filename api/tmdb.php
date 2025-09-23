<?php
// File: api/tmdb.php
header('Content-Type: application/json');

$apiKey = 'b6b677eb7d4ec17f700e3d4dfc31d005';
$endpoint = $_GET['endpoint'] ?? '';
$params = $_GET;
unset($params['endpoint']);

$baseUrl = 'https://api.themoviedb.org/3' . $endpoint;
$params['api_key'] = $apiKey;

$fullUrl = $baseUrl . '?' . http_build_query($params);

$response = file_get_contents($fullUrl);
echo $response;
