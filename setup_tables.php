<?php
require_once 'api/database.php';

$conn = getDbConnection();

$sql_favorites = "
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `show_id` int(11) NOT NULL,
  `show_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_show` (`user_id`,`show_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

$sql_progress = "
CREATE TABLE IF NOT EXISTS `user_watch_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `show_id` int(11) NOT NULL,
  `season_number` int(11) NOT NULL,
  `episode_number` int(11) NOT NULL,
  `watched` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_show_episode` (`user_id`,`show_id`,`season_number`,`episode_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_watch_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($conn->query($sql_favorites) === TRUE) {
  echo "Table 'user_favorites' created successfully or already exists.<br>";
} else {
  echo "Error creating table 'user_favorites': " . $conn->error . "<br>";
}

if ($conn->query($sql_progress) === TRUE) {
  echo "Table 'user_watch_progress' created successfully or already exists.<br>";
} else {
  echo "Error creating table 'user_watch_progress': " . $conn->error . "<br>";
}

$conn->close();
?>