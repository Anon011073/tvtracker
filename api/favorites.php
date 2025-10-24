<?php
session_start();
// Correctly include the database helper and establish a connection
require_once __DIR__ . '/database.php';
$conn = getDbConnection();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT show_id FROM user_favorites WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $favorites = [];
    while ($row = $result->fetch_assoc()) {
        $show_id = $row['show_id'];

        // Fetch show name from TMDB
        $tmdb_url = "https://api.themoviedb.org/3/tv/{$show_id}?api_key=" . TMDB_API_KEY;
        $show_details_json = @file_get_contents($tmdb_url);

        if ($show_details_json !== false) {
            $show_details = json_decode($show_details_json, true);
            if (isset($show_details['id'])) {
                $favorites[] = [
                    'show_id' => $show_details['id'],
                    'show_name' => $show_details['name']
                ];
            }
        }
    }
    echo json_encode($favorites);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $show_id = $data['show_id'];
    $action = $data['action'];

    if ($action === 'add') {
        $stmt = $conn->prepare("INSERT INTO user_favorites (user_id, show_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $user_id, $show_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add favorite: ' . $stmt->error]);
        }
    } elseif ($action === 'remove') {
        $stmt = $conn->prepare("DELETE FROM user_favorites WHERE user_id = ? AND show_id = ?");
        $stmt->bind_param("ii", $user_id, $show_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to remove favorite: ' . $stmt->error]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}
?>
