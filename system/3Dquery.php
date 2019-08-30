<?php
require_once "config.php";
function GetpointInfoOfTrip($input, $conn) {
    $input1 = explode("!", $input);
	  
	  $SQL = "SELECT ST_AsText(point), pdatetime from gps_points1 where tripid = " .$input1[0]. " order by pdatetime";
        $query = $conn->prepare($SQL);
        $query->execute();
		if (!$query) {
            echo "An error occurred.\n";
            exit;
        }
        $record = $query->fetchAll();
        $Draw_Array = "";
        
        for ($i = 0;$i < sizeof($record);$i++) {
			$Draw_Array .= $record[$i][0] . "," . $record[$i][1] .  ",";
          
        }
	
        $Final_Results = array();
        $Final_Results["pointlist"] =  substr(trim($Draw_Array), 0, -1);
        
  
    return json_encode($Final_Results);
}
if (isset($_POST['cor'])) {
    $db_user1 = "postgres";
    $db_pass1 = "user";
    $db_name1 = $_POST['DB'];
    $db_server1 = "localhost";
    $db_port1 = "5432";
    try {
        $conn1 = new PDO("pgsql:dbname=$db_name1;host=$db_server1;port=$db_port1", $db_user1, $db_pass1) OR DIE('Unable to connect to database! Please try again later.');
    }
    catch(PDOException $e) {
        echo "Error: " . $e;
    }
    $Result = GetpointInfoOfTrip($_POST['cor'], $conn1);
    echo $Result;
}
?>
