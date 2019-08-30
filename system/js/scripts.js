$(document).ready(function() {
    var SelectDB = [];
    var MyDB = [];
    var MyTB = {};
    var selected_index = -1;
    var Tselected_index = -1;

    var navListItems = $('div.setup-panel div a'),
        allWells = $('.setup-content'),
        allNextBtn = $('.nextBtn'),
        allPrevBtn = $('.prevBtn');

    allWells.hide();

    navListItems.click(function(e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
            $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-primary').addClass('btn-default');
            $item.addClass('btn-primary');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });

    allPrevBtn.click(function() {
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            prevStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().prev().children("a");

        prevStepWizard.removeAttr('disabled').trigger('click');
    });

    allNextBtn.click(function() {
        var curStep = $(this).closest(".setup-content");
        curStepBtn = curStep.attr("id");
        nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a");
        curInputs = curStep.find("input[type='text'],input[type='url']"),
            isValid = true;

        if (curStepBtn === "step-1") {
            //console.log(document.getElementById('username').value);
            $.post("/TrajVis/system/Qquery.php", {
                UN: document.getElementById('username').value
            }, function(results) {
                // the output of the response is now handled via a variable call 'results'
                if (results) {
                    //console.log(results);
                    var obj = [];
                    obj = JSON.parse(results);
                    //console.log(obj);
                    $(".dropdown-menu.sh").empty();
                    j = 0;
                    for (var i = 0; i < obj.AllDB.length; i++) {
                        var res = obj.AllDB[i].split("_1_1_");
                        if (res[1] === document.getElementById('username').value) {
                            SelectDB[j] = res[0];
                            MyDB[j++] = obj.AllDB[i];
                            $(".dropdown-menu.sh").append("<li><a href='#'>" + res[0] + "</a></li>");
                            
                            MyTB[obj.AllDB[i]] = new Array();
                            s = 0;
                            for (var k = 0; k < obj.AllTB[obj.AllDB[i]].length; k++) {
                                if(obj.AllTB[obj.AllDB[i]][k]==="td" || obj.AllTB[obj.AllDB[i]][k]==="tds" || obj.AllTB[obj.AllDB[i]][k]==="tdr"){
                                    MyTB[obj.AllDB[i]][s++] = obj.AllTB[obj.AllDB[i]][k];
                                }
                            }
                        }
                    }
                    //console.log(MyTB);
                    $(".dropdown-menu.sh li a").click(function() {
                        var selText = $(this).text();
                        selected_index = $(this).closest('li').index();
                        Tselected_index = -1;
                        $(".dropdown-menu.sh1").empty();
                        $(".dropdown-menu.sh1").parents('.dropdown').find('.dropdown-toggle').html('Select Your Table <span class="caret"></span>');
                        for (var i = 0; i < MyTB[MyDB[selected_index]].length; i++) {
                            if(MyTB[MyDB[selected_index]][i]==="td"){
                                $(".dropdown-menu.sh1").append("<li><a href='#'>" + "Raw Data" + "</a></li>");
                            }
                            else if(MyTB[MyDB[selected_index]][i]==="tds"){
                                $(".dropdown-menu.sh1").append("<li><a href='#'>" + "Data Mapped to Road Net." + "</a></li>");
                            }
                            else if(MyTB[MyDB[selected_index]][i]==="tdr"){
                                $(".dropdown-menu.sh1").append("<li><a href='#'>" + "Data Mapped to Regions" + "</a></li>");
                            }
                        }
                        
                        //console.log(selected_index + selText);
                        $(".dropdown-menu.sh").parents('.dropdown').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');

                        $(".dropdown-menu.sh1 li a").click(function() {
                            var TselText = $(this).text();
                            Tselected_index = $(this).closest('li').index();
                            
                            //console.log(Tselected_index + TselText);
                            $(".dropdown-menu.sh1").parents('.dropdown').find('.dropdown-toggle').html(TselText + ' <span class="caret"></span>');
                        });
                    });

                    //console.log(SelectDB.length, MyDB);
                    if (isValid && SelectDB.length > 0) {
                        nextStepWizard.removeAttr('disabled').trigger('click');
                    } else {
                        $(".form-group").removeClass("has-error");
                        for (var i = 0; i < curInputs.length; i++) {
                            if (!curInputs[i].validity.valid) {
                                isValid = false;
                                $(curInputs[i]).closest(".form-group").addClass("has-error");
                            }
                        }
                        alert("User Name not found!");
                    }

                } else {
                    console.log("No Results");
                }
            });
        }
        if (curStepBtn === "step-2") {
            if ((selected_index != -1)&&(Tselected_index != -1)) {
                nextStepWizard.removeAttr('disabled').trigger('click');
                if(MyTB[MyDB[selected_index]][Tselected_index] != "td"){
                $.post("/TrajVis/system/Qquery1.php", {
                    SelDB: MyDB[selected_index],
                    SelTB: MyTB[MyDB[selected_index]][Tselected_index]
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        //console.log(obj);
						localStorage.clear();
                        localStorage.setItem("MyDB",MyDB[selected_index]);
                        localStorage.setItem("MyTB",MyTB[MyDB[selected_index]][Tselected_index]);
                        localStorage.setItem("lat",obj.lat);
                        localStorage.setItem("lng",obj.lng);
                        localStorage.setItem("ST",obj.ST);
                        localStorage.setItem("ET",obj.ET);
                       
                    } else {
                        console.log("No Results");
                    }
                });

            }
			else{
				$.post("/TrajVis/system/Qquery1.php", {
                    SelDB: MyDB[selected_index],
                    SelTB: MyTB[MyDB[selected_index]][Tselected_index]
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {

                        //console.log(results);
                        var obj = [];
                        obj = JSON.parse(results);
						localStorage.clear();
                        localStorage.setItem("MyDB",MyDB[selected_index]);
                        localStorage.setItem("MyTB",MyTB[MyDB[selected_index]][Tselected_index]);
                        localStorage.setItem("lat",obj.lat);
                        localStorage.setItem("lng",obj.lng);
                        localStorage.setItem("ST",obj.ST);
                        localStorage.setItem("ET",obj.ET);

                    } else {
                        console.log("No Results");
                    }
                });
			}

            } else
                alert("Select a Database then a Table!");
        }

    });

    $('div.setup-panel div a.btn-primary').trigger('click');
    //************************************************************************

});