<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>TrajVis</title>
    <meta name="description" content="How to create a form with steps like a wizard in Bootstrap" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="Codeply">



    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" />

    <link rel="stylesheet" href="system/css/styles.css" />
  </head>
  <body >
    <?php
    require_once("system/Qstart.php");
    ?>
<div class="container"> 
<h1 style="width: 50%; margin-left: auto; margin-right: auto; color: #4682B4; font-family: 'Lobster', cursive; font-size: 36px; font-weight: normal; line-height: 48px; text-shadow: 1px 0 0 #fff;">TrajAnalytics - TrajVis</h1>  

</br>
</br>
</br>   
<div class="stepwizard col-md-offset-3">
    <div class="stepwizard-row setup-panel">  
      <div class="stepwizard-step">
        <a href="#step-1" type="button" class="btn btn-primary btn-circle">1</a>
        <p>Enter User Name</p>
      </div>
      <div class="stepwizard-step">
        <a href="#step-2" type="button" class="btn btn-default btn-circle" disabled="disabled">2</a>
        <p>Select Database</p>
      </div>
      <div class="stepwizard-step">
        <a href="#step-3" type="button" class="btn btn-default btn-circle" disabled="disabled">3</a>
        <p>Go to TrajAnalytics</p>
      </div>
    </div>
  </div>
  </br>
  </br>
  </br>
  <form role="form" autocomplete="off" action="" method="post">
    <div class="row setup-content" id="step-1">
      <div class="col-xs-6 col-md-offset-3">
        <div class="col-md-12">
          <h3> Enter User Name</h3>
          </br>
          <div class="form-group">
            <input id="username" maxlength="100" type="text" required="required" class="form-control" placeholder="Enter User Name" value="userstudy">
          </div>
          </br>
          </br>
          </br>
          </br>
          </br>
          <button class="btn btn-primary nextBtn btn-md pull-right" type="button">Next</button>
        </div>
      </div>
    </div>
    <div class="row setup-content" id="step-2">
      <div class="col-xs-6 col-md-offset-3">
        <div class="col-md-12">
          <h3> Select Database & Table</h3>
          </br>
          <div class="row">
          <div class="col-sm-6">
              <div class="form-group">
                  <div class="dropdown">
                      <a class="btn btn-danger dropdown-toggle" data-toggle="dropdown" href="#">Select Your Database <span class="caret"></span></a>
                      <ul class="dropdown-menu sh">
                        
                      </ul>
                  </div>
              </div>
          </div>
          <div class="col-sm-6">
              <div class="form-group">
                  <div class="dropdown">
                      <a class="btn btn-danger dropdown-toggle" data-toggle="dropdown" href="#">Select Your Table <span class="caret"></span></a>
                      <ul class="dropdown-menu sh1">
                        
                      </ul>
                  </div>
              </div>
          </div>
          </div>
          </br>
          </br>
          </br>
          </br>
          <button class="btn btn-primary nextBtn btn-md pull-right" type="button" style="margin: 13px;">Next</button>
          <button class="btn btn-primary prevBtn btn-md pull-left" type="button" style="margin: 13px;">Previous</button>
        </div>
      </div>
    </div>
    <div class="row setup-content" id="step-3">
      <div class="col-xs-6 col-md-offset-3">
        <div class="col-md-12">
          <h3> Go to TrajVis</h3>
          </br>
          </br>
          </br>
          </br>
          </br>
          </br>
          </br>
          <a class="btn btn-success nextBtn btn-md pull-right" href="TrajVis.php" type="button" style="margin: 13px;">Open TrajVis</a>
          <button class="btn btn-primary prevBtn btn-md pull-left" type="button" style="margin: 13px;">Previous</button>
        </div>
      </div>
    </div>
  </form>
  <hr>
  <div class="col-xs-6 col-md-offset-3">
	<div class="col-md-12">
	<h4 style="BACKGROUND-COLOR: yellow"> Username: <b>userstudy</b></h2>
	</div>
  </div>

</div>
    <!--scripts loaded here-->
    
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <script src="system/js/RID.js"></script>
    <script src="system/js/scripts.js"></script>
  </body>
</html>