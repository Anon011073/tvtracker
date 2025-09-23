<?php

require_once 'database.php';

session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Username and password are required.']);
    exit;
}

$username = $data['username'];
$password = $data['password'];

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Please fill in all fields.']);
    exit;
}

$conn = getDbConnection();

$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid username or password.']);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

if (password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    http_response_code(200);
    echo json_encode(['message' => 'Login successful.']);
} else {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid username or password.']);
}

$stmt->close();
$conn->close();

?>
