    var country=''
    var province=''
    var winery=''

    function selection(){
        $(this).addClass('selected');
    }
    function selectcountry() {
            country= $('#country')[0].selectedOptions[0].value;
            $('#province').empty();
             html='<option value="SelectProvince">Select Province</option>';
            $('#province').html(html);

            $.ajax({
                url: '/country/'+country,
                data: country,
                type: 'POST',
                success: function(response) {
                    countrysuccess(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
    }

    function countrysuccess(response) {
        html='<option value="SelectProvince">Select Province</option>';
        console.log(response)
        $.each(response,function (key,value) {
            html=html+'<option value="' +value+'">'+value+'</option>';
        })

        $('#province').html(html);
    }

    function selectprovince() {
            province= $('#province')[0].selectedOptions[0].value;
            html='<option value="SelectWinery">Select Winery</option>';
            $('#winery').empty();
            $('#winery').html(html);
            $.ajax({
                url: '/province/'+province,
                data: province,
                type: 'POST',
                success: function(response) {
                    provincesuccess(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
    }

    function provincesuccess(response) {
        html='<option value="SelectWinery">Select Winery</option>';
        console.log(response)
        $.each(response,function (key,value) {
            html=html+'<option value="' +value+'">'+value+'</option>';
        })

        $('#winery').html(html);
    }


    function getwines() {
         winery= $('#winery')[0].selectedOptions[0].value;
            $.ajax({
                url: '/winery/'+winery,
                data: winery,
                type: 'POST',
                success: function(response) {
                    winessuccess(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
            $.ajax({
                url: '/winery_details/'+winery,
                data: winery,
                type: 'POST',
                success: function(response) {
                    setValues(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
    }
    
    function winessuccess(response) {
        $('.wine').remove();
        html=$('#searchwine')[0].innerHTML;

        $.each(response,function (key,value) {
            html=html+'<div class="row wine" name="'+value["Title"]+'">' +
                            '<div class="row" id="Title">'+
                            '<div class="col-xl-10 form-inline" style="text-align: left;">'+
                            '<span style="margin-left: 1vw;">'+value["Title"]+'</span>' +
                            '</div>' +
                            '<div class="col-xl-2" id="star" onclick="showreview(\''+value["Title"].replace("'","\'")+'\')" ">'+
                            '<label style="font-size: large;line-height: 0.2vw;">Write your Review!!</label>'+
                            '<span style="margin-left: 1.0vw;" class="fa fa-star checked"></span>'+
                            '<span class="fa fa-star checked"></span>'+
                            '<span class="fa fa-star checked"></span>'+
                            '<span class="fa fa-star checked"></span>'+
                            '<span class="fa fa-star checked"></span>'+
                           // '<a class="col-xl-1 empty-stars" id="rate" style="margin-left: 0.5vw;" onclick="showreview(\''+value["Title"]+'\')" "></a>' +
                            '</div>'+
                            '</div>'+
                            '<div class="row form-inline" id="Variety">'+
                            '<label>Variety:</label>' +
                            '<span >'+value["Variety"] + '</span>'+
                            '<span id="Price">$'+value["Price"] + '</span>'+
                            '</div>'+
                            '<div class="row" id="Points">'+
                            '<label>Points:</label>' +
                            '<span >'+value["Points"] + '</span>'+
                            '</div>'+
                           // '<div class="row" id="Price">'+
                            //'<label>Price:</label>' +
                            //'<span >'+value["Price"] + '</span>'+
                            //'</div>'+
                            // '<div class="row" id="Taster">'+
                            // '<label>Taster:</label>' +
                            // '<span >'+value["Taster"] + '</span>'+
                            // '</div>'+
                            '<div class="row" id="Twitter">'+
                            '<label>Taster:</label>' +
                            '<a target="_blank" href="http://www.twitter.com/'+value["twitter"]+'"><span>'+value["Taster"]+'</span></a>\n'+
                            '</div>'+
                            '<div class="row" id="Review">'+
                            '<span id="winereview">'+value["Description"] + '</span>'+
                            '</div>'+
                            '<div id="Reviewsuser">'
                             $.each(value["Reviews"],function (name,review) {
                               html=html+'<div class="row">'+
                                         '<label>User:</label>'+
                                         '<span>'+review["User"]+'</span>'+
                                         '</div>'+
                                         '<div class="row"> '+
                                         '<label>Review:</label>'+
                                         '<span>'+review["Review"]+'</span>'+
                                         '</div>'
                             });
                       html=html+     '</div> </div>';
        });

        $('#searchwine').html(html);

        $('#country').val(country);
        $('#province').val(province);
        $('#winery').val(winery);
    }

    function showreview(title) {
            $('#winename').text(title);
       // $('#main').css("-webkit-filter","blur(8px)");
       // $('#main').css("display","none");
        $('#main').css("filter", "blur(2px)");
        $('body').css("overflow","hidden");
        $('#reviewpage').css("display","block");
    }

    function reveal() {
        $('#main').css("filter","");
        $('#reviewpage').css("display","none");
        $('body').css("overflow","");
    }

    function save() {
        var title= $('#winename')[0].textContent;
         var user=$('#username')[0].value;
         var userreview=$('#userreview')[0].value;
         $.ajax({
                url: '/userreviews/'+title+'/'+user+'/'+userreview,
                data: title,user,userreview,
                type: 'POST',
                success: function(response) {
                    reviewsuccess(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
    }

    function reviewsuccess(response) {
        html='';
        $.each(response[0].Reviews , function (key,value) {
            html=html+'<div class="row">'+
                                         '<label>User:</label>'+
                                         '<span>'+value["User"]+'</span>'+
                                         '</div>'+
                                         '<div class="row"> '+
                                         '<label>Review:</label>'+
                                         '<span>'+value["Review"]+'</span>'+
                                         '</div>'
        });

        $.each($('#Reviewsuser'), function (key,review) {
            if(review.parentNode.getAttribute('name')==response[0].Title) {
                var rowvalue = $('#Reviewsuser')[key];
                $(rowvalue).empty();
                $(rowvalue).html(html)
            }
            else {
                var getwine = document.getElementsByClassName('wine');
                $.each(getwine, function (key, wine) {
                    let test = $(wine)[0];
                    if (test.getAttribute('name') == response[0].Title) {
                        var winereview = $(wine)[0].lastElementChild;
                        $(winereview).empty();
                        $(winereview).html(html);
                    }
                });
            }
        });

        reveal();
       // if(response["Reviews"])
        //var title= document.getElementsByName('')
    }

