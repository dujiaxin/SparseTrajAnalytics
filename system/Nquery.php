<?php
require_once "config.php";
function NGetTripsIntersect($input, $conn) {
    $input1 = explode("!", $input);
    if ((int)$input1[3] == 4) {
        // get trips withen the region box and rank the trips by trip length===============
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM (Select  tripid,ST_SetSRID(ST_MakeLine(point order by PDateTime),4326) as trip from gps_points1 where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid )as x order by 3 DESC";
        $query = $conn->prepare($SQL);
        $query->execute();
        if (!$query) {
            echo "An error occurred.\n";
            exit;
        }
        $record = $query->fetchAll();
        $Draw_Array = array();
        $Trip_Rank = "";
        for ($i = 0;$i < sizeof($record);$i++) {
            $Draw_Array[$record[$i][0]]["trajectorypoints"] = $record[$i][1];
            $Trip_Rank.= $record[$i][0] . ":" . $record[$i][2] . ",";
        }
        //===============================================================================
        //group by week days=========================
        $qr1 = "SELECT startday,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(DOW FROM min(PDateTime)) as startday from gps_points1 where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by startday order by startday";
        $query1 = $conn->prepare($qr1);
        $query1->execute();
        $record1 = $query1->fetchAll();
        $Week_Array = array();
        for ($i = 0;$i < sizeof($record1);$i++) {
            $Week_Array[$record1[$i][0]]["total"] = $record1[$i][2];
            $Week_Array[$record1[$i][0]]["Trip_Ids"] = $record1[$i][1];
        }
        //===============================================================================
        //group by day hours=========================
        $qr2 = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Hour FROM min(PDateTime)) as starthour from gps_points1 where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by starthour order by starthour";
        $query2 = $conn->prepare($qr2);
        $query2->execute();
        $record2 = $query2->fetchAll();
        $Hour_Array = array();
        for ($i = 0;$i < sizeof($record2);$i++) {
            $Hour_Array[$record2[$i][0]]["total"] = $record2[$i][2];
            $Hour_Array[$record2[$i][0]]["Trip_Ids"] = $record2[$i][1];
        }
        //===============================================================================
        //group by Months=========================
        $qrMonth = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Month FROM min(PDateTime)) as startMonth from gps_points1 where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by startMonth order by startMonth";
        $query3 = $conn->prepare($qrMonth);
        $query3->execute();
        $record3 = $query3->fetchAll();
        $Months_Array = array();
        for ($i = 0, $iMax = sizeof($record3); $i < $iMax; $i++) {
            $Months_Array[$record3[$i][0]]["total"] = $record3[$i][2];
            $Months_Array[$record3[$i][0]]["Trip_Ids"] = $record3[$i][1];
        }
        //===============================================================================
        //group by Year=========================
        $qrYear = "SELECT startYear,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Year FROM min(PDateTime)) as startYear from gps_points1 where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by startYear order by startYear";
        $query4 = $conn->prepare($qrYear);
        $query4->execute();
        $record4 = $query4->fetchAll();
        $Years_Array = array();
        for ($i = 0, $iMax = sizeof($record4); $i < $iMax; $i++) {
            $Years_Array[$record4[$i][0]]["total"] = $record4[$i][2];
            $Years_Array[$record4[$i][0]]["Trip_Ids"] = $record4[$i][1];
        }
        //===============================================================================
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
        $Final_Results["WeekDays"] = $Week_Array;
        $Final_Results["DayHours"] = $Hour_Array;
        $Final_Results["Months"] = $Months_Array;
        $Final_Results["Years"] = $Years_Array;
        $Final_Results["road_Array"] = "0";
        $Final_Results["St_Rank_count"] = "0";
        $Final_Results["St_Rank_speed"] = "0";
    } 
	else {
       
		 $SQL="SELECT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM td "
		. "WHERE starttime BETWEEN '".$input1[1]."' AND '".$input1[2]."' AND ";
		 
	  if((int)$input1[3]==1){
		$qr = $SQL
		. "ST_Intersects(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), trip) order by 3 DESC";    
	  }
	  elseif ((int)$input1[3]==2) {
		$qr = $SQL
		. "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), startpoint) order by 3 DESC";
	  }
	  elseif ((int)$input1[3]==3) {
		$qr = $SQL
		. "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), EndPoint) order by 3 DESC";
	  }
        $query = $conn->prepare($qr);
        $query->execute();
        if (!$query) {
            echo "An error occurred.\n";
            exit;
        }
        $record = $query->fetchAll();
        $st = "(";
        $Draw_Array = array();
        $Trip_Rank = "";
        for ($i = 0;$i < sizeof($record);$i++) {
            $Draw_Array[$record[$i][0]]["trajectorypoints"] = $record[$i][1];
            //$Draw_Array[$record[$i][0]]["length"]= $record[$i][2];
            $st.= $record[$i][0] . ",";
            $Trip_Rank.= $record[$i][0] . ":" . $record[$i][2] . ",";
        }
        $st2 = substr(trim($st), 0, -1);
        $st2.= ")";
        //group by week days=========================
        $qr1 = "SELECT startday,array_agg(tripid),count(*) FROM td WHERE tripid in" . $st2 . "group by startday order by startday";
        $query1 = $conn->prepare($qr1);
        $query1->execute();
        $record1 = $query1->fetchAll();
        $Week_Array = array();
        for ($i = 0;$i < sizeof($record1);$i++) {
            $Week_Array[$record1[$i][0]]["total"] = $record1[$i][2];
            $Week_Array[$record1[$i][0]]["Trip_Ids"] = $record1[$i][1];
        }
        //group by day hours=========================
        $qr2 = "SELECT starthour,array_agg(tripid),count(*) FROM td WHERE tripid in" . $st2 . "group by starthour order by starthour";
        $query2 = $conn->prepare($qr2);
        $query2->execute();
        $record2 = $query2->fetchAll();
        $Hour_Array = array();
        for ($i = 0;$i < sizeof($record2);$i++) {
            $Hour_Array[$record2[$i][0]]["total"] = $record2[$i][2];
            $Hour_Array[$record2[$i][0]]["Trip_Ids"] = $record2[$i][1];
        }
        //group by Months=========================
        $qrMonth = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Month FROM min(starttime)) as startMonth from td WHERE tripid in" . $st2 . " group by tripid ) as x group by startMonth order by startMonth";
        $queryMonth = $conn->prepare($qrMonth);
        $queryMonth->execute();
        $recordMonth = $queryMonth->fetchAll();
        $Months_Array = array();
        for ($i = 0, $iMax = sizeof($recordMonth); $i < $iMax; $i++) {
            $Months_Array[$recordMonth[$i][0]]["total"] = $recordMonth[$i][2];
            $Months_Array[$recordMonth[$i][0]]["Trip_Ids"] = $recordMonth[$i][1];
        }
        //group by Years=========================
        $qrYear = "SELECT startYear,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Year FROM min(starttime)) as startYear from td WHERE tripid in" . $st2 . " group by tripid ) as x group by startYear order by startYear";
        $queryYear = $conn->prepare($qrYear);
        $queryYear->execute();
        $recordYear = $queryYear->fetchAll();
        $Years_Array = array();
        for ($i = 0, $iMax = sizeof($recordYear); $i < $iMax; $i++) {
            $Years_Array[$recordYear[$i][0]]["total"] = $recordYear[$i][2];
            $Years_Array[$recordYear[$i][0]]["Trip_Ids"] = $recordYear[$i][1];
        }
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["WeekDays"] = $Week_Array;
        $Final_Results["DayHours"] = $Hour_Array;
        $Final_Results["Months"] = $Months_Array;
        $Final_Results["Years"] = $Years_Array;
        $Final_Results["road_Array"] = "0";
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
        $Final_Results["St_Rank_count"] = "0";
        $Final_Results["St_Rank_speed"] = "0";
    
    }
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
    $Result = NGetTripsIntersect($_POST['cor'], $conn1);
    echo $Result;
}
?>
