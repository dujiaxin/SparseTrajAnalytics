<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="description" content="">
      <meta name="author" content="">
	  <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
      <title>TrajAnalytics</title>
      <!-- font-awesome Core CSS -->
      <link rel="stylesheet" href="system/css/css/font-awesome.min.css">
      <!-- Bootstrap Core CSS -->
      <link href="system/css/bootstrap.min.css" rel="stylesheet">
      <!-- Custom CSS -->
      <link href="system/css/MyCSS.css" rel="stylesheet" />
      <!-- Used JavaScript -->
      <script src="system/js/leaflet-src.js"></script>
      <link rel="stylesheet" href="system/css/leaflet.css" />
      <script src="system/js/jquery-1.11.2.min.js"></script>
      <script src="system/js/bootstrap.min.js"></script>
      <script src="system/js/Leaflet.draw.js"></script>
      <script src="system/js/Leaflet.Draw.Event.js"></script>
      <link rel="stylesheet" href="system/css/leaflet.draw.css" />
      <script src="system/js/Toolbar.js"></script>
      <script src="system/js/Tooltip.js"></script>
      <script src="system/js/ext/GeometryUtil.js"></script>
      <script src="system/js/ext/LatLngUtil.js"></script>
      <script src="system/js/ext/LineUtil.Intersect.js"></script>
      <script src="system/js/ext/Polygon.Intersect.js"></script>
      <script src="system/js/ext/Polyline.Intersect.js"></script>
      <script src="system/js/ext/TouchEvents.js"></script>
      <script src="system/js/draw/DrawToolbar.js"></script>
      <script src="system/js/draw/handler/Draw.Feature.js"></script>
      <script src="system/js/draw/handler/Draw.SimpleShape.js"></script>
      <script src="system/js/draw/handler/Draw.Polyline.js"></script>
      <script src="system/js/draw/handler/Draw.Circle.js"></script>
      <script src="system/js/draw/handler/Draw.Marker.js"></script>
      <script src="system/js/draw/handler/Draw.Polygon.js"></script>
      <script src="system/js/draw/handler/Draw.Rectangle.js"></script>
      <script src="system/js/edit/EditToolbar.js"></script>
      <script src="system/js/edit/handler/EditToolbar.Edit.js"></script>
      <script src="system/js/edit/handler/EditToolbar.Delete.js"></script>
      <script src="system/js/Control.Draw.js"></script>
      <script src="system/js/edit/handler/Edit.Poly.js"></script>
      <script src="system/js/edit/handler/Edit.SimpleShape.js"></script>
      <script src="system/js/edit/handler/Edit.Circle.js"></script>
      <script src="system/js/edit/handler/Edit.Rectangle.js"></script>
      <script src="system/js/edit/handler/Edit.Marker.js"></script>
      <script src='system/js/leaflet.ajax.min.js'></script>
      <script src='system/js/leaflet-geodesy.js'></script>
      <script src="system/js/Control.FullScreen.js"></script>
      <!-- date picker-->
      <script src="system/js/easy-button.js"></script>
      <link rel="stylesheet" href="system/css/easy-button.css" />
      <!-- date picker-->
      <script type="text/javascript" src="system/datepicker/js/bootstrap-datepicker.min.js"></script>
      <link rel="stylesheet" type="text/css" href="system/datepicker/css/bootstrap-datepicker.css" />
      <!-- time slider -->
      <script type="text/javascript" src="system/UISlider/jquery.range-min.js"></script>
      <link rel="stylesheet" type="text/css" href="system/UISlider/jquery.range.css" />
      <!-- Kendo Style -->
      <link rel="stylesheet" href="system/css/kendo.common.min.css" />
      <link rel="stylesheet" href="system/css/kendo.default.min.css" />
      <script src="system/js/kendo.all.min.js"></script>
      <!-- NVD3 Library -->
      <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>
      <link href="system/css/nv.d3.css" rel="stylesheet" type="text/css">
      <script src="system/js/nv.d3.js"></script>
      <script src="system/js/nv.d3.min.js"></script>
      <script src="http://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js"></script>
      <script src = "http://axc.net/code_libraries/lasso/lasso.min.js"></script>
	  <!-- new added -->

<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v1.1.0/mapbox-gl.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v1.1.0/mapbox-gl.css' rel='stylesheet' />
 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
 
  <script src='https://unpkg.com/three@0.102.0/build/three.min.js'></script>
