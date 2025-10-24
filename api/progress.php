<?php
session_start();
include '../config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => "Connection failed: " . $conn->connect_error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $show_id = $_GET['show_id'];
    $stmt = $conn->prepare("SELECT season_number, episode_number FROM user_watch_progress WHERE user_id = ? AND show_id = ?");
    $stmt->bind_param("ii", $user_id, $show_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $progress = [];
    while ($row = $result->fetch_assoc()) {
        $progress[] = $row;
    }
    echo json_encode($progress);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $show_id = $data['show_id'];

    if (isset($data['bulk_update']) && $data['bulk_update']) {
        // Handle "Mark as Caught Up"
        $episodes = $data['episodes'];
        $conn->begin_transaction();
        try {
            // First, clear existing progress for this show
            $stmt_delete = $conn->prepare("DELETE FROM user_watch_progress WHERE user_id = ? AND show_id = ?");
            $stmt_delete->bind_param("ii", $user_id, $show_id);
            $stmt_delete->execute();

            // Then, insert all episodes as watched
            $stmt_insert = $conn->prepare("INSERT INTO user_watch_progress (user_id, show_id, season_number, episode_number) VALUES (?, ?, ?, ?)");
            foreach ($episodes as $ep) {
                $stmt_insert->bind_param("iiii", $user_id, $show_id, $ep['season_number'], $ep['episode_number']);
                $stmt_insert->execute();
            }
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'All episodes marked as watched!']);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(['error' => 'Bulk update failed: ' . $e->getMessage()]);
        }

    } elseif (isset($data['action']) && $data['action'] === 'reset') {
        // Handle resetting progress
        $stmt = $conn->prepare("DELETE FROM user_watch_progress WHERE user_id = ? AND show_id = ?");
        $stmt->bind_param("ii", $user_id, $show_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to reset progress']);
        }

    } else {
        // Handle single episode marking
        $season_number = $data['season_number'];
        $episode_number = $data['episode_number'];
        $watched = $data['watched'];

        if ($watched) {
            $stmt = $conn->prepare("INSERT INTO user_watch_progress (user_id, show_id, season_number, episode_number) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE season_number=season_number");
            $stmt->bind_param("iiii", $user_id, $show_id, $season_number, $episode_number);
        } else {
            $stmt = $conn->prepare("DELETE FROM user_watch_progress WHERE user_id = ? AND show_id = ? AND season_number = ? AND episode_number = ?");
            $stmt->bind_param("iiii", $user_id, $show_id, $season_number, $episode_number);
        }

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update progress']);
        }
    }
}
?>
