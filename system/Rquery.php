<?php

require_once "config.php";

function RGetTripsIntersect($input,$conn)
{
  $input1 = explode("!", $input);
  
  $SQL="with x as (select geom from regions where ST_Intersects(ST_GeomFromText('POLYGON((". $input1[0]."))',4326), geom)) SELECT DISTINCT tripid,ST_AsText(trip) as trajectorypoints,St_Length(trip::geography) as len FROM tdr,x WHERE starttime BETWEEN '".$input1[1]."' AND '".$input1[2]."' AND "; 

  
	 
  if((int)$input1[3]==1)
  {
    $qr = $SQL
    . "ST_Intersects(x.geom, trip) order by St_Length(trip::geography) DESC";    
  }
  elseif ((int)$input1[3]==2) 
  {
    $qr = $SQL
    . "ST_Contains(x.geom, startpoint) order by St_Length(trip::geography) DESC";
  }
  elseif ((int)$input1[3]==3) 
  {
    $qr = $SQL
    . "ST_Contains(x.geom, EndPoint) order by St_Length(trip::geography) DESC";
  }

 
  $query = $conn->prepare($qr);
  $query->execute();
  if (!$query) 
  {
    echo "An error occurred.\n";
    exit;
  }
  $record = $query->fetchAll();  
  $st="(";
  $Draw_Array= array();
  $Trip_Rank="";
  for($i=0;$i<sizeof($record);$i++)
  {
    $Draw_Array[$record[$i][0]]["trajectorypoints"]= $record[$i][1];
    //$Draw_Array[$record[$i][0]]["length"]= $record[$i][2];
	$st.= $record[$i][0].",";
    $Trip_Rank.=$record[$i][0].":".$record[$i][2].",";
  }
  $st2=substr(trim($st), 0, -1);
  $st2.=")";
  

  //group by week days=========================
  $qr1="SELECT startday,array_agg(tripid),count(*) FROM tdr WHERE tripid in".$st2."group by startday order by startday";  
  $query1 = $conn->prepare($qr1);
  $query1->execute();
  $record1 = $query1->fetchAll();
  $Week_Array= array();
  for($i=0;$i<sizeof($record1);$i++)
  {
    $Week_Array[$record1[$i][0]]["total"]= $record1[$i][2];
    $Week_Array[$record1[$i][0]]["Trip_Ids"]= $record1[$i][1];    
  }
  //group by day hours=========================
  $qr2="SELECT starthour,array_agg(tripid),count(*) FROM tdr WHERE tripid in".$st2."group by starthour order by starthour";
  $query2 = $conn->prepare($qr2);
  $query2->execute();
  $record2 = $query2->fetchAll(); 
  $Hour_Array= array();
  for($i=0;$i<sizeof($record2);$i++)
  {
    $Hour_Array[$record2[$i][0]]["total"]= $record2[$i][2];
    $Hour_Array[$record2[$i][0]]["Trip_Ids"]= $record2[$i][1];    
  } 
  //group by region id =========================
  $qr5="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as regionid,unnest(speeds)as speed FROM tdr WHERE tripid in".$st2.") as f group by regionid";

  $query5 = $conn->prepare($qr5);
  $query5->execute();
  $record5 = $query5->fetchAll();
  
  $region_Array=array();
  
  for($i=0;$i<sizeof($record5);$i++)
  {
    $region_Array[$record5[$i][0]]["total_Count"]= $record5[$i][1]; 
    $region_Array[$record5[$i][0]]["total_AVSpeed"]= $record5[$i][2];
    
  }
  //regions rank by count===============================
  $qr6="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as regionid,unnest(speeds)as speed FROM tdr WHERE tripid in".$st2.") as f group by regionid order by count(*) DESC";
   
  $query6 = $conn->prepare($qr6);
  $query6->execute();
  $record6 = $query6->fetchAll();
  $CStreet_Rank="";
  for($i=0;$i<sizeof($record6);$i++)
  {
    $CStreet_Rank.=$record6[$i][0].":".$record6[$i][1].":".$record6[$i][2].",";    
  }
  //regions rank by speed===============================
  $qr7="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as regionid,unnest(speeds)as speed FROM tdr WHERE tripid in".$st2.") as f group by regionid order by avg(speed) DESC"; 
  $query7 = $conn->prepare($qr7);
  $query7->execute();
  $record7 = $query7->fetchAll();
  $SStreet_Rank="";
  for($i=0;$i<sizeof($record7);$i++)
  {
    $SStreet_Rank.=$record7[$i][0].":".$record7[$i][2].":".$record7[$i][1].",";    
  }
  $Final_Results = array();
  $Final_Results["Draw"]=$Draw_Array;
  
  $Final_Results["WeekDays"]=$Week_Array;
  $Final_Results["DayHours"]=$Hour_Array;
  $Final_Results["region_Array"]=$region_Array;
  $Final_Results["Trip_Rank"]=substr(trim($Trip_Rank), 0, -1);
  $Final_Results["St_Rank_count"]=substr(trim($CStreet_Rank), 0, -1);
  $Final_Results["St_Rank_speed"]=substr(trim($SStreet_Rank), 0, -1);
  //$Final_Results["Trip_Rank"]=substr($st2, 1, -1);
  return json_encode($Final_Results);
  
}

if (isset($_POST['cor']))  {
	
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
  
  $Result = RGetTripsIntersect($_POST['cor'],$conn1);
  echo $Result;
}

?>
