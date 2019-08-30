<?php
require_once "config.php";
function filter2($input, $conn) {
    $input1 = explode("!", $input);
    if ((int)$input1[6] == 4) {
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM (select  tripid,ST_SetSRID(ST_MakeLine(point order by PDateTime),4326) as trip,EXTRACT(DOW FROM min(PDateTime)) as startday,EXTRACT(HOUR FROM min(PDateTime)) as starthour from gps_points_rn where pdatetime BETWEEN '" . $input1[4] . "' AND '" . $input1[5] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[3] . "))',4326), point)  group by tripid ) as x where startday in (" . $input1[2] . ") AND starthour in (" . $input1[1] . ") order by 3 DESC ";
        $query = $conn->prepare($SQL);
        $query->execute();
        $record = $query->fetchAll();
        $Draw_Array = array();
        $Trip_Rank = "";
        for ($i = 0;$i < sizeof($record);$i++) {
            $Draw_Array[$record[$i][0]]["trajectorypoints"] = $record[$i][1];
            $Trip_Rank.= $record[$i][0] . ":" . $record[$i][2] . ",";
        }
        //group by road id,time,road type===============
        $SQL1 = "select roadid,count(*) as count,avg(speed)as avspeed,road_type from(Select  rid as roadid ,highway as road_type,speed,EXTRACT(DOW FROM pdatetime)as day,EXTRACT(HOUR FROM pdatetime)as hour  from gps_points_rn where pdatetime BETWEEN '" . $input1[4] . "' AND '" . $input1[5] . "' And ST_Intersects (ST_GeomFromText('POLYGON((" . $input1[3] . "))',4326), point)) as x where day in (" . $input1[2] . ") AND hour in (" . $input1[1] . ") group by roadid,road_type";
        $query1 = $conn->prepare($SQL1);
        $query1->execute();
        $record1 = $query1->fetchAll();
        $road_Array = array();
        for ($i = 0;$i < sizeof($record1);$i++) {
            $road_Array[$record1[$i][3]][$record1[$i][0]]["total_Count"] = $record1[$i][1];
            $road_Array[$record1[$i][3]][$record1[$i][0]]["total_AVSpeed"] = $record1[$i][2];
        }
        //streets rank by count===============================
        $SQL2 = "select roadid,count(*) as total,avg(speed)as avspeed from (Select  rid as roadid,speed,pdatetime as ptime from gps_points_rn where pdatetime BETWEEN '" . $input1[4] . "' AND '" . $input1[5] . "' And ST_Intersects (ST_GeomFromText('POLYGON((" . $input1[3] . "))',4326), point)) as x where EXTRACT(DOW FROM ptime) in (" . $input1[2] . ") AND EXTRACT(HOUR FROM ptime) in (" . $input1[1] . ") group by roadid order by 2 DESC";
        $query2 = $conn->prepare($SQL2);
        $query2->execute();
        $record2 = $query2->fetchAll();
        $CStreet_Rank = "";
        for ($i = 0;$i < sizeof($record2);$i++) {
            $CStreet_Rank.= $record2[$i][0] . ":" . $record2[$i][1] . ":" . $record2[$i][2] . ",";
        }
        //streets rank by speed===============================
        $SQL3 = "select roadid,count(*) as total,avg(speed)as avspeed from(Select  rid as roadid,speed,pdatetime as ptime from gps_points_rn where pdatetime BETWEEN '" . $input1[4] . "' AND '" . $input1[5] . "' And ST_Intersects (ST_GeomFromText('POLYGON((" . $input1[3] . "))',4326), point)) as x where EXTRACT(DOW FROM ptime) in (" . $input1[2] . ") AND EXTRACT(HOUR FROM ptime) in (" . $input1[1] . ")  group by roadid order by 3 DESC";
        $query3 = $conn->prepare($SQL3);
        $query3->execute();
        $record3 = $query3->fetchAll();
        $SStreet_Rank = "";
        for ($i = 0;$i < sizeof($record3);$i++) {
            $SStreet_Rank.= $record3[$i][0] . ":" . $record3[$i][2] . ":" . $record3[$i][1] . ",";
        }
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["road_Array"] = $road_Array;
        $Final_Results["St_Rank_count"] = substr(trim($CStreet_Rank), 0, -1);
        $Final_Results["St_Rank_speed"] = substr(trim($SStreet_Rank), 0, -1);
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
    } else {
        // rank trips by trip length===============
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM tds " . "WHERE tripid in " . $input1[0] . " AND EXTRACT(DOW FROM starttime) in (" . $input1[2] . ") AND EXTRACT(HOUR FROM starttime) in (" . $input1[1] . ")  order by St_Length(trip::geography) DESC ";
        $query = $conn->prepare($SQL);
        $query->execute();
        $record = $query->fetchAll();
        $Draw_Array = array();
        $Trip_Rank = "";
        for ($i = 0;$i < sizeof($record);$i++) {
            $Draw_Array[$record[$i][0]]["trajectorypoints"] = $record[$i][1];
            $Trip_Rank.= $record[$i][0] . ":" . $record[$i][2] . ",";
        }
        //group by road id,time,road type===============
        $SQL1 = "select roadid,count(*) as count,avg(speed)as avspeed,road_type from(SELECT roadid,speed,road_type from(SELECT unnest(orids) as roadid,
  unnest(pointstime) as ptime,unnest(speeds)as speed,unnest(roads_type)as road_type FROM tds WHERE  tripid in " . $input1[0] . ")as x where 
  EXTRACT(DOW FROM ptime) in (" . $input1[2] . ") AND EXTRACT(HOUR FROM ptime) in (" . $input1[1] . "))as x1 group by roadid,road_type";
        $query1 = $conn->prepare($SQL1);
        $query1->execute();
        $record1 = $query1->fetchAll();
        $road_Array = array();
        for ($i = 0;$i < sizeof($record1);$i++) {
            $road_Array[$record1[$i][3]][$record1[$i][0]]["total_Count"] = $record1[$i][1];
            $road_Array[$record1[$i][3]][$record1[$i][0]]["total_AVSpeed"] = $record1[$i][2];
        }
        //top ten streets by count===============================
        $SQL2 = "select roadid,count(*) as total,avg(speed)as avspeed from(SELECT roadid,speed from(SELECT unnest(orids) as roadid,
  unnest(pointstime) as ptime,unnest(speeds)as speed FROM tds WHERE  tripid in " . $input1[0] . ")as x where EXTRACT(DOW FROM ptime) in (" . $input1[2] . ") AND EXTRACT(HOUR FROM ptime) 
  in (" . $input1[1] . "))as x1 group by roadid order by count(*) DESC";
        $query2 = $conn->prepare($SQL2);
        $query2->execute();
        $record2 = $query2->fetchAll();
        $CStreet_Rank = "";
        for ($i = 0;$i < sizeof($record2);$i++) {
            $CStreet_Rank.= $record2[$i][0] . ":" . $record2[$i][1] . ":" . $record2[$i][2] . ",";
        }
        //top ten streets by speed===============================
        $SQL3 = "select roadid,count(*) as total,avg(speed)as avspeed from(SELECT roadid,speed from(SELECT unnest(orids) as roadid,unnest(pointstime) as ptime,
  unnest(speeds)as speed FROM tds WHERE  tripid in " . $input1[0] . ")as x where EXTRACT(DOW FROM ptime) in (" . $input1[2] . ") AND EXTRACT(HOUR FROM ptime) in (" . $input1[1] . "))as 
  x1 group by roadid order by avg(speed) DESC";
        $query3 = $conn->prepare($SQL3);
        $query3->execute();
        $record3 = $query3->fetchAll();
        $SStreet_Rank = "";
        for ($i = 0;$i < sizeof($record3);$i++) {
            $SStreet_Rank.= $record3[$i][0] . ":" . $record3[$i][2] . ":" . $record3[$i][1] . ",";
        }
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["road_Array"] = $road_Array;
        $Final_Results["St_Rank_count"] = substr(trim($CStreet_Rank), 0, -1);
        $Final_Results["St_Rank_speed"] = substr(trim($SStreet_Rank), 0, -1);
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
    $Result = filter2($_POST['para1'], $conn1);
    echo $Result;
}
?>
