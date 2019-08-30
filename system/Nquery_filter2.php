<?php
require_once "config.php";
function Nfilter2($input, $conn) {
    $input1 = explode("!", $input);
    if ((int)$input1[6] == 4) {
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM (select  tripid,ST_SetSRID(ST_MakeLine(point order by PDateTime),4326) as trip,EXTRACT(DOW FROM min(PDateTime)) as startday,EXTRACT(HOUR FROM min(PDateTime)) as starthour from gps_points1 where pdatetime BETWEEN '" . $input1[4] . "' AND '" . $input1[5] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[3] . "))',4326), point)  group by tripid ) as x where startday in (" . $input1[2] . ") AND starthour in (" . $input1[1] . ") order by 3 DESC ";
        $query = $conn->prepare($SQL);
        $query->execute();
        $record = $query->fetchAll();
        $Draw_Array = array();
        $Trip_Rank = "";
        for ($i = 0;$i < sizeof($record);$i++) {
            $Draw_Array[$record[$i][0]]["trajectorypoints"] = $record[$i][1];
            $Trip_Rank.= $record[$i][0] . ":" . $record[$i][2] . ",";
        }
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["road_Array"] = "0";
        $Final_Results["St_Rank_count"] = "0";
        $Final_Results["St_Rank_speed"] = "0";
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
    } else {
        // rank trips by trip length===============
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM td " . "WHERE tripid in " . $input1[0] . " AND EXTRACT(DOW FROM starttime) in (" . $input1[2] . ") AND EXTRACT(HOUR FROM starttime) in (" . $input1[1] . ")  order by St_Length(trip::geography) DESC ";
        $query = $conn->prepare($SQL);
        $query->execute();
        $record = $query->fetchAll();
        $Draw_Array = array();
        $Trip_Rank = "";
        for ($i = 0;$i < sizeof($record);$i++) {
            $Draw_Array[$record[$i][0]]["trajectorypoints"] = $record[$i][1];
            $Trip_Rank.= $record[$i][0] . ":" . $record[$i][2] . ",";
        }
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["road_Array"] = "0";
        $Final_Results["St_Rank_count"] = "0";
        $Final_Results["St_Rank_speed"] = "0";
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
    }
    return json_encode($Final_Results);
    //return $qr2;
    
}
if (isset($_POST['para1'])) {
    //$Rcoor  = $_POST['para'];
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
    $Result = Nfilter2($_POST['para1'], $conn1);
    echo $Result;
}
?>
