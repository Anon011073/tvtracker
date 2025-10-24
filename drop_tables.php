<?php

require_once 'api/database.php';

$conn = getDbConnection();

$sql_drop_progress = "DROP TABLE IF EXISTS `user_watch_progress`;";
$sql_drop_favorites = "DROP TABLE IF EXISTS `user_favorites`;";
$sql_drop_users = "DROP TABLE IF EXISTS `users`;";

if ($conn->query($sql_drop_progress) === TRUE) {
  echo "Table 'user_watch_progress' dropped successfully.<br>";
} else {
  echo "Error dropping table 'user_watch_progress': " . $conn->error . "<br>";
}

if ($conn->query($sql_drop_favorites) === TRUE) {
  echo "Table 'user_favorites' dropped successfully.<br>";
} else {
  echo "Error dropping table 'user_favorites': " . $conn->error . "<br>";
}

if ($conn->query($sql_drop_users) === TRUE) {
  echo "Table 'users' dropped successfully.<br>";
} else {
  echo "Error dropping table 'users': " . $conn->error . "<br>";
}

$conn->close();

?>