<?php

require_once "Qconfig.php";
$conn1 = NULL;

function ExtractRUnitInfo($input,$conn)
{
	//Farah
	//Your Work is Here by Farah
	#get roads to create RID variable that includes roads geometry
	$All_Results1 = array();
	$qr ="Select r_id as rid,ST_AsText(geom) as polygon from regions ";
	$query = $conn->prepare($qr);
	$query->execute();
	if (!$query) {
		echo "An error occurred.\n";
		exit;
	}
	$record = $query->fetchAll();    
    $RID=array();
	$RID["Initial"]="Region";
    for($i=0;$i<sizeof($record);$i++)
	{
		/*$key1="'".$record[$i]["rid"]."'";
		$RID[$key1]=substr(trim($record[$i]["polygon"]), 9, -2);*/
		$RID[$record[$i]["rid"]]=substr(trim($record[$i]["polygon"]), 9, -2);
		
    }	        
	$All_Results1["Regions"]=$RID;	
	#=================================================================================================================
	#get the regions as geojson file
	$qr1 ="Select r_id as rid,ST_AsGeoJSON(geom) as polygon from regions ";
	$query1 = $conn->prepare($qr1);
	$query1->execute();
	if (!$query1) {
		echo "An error occurred.\n";
		exit;
	}
	$record1 = $query1->fetchAll();
	
	$geojson = array('type' => 'FeatureCollection','features' => array());
    
    
    for($i=0;$i<sizeof($record1);$i++)
	{
        $temp=array(
                "type"=> "Feature",
                "properties" => array("id" => $record1[$i]["rid"]),              
                "geometry" => json_decode($record1[$i]["polygon"],true)
            );
        array_push($geojson["features"], $temp);
    } 
	$All_Results1["RID"]=$geojson;
	#=================================================================================================================
	
    return json_encode($All_Results1);
}

function ExtractSUnitInfo($input,$conn)
{

	//Your Work is Here by Farah
	#get roads to create RID variable that includes roads geometry
	$All_Results = array();
	$qr ="Select osm_id,ST_AsText(geom) from osm_roads_car";
	$query = $conn->prepare($qr);
	$query->execute();
	if (!$query) {
		echo "An error occurred.\n";
		exit;
	}
	$record = $query->fetchAll();    
    $RID=array();
    for($i=0;$i<sizeof($record);$i++)
	{
        $RID[$record[$i][0]]=substr(trim($record[$i][1]), 11, -1);
    }	    
    $All_Results["RID"]=$RID;	
	#====================================================================================================================	
	#get roads to create RoadTypes variables
    $qr1 ="Select highway,array_agg(osm_id) as ids from osm_roads_car group by highway";     
    $query1 = $conn->prepare($qr1);
	$query1->execute();
	if (!$query1) {
		echo "An error occurred.\n";
		exit;
	}
	$record1 = $query1->fetchAll();
	
    $tempObj=array();    
    $O_road_types=array('motorway'=>0,'trunk'=>1,'primary'=>2,'secondary'=>3,'tertiary'=>4,'unclassified'=>5,'residential'=>6,'service'=>7,'motorway_link'=>8,'trunk_link'=>9,'primary_link'=>10,'secondary_link'=>11,'tertiary_link'=>12,'living_street'=>13,'road'=>14,'turning_circle'=>15);
    $M_road_types=array('motorway','trunk','primary','secondary','tertiary','unclassified','residential','service','motorway','trunk','primary','secondary','tertiary','living_street','road','turning_circle');    
	for($i=0;$i<sizeof($record1);$i++)
	{        
        
		$str=substr(trim($record1[$i]["ids"]), 1, -1);
		$tempIds = array_map('intval', explode(',', $str));
		 
        $NewRtype=$M_road_types[$O_road_types[$record1[$i]["highway"]]];       
        if (array_key_exists($NewRtype, $All_Results))		
		{
			$All_Results[$NewRtype]=array_merge($All_Results[$NewRtype], $tempIds);
		}           
        else
		{
			$All_Results[$NewRtype]=$tempIds;
		}            
    }
	#====================================================================================================================

	return json_encode($All_Results);
  
  
}

if (isset($_POST['SelDB']))  {

	$db_user1 = "postgres";
	$db_pass1 = "user";
	$db_name1 = $_POST['SelDB'];
	$db_server1 = "localhost";
	$db_port1 = "5432";

	try{
	  $conn1 = new PDO("pgsql:dbname=$db_name1;host=$db_server1;port=$db_port1", $db_user1, $db_pass1) OR DIE('Unable to connect to database! Please try again later.');
	}catch(PDOException  $e ){
	  echo "Error: ".$e;
	}
  	if($_POST['SelTB']=="tds"){
		$Result = ExtractSUnitInfo($_POST['SelDB'],$conn1);
	}
	else if($_POST['SelTB']=="tdr"){
		$Result = ExtractRUnitInfo($_POST['SelDB'],$conn1);
	}
  	echo $Result;
}

?>
