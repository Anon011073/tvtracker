<?php

require_once 'database.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['message' => 'You must be logged in to manage favorites.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$conn = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT show_id, show_name FROM user_favorites WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $favorites = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($favorites);
    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['show_id']) || !isset($data['show_name'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Show ID and name are required.']);
        exit;
    }

    $show_id = $data['show_id'];
    $show_name = $data['show_name'];

    $stmt = $conn->prepare("INSERT INTO user_favorites (user_id, show_id, show_name) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $user_id, $show_id, $show_name);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['message' => 'Favorite added successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'An error occurred while adding the favorite.']);
    }
    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $show_id = $_GET['show_id'] ?? null;

    if (!$show_id) {
        http_response_code(400);
        echo json_encode(['message' => 'Show ID is required.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM user_favorites WHERE user_id = ? AND show_id = ?");
    $stmt->bind_param("ii", $user_id, $show_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(['message' => 'Favorite removed successfully.']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Favorite not found.']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'An error occurred while removing the favorite.']);
    }
    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}

$conn->close();

?>