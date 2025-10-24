<?php

require_once 'database.php';
require_once 'tmdb.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['message' => 'You must be logged in to view notifications.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$conn = getDbConnection();

$stmt = $conn->prepare("SELECT show_id FROM user_favorites WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$favorites = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$notifications = [];
$today = new DateTime();
$tomorrow = (new DateTime())->modify('+1 day');

foreach ($favorites as $fav) {
    $show_id = $fav['show_id'];
    $show = tmdb_request("/tv/{$show_id}");
    if ($show && isset($show['next_episode_to_air']) && $show['next_episode_to_air']) {
        $next_episode_date = new DateTime($show['next_episode_to_air']['air_date']);
        if ($next_episode_date >= $today && $next_episode_date <= $tomorrow) {
            $notifications[] = [
                'show_name' => $show['name'],
                'episode_name' => $show['next_episode_to_air']['name'],
                'air_date' => $show['next_episode_to_air']['air_date']
            ];
        }
    }
}

echo json_encode($notifications);

$conn->close();

?>