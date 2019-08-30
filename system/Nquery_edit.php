<?php

require_once "config.php";

function NGetEditResults($input,$conn)
{
  //group by week days=========================
  $Eqr1="SELECT startday,array_agg(tripid),count(*) FROM td WHERE tripid in ".$input."group by startday order by startday";    
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
  $Eqr2="SELECT starthour,array_agg(tripid),count(*) FROM td WHERE tripid in ".$input."group by starthour order by starthour";
  $query2 = $conn->prepare($Eqr2);
  $query2->execute();
  $record2 = $query2->fetchAll(); 
  $Hour_Array= array();
  for($i=0;$i<sizeof($record2);$i++)
  {
    $Hour_Array[$record2[$i][0]]["total"]= $record2[$i][2];
    $Hour_Array[$record2[$i][0]]["Trip_Ids"]= $record2[$i][1];    
  }
  
  //Rank trips by trip length====================
  $Eqr3="SELECT DISTINCT tripid,St_Length(trip::geography) as len FROM td WHERE tripid in ".$input."order by St_Length(trip::geography) DESC";    
  $query3 = $conn->prepare($Eqr3);
  $query3->execute();
  $record3 = $query3->fetchAll();
  $Trip_Rank="";
  for($i=0;$i<sizeof($record3);$i++)
  {
    $Trip_Rank.=$record3[$i][0].":".$record3[$i][1].",";
    //$Trip_Rank.=$record3[$i][0].",";
  }
  //group by Months=========================
  $qrMonth = "SELECT startMonth,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Month FROM min(starttime)) as startMonth from td WHERE tripid in" . $input . " group by tripid ) as x group by startMonth order by startMonth";
  $queryMonth = $conn->prepare($qrMonth);
  $queryMonth->execute();
  $recordMonth = $queryMonth->fetchAll();
  $Months_Array = array();
  for ($i = 0, $iMax = sizeof($recordMonth); $i < $iMax; $i++) {
    $Months_Array[$recordMonth[$i][0]]["total"] = $recordMonth[$i][2];
    $Months_Array[$recordMonth[$i][0]]["Trip_Ids"] = $recordMonth[$i][1];
  }
  //group by Years=========================
  $qrYear = "SELECT startYear,array_agg(tripid),count(*) FROM (Select  tripid,EXTRACT(Year FROM min(starttime)) as startYear from td WHERE tripid in" . $input . " group by tripid ) as x group by startYear order by startYear";
  $queryYear = $conn->prepare($qrYear);
  $queryYear->execute();
  $recordYear = $queryYear->fetchAll();
  $Years_Array = array();
  for ($i = 0, $iMax = sizeof($recordYear); $i < $iMax; $i++) {
    $Years_Array[$recordYear[$i][0]]["total"] = $recordYear[$i][2];
    $Years_Array[$recordYear[$i][0]]["Trip_Ids"] = $recordYear[$i][1];
  }
//get data for SCP=========================
        $Eqr4 = "SELECT tripid,starthour,startday,avspeed,minspeed,maxspeed, EXTRACT(HOUR FROM endtime) as endHour,St_Length(trip::geography) as len FROM td WHERE tripid in" . $input ;
        $query4 = $conn->prepare($Eqr4); 
        $query4->execute();
        $record4 = $query4->fetchAll();
        $dataForSCP = "";
        for ($i = 0;$i < sizeof($record3);$i++) {
            $dataForSCP.= $record4[$i][0] . ":" . $record4[$i][1] . ":" . $record4[$i][2] .":" . $record4[$i][3] .":" . $record4[$i][4] .":" . $record4[$i][5] .":" . $record4[$i][6]  . ":" . $record4[$i][7]  . ",";
        }  
  
  $Final_Results = array(); 
  $Final_Results["WeekDays"]=$Week_Array;
  $Final_Results["DayHours"]=$Hour_Array;
  $Final_Results["Months"] = $Months_Array;
  $Final_Results["Years"] = $Years_Array;
  $Final_Results["region_Array"]="0";
  $Final_Results["Trip_Rank"]=substr(trim($Trip_Rank), 0, -1);;
  $Final_Results["St_Rank_count"]="0";
  $Final_Results["St_Rank_speed"]="0";
  $Final_Results ["Data_For_SCP"] = substr(trim($dataForSCP), 0, -1);

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
  
  $Result = NGetEditResults($_POST['trips'],$conn1);
  echo $Result;
}

?>
