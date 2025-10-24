<?php
require_once 'database.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['message' => 'You must be logged in to change your password.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Current and new passwords are required.']);
    exit;
}

$currentPassword = $data['currentPassword'];
$newPassword = $data['newPassword'];
$user_id = $_SESSION['user_id'];

if (empty($currentPassword) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(['message' => 'Please fill in all fields.']);
    exit;
}

$conn = getDbConnection();

$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!password_verify($currentPassword, $user['password'])) {
    http_response_code(401);
    echo json_encode(['message' => 'Incorrect current password.']);
    $conn->close();
    exit;
}

$hashed_password = password_hash($newPassword, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->bind_param("si", $hashed_password, $user_id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(['message' => 'Password changed successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'An error occurred while changing the password.']);
}

$stmt->close();
$conn->close();
?>