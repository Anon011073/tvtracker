<?php

require_once 'database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Username, password, and email are required.']);
    exit;
}

$username = $data['username'];
$password = $data['password'];
$email = $data['email'];

if (empty($username) || empty($password) || empty($email)) {
    http_response_code(400);
    echo json_encode(['message' => 'Please fill in all fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid email format.']);
    exit;
}

$conn = getDbConnection();

$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['message' => 'Username or email already exists.']);
    $stmt->close();
    $conn->close();
    exit;
}

$stmt->close();

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $hashed_password, $email);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(['message' => 'User registered successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'An error occurred during registration.']);
}

$stmt->close();
$conn->close();

?>
