<?php

require_once "config.php";

function Rfilter2($input,$conn)
{
  
  
  $input1 = explode("!", $input); 
  
     
// rank trips by trip length===============
 $SQL="SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM tdr "
    . "WHERE tripid in ".$input1[0]." AND EXTRACT(DOW FROM starttime) in (".$input1[2].") AND EXTRACT(HOUR FROM starttime) in (".$input1[1].")  order by St_Length(trip::geography) DESC ";
  
  $query = $conn->prepare($SQL);
  $query->execute();  
  $record = $query->fetchAll();  
  
  $Draw_Array= array();
  $Trip_Rank="";
  
  for($i=0;$i<sizeof($record);$i++)
  {
    $Draw_Array[$record[$i][0]]["trajectorypoints"]= $record[$i][1];	
    $Trip_Rank.=$record[$i][0].":".$record[$i][2].",";
	
  }
  
  //group by region id,time===============
  $SQL1="select regionid,count(*) as count,avg(speed)as avspeed from(SELECT regionid,speed from(SELECT unnest(orids) as regionid,
  unnest(pointstime) as ptime,unnest(speeds)as speed FROM tdr WHERE  tripid in ".$input1[0].")as x where 
  EXTRACT(DOW FROM ptime) in (".$input1[2].") AND EXTRACT(HOUR FROM ptime) in (".$input1[1]."))as x1 group by regionid"; 
  $query1 = $conn->prepare($SQL1);
  $query1->execute();
  $record1 = $query1->fetchAll();
  
  $region_Array=array(); 
  for($i=0;$i<sizeof($record1);$i++)
  {
    $region_Array[$record1[$i][0]]["total_Count"]=$record1[$i][1];
    $region_Array[$record1[$i][0]]["total_AVSpeed"]=$record1[$i][2];
  } 
  //regions rank by count===============================
  
  $SQL2="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT regionid,speed from(SELECT unnest(orids) as regionid,
  unnest(pointstime) as ptime,unnest(speeds)as speed FROM tdr WHERE  tripid in ".$input1[0].")as x where EXTRACT(DOW FROM ptime) in (".$input1[2].") AND EXTRACT(HOUR FROM ptime) 
  in (".$input1[1]."))as x1 group by regionid order by count(*) DESC";
  $query2 = $conn->prepare($SQL2);
  $query2->execute();
  $record2 = $query2->fetchAll();
  $CStreet_Rank="";
  for($i=0;$i<sizeof($record2);$i++)
  {
    $CStreet_Rank.=$record2[$i][0].":".$record2[$i][1].":".$record2[$i][2].",";    
  }
  //regions rank by speed===============================
  
  $SQL3="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT regionid,speed from(SELECT unnest(orids) as regionid,unnest(pointstime) as ptime,
  unnest(speeds)as speed FROM tdr WHERE  tripid in ".$input1[0].")as x where EXTRACT(DOW FROM ptime) in (".$input1[2].") AND EXTRACT(HOUR FROM ptime) in (".$input1[1]."))as 
  x1 group by regionid order by avg(speed) DESC";
  $query3 = $conn->prepare($SQL3);
  $query3->execute();
  $record3 = $query3->fetchAll();
  $SStreet_Rank="";
  for($i=0;$i<sizeof($record3);$i++)
  {
    $SStreet_Rank.=$record3[$i][0].":".$record3[$i][2].":".$record3[$i][1].",";    
  } 
  
 
  
  $Final_Results = array();
  $Final_Results["Draw"]=$Draw_Array;
  $Final_Results["region_Array"]=$region_Array;
  $Final_Results["St_Rank_count"]=substr(trim($CStreet_Rank), 0, -1);
  $Final_Results["St_Rank_speed"]=substr(trim($SStreet_Rank), 0, -1);
  $Final_Results["Trip_Rank"]=substr(trim($Trip_Rank), 0, -1);
  
  return json_encode($Final_Results);
  //return $qr2;
}

if (isset($_POST['para1']))  {
  //$Rcoor  = $_POST['para'];
  $db_user1 = "postgres";
  $db_pass1 = "user";
  $db_name1 = $_POST['DB'];
  $db_server1 = "localhost";
  $db_port1 = "5432";

  try{
    $conn1 = new PDO("pgsql:dbname=$db_name1;host=$db_server1;port=$db_port1", $db_user1, $db_pass1) OR DIE('Unable to connect to database! Please try again later.');
  }catch(PDOException  $e ){
    echo "Error: ".$e;
  }
  $Result = Rfilter2($_POST['para1'],$conn1);
  echo $Result;
}

?>