<script src="https://unpkg.com/three@0.102.0/examples/js/loaders/GLTFLoader.js"></script>
<script src='https://npmcdn.com/@turf/turf/turf.min.js'></script>

   </head>
   <body>
      <?php
         require_once("system/start.php");
         ?>
      <!-- Navigation -->
      <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
         <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
               <a class="navbar-brand" href="http://vis.cs.kent.edu/">Trajectory Analytics V2.0</a>
            </div>
            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
               <ul class="nav navbar-nav">
                  <li>
                     <a href="http://www.cs.kent.edu/~zhao/urban.html">About</a>
                  </li>
                  <li>
                     <a href="http://vis.cs.kent.edu/contact.html">Contact</a>
                  </li>
               </ul>
               <a class="btn btn-success nextBtn btn-sm pull-right" href="http://localhost/TrajVis/" type="button" style="margin: 10px;">Home</a>
            </div>
            <!-- /.navbar-collapse -->
         </div>
         <!-- /.container -->
      </nav>
      <!-- Page Content -->
      <div id="content">
         <div id="map">
            <footer>
               <div id="search">
                  <form method="post" action="?">
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                     <div>
                        <label for="search-from-date"><font size="2" style="font-weight: bold;">Date from:</font></label>&nbsp;
                        <input type="text" name="search-from-date" id="search-from-date"/>
                     </div>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                     <div>
                        <label for="search-to-date"><font size="2" style="font-weight: bold;">Date to:</font></label>&nbsp;
                        <input type="text" name="search-to-date" id="search-to-date"/>
                     </div>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                     <label><font size="2" style="font-weight: bold;">Query Mode:</font></label>&nbsp;
                     <select name="select" id="QueryMode">
                        <option value="Intersect" selected>Intersect</option>
                        <option value="Pick-UP">Pick-UP</option>
                        <option value="Drop-Off">Drop-Off</option>
                        <!--<option value="Within">Within</option>-->
                     </select>
                  </form>
               </div>
            </footer>
         </div>
         <div id="toolbar">
            <div class="MV">
               <span style="font-size:15px;">Query&nbsp;Control</span>
            </div>
            <div align="center" class="controlBody">
               <div class="container1 regionView" id="listView2"></div>
            </div>
         </div>
         <div id="rightside">
 <div class="container">

  <!-- Modal -->
  <div class="modal fade" id="myModal" role="dialog">
    <div class="modal-dialog">
    
      <!-- Modal content-->
      <div class="modal-content" style="width: 800px;height: 750px;" >
        <div class="modal-header">
		
		<button type="button"  class="btn btn-success" onclick = "addAnotherTrip()" >Add Another Trip</button>
          <button type="button"  class="btn btn-danger" style="float : right" data-dismiss="modal">clear</button>
        </div>
        <div class="modal-body" style="height:700px; padding:0px !important">
         <div id='map2'></div>
        </div>
  
      </div>
      
    </div>
  </div>
  
