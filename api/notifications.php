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

// Get user's favorite shows
$stmt = $conn->prepare("SELECT show_id FROM user_favorites WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$favorite_show_ids = [];
while ($row = $result->fetch_assoc()) {
    $favorite_show_ids[] = $row['show_id'];
}

$notifications = [];
$now = time();
$yesterday = $now - (24 * 60 * 60);
$tomorrow = $now + (24 * 60 * 60);

foreach ($favorite_show_ids as $show_id) {
    // Get general show details to find the latest season number
    $show_details_url = "https://api.themoviedb.org/3/tv/{$show_id}?api_key=" . TMDB_API_KEY;
    $show_details_json = @file_get_contents($show_details_url);
    if ($show_details_json === false) continue;

    $show_details = json_decode($show_details_json, true);
    if (!isset($show_details['number_of_seasons'])) continue;

    $latest_season_number = $show_details['number_of_seasons'];
    $show_name = $show_details['name'];

    // Get the details of the latest season
    $season_details_url = "https://api.themoviedb.org/3/tv/{$show_id}/season/{$latest_season_number}?api_key=" . TMDB_API_KEY;
    $season_details_json = @file_get_contents($season_details_url);
    if ($season_details_json === false) continue;

    $season_details = json_decode($season_details_json, true);
    if (!isset($season_details['episodes'])) continue;

    foreach ($season_details['episodes'] as $episode) {
        if (empty($episode['air_date'])) continue;

        $air_date_timestamp = strtotime($episode['air_date']);

        // Check if the episode airs within our 48-hour window
        if ($air_date_timestamp >= $yesterday && $air_date_timestamp <= $tomorrow) {
            $status = $air_date_timestamp < $now ? "Aired recently" : "Airing soon";
            $notifications[] = [
                'show_name' => $show_name,
                'episode_string' => "S{$episode['season_number']}E{$episode['episode_number']}: {$episode['name']}",
                'air_date' => $episode['air_date'],
                'status' => $status
            ];
        }
    }
}

header('Content-Type: application/json');
echo json_encode($notifications);
?>
