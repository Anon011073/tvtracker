<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'database.php';

session_start();

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['action'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Action is required.']);
    exit;
}

$action = $data['action'];

if ($action === 'register') {
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
} elseif ($action === 'login') {
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
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid action.']);
    exit;
}
?>