</div>


            <div id="tabs-1">

               <form>
                  <label><input id="tableView" type="radio" name="mode"  checked onchange = "tabSCPChanged(tableView)"> Table View</label>
                  <label><input id="scatterView" type="radio" name="mode" onchange = "tabSCPChanged(scatterView)"> Scatter plot view</label>
				 
               </form>
               <div id="scatterdiv" style="display:none ">
			  
                  <div class="container" style="width:100%">
                     <div class="row" >
                        <div class="form-row ">
                           <div class="form-group col-md-3 ">
                              <label for="XLine">Xline</label>
                              <select class="form-control" id="XLine">
                                 <option value="MinSpeed">Min speed</option>
                                 <option value="AvgSpeed" selected>Avg Speed</option>
                                 <option value="MaxSpeed">Max speed</option>
                                 <option class="optionForSCPTDS" value="Flow">Flow count</option>
                                 <option class="optionForSCPTD" value="StartHour">Start Hour</option>
                                 <option class="optionForSCPTD" value="StartDay">Start Day</option>
                                 <option class="optionForSCPTD" value="EndHour">End Hour </option>
                                 <option class="optionForSCPTD" value="Length_km">Trip Length</option>
                              </select>
                           </div>
                           <div class="form-group col-md-3">
                              <label for="YLine">YLine</label>
                              <select class="form-control fontsize10" id="YLine">
                                 <option value="MinSpeed">Min speed</option>
                                 <option value="AvgSpeed" >Avg Speed</option>
                                 <option value="MaxSpeed" selected>Max speed</option>
                                 <option class="optionForSCPTDS" value="Flow" >Flow count</option>
                                 <option class="optionForSCPTD" value="StartHour">Start Hour</option>
                                 <option class="optionForSCPTD" value="StartDay">Start Day</option>
                                 <option class="optionForSCPTD" value="EndHour">End Hour </option>
                                 <option class="optionForSCPTD" value="Length_km">Trip Length</option>
                              </select>
                           </div>
                           <div class="form-group col-md-3">
                              <label for="colorid">Color By</label>
                              <select class="form-control " id="colorid">
                                 <option value="MinSpeed" selected>Min speed</option>
                                 <option value="AvgSpeed" >Avg Speed</option>
                                 <option value="MaxSpeed" >Max speed</option>
                                 <option class="optionForSCPTDS"value="Flow" >Flow count</option>
                                 <option class="optionForSCPTD" value="StartHour">Start Hour</option>
                                 <option class="optionForSCPTD" value="StartDay">Start Day</option>
                                 <option class="optionForSCPTD" value="EndHour">End Hour </option>
                                 <option class="optionForSCPTD" value="Length_km">Trip Length</option>
                              </select>
                           </div>
                           <div class="form-group col-md-3">
                              <button type="button" class="margin_top_17 btn btn-success btn-sm" onclick="drawSCP()">Draw</button>
                              <button type="button" class="margin_top_17 btn btn-success btn-sm" onclick="DrawTripFormLassoselected()">Zoom</button>
                           </div>
                        </div>
                     </div>
					 <div style="text-align: center" >
					   <b style="font-size:15px" id="h2dataInnfo"></b>
					   </div>
                  </div>
                  <div id="scatter"  class="container">
                  </div>
               </div>
               
               <div id="exTab3" class="container">
                  <ul class="nav nav-pills">
                     <li class="active">
                        <a href="#3b" data-toggle="tab"><strong>Ranked Records (Len)</strong></a>
                     </li>
                     <li>
                        <a href="#1b" data-toggle="tab"><strong>Top Records (Flow)</strong></a>
                     </li>
                     <li>
                        <a href="#2b" data-toggle="tab"><strong>Top Records (Speed)</strong></a>
                     </li>
                  </ul>
                  <div class="tab-content clearfix">
                     <div class="tab-pane active"  id="3b">
                        <div style="text-align:center;" id="singleSort2"></div>
                     </div>
                     <div class="tab-pane"  id="1b">
                        <div style="text-align:center;" id="singleSort"></div>
                     </div>
                     <div class="tab-pane"  id="2b">
                        <div style="text-align:center;" id="singleSort1"></div>
                     </div>
                     <span id="span3" class="glyphicon glyphicon-floppy-save" style="z-index:10; color: black; display: inline-block; position: absolute; top: 4.8vh; right: 15vw;"></span>
                  </div>
               </div>
               <div id="top1">
                  <span id="span1" class="glyphicon glyphicon-floppy-save" style="z-index:10; color: black; display: inline-block; position: absolute; top: 10vh; right: 10px;"></span>
                  <div class="reportView">
                     <svg id="v1"></svg>
                  </div>
               </div>
               <div id="bottom1">
                  <span id="span2" class="glyphicon glyphicon-floppy-save" style="z-index:10; color: black; display: inline-block; position: absolute; top: 10vh; right: 10px;"></span>
                  <div class="reportView">
                     <svg id="v2"></svg>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <input id="upload-file" type="file" accept=".geojson" style="display:none" />
      <!-- /.container -->
      <!-- Kendo Library -->
      <link rel="stylesheet" href="system/css/kendo.common-material.min.css" />
      <link rel="stylesheet" href="system/css/kendo.material.min.css" />
      <link rel="stylesheet" href="system/css/kendo.material.mobile.min.css" />
      <script type="text/javascript" src="system/js/kendo.all.min.js"></script>
      <link rel="stylesheet" type="text/css" href="system/css/jquery.datetimepicker.css"/>
      <script src="system/js/jquery.datetimepicker.full.js"></script>
      <!-- Bootstrap Core JavaScript -->
      <script src="system/js/bootstrap.min.js"></script>
      <!-- Required JavaScript -->
      <script src="system/js/leaflet-heat.js"></script>
      <!--<script src="system/js/STP.js"></script>-->
      <script src="system/js/html2canvas.js"></script>
      <script src="system/js/base64.js"></script>
      <script src="system/js/canvas2image.js"></script>
      <script src="system/js/RID.js"></script>
      <script src="system/js/underscore.js"></script>
      <script src="system/js/MyJS.js"></script>
      <script src="system/js/UI.js"></script>
      <script src="system/js/Query.js"></script>
      <script src="system/js/QueryManager.js"></script>
	  	  <style>
#map2 { position:absolute; top:0; bottom:0; width:800px; height:700px }
</style>
   </body>
</html>