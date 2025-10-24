<?php

require_once 'database.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['message' => 'You must be logged in to manage watch progress.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$conn = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $show_id = $_GET['show_id'] ?? null;
    if (!$show_id) {
        http_response_code(400);
        echo json_encode(['message' => 'Show ID is required.']);
        exit;
    }

    $stmt = $conn->prepare("SELECT season_number, episode_number FROM user_watch_progress WHERE user_id = ? AND show_id = ? AND watched = 1");
    $stmt->bind_param("ii", $user_id, $show_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $progress = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($progress);
    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['bulk_update']) && $data['bulk_update']) {
        if (!isset($data['show_id']) || !isset($data['episodes'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Show ID and episodes are required for bulk update.']);
            exit;
        }

        $show_id = $data['show_id'];
        $episodes = $data['episodes'];

        $conn->begin_transaction();
        $stmt = $conn->prepare("INSERT INTO user_watch_progress (user_id, show_id, season_number, episode_number, watched) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE watched = 1");

        foreach ($episodes as $ep) {
            $stmt->bind_param("iiii", $user_id, $show_id, $ep['season_number'], $ep['episode_number']);
            $stmt->execute();
        }

        if ($conn->commit()) {
            http_response_code(200);
            echo json_encode(['message' => 'Bulk watch progress updated successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'An error occurred during bulk update.']);
        }
        $stmt->close();
    } else {
        if (!isset($data['show_id']) || !isset($data['season_number']) || !isset($data['episode_number']) || !isset($data['watched'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Show ID, season number, episode number, and watched status are required.']);
            exit;
        }

        $show_id = $data['show_id'];
        $season_number = $data['season_number'];
        $episode_number = $data['episode_number'];
        $watched = $data['watched'];

        $stmt = $conn->prepare("INSERT INTO user_watch_progress (user_id, show_id, season_number, episode_number, watched) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE watched = ?");
        $stmt->bind_param("iiiii", $user_id, $show_id, $season_number, $episode_number, $watched, $watched);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['message' => 'Watch progress updated successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'An error occurred while updating watch progress.']);
        }
        $stmt->close();
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $show_id = $_GET['show_id'] ?? null;

    if (!$show_id) {
        http_response_code(400);
        echo json_encode(['message' => 'Show ID is required.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM user_watch_progress WHERE user_id = ? AND show_id = ?");
    $stmt->bind_param("ii", $user_id, $show_id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(['message' => 'Watch progress reset successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'An error occurred while resetting watch progress.']);
    }
    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}

$conn->close();

?>