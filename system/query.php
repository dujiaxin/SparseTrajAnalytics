<?php
require_once "config.php";
function GetTripsIntersect($input, $conn) {
    $input1 = explode("!", $input);
	
	if(count($input1) > 4 && (int)$input1[5] == 1)
	{
		if ((int)$input1[3] == 4) {
        // get trips withen the region box and rank the trips by trip length===============
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM (Select  tripid,ST_SetSRID(ST_MakeLine(point order by PDateTime),4326) as trip from gps_points_rn where rid in " .$input1[4]. " AND pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid )as x order by 3 DESC";
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
        $qr1 = "SELECT startday,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(DOW FROM min(PDateTime)) as startday from gps_points_rn where rid in " .$input1[4]. " AND pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by startday order by startday";
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
        $qr2 = "SELECT starthour,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Hour FROM min(PDateTime)) as starthour from gps_points_rn where rid in " .$input1[4]. " AND pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by starthour order by starthour";
        $query2 = $conn->prepare($qr2);
        $query2->execute();
        $record2 = $query2->fetchAll();
        $Hour_Array = array();
        for ($i = 0;$i < sizeof($record2);$i++) {
            $Hour_Array[$record2[$i][0]]["total"] = $record2[$i][2];
            $Hour_Array[$record2[$i][0]]["Trip_Ids"] = $record2[$i][1];
        }
        //group by Months=========================
        $qrMonth = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Month FROM min(PDateTime)) as startMonth from gps_points_rn WHERE tripid in" . $input1[4] . " AND pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by startMonth order by startMonth";
        $queryMonth = $conn->prepare($qrMonth);
        $queryMonth->execute();
        $recordMonth = $queryMonth->fetchAll();
        $Months_Array = array();
        for ($i = 0, $iMax = sizeof($recordMonth); $i < $iMax; $i++) {
            $Months_Array[$recordMonth[$i][0]]["total"] = $recordMonth[$i][2];
            $Months_Array[$recordMonth[$i][0]]["Trip_Ids"] = $recordMonth[$i][1];
        }
        //group by Years=========================
        $qrYear = "SELECT startYear,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Year FROM min(PDateTime)) as startYear from gps_points_rn WHERE tripid in" . $input1[4] . " AND pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by tripid ) as x group by startYear order by startYear";
        $queryYear = $conn->prepare($qrYear);
        $queryYear->execute();
        $recordYear = $queryYear->fetchAll();
        $Years_Array = array();
        for ($i = 0, $iMax = sizeof($recordYear); $i < $iMax; $i++) {
            $Years_Array[$recordYear[$i][0]]["total"] = $recordYear[$i][2];
            $Years_Array[$recordYear[$i][0]]["Trip_Ids"] = $recordYear[$i][1];
        }
        //===============================================================================
        //group by road id and road type=========================
        $qr5 = "select roadid,count(*) as total,avg(speed)as avspeed,road_type from( Select  rid as roadid ,highway as road_type,speed from gps_points_rn where rid in " .$input1[4]. " AND pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) )as f group by roadid,road_type";
        $query5 = $conn->prepare($qr5);
        $query5->execute();
        $record5 = $query5->fetchAll();
        $road_Array = array();
        for ($i = 0;$i < sizeof($record5);$i++) {
            $road_Array[$record5[$i][3]][$record5[$i][0]]["total_Count"] = $record5[$i][1];
            $road_Array[$record5[$i][3]][$record5[$i][0]]["total_AVSpeed"] = $record5[$i][2];
        }
        //streets rank by count==========================================================
        $qr6 = "select roadid,count(*) as total,avg(speed)as avspeed, MAX(speed) as maxspeed, MIN(speed) as minspeed from(Select  rid as roadid,speed from gps_points_rn where rid in " .$input1[4]. " AND pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point)) as f group by roadid order by 2 DESC";
        $query6 = $conn->prepare($qr6);
        $query6->execute();
        $record6 = $query6->fetchAll();
        $CStreet_Rank = "";
		$Data_For_SCP = "";
        for ($i = 0;$i < sizeof($record6);$i++) {
            $CStreet_Rank.= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] . ",";
            $Data_For_SCP .= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] .":" . $record6[$i][3] .":" . $record6[$i][4] . ",";
		}
        //streets rank by speed===============================
        $qr7 = "select roadid,count(*) as total,avg(speed)as avspeed from(Select  rid as roadid,speed from gps_points_rn where rid in " .$input1[4]. " AND pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point)) as f group by roadid order by 3 DESC";
        $query7 = $conn->prepare($qr7);
        $query7->execute();
        $record7 = $query7->fetchAll();
        $SStreet_Rank = "";
        for ($i = 0;$i < sizeof($record7);$i++) {
            $SStreet_Rank.= $record7[$i][0] . ":" . $record7[$i][2] . ":" . $record7[$i][1] . ",";
        }
        //===============================================================================
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
        $Final_Results["WeekDays"] = $Week_Array;
        $Final_Results["DayHours"] = $Hour_Array;
        $Final_Results["Months"] = $Months_Array;
        $Final_Results["Years"] = $Years_Array;
        $Final_Results["road_Array"] = $road_Array;
        $Final_Results["St_Rank_count"] = substr(trim($CStreet_Rank), 0, -1);
        $Final_Results["St_Rank_speed"] = substr(trim($SStreet_Rank), 0, -1);
		$Final_Results["Data_For_SCP"] = substr(trim($Data_For_SCP), 0, -1);
    } else {
		
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM  (SELECT orids,
           generate_subscripts(orids, 1) AS s,tripid,starttime,trip,startpoint,EndPoint
      FROM tds) AS foo WHERE orids[s] in  " .$input1[4]. " AND starttime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' AND ";
        if ((int)$input1[3] == 1) {
            $qr = $SQL . "ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), trip) order by St_Length(trip::geography) DESC";
        } elseif ((int)$input1[3] == 2) {
            $qr = $SQL . "ST_Contains(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), startpoint) order by St_Length(trip::geography) DESC";
        } elseif ((int)$input1[3] == 3) {
            $qr = $SQL . "ST_Contains(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), EndPoint) order by St_Length(trip::geography) DESC";
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
        $qr1 = "SELECT startday,array_agg(tripid),count(*) FROM tds WHERE tripid in" . $st2 . "group by startday order by startday";
        $query1 = $conn->prepare($qr1);
        $query1->execute();
        $record1 = $query1->fetchAll();
        $Week_Array = array();
        for ($i = 0;$i < sizeof($record1);$i++) {
            $Week_Array[$record1[$i][0]]["total"] = $record1[$i][2];
            $Week_Array[$record1[$i][0]]["Trip_Ids"] = $record1[$i][1];
        }
        //group by day hours=========================
        $qr2 = "SELECT starthour,array_agg(tripid),count(*) FROM tds WHERE tripid in" . $st2 . "group by starthour order by starthour";
        $query2 = $conn->prepare($qr2);
        $query2->execute();
        $record2 = $query2->fetchAll();
        $Hour_Array = array();
        for ($i = 0;$i < sizeof($record2);$i++) {
            $Hour_Array[$record2[$i][0]]["total"] = $record2[$i][2];
            $Hour_Array[$record2[$i][0]]["Trip_Ids"] = $record2[$i][1];
        }
        //group by Months=========================
        $qrMonth = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Month FROM min(starttime)) as startMonth from tds WHERE tripid in" . $st2 . " group by tripid ) as x group by startMonth order by startMonth";
        $queryMonth = $conn->prepare($qrMonth);
        $queryMonth->execute();
        $recordMonth = $queryMonth->fetchAll();
        $Months_Array = array();
        for ($i = 0, $iMax = sizeof($recordMonth); $i < $iMax; $i++) {
            $Months_Array[$recordMonth[$i][0]]["total"] = $recordMonth[$i][2];
            $Months_Array[$recordMonth[$i][0]]["Trip_Ids"] = $recordMonth[$i][1];
        }
        //group by Years=========================
        $qrYear = "SELECT startYear,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Year FROM min(starttime)) as startYear from tds WHERE tripid in" . $st2 . " group by tripid ) as x group by startYear order by startYear";
        $queryYear = $conn->prepare($qrYear);
        $queryYear->execute();
        $recordYear = $queryYear->fetchAll();
        $Years_Array = array();
        for ($i = 0, $iMax = sizeof($recordYear); $i < $iMax; $i++) {
            $Years_Array[$recordYear[$i][0]]["total"] = $recordYear[$i][2];
            $Years_Array[$recordYear[$i][0]]["Trip_Ids"] = $recordYear[$i][1];
        }
        //group by road id and road type=========================
        //$qr5="select roadid,count(*) as total,avg(speed)as avspeed from(SELECT tripid,unnest(orids) as roadid,unnest(speeds)as speed FROM tds WHERE tripid in".$st2.") as f group by roadid";
        $qr5 = "select roadid,count(*) as total,avg(speed)as avspeed,road_type from(SELECT unnest(orids) as roadid,unnest(speeds)as speed,unnest(roads_type)as road_type FROM tds WHERE tripid in" . $st2 . ")  as f  where roadid in " .$input1[4]. " group by roadid,road_type";
        $query5 = $conn->prepare($qr5);
        $query5->execute();
        $record5 = $query5->fetchAll();
        $road_Array = array();
        for ($i = 0;$i < sizeof($record5);$i++) {
            $road_Array[$record5[$i][3]][$record5[$i][0]]["total_Count"] = $record5[$i][1];
            $road_Array[$record5[$i][3]][$record5[$i][0]]["total_AVSpeed"] = $record5[$i][2];
        }
        //top ten streets by count===============================
        $qr6 = "select roadid,count(*) as total,avg(speed)as avspeed, MAX(speed) as maxspeed, MIN(speed) as minSpeed from(SELECT unnest(orids) as roadid,unnest(speeds)as speed FROM tds WHERE tripid in" . $st2 . ") as f where roadid in " .$input1[4]. " group by roadid order by count(*) DESC";
        $query6 = $conn->prepare($qr6);
        $query6->execute();
        $record6 = $query6->fetchAll();
        $CStreet_Rank = "";
		$Data_For_SCP = "";
        for ($i = 0;$i < sizeof($record6);$i++) {
            $CStreet_Rank.= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] . ",";
			$Data_For_SCP .= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] . ":" . $record6[$i][3] . ":" . $record6[$i][4] . ",";
        }
        //top ten streets by speed===============================
        $qr7 = "select roadid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as roadid,unnest(speeds)as speed FROM tds WHERE tripid in" . $st2 . ") as f where roadid in " .$input1[4]. " group by roadid order by avg(speed) DESC";
        $query7 = $conn->prepare($qr7);
        $query7->execute();
        $record7 = $query7->fetchAll();
        $SStreet_Rank = "";
        for ($i = 0;$i < sizeof($record7);$i++) {
            $SStreet_Rank.= $record7[$i][0] . ":" . $record7[$i][2] . ":" . $record7[$i][1] . ",";
        }
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["WeekDays"] = $Week_Array;
        $Final_Results["DayHours"] = $Hour_Array;
        $Final_Results["Months"] = $Months_Array;
        $Final_Results["Years"] = $Years_Array;
        $Final_Results["road_Array"] = $road_Array;
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
        $Final_Results["St_Rank_count"] = substr(trim($CStreet_Rank), 0, -1);
        $Final_Results["St_Rank_speed"] = substr(trim($SStreet_Rank), 0, -1);
        $Final_Results["Data_For_SCP"] = substr(trim($Data_For_SCP), 0, -1);
        
    }
		
	}
 else {
    if ((int)$input1[3] == 4) {
        // get trips withen the region box and rank the trips by trip length===============
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM (Select  tripid,ST_SetSRID(ST_MakeLine(point order by PDateTime),4326) as trip from gps_points_rn where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid )as x order by 3 DESC";
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
        $qr1 = "SELECT startday,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(DOW FROM min(PDateTime)) as startday from gps_points_rn where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by startday order by startday";
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
        $qr2 = "SELECT starthour,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Hour FROM min(PDateTime)) as starthour from gps_points_rn where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by starthour order by starthour";
        $query2 = $conn->prepare($qr2);
        $query2->execute();
        $record2 = $query2->fetchAll();
        $Hour_Array = array();
        for ($i = 0;$i < sizeof($record2);$i++) {
            $Hour_Array[$record2[$i][0]]["total"] = $record2[$i][2];
            $Hour_Array[$record2[$i][0]]["Trip_Ids"] = $record2[$i][1];
        }
        //group by Months=========================
        $qrMonth = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Month FROM min(PDateTime)) as startMonth from gps_points_rn where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by startMonth order by startMonth";
        $queryMonth = $conn->prepare($qrMonth);
        $queryMonth->execute();
        $recordMonth = $queryMonth->fetchAll();
        $Months_Array = array();
        for ($i = 0, $iMax = sizeof($recordMonth); $i < $iMax; $i++) {
            $Months_Array[$recordMonth[$i][0]]["total"] = $recordMonth[$i][2];
            $Months_Array[$recordMonth[$i][0]]["Trip_Ids"] = $recordMonth[$i][1];
        }
        //group by Years=========================
        $qrYear = "SELECT startYear,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Year FROM min(PDateTime)) as startYear from gps_points_rn where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) group by tripid ) as x group by startYear order by startYear";
        $queryYear = $conn->prepare($qrYear);
        $queryYear->execute();
        $recordYear = $queryYear->fetchAll();
        $Years_Array = array();
        for ($i = 0, $iMax = sizeof($recordYear); $i < $iMax; $i++) {
            $Years_Array[$recordYear[$i][0]]["total"] = $recordYear[$i][2];
            $Years_Array[$recordYear[$i][0]]["Trip_Ids"] = $recordYear[$i][1];
        }
        //===============================================================================
        //group by road id and road type=========================
        $qr5 = "select roadid,count(*) as total,avg(speed)as avspeed,road_type from( Select  rid as roadid ,highway as road_type,speed from gps_points_rn where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point) )as f group by roadid,road_type";
        $query5 = $conn->prepare($qr5);
        $query5->execute();
        $record5 = $query5->fetchAll();
        $road_Array = array();
        for ($i = 0;$i < sizeof($record5);$i++) {
            $road_Array[$record5[$i][3]][$record5[$i][0]]["total_Count"] = $record5[$i][1];
            $road_Array[$record5[$i][3]][$record5[$i][0]]["total_AVSpeed"] = $record5[$i][2];
        }
        //streets rank by count==========================================================
        $qr6 = "select roadid,count(*) as total,avg(speed)as avspeed, MAX(speed) as maxspeed, MIN(speed) as minspeed from(Select  rid as roadid,speed from gps_points_rn where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point)) as f group by roadid order by 2 DESC";
        $query6 = $conn->prepare($qr6);
        $query6->execute();
        $record6 = $query6->fetchAll();
        $CStreet_Rank = "";
		$Data_For_SCP = "";
        for ($i = 0;$i < sizeof($record6);$i++) {
            $CStreet_Rank.= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] . ",";
            $Data_For_SCP .= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] .":" . $record6[$i][3] .":" . $record6[$i][4] . ",";
		}
        //streets rank by speed===============================
        $qr7 = "select roadid,count(*) as total,avg(speed)as avspeed from(Select  rid as roadid,speed from gps_points_rn where pdatetime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' And ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), point)) as f group by roadid order by 3 DESC";
        $query7 = $conn->prepare($qr7);
        $query7->execute();
        $record7 = $query7->fetchAll();
        $SStreet_Rank = "";
        for ($i = 0;$i < sizeof($record7);$i++) {
            $SStreet_Rank.= $record7[$i][0] . ":" . $record7[$i][2] . ":" . $record7[$i][1] . ",";
        }
        //===============================================================================
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
        $Final_Results["WeekDays"] = $Week_Array;
        $Final_Results["DayHours"] = $Hour_Array;
        $Final_Results["Months"] = $Months_Array;
        $Final_Results["Years"] = $Years_Array;
        $Final_Results["road_Array"] = $road_Array;
        $Final_Results["St_Rank_count"] = substr(trim($CStreet_Rank), 0, -1);
        $Final_Results["St_Rank_speed"] = substr(trim($SStreet_Rank), 0, -1);
		$Final_Results["Data_For_SCP"] = substr(trim($Data_For_SCP), 0, -1);
    } else {
        $SQL = "SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM tds " . "WHERE starttime BETWEEN '" . $input1[1] . "' AND '" . $input1[2] . "' AND ";
        if ((int)$input1[3] == 1) {
            $qr = $SQL . "ST_Intersects(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), trip) order by St_Length(trip::geography) DESC";
        } elseif ((int)$input1[3] == 2) {
            $qr = $SQL . "ST_Contains(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), startpoint) order by St_Length(trip::geography) DESC";
        } elseif ((int)$input1[3] == 3) {
            $qr = $SQL . "ST_Contains(ST_GeomFromText('POLYGON((" . $input1[0] . "))',4326), EndPoint) order by St_Length(trip::geography) DESC";
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
        $qr1 = "SELECT startday,array_agg(tripid),count(*) FROM tds WHERE tripid in" . $st2 . "group by startday order by startday";
        $query1 = $conn->prepare($qr1);
        $query1->execute();
        $record1 = $query1->fetchAll();
        $Week_Array = array();
        for ($i = 0;$i < sizeof($record1);$i++) {
            $Week_Array[$record1[$i][0]]["total"] = $record1[$i][2];
            $Week_Array[$record1[$i][0]]["Trip_Ids"] = $record1[$i][1];
        }
        //group by day hours=========================
        $qr2 = "SELECT starthour,array_agg(tripid),count(*) FROM tds WHERE tripid in" . $st2 . "group by starthour order by starthour";
        $query2 = $conn->prepare($qr2);
        $query2->execute();
        $record2 = $query2->fetchAll();
        $Hour_Array = array();
        for ($i = 0;$i < sizeof($record2);$i++) {
            $Hour_Array[$record2[$i][0]]["total"] = $record2[$i][2];
            $Hour_Array[$record2[$i][0]]["Trip_Ids"] = $record2[$i][1];
        }
        //group by Months=========================
        $qrMonth = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Month FROM min(starttime)) as startMonth from tds WHERE tripid in" . $st2 . " group by tripid ) as x group by startMonth order by startMonth";
        $queryMonth = $conn->prepare($qrMonth);
        $queryMonth->execute();
        $recordMonth = $queryMonth->fetchAll();
        $Months_Array = array();
        for ($i = 0, $iMax = sizeof($recordMonth); $i < $iMax; $i++) {
            $Months_Array[$recordMonth[$i][0]]["total"] = $recordMonth[$i][2];
            $Months_Array[$recordMonth[$i][0]]["Trip_Ids"] = $recordMonth[$i][1];
        }
        //group by Years=========================
        $qrYear = "SELECT startYear,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Year FROM min(starttime)) as startYear from tds WHERE tripid in" . $st2 . " group by tripid ) as x group by startYear order by startYear";
        $queryYear = $conn->prepare($qrYear);
        $queryYear->execute();
        $recordYear = $queryYear->fetchAll();
        $Years_Array = array();
        for ($i = 0, $iMax = sizeof($recordYear); $i < $iMax; $i++) {
            $Years_Array[$recordYear[$i][0]]["total"] = $recordYear[$i][2];
            $Years_Array[$recordYear[$i][0]]["Trip_Ids"] = $recordYear[$i][1];
        }
        //group by road id and road type=========================
        //$qr5="select roadid,count(*) as total,avg(speed)as avspeed from(SELECT tripid,unnest(orids) as roadid,unnest(speeds)as speed FROM tds WHERE tripid in".$st2.") as f group by roadid";
        $qr5 = "select roadid,count(*) as total,avg(speed)as avspeed,road_type from(SELECT unnest(orids) as roadid,unnest(speeds)as speed,unnest(roads_type)as road_type FROM tds WHERE tripid in" . $st2 . ") as f group by roadid,road_type";
        $query5 = $conn->prepare($qr5);
        $query5->execute();
        $record5 = $query5->fetchAll();
        $road_Array = array();
        for ($i = 0;$i < sizeof($record5);$i++) {
            $road_Array[$record5[$i][3]][$record5[$i][0]]["total_Count"] = $record5[$i][1];
            $road_Array[$record5[$i][3]][$record5[$i][0]]["total_AVSpeed"] = $record5[$i][2];
        }
        //top ten streets by count===============================
        $qr6 = "select roadid,count(*) as total,avg(speed)as avspeed, MAX(speed) as maxspeed, MIN(speed) as minSpeed from(SELECT unnest(orids) as roadid,unnest(speeds)as speed FROM tds WHERE tripid in" . $st2 . ") as f group by roadid order by count(*) DESC";
        $query6 = $conn->prepare($qr6);
        $query6->execute();
        $record6 = $query6->fetchAll();
        $CStreet_Rank = "";
		$Data_For_SCP = "";
        for ($i = 0;$i < sizeof($record6);$i++) {
            $CStreet_Rank.= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] . ",";
			$Data_For_SCP .= $record6[$i][0] . ":" . $record6[$i][1] . ":" . $record6[$i][2] . ":" . $record6[$i][3] . ":" . $record6[$i][4] . ",";
        }
        //top ten streets by speed===============================
        $qr7 = "select roadid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as roadid,unnest(speeds)as speed FROM tds WHERE tripid in" . $st2 . ") as f group by roadid order by avg(speed) DESC";
        $query7 = $conn->prepare($qr7);
        $query7->execute();
        $record7 = $query7->fetchAll();
        $SStreet_Rank = "";
        for ($i = 0;$i < sizeof($record7);$i++) {
            $SStreet_Rank.= $record7[$i][0] . ":" . $record7[$i][2] . ":" . $record7[$i][1] . ",";
        }
        $Final_Results = array();
        $Final_Results["Draw"] = $Draw_Array;
        $Final_Results["WeekDays"] = $Week_Array;
        $Final_Results["DayHours"] = $Hour_Array;
        $Final_Results["Months"] = $Months_Array;
        $Final_Results["Years"] = $Years_Array;
        $Final_Results["road_Array"] = $road_Array;
        $Final_Results["Trip_Rank"] = substr(trim($Trip_Rank), 0, -1);
        $Final_Results["St_Rank_count"] = substr(trim($CStreet_Rank), 0, -1);
        $Final_Results["St_Rank_speed"] = substr(trim($SStreet_Rank), 0, -1);
        $Final_Results["Data_For_SCP"] = substr(trim($Data_For_SCP), 0, -1);
        
    }
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
    $Result = GetTripsIntersect($_POST['cor'], $conn1);
    echo $Result;
}
?>
