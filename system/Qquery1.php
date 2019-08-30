<?php

require_once "Qconfig.php";
$conn1 = NULL;

function ExtractRegionInfo($input,$conn)
{
	
	$All_Results1 = array();
	#====================================================================================================================
	# get center point of the city
	$qr2="SELECT ST_AsGeoJSON(ST_Centroid(bbx)) as cp From (Select ST_SetSRID(ST_Extent(point),4326) as bbx FROM gps_points_re ) as x";
	$query2 = $conn->prepare($qr2);
	$query2->execute();
	if (!$query2) {
		echo "An error occurred.\n";
		exit;
	}
	$record2 = $query2->fetchAll();
	
	$cp=json_decode($record2[0]["cp"],true);
	$All_Results1["lat"]=$cp["coordinates"][1];
	$All_Results1["lng"]=$cp["coordinates"][0];
	
	#=================================================================================================================
	#get the time constraints
	$qrST ="SELECT MIN(starttime) as ST FROM tdr";
	$qrET ="SELECT MAX(starttime) as ET FROM tdr";

	$queryST = $conn->prepare($qrST);
	$queryST->execute();
	if (!$queryST) {
		echo "An error occurred.\n";
		exit;
	}
	$recordST = $queryST->fetchAll();
	$All_Results1["ST"] = $recordST[0][0];

	$queryET = $conn->prepare($qrET);
	$queryET->execute();
	if (!$queryET) {
		echo "An error occurred.\n";
		exit;
	}
	$recordET = $queryET->fetchAll();
	$All_Results1["ET"] = $recordET[0][0];
	
    return json_encode($All_Results1);
}

function ExtractRoadInfo($input,$conn)
{

	$All_Results = array();
	#====================================================================================================================
	# get center point of the city
	$qr2="SELECT ST_AsGeoJSON(ST_Centroid(bbx)) as cp From (Select ST_SetSRID(ST_Extent(point),4326) as bbx FROM gps_points_rn ) as x";
	$query2 = $conn->prepare($qr2);
	$query2->execute();
	if (!$query2) {
		echo "An error occurred.\n";
		exit;
	}
	$record2 = $query2->fetchAll();
	
	$cp=json_decode($record2[0]["cp"],true);
	$All_Results["lat"]=$cp["coordinates"][1];
	$All_Results["lng"]=$cp["coordinates"][0];
	
	#====================================================================================================================	
	#get the time constraints
	$qrST ="SELECT MIN(starttime) as ST FROM tds";
	$qrET ="SELECT MAX(starttime) as ET FROM tds";

	$queryST = $conn->prepare($qrST);
	$queryST->execute();
	if (!$queryST) {
		echo "An error occurred.\n";
		exit;
	}
	$recordST = $queryST->fetchAll();
	$All_Results["ST"] = $recordST[0][0];

	$queryET = $conn->prepare($qrET);
	$queryET->execute();
	if (!$queryET) {
		echo "An error occurred.\n";
		exit;
	}
	$recordET = $queryET->fetchAll();
	$All_Results["ET"] = $recordET[0][0];

	#====================================================================================================================

	return json_encode($All_Results);
  
}

function ExtractTrajInfo($input,$conn)
{
	$All_Results = array();
	#====================================================================================================================
	# get center point of the city
	$qr2="SELECT ST_AsGeoJSON(ST_Centroid(bbx)) as cp From (Select ST_SetSRID(ST_Extent(point),4326) as bbx FROM gps_points1 ) as x";
	$query2 = $conn->prepare($qr2);
	$query2->execute();
	if (!$query2) {
		echo "An error occurred.\n";
		exit;
	}
	$record2 = $query2->fetchAll();
	
	$cp=json_decode($record2[0]["cp"],true);
	$All_Results["lat"]=$cp["coordinates"][1];
	$All_Results["lng"]=$cp["coordinates"][0];
	#====================================================================================================================
	$qrST ="SELECT MIN(starttime) as ST FROM td";
	$qrET ="SELECT MAX(starttime) as ET FROM td";

	$queryST = $conn->prepare($qrST);
	$queryST->execute();
	if (!$queryST) {
		echo "An error occurred.\n";
		exit;
	}
	$recordST = $queryST->fetchAll();
	$All_Results["ST"] = $recordST[0][0];

	$queryET = $conn->prepare($qrET);
	$queryET->execute();
	if (!$queryET) {
		echo "An error occurred.\n";
		exit;
	}
	$recordET = $queryET->fetchAll();
	$All_Results["ET"] = $recordET[0][0];

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
		$Result = ExtractRoadInfo($_POST['SelDB'],$conn1);
	}
	else if($_POST['SelTB']=="tdr"){
		$Result = ExtractRegionInfo($_POST['SelDB'],$conn1);
	}
	else if($_POST['SelTB']=="td"){
		$Result = ExtractTrajInfo($_POST['SelDB'],$conn1);
	}
  	echo $Result;
}

?>
