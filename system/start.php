<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
require_once "config.php";
require_once "query.php";
require_once "query_edit.php";
require_once "query_filter.php";
require_once "query_filter2.php";
require_once "Rquery.php";
require_once "Rquery_edit.php";
require_once "Rquery_filter.php";
require_once "Rquery_filter2.php";
require_once "Nquery.php";
require_once "Nquery_edit.php";
require_once "Nquery_filter.php";
require_once "Nquery_filter2.php";

// Autoloader.
function __autoload($class) {
  $file = dirname(__FILE__) . "/" . str_replace("\\", "/", $class) . ".php";

  if (file_exists($file)) {
    require_once($file);
  }
}

?>
