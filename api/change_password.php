<?php
session_start();
require_once __DIR__ . '/database.php';
$conn = getDbConnection();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $current_password = $data['current_password'];
    $new_password = $data['new_password'];

    // Get current password hash from DB
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($current_password, $user['password'])) {
        // Current password is correct, update to new password
        $new_password_hashed = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt_update = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt_update->bind_param("si", $new_password_hashed, $user_id);

        if ($stmt_update->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update password.']);
        }
    } else {
        // Invalid current password
        http_response_code(400);
        echo json_encode(['error' => 'Invalid current password.']);
    }
}
?>
