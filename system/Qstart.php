<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
require_once "Qconfig.php";
require_once "Qquery.php";
require_once "Qquery1.php";

// Autoloader.
function __autoload($class) {
  $file = dirname(__FILE__) . "/" . str_replace("\\", "/", $class) . ".php";

  if (file_exists($file)) {
    require_once($file);
  }
}

?>
