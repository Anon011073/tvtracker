<?php
require_once 'api/database.php';

$conn = getDbConnection();

$sql_users = "
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($conn->query($sql_users) === TRUE) {
  echo "Table 'users' created successfully or already exists.<br>";
} else {
  echo "Error creating table 'users': " . $conn->error . "<br>";
}

$conn->close();
?>