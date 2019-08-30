<?php
require_once "config.php";
function GetEditResults($input, $conn) {
    //group by week days=========================
    $Eqr1 = "SELECT startday,array_agg(tripid),count(*) FROM tds WHERE tripid in " . $input . "group by startday order by startday";
    $query1 = $conn->prepare($Eqr1);
    $query1->execute();
    $record1 = $query1->fetchAll();
    $Week_Array = array();
    for ($i = 0;$i < sizeof($record1);$i++) {
        $Week_Array[$record1[$i][0]]["total"] = $record1[$i][2];
        $Week_Array[$record1[$i][0]]["Trip_Ids"] = $record1[$i][1];
    }
    //group by day hours=========================
    $Eqr2 = "SELECT starthour,array_agg(tripid),count(*) FROM tds WHERE tripid in " . $input . "group by starthour order by starthour";
    $query2 = $conn->prepare($Eqr2);
    $query2->execute();
    $record2 = $query2->fetchAll();
    $Hour_Array = array();
    for ($i = 0;$i < sizeof($record2);$i++) {
        $Hour_Array[$record2[$i][0]]["total"] = $record2[$i][2];
        $Hour_Array[$record2[$i][0]]["Trip_Ids"] = $record2[$i][1];
    }
    //group by road id and road type=========================
    $qr5 = "select roadid,count(*) as total,avg(speed)as avspeed,road_type from(SELECT unnest(orids) as roadid,unnest(speeds)as speed,unnest(roads_type)as road_type FROM tds WHERE tripid in" . $input . ") as f group by roadid,road_type";
    $query5 = $conn->prepare($qr5);
    $query5->execute();
    $record5 = $query5->fetchAll();
    $road_Array = array();
    for ($i = 0;$i < sizeof($record5);$i++) {
        $road_Array[$record5[$i][3]][$record5[$i][0]]["total_Count"] = $record5[$i][1];
        $road_Array[$record5[$i][3]][$record5[$i][0]]["total_AVSpeed"] = $record5[$i][2];
    }
    //Rank trips by trip length====================
    $Eqr3 = "SELECT DISTINCT tripid,St_Length(trip::geography) as len FROM tds WHERE tripid in " . $input . "order by St_Length(trip::geography) DESC";
    $query3 = $conn->prepare($Eqr3);
    $query3->execute();
    $record3 = $query3->fetchAll();
    $Trip_Rank = "";
    for ($i = 0;$i < sizeof($record3);$i++) {
        $Trip_Rank.= $record3[$i][0] . ":" . $record3[$i][1] . ",";
        //$Trip_Rank.=$record3[$i][0].",";
        
    }
    //top ten streets by count===============================
    $qr6 = "select roadid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as roadid,unnest(speeds)as speed FROM tds WHERE tripid in" . $input . ") as f group by roadid order by count(*) DESC";
    $query6 = $conn->prepare($qr6);
    $query6->execute();
    $record6 = $query6->fetchAll();
    $CStreet_Rank = "";
    for ($i = 0;$i < sizeof($record6);$i++) {
        $CStreet_Rank.= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] . ",";
    }
    //top ten streets by speed===============================
    $qr7 = "select roadid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as roadid,unnest(speeds)as speed FROM tds WHERE tripid in" . $input . ") as f group by roadid order by avg(speed) DESC";
    $query7 = $conn->prepare($qr7);
    $query7->execute();
    $record7 = $query7->fetchAll();
    $SStreet_Rank = "";
    for ($i = 0;$i < sizeof($record7);$i++) {
        $SStreet_Rank.= $record7[$i][0] . ":" . $record7[$i][2] . ":" . $record7[$i][1] . ",";
    }
    $Final_Results = array();
    $Final_Results["WeekDays"] = $Week_Array;
    $Final_Results["DayHours"] = $Hour_Array;
    $Final_Results["road_Array"] = $road_Array;
    $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);;
    $Final_Results["St_Rank_count"] = substr(trim($CStreet_Rank), 0, -1);
    $Final_Results["St_Rank_speed"] = substr(trim($SStreet_Rank), 0, -1);
    return json_encode($Final_Results);
}
if (isset($_POST['trips'])) {
    //$Rcoor  = $_POST['trips'];
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
    $Result = GetEditResults($_POST['trips'], $conn1);
    echo $Result;
}
?>
