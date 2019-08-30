<?php

require_once "config.php";

function RGetEditResults($input,$conn)
{
  

  
  //group by week days=========================
  $Eqr1="SELECT startday,array_agg(tripid),count(*) FROM tdr WHERE tripid in ".$input."group by startday order by startday";    
  $query1 = $conn->prepare($Eqr1);
  $query1->execute();
  $record1 = $query1->fetchAll();
  $Week_Array= array();
  for($i=0;$i<sizeof($record1);$i++)
  {
    $Week_Array[$record1[$i][0]]["total"]= $record1[$i][2];
    $Week_Array[$record1[$i][0]]["Trip_Ids"]= $record1[$i][1];    
  }
  //group by day hours=========================
  $Eqr2="SELECT starthour,array_agg(tripid),count(*) FROM tdr WHERE tripid in ".$input."group by starthour order by starthour";
  $query2 = $conn->prepare($Eqr2);
  $query2->execute();
  $record2 = $query2->fetchAll(); 
  $Hour_Array= array();
  for($i=0;$i<sizeof($record2);$i++)
  {
    $Hour_Array[$record2[$i][0]]["total"]= $record2[$i][2];
    $Hour_Array[$record2[$i][0]]["Trip_Ids"]= $record2[$i][1];    
  }
  //group by Months=========================
  $qrMonth = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Month FROM min(starttime)) as startMonth from tdr WHERE tripid in" . $input . " group by tripid ) as x group by startMonth order by startMonth";
  $queryMonth = $conn->prepare($qrMonth);
  $queryMonth->execute();
  $recordMonth = $queryMonth->fetchAll();
  $Months_Array = array();
  for ($i = 0, $iMax = sizeof($recordMonth); $i < $iMax; $i++) {
    $Months_Array[$recordMonth[$i][0]]["total"] = $recordMonth[$i][2];
    $Months_Array[$recordMonth[$i][0]]["Trip_Ids"] = $recordMonth[$i][1];
  }
  //group by Years=========================
  $qrYear = "SELECT startYear,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Year FROM min(starttime)) as startYear from tdr WHERE tripid in" . $input . " group by tripid ) as x group by startYear order by startYear";
  $queryYear = $conn->prepare($qrYear);
  $queryYear->execute();
  $recordYear = $queryYear->fetchAll();
  $Years_Array = array();
  for ($i = 0, $iMax = sizeof($recordYear); $i < $iMax; $i++) {
    $Years_Array[$recordYear[$i][0]]["total"] = $recordYear[$i][2];
    $Years_Array[$recordYear[$i][0]]["Trip_Ids"] = $recordYear[$i][1];
  }
  //group by region id=========================
  $qr5="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as regionid,unnest(speeds)as speed FROM tdr WHERE tripid in".$input.") as f group by regionid";
  $query5 = $conn->prepare($qr5);
  $query5->execute();
  $record5 = $query5->fetchAll();
  
  $region_Array=array();
  
  for($i=0;$i<sizeof($record5);$i++)
  {
    $region_Array[$record5[$i][0]]["total_Count"]= $record5[$i][1]; 
    $region_Array[$record5[$i][0]]["total_AVSpeed"]= $record5[$i][2];
  }
  //Rank trips by trip length====================
  $Eqr3="SELECT DISTINCT tripid,St_Length(trip::geography) as len FROM tdr WHERE tripid in ".$input."order by St_Length(trip::geography) DESC";    
  $query3 = $conn->prepare($Eqr3);
  $query3->execute();
  $record3 = $query3->fetchAll();
  $Trip_Rank="";
  for($i=0;$i<sizeof($record3);$i++)
  {
    $Trip_Rank.=$record3[$i][0].":".$record3[$i][1].",";
    //$Trip_Rank.=$record3[$i][0].",";
  }
  //streets rank by count===============================
  //$qr6="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as regionid,unnest(speeds)as speed FROM tdr WHERE tripid in".$input.") as f group by regionid order by count(*) DESC limit 10";
  $qr6="select regionid,count(*) as total,avg(speed)as avspeed,MAX(speed) as maxspeed,MIN(speed) as minspeed from(SELECT unnest(orids) as regionid,unnest(speeds)as speed FROM tdr WHERE tripid in".$input.") as f group by regionid order by count(*) DESC";
  $query6 = $conn->prepare($qr6);
  $query6->execute();
  $record6 = $query6->fetchAll();
  $CStreet_Rank="";
  $Data_For_SCP = "";
  for($i=0;$i<sizeof($record6);$i++)
  {
    $CStreet_Rank.=$record6[$i][0].":".$record6[$i][1].":".$record6[$i][2].",";
	$Data_For_SCP .= $record6[$i][0].":".$record6[$i][1].":".$record6[$i][2].":".$record6[$i][3].":".$record6[$i][4].",";
  }
  //streets rank by speed===============================
  //$qr7="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as regionid,unnest(speeds)as speed FROM tdr WHERE tripid in".$input.") as f group by regionid order by avg(speed) DESC limit 10";
  $qr7="select regionid,count(*) as total,avg(speed)as avspeed from(SELECT unnest(orids) as regionid,unnest(speeds)as speed FROM tdr WHERE tripid in".$input.") as f group by regionid order by avg(speed) DESC";  
  $query7 = $conn->prepare($qr7);
  $query7->execute();
  $record7 = $query7->fetchAll();
  $SStreet_Rank="";
  for($i=0;$i<sizeof($record7);$i++)
  {
    $SStreet_Rank.=$record7[$i][0].":".$record7[$i][2].":".$record7[$i][1].",";    
  } 
  $Final_Results = array(); 
  $Final_Results["WeekDays"]=$Week_Array;
  $Final_Results["DayHours"]=$Hour_Array;
  $Final_Results["Months"] = $Months_Array;
  $Final_Results["Years"] = $Years_Array;
  $Final_Results["region_Array"]=$region_Array;
  $Final_Results["Trip_Rank"]=substr(trim($Trip_Rank), 0, -1);;
  $Final_Results["St_Rank_count"]=substr(trim($CStreet_Rank), 0, -1);
  $Final_Results["St_Rank_speed"]=substr(trim($SStreet_Rank), 0, -1);
  $Final_Results["Data_For_SCP"] = substr(trim($Data_For_SCP), 0, -1);

  return json_encode($Final_Results);
 
}

if (isset($_POST['trips']))  {
  //$Rcoor  = $_POST['trips'];
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
  $Result = RGetEditResults($_POST['trips'],$conn1);
  echo $Result;
}

?>
