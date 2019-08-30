<?php

require_once "Qconfig.php";

function CheckUN($input,$conn)
{
  $All_Results = array();
  $qr = "SELECT datname FROM pg_database";

  $query = $conn->prepare($qr);
  $query->execute();
  if (!$query) {
    echo "An error occurred.\n";
    exit;
  }
  //$record = $query->fetchAll();

  $DB_Array=array();
  $DBTable_Array=array();

  $i = 0;
  foreach ($query->fetchAll(PDO::FETCH_COLUMN) as $row) {
    
    
    if(($row!="template0")&&($row!="template1")){
      $DB_Array[$i++] = $row;
      $db_user = "postgres";
      $db_pass = "user";
      $db_name =  $row;
      $db_server = "localhost";
      $db_port = "5432";
      try {
            $conn1 = new PDO("pgsql:dbname=$db_name;host=$db_server", $db_user, $db_pass) OR DIE('Unable to connect to database! Please try again later.');
          }
      catch(PDOException $e) {
        echo "Error: " . $e;
      }

      $qr1 = "SELECT tablename as table FROM pg_tables WHERE schemaname = 'public'";
      $query1 = $conn1->prepare($qr1);
      $query1->execute();
      if (!$query1) {
        echo "An error occurred.\n";
        exit;
      }
      $Table_Array=array();
      $j = 0;
      foreach ($query1->fetchAll(PDO::FETCH_COLUMN) as $row1) {
        $Table_Array[$j++] = $row1;
      }

      $DBTable_Array[$row] = $Table_Array;

      }
    
  }
  $All_Results["AllDB"]=$DB_Array; 
  $All_Results["AllTB"]=$DBTable_Array; 

  return json_encode($All_Results);
}

if (isset($_POST['UN']))  {
  
  $Result = CheckUN($_POST['UN'],$conn);
  echo $Result;
}

?>
