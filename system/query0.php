<?php

require_once "config.php";

function GetTripsIntersect($input,$conn)
{
  $input1 = explode("!", $input);
  
  $SQL="SELECT tripid,ST_AsText(trip) as trajectorypoints,speeds FROM GPS_Porto_Trips1 "
    . "WHERE starttime BETWEEN '".$input1[1]."' AND '".$input1[2]."' AND ";
	
  $SQL1="SELECT startday,array_agg(tripid),count(*) FROM GPS_Porto_Trips1 WHERE starttime BETWEEN '"
  .$input1[1]."' AND '".$input1[2]."' AND ";
  
  $SQL2="SELECT starthour,array_agg(tripid),count(*) FROM GPS_Porto_Trips1 WHERE starttime BETWEEN '"
  .$input1[1]."' AND '".$input1[2]."' AND ";
  
  /*$SQL3="select roadid,weekday,count(*) as count,avg(speed)as avspeed from(SELECT tripid,roadid,speed,EXTRACT(DOW FROM ptime)as weekday from(SELECT tripid,unnest(orids) as roadid,unnest(pointstime) as ptime,unnest(speeds)as speed FROM GPS_Porto_Trips1 WHERE starttime BETWEEN '"
  .$input1[1]."' AND '".$input1[2]."' AND ";
  
  $SQL4="select roadid,dayhour,count(*) as count,avg(speed)as avspeed from(SELECT tripid,roadid,speed,EXTRACT(HOUR FROM ptime)as dayhour from(SELECT tripid,unnest(orids) as roadid,unnest(pointstime) as ptime,unnest(speeds)as speed FROM GPS_Porto_Trips1 WHERE starttime BETWEEN '"
  .$input1[1]."' AND '".$input1[2]."' AND ";
  */
  $SQL5="select roadid,count(*) as total,avg(speed)as avspeed from(SELECT tripid,unnest(orids) as roadid,unnest(speeds)as speed FROM GPS_Porto_Trips1 WHERE starttime BETWEEN '"
  .$input1[1]."' AND '".$input1[2]."' AND ";
  if((int)$input1[3]==1){
    $qr = $SQL
    . "ST_Intersects(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), trip)";    
    $qr1 = $SQL1
    . "ST_Intersects(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), trip) group by startday order by startday";
    $qr2 = $SQL2
    . "ST_Intersects(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), trip) group by starthour order by starthour";
  
   /* $qr3 = $SQL3
    . "ST_Intersects(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), trip))as x )as x1 group by roadid,weekday order by weekday";
  
    $qr4 = $SQL4
    . "ST_Intersects(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), trip))as x )as x1 group by roadid,dayhour order by dayhour";
 */
    $qr5 = $SQL5
    . "ST_Intersects(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), trip))as f group by roadid";
  
  }
  elseif ((int)$input1[3]==2) {
    $qr = $SQL
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), startpoint)";
    $qr1 = $SQL1
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), startpoint) group by startday order by startday";
    $qr2 = $SQL2
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), startpoint) group by starthour order by starthour";
  
    /*$qr3 = $SQL3
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), startpoint))as x )as x1 group by roadid,weekday order by weekday ";
   
    $qr4 = $SQL4
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), startpoint))as x )as x1 group by roadid,dayhour order by dayhour ";
 */
    $qr5 = $SQL5
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), startpoint))as f group by roadid";
  
  }
  elseif ((int)$input1[3]==3) {
    $qr = $SQL
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), EndPoint)";
    $qr1 = $SQL1
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), EndPoint) group by startday order by startday";
    $qr2 = $SQL2
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), EndPoint) group by starthour order by starthour";
    /*$qr3 = $SQL3
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), EndPoint))as x )as x1 group by roadid,weekday order by weekday";
    $qr4 = $SQL4
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), EndPoint))as x )as x1 group by roadid,dayhour order by dayhour";
    */
    $qr5 = $SQL5
    . "ST_Contains(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), EndPoint))as f group by roadid";
  
  
  }


  $query = $conn->prepare($qr);
  $query->execute();
  if (!$query) {
    echo "An error occurred.\n";
    exit;
  }
  $record = $query->fetchAll();
  //$json=json_encode($record);
  $query1 = $conn->prepare($qr1);
  $query1->execute();
  $record1 = $query1->fetchAll();
  $query2 = $conn->prepare($qr2);
  $query2->execute();
  $record2 = $query2->fetchAll();
  $Draw_Array= array();
  for($i=0;$i<sizeof($record);$i++)
  {
    $Draw_Array[$record[$i][0]]["trajectorypoints"]= $record[$i][1];
    $Draw_Array[$record[$i][0]]["speeds"]= $record[$i][2];
  }
  $Week_Array= array();
  for($i=0;$i<sizeof($record1);$i++)
  {
    $Week_Array[$record1[$i][0]]["total"]= $record1[$i][2];
    $Week_Array[$record1[$i][0]]["Trip_Ids"]= $record1[$i][1];    
  }
  $Hour_Array= array();
  for($i=0;$i<sizeof($record2);$i++)
  {
    $Hour_Array[$record2[$i][0]]["total"]= $record2[$i][2];
    $Hour_Array[$record2[$i][0]]["Trip_Ids"]= $record2[$i][1];    
  }
  /*$query3 = $conn->prepare($qr3);
  $query3->execute();
  $record3 = $query3->fetchAll();
  $query4 = $conn->prepare($qr4);
  $query4->execute();
  $record4 = $query4->fetchAll();*/
  $query5 = $conn->prepare($qr5);
  $query5->execute();
  $record5 = $query5->fetchAll();
  
  $road_Array=array();
  for($i=0;$i<sizeof($record5);$i++)
  {
    $road_Array[$record5[$i][0]]["total_Count"]= $record5[$i][1]; 
    $road_Array[$record5[$i][0]]["total_AVSpeed"]= $record5[$i][2];
  }
  /*for($i=0;$i<sizeof($record4);$i++)
  {
    $road_Array[$record4[$i][0]]["H_C:".$record4[$i][1]]=$record4[$i][2];
    $road_Array[$record4[$i][0]]["H_S:".$record4[$i][1]]=$record4[$i][3];    
  }
  for($i=0;$i<sizeof($record3);$i++)
  {
    $road_Array[$record3[$i][0]]["WD_C:".$record3[$i][1]]=$record3[$i][2];
    $road_Array[$record3[$i][0]]["WD_S:".$record3[$i][1]]=$record3[$i][3];
  }*/
  
  $Final_Results = array();
  $Final_Results["Draw"]=$Draw_Array;
  $Final_Results["WeekDays"]=$Week_Array;
  $Final_Results["DayHours"]=$Hour_Array;
  $Final_Results["road_Array"]=$road_Array;
  return json_encode($Final_Results);
  //return $qr1;
}

if (isset($_POST['cor']))  {
  //$Rcoor  = $_POST['cor'];
  $Result = GetTripsIntersect($_POST['cor'],$conn);
  echo $Result;
}

?>
