<?php
ini_set('memory_limit', '-1');
$server_setup = "default";
$conn = NULL;
switch ($server_setup) {
  case "default":
  $db_user = "postgres";
  $db_pass = "user";
  $db_name = "postgres";
  $db_server = "localhost";
  $db_port="5432";
  $root_url = "/TrajVis/";
  break;
}

try{
  $conn = new PDO("pgsql:dbname=$db_name;host=$db_server;port=$db_port", $db_user, $db_pass) OR DIE('Unable to connect to database! Please try again later.');
}catch(PDOException  $e ){
  echo "Error: ".$e;
}

?>
