(function($){

////CONFIGURATION
var WIDTH_BOOK           			//WIDTH BOOK
var HEIGHT_BOOK						//HEIGHT BOOK
var BOOK_SLUG;						//SLUG FOR BOOK
var WINDOW_WIDTH;                   //WIDTH AREA [px]
var WINDOW_HEIGHT;                  //HEIGHT AREA [px]
var ZOOM_STEP 		        		//STEPS SIZE FOR ZOOM
var ZOOM_DOUBLE_CLICK_ENABLED;		//ENABLED DOUBLE CLICK FOR ZOOM
var ZOOM_DOUBLE_CLICK;    			//ZOOM FOR DOUBLE CLICK
var GOTOPAGE_WIDTH;					//WIDTH FOR INPUT FIELD
var IS_AS_TEMPLATE               	//IF THIS TEMPLATE 
var TOOL_TIP_VISIBLE                //TOOLTIP VISIBLE
var SWF_ADDRESS                     //SWF ADDRESS
var TOOLS_VISIBLE                   //TOOLBAR VISIBLE
var RTL                             //RIGHT TO LEFT


/* =  event ready 
--------------------------*/
$(document).ready(function(e) {	
	

	if( general.browser_firefox() ) {
		console.log('book:version jquery = '+$.fn.jquery);	
	}
	
	Book_v8.ready();
	
});

/* =  event load 
--------------------------*/
$(window).load(function(e){
	
	 Book_v8.load()
})




/* =  set Page
--------------------------*/
     
  setPage=function(nr_) {
      
      if( SWF_ADDRESS == "true" ){ 
          var results= $("#fb8-deeplinking ul li[data-page="+nr_+"]");
		  var address = results.attr('data-address');
	  	  setAddress( $('#fb8').attr('data-current')+"/"+address);	
      }else{
           $('#fb8-book').turn('page',nr_);      
      }
       
 };
 

/* =  set Address
--------------------------*/

 setAddress=function(address_) {
       
	   $.address.value( address_ );
  };


/* =  show lightbox with video 
--------------------------*/

  youtube=function(id_,w_,h_) { 
	 

	 var w=w_;
	 var h=h_;
	 var id=id_;
	 
	$('body').prepend('<div id="v8_lightbox"><div class="bcg"></div><iframe class="youtube-player" width='+w+' height='+h+' src="http://www.youtube.com/embed/'+id+'?html5=1" frameborder="0" allowfullscreen></iframe></div>');
  
    $(window).trigger('orientationchange');
	  	
	$("#v8_lightbox").click(function(){
		$(this).children().hide();
		$(this).remove();
        
        Book_v8.zoomAuto();
	})
	
	$("#v8_lightbox").css('display','block');
	
 };
 
 
/* =  prototype 
--------------------------*/
Number.prototype.rtl=function()
{
return (Book_v8.getLength()+1)-this.valueOf();
}


/* =  local general function 
--------------------------*/
var general={

browser_firefox:function(){	
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
	  return true;	
	}else{
	  return false;	
	}
}

}


/* =  FlipBook v8
--------------------------*/
var Book_v8 = {

	toolsHeight:0,   //tools height
	zoom:1,           //zoom
    page_padding:0.1,
    paddingL:0.02,
    paddingR:0.02,
    paddingT:0.02,
    paddingB:0.02,
    currentPage:0,
    


    ready: function(){
	   if( general.browser_firefox() ) {	
       		console.log('book:ready');    
	   }
	   //start	 
	  
       //Configuration
       var config=$('#fb8-ajax').data('config'); 
	   config["toolbar_visible"]='true';
	   config['icon_page_manager']='true';	
		
       Book_v8.config=config; 
       WIDTH_BOOK=Number(config['page_width'])*2;  	 
       HEIGHT_BOOK=Number(config['page_height']);
       ZOOM_STEP=Number(config['zoom_step']);
       ZOOM_DOUBLE_CLICK_ENABLED=(config['double_click_enabled']);           
       ZOOM_DOUBLE_CLICK=Number(config['zoom_double_click'])
       GOTOPAGE_WIDTH=Number(config['gotopage_width']);
       TOOL_TIP_VISIBLE=(config['tooltip_visible']);
       SWF_ADDRESS=(config['deeplinking_enabled']);
	   RTL=config['rtl'];
	   
       IS_AS_TEMPLATE= $('#fb8-ajax').attr('data-template') == "true" ? true : false;
       TOOLS_VISIBLE=(config['toolbar_visible']);
       //if( TOOLS_VISIBLE == "true" ){
			 Book_v8.toolsHeight=40;
	   //}else{
			 //Book_v8.toolsHeight=0;
	   ///}
	   if(   config['icon_page_manager']=='false'  ){
		     	 Book_v8.toolsHeight=0;	  
				 $('.fb8-goto').css('display','none');
	   }
	   
	   if( $('#fb8-center ul li').length==0 ){
		   		   
	   }
	 	   
		
		///about show
		$('#fb8-about').css('display','block');		
			      

       //event resize
       $(window).bind('orientationchange resize', function(event){
            Book_v8.book_area();
            Book_v8.zoomAuto();
            Book_v8.book_position();
            Book_v8.dragdrop_init();        
            Book_v8.resize_page()     
            Book_v8.center($('#v8_lightbox'));           
            Book_v8.center_icon();
            Book_v8.center_icon();
            Book_v8.media_queries()
		});
		////end  
		
		
		//reverse book		
		$( $('#fb8-book>div').get().reverse()  ).each(function(index,element) { 
			    var item=$(element);
				var meta=$('div.fb8-meta',this);
				///for only reverse
				if( RTL == "true" ){				  
					  //reverse					
					  $(this).appendTo( $(this).parent() );					  
					  //reorder description and number
					  var desc=$('span.fb8-description',item);
					  if( desc.index() ==0 ){
						//desc.appendTo(meta);						  
					  }else{
						//desc.prependTo(meta); 
					  }				  					  
					  ///for double
					  if( item.hasClass('fb8-double') ){						  
						if(  item.hasClass('fb8-first') ){
						     item.removeClass('fb8-first').addClass('fb8-second');							
						}else if( item.hasClass('fb8-second') ){
							 item.removeClass('fb8-second').addClass('fb8-first');							
						}						  
					  }		
					 //add data for meta
				 	 if( index%2!=0 ){			 
				  		meta.addClass('fb8-left');		
				 	 }else{
				  		meta.addClass('fb8-right');					 
				 	 }			  
      			}else{
					 //add data for meta
				 	 if( index%2==0 ){			 
				  		meta.addClass('fb8-left');		
				 	 }else{
				  		meta.addClass('fb8-right');					 
				 	 }					
				} 
		});
		
		   
    
        //preloader start
        var preloader_visible=Book_v8.config['preloader_visible'];
        if( preloader_visible=="true"){
           $('.fb8-preloader').css('display','block');
        }
        
        WINDOW_WIDTH=$('#fb8').width();
        WINDOW_HEIGHT=$('#fb8').height();
        
        Book_v8.resize_input_text()
    	Book_v8.book_area();
    	$("#fb8").css('opacity','1');
    	
            
        
        /* SCALE PAGE IN FLIPBOOK  /*/
        //size default for class .fb8-cont-page-book
        $("#fb8 .fb8-cont-page-book").css('width',(WIDTH_BOOK/2)+'px');
        $("#fb8 .fb8-cont-page-book").css('height',HEIGHT_BOOK+'px');
        $("#fb8 .fb8-cont-page-book").css({'transform-origin':'0 0','-ms-transform-origin':'0 0','-webkit-transform-origin':'0 0'});
        //size default for class .page_book
        var paddingL=WIDTH_BOOK*this.paddingL;
        var paddingR=WIDTH_BOOK*this.paddingR;
        var paddingT=WIDTH_BOOK*this.paddingT;
        var paddingB=WIDTH_BOOK*this.paddingB;
        $("#fb8 .fb8-page-book").css('width',(WIDTH_BOOK/2-(paddingL+paddingR))+'px');
        $("#fb8 .fb8-page-book").css('height',(HEIGHT_BOOK-(paddingT+paddingB))+'px');
        
        /* SCALE ABOUT near FLIPBOOK  /*/
        $("#fb8 #fb8-about").css('width',(WIDTH_BOOK/2)+'px');
        $("#fb8 #fb8-about").css('height',HEIGHT_BOOK+'px');
		if(RTL=='true'){
			$("#fb8 #fb8-about").css('right','0px');
			$("#fb8 #fb8-about").css({'transform-origin':'right 0','-ms-transform-origin':'right 0','-webkit-transform-origin':'right 0'});
		}else{
        	$("#fb8 #fb8-about").css({'transform-origin':'0 0','-ms-transform-origin':'0 0','-webkit-transform-origin':'0 0'});
		}
		
        //run key
        this.key_down();    

        //show and hide full screen icon
        if(!$.support.fullscreen){
        	$('li a.fb8-fullscreen').parent(this).remove();
        }
		
		
		///redirect from youtube and setPage ( change attributes href to onClick )
		/*
		$('#fb8 a[href]').each(function(index, element) {
			var el=$(element);
            var href=el.attr('href');						
			if ( href.indexOf("youtube") >= 0 || href.indexOf("setPage") >= 0 ) {
				   el.attr('onClick',href);
				   el.removeAttr('href');			   
		    }
        });
		/*/
		
             
    },
        
    load: function(){
		if( general.browser_firefox() ) {
        	console.log('book:load');
		}
		
        //preloader hide
        $('.fb8-preloader').css('display','none');
        
   		$.address.strict(false)
		$.address.autoUpdate(true)
	
		$('#fb8-container-book').show();
		
		Book_v8.init();
	
		Book_v8.zoomAuto();
		
		Book_v8.book_position();
	
		Book_v8.dragdrop_init();

		Navigation_v8.init();

		Book_v8.resize_page();   
        
        if( TOOLS_VISIBLE == "true" ){
        	$("#fb8 #fb8-footer").css('opacity','1');
        }
        
         //center icon
        Book_v8.center_icon();
        Book_v8.center_icon();
        Book_v8.media_queries()
		
		
   
         
    },
	
	getLength:function(){		
		return $('#fb8-deeplinking ul li').length;		
	},
    
    center_icon:function(){
    
        //icon tools position
        var icon=$('#fb8-center');
        var all_width=$('#fb8').width();
        var left_w=$('#fb8-logo').width();
        var center_w=$('#fb8-center').width();
        var right_w=$('#fb8-right').width();
                
        var posX=all_width/2-center_w/2;
		var posY=-$('#fb8-footer').position().top+10;
        icon.css('left',posX+'px');
		icon.css('top',posY+'px');
		
		
		///
		var input=$('#fb8-right');
		var inputX=all_width/2- input.width()/2;
		var inputX= $('#fb8-container-book').position().left+ Book_v8.widthBook()/2- input.width()/2;
		
		var inputY= -$('#fb8-footer').position().top+ Book_v8.heightBook()+ $('#fb8-container-book').position().top;
        input.css('left',inputX+'px');
		input.css('top',inputY+'px');
		
		//remove menu on IPhone
		if( all_width <365 ){
			icon.css('display','none');
		}else{
			icon.css('display','block');
		}
		
	
        
        
    },
    
    media_queries:function (){
       /*      
       //center
       var position_center=$('#fb8-center').position();
       var xMax_center=position_center.left+$('#fb8-center').width();
       var xMin_center=position_center.left
       //right
       var position_right=$('#fb8-right').position();
       var xMin_right=position_right.left;
       //left
       var position_left=$('#fb8-logo').position();
       var xMax_left=position_left.left+$('#fb8-logo').width();
              
       if( xMax_center > xMin_right || xMax_left > xMin_center  ){
         //$('#fb8 #fb8-right,#fb8 #fb8-logo').css('visibility','hidden');
       }else{
         //$('#fb8 #fb8-right,#fb8 #fb8-logo').css('visibility','visible');
       }
       /*/

    }, 
    
    autoMarginB:function(){
		
      return Math.round(  $('#fb8').height()*0.02 )
    },
    
    autoMarginT:function(){
		 if( $('#fb8-center ul li').length==0 ){
            return Math.round( $('#fb8').height()*0.02 )
		 }else{
       		return 90;      
		 }
    },
    
     autoMarginL:function(){
      return Math.round( $('#fb8').width()*0.02 )    
    },
    
     autoMarginR:function(){
       return Math.round(  $('#fb8').width()*0.02 )   
    },
	
	change_address:function(){
		
						var th=this;
						if( general.browser_firefox() ) {
							console.log("book:change address")
						}
						//$('h1.entry-title').append(' /change ')
					    ///for slug
					    var slug=$.address.pathNames()[0];
					    if(th.tmp_slug!=undefined&&slug!=th.tmp_slug){
			   			 
					      
						 //setAddress('book5-1'); 
						 setTimeout(function(){
						 window.location.reload();
						 },1);
						 
						 if( general.browser_firefox() ) {
						 	console.log("book:change book")
						 }
						 //$('h1.entry-title').append(' /change book ')
						 
						 $("#fb8").remove();
						 // Ajax_v8.ready()
						 return;
					   }
					   
					   th.tmp_slug=slug;
					
					   //normal
                       var address=$.address.pathNames()[$.address.pathNames().length-1];
                       var results=$('#fb8-deeplinking ul li[data-address='+address+']');
                       var nrPage=results.attr('data-page')
					   if(RTL=='true'){
				           var nrPage =  ( Book_v8.getLength()+1 ) -results.attr('data-page');						
				       }
					   //error nr page
					   if(!nrPage){
						   if(RTL=='true'){
						      nrPage=Book_v8.getLength();
					       }else{ 
                              nrPage=1;   
						   }
                       }
				
                       $('#fb8-book').turn('page',nrPage);
                       Book_v8.resize_page();
		
	},
    
    init: function() {
		
		var th=this;
		//this.on_start = true;
		
		
	    if( SWF_ADDRESS=="true" ){
        
                /* =  jQuery Addresss INIT
                --------------------------*/
                var current_address=$.address.pathNames()[$.address.pathNames().length-1];
                BOOK_SLUG=$.address.pathNames()[0];
                var results=$('#fb8-deeplinking ul li[data-address='+current_address+']');
                var nrPage =   results.attr('data-page');
				if(RTL=='true'){
				 var nrPage =   ( Book_v8.getLength()+1 ) -results.attr('data-page');						
				}
               
			    //error nr page
			    if(!nrPage){
					if(RTL=='true'){
						 nrPage=Book_v8.getLength();
					 }else{ 
                         nrPage=1;   
					 }
                }
			
        
                /* =  jQuery Addresss CHANGE
                --------------------------*/ 
                $.address.change(function(event) {
					   th.change_address()     
               })
			   
			   
       }
	 
		
		$('#fb8-book').turn({
			display: 'double',
			acceleration: true,
			elevation:50,
			page:nrPage,
			when: {
				first: function(e, page) {
					$('.fb8-nav-arrow.prev').hide();
				},
				
				turned: function(e, page) {
					
					if (page > 1) {
						$('.fb8-nav-arrow.prev').fadeIn();
						//$('#fb8-about').hide();
					}
					
					if( (page==1&&RTL=='false') || ( page==$(this).turn('pages')&&RTL=='true') ){	
						$('#fb8-about').css('z-index',11);
					}						
					
					if ( page < $(this).turn('pages') ) {
						$('.fb8-nav-arrow.next').fadeIn();
					}
					
					
					
					
					
					var page1=page;
						if(RTL=="true"){
							 page1=Book_v8.getLength()-page+1;
						}
						var page2;
						
						if(page1>1&&page1<Book_v8.getLength()){
						   var even=( RTL=="true" ) ? page%2!=0    :page%2==0 	
						   if(even){
							   page2=page1+1;						   
						   }else{
							   page2=page1-1; 
						   }
						   if(RTL=="true"){
						   	  var page_view=Math.max(page2,page1)+"-"+Math.min(page2,page1);  
						   }else{
							  var page_view=Math.min(page2,page1)+"-"+Math.max(page2,page1);   
						   }
						}else{
						  var page_view=page1;							
						}
						
						$('#fb8-page-number').val(page_view);
					
					
					
                                       
					Book_v8.resize_page();
                    if(SWF_ADDRESS=="true"){
                       if(RTL=='true'){
						 setPage( new Number(page).rtl() )   
					   }else{
						 setPage(page);   
					   }
					       
					   th.tmp_slug=$.address.pathNames()[0]             
                    }
				},
				
				turning: function(e, page) {
							
					$('#fb8-about').css('z-index',5);
					
                    
				},
				
				last: function(e, page) {
					$('.fb8-nav-arrow.next').hide();
				}	
			}
		});
		Book_v8.arrows();
		
	},
	
	corner_change:function(boolean_){
		//$('#fb8-book').turn("disable",boolean_);		
	},
        
	center: function (lightbox_) {
	
			var iframe=$('iframe',lightbox_);
			var old_w=iframe.attr("width");
			var old_h=iframe.attr("height");
    		iframe.css("position","absolute");
	
			var stage_w=$(window).width();
            var stage_h=$(window).height();
            var delta_w=stage_w-old_w;
            var delta_h=stage_h-old_h
            
            if(delta_w<delta_h){
                var new_w=$(window).width()-200;
                var new_h=(new_w*old_h)/old_w
            }else{
                var new_h=$(window).height()-200;
                var new_w=(old_w*new_h)/old_h
            }
            iframe.attr("width", new_w);
            iframe.attr("height",new_h);
            
            var height=iframe.height();
            var width=iframe.width();
            iframe.css("top", ( $(window).height()/2 - height/2+"px"));
            iframe.css("left", ( $(window).width()/2 -width/2+"px"  ));
	},    
        
    key_down: function(){
        $(window).bind('keydown', function(e){
		if (e.keyCode==37)
			//$('#fb8-book').turn('previous');
            Book_v8.prevPage();
		else if (e.keyCode==39)
			//$('#fb8-book').turn('next');
            Book_v8.nextPage();

		});	
    },

    resize_input_text: function (){
		var input=$('#fb8-page-number');
		var btn=$('div#fb8-right button');
		input.css('width',GOTOPAGE_WIDTH);
		//input.css('padding-right',btn.width()+2);
	}, 

    isiPhone: function (){
       return ( (navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPad") != -1)  );
    },

	arrows: function() {
		$('.fb8-nav-arrow.prev').click(function() {
			//$('#fb8-book').turn('previous');
            Book_v8.prevPage();
            Book_v8.resize_page()
		});
		$('.fb8-nav-arrow.next').click(function() {
			//$('#fb8-book').turn('next');
            Book_v8.nextPage();
            Book_v8.resize_page()
		});
	},
    
    nextPage:function(){
      
      var current=$('#fb8-book').turn('page');
      if( current%2==0){
		 var page=current+2
      }else{
         var page=current+1 
      }      

      if(RTL=='true'){
		setPage( new Number(page).rtl() )   
	  }else{
		setPage(page);   
	  }
  
    
    },
    
    prevPage:function(){
    
      var current=$('#fb8-book').turn('page');
      if(current==1) {return;}
      if( current%2==0){
         var page=current-1;
      }else{
         var page=current-2;
      }
	  
	  if(RTL=='true'){
		setPage( new Number(page).rtl() )   
	  }else{
		setPage(page);   
	  }
	  
    
    },

	all_pages: function() {
        
		//remove corner
		Book_v8.corner_change(true);     
			 
        ///height thumbs
        var cont_thumbs=$('#fb8-all-pages .fb8-container-pages');
        var area_height=$('#fb8').height()-this.toolsHeight;
        var height_container=area_height*80/100;
        if(height_container>225){
          height_container=225;
        }
        cont_thumbs.css('height',height_container+'px');
        //position thumbs
        var _top=( (area_height/2) -  ( (cont_thumbs.outerHeight())/2   )  )
        cont_thumbs.css('top',_top+'px');
     
		var summary = 0;
		var self = this;
		var slider_width = $('#fb8-slider').width();
		
		$('#fb8-slider').append('<li></li>');
		
		$('#fb8-slider li').each(function() {
			li_width = $(this).outerWidth();
			summary += li_width;
		})
	
		$('#fb8-slider').css('width', summary);
	
		$("#fb8-menu-holder").mousemove(function(e) {
                      	
			if ( $(this).width() < $("#fb8-slider").width() ) {
	     		var distance = e.pageX - $(this).offset().left;
				var percentage = distance / $(this).width();
				var targetX = -Math.round(($("#fb8-slider").width() - $(this).width()) * percentage);
	    		$('#fb8-slider').animate({left: [targetX+"px",'easeOutCubic']  }, { queue:false, duration: 200 });
			}
		});

        //////////////////////SWIPE
        if(self.events_thumbs!=1){
        $('#fb8-all-pages .fb8-container-pages').bind("touchstart", function(e) {
               
               $('#fb8-slider').stop();
               
               //time
               self.time_start=new Date().getTime();
               self.time_move_old=self.time_start;
               
               //road
			   self.x_start = e.originalEvent.targetTouches[0].pageX;
			   self.x_move=undefined;
               self.x_move_old=self.x_start;
		});
        
        
        $('#fb8-all-pages .fb8-container-pages').bind("touchmove", function(e) {
   			   	
                //current round and time
                self.x_move = e.originalEvent.targetTouches[0].pageX;  
                self.time_move=new Date().getTime();
                                        
                //time - delta
                self.delta_t=new Date().getTime()-self.time_move_old;
                self.time_move_old=new Date().getTime();                
                                        
                //round- delta
                self.delta_s=self.x_move-self.x_move_old;
                self.x_move_old=self.x_move;
                    
                //set position thumbs
                self.current_x=parseInt( $('#fb8-slider').css('left') ); 
                var new_position=self.current_x+self.delta_s;
                if(new_position>0){ new_position=0 }   
                var minX=-summary+WINDOW_WIDTH;
                if(new_position<minX ){new_position=minX}
                $('#fb8-slider').css({left:new_position});
              
                //remove default action
                e.preventDefault(e);       
                
                         
		 });
         
         $('#fb8-all-pages .fb8-container-pages').bind("touchend", function(e) {   
               
               //calculation speed                 
               var v=self.delta_s/self.delta_t;
               var s= ( WINDOW_WIDTH*0.25 )*v; 
               var t=Math.abs(s/v);
            
               //set position thumbs
               var new_position=self.current_x+s
               if(new_position>0){new_position=0}   
               var minX=-summary+WINDOW_WIDTH;
               if(new_position<minX ){new_position=minX } 
             
               if( Math.abs( self.delta_s ) > 5){
                
          		 $('#fb8-slider').animate({ left:[new_position+"px","easeOutCubic"]  },t);               
               }			   
		               
              //e.preventDefault(e);
 
		});		
        //////////////////////end SWIPE
        self.events_thumbs=1;
        }        
		

		$('#fb8-slider li').on('click',function() {
            self.x_start=null;
            self.x_move=null;
		    $('#fb8-slider').stop();
			var page_index = $(this).attr('class');
			var tmp = parseInt(page_index);
			close_overlay();
			
			setTimeout(function(){
				setPage(tmp);   
			},100);

		})

		$(document).on('click',function(e) {
			var target = $(e.target);
			if ( target.hasClass('fb8-overlay') ) close_overlay();
		});
        
       
	
	},

	book_grab: function() {
		$('#fb8-container-book').css('cursor', '-webkit-grab');
		$('#fb8-container-book').css('cursor', '-moz-grab');
		
	},

	book_grabbing: function() {
		$('#fb8-container-book').css('cursor', '-webkit-grabbing');
		$('#fb8-container-book').css('cursor', '-moz-grabbing');
		 
	},
    
    book_area: function(){
		
        var width_book=$('#fb8').width();
                
        ///if(IS_AS_TEMPLATE==true){
           // var height=$(window).height()+"px";
        //}else{
            //var height=(width_book*HEIGHT_BOOK/WIDTH_BOOK)+this.toolsHeight+"px";
        ///}
        
        if(IS_AS_TEMPLATE==true){
           var height="100%";//$(window).height()+"px";
        }else{
        
           if( $('#fb8').hasClass('fullScreen') ){
              var height='100%'//$(window).height()+"px";
           }else{           
              var height=(width_book*HEIGHT_BOOK/WIDTH_BOOK)+this.toolsHeight+"px";
           }
                     
        }
        
        
         
         $("#fb8").css('height',height);
		
	},
    
    ///current width book
    widthBook:  function(){
         return $('#fb8-container-book').width();   
    },
    
    //current height book
    heightBook: function(){
         return $('#fb8-container-book').height();    
    },

	book_position: function() {
    
  
		var book_height	= this.heightBook();
		var book_width	= this.widthBook();
		
		var half_height	= (  (book_height/2)+this.toolsHeight/2   );
		var half_width	= (  book_width/2 );
        
        var x=$('#fb8').width()/2-half_width;
        //var y=$('#fb8').height()/2-half_height;
		//var y=Book_v8.autoMarginT()+ ($('#fb8').height()-Book_v8.autoMarginT() - Book_v8.toolsHeight)/2 -(book_height/2) 
		var y=Book_v8.autoMarginT(); 
		$('#fb8-container-book').css({ left: x, top:y });
		
		/*footer position/*/
		var new_y=book_height+this.autoMarginT()+this.autoMarginB();
		//$("#fb8-footer").css({top:new_y+'px'});
		//$("#fb8").css('height',new_y+this.toolsHeight);
        
	},
    
    touchstart_book:function(e){
    
       this.book_x = e.originalEvent.touches[0].pageX;
       this.book_y = e.originalEvent.touches[0].pageY;
         
    },
    
    touchmove_book:function(e){
    
        //delta x
        this.book_x_delta=e.originalEvent.touches[0].pageX-this.book_x;
        this.book_x=e.originalEvent.touches[0].pageX;
        
        //delta y
        this.book_y_delta=e.originalEvent.touches[0].pageY-this.book_y;
        this.book_y=e.originalEvent.touches[0].pageY;
        
                
        var current_x= parseInt(  $('#fb8-container-book').css('left')  )
        var current_y= parseInt(  $('#fb8-container-book').css('top')  )
        
        var x=current_x+this.book_x_delta;
        var y=current_y+this.book_y_delta;
        $('#fb8-container-book').css( {left:x,top:y } ); 
        
        e.preventDefault();
        
        
        
        //var t=e.originalEvent.changedTouches[0].pageX
        
        //alert("move");
    
    },
    touchend_book:function(e){
    
    
        
           
    },    

	drag: function(e) {
		
		var el = $(this);
		var dragged = el.addClass('draggable');

		$('#fb8-container-book').unbind('mousemove');
		$('#fb8-container-book').bind('mousemove', Book_v8.book_grabbing);
        
		

        var d_h = dragged.outerHeight();
        var d_w = dragged.outerWidth();
        var pos_y = dragged.offset().top + d_h - e.pageY;
        var pos_x = dragged.offset().left + d_w - e.pageX;
        
		dragged.parents().unbind("mousemove");
        dragged.parents().bind("mousemove", function(e) {
			 Book_v8.center_icon();
			 
            $('.draggable').offset({
                top:e.pageY + pos_y - d_h,
                left:e.pageX + pos_x - d_w
            });
        });
        e.preventDefault();
	},
	
	drop: function() {
		Book_v8.book_grab();
		$('#fb8-container-book').bind('mousemove', Book_v8.book_grab);
		$('#fb8-container-book').removeClass('draggable');
	},
    
    checkScrollBook: function () {
      
	  
	  
      var vertical=$('#fb8-book').height() > $("#fb8").height() - this.toolsHeight- this.autoMarginT()
	  var horizontal=$('#fb8-book').width() > $("#fb8").width() - (this.arrow_width*2);
      
 	
	  if ( vertical || horizontal ) {
		higherThanWindow = true;
      } else {
		higherThanWindow = false;
	  }
	   return higherThanWindow;
    },

	dragdrop_init: function() {
		this.checkScrollBook();

		if ( higherThanWindow == false ) {
            //mobile
            $('#fb8-container-book').unbind('touchstart', Book_v8.touchstart_book);
            $('#fb8-container-book').unbind('touchmove', Book_v8.touchmove_book);
            $('#fb8-container-book').unbind('touchend', Book_v8.touchend_book);    
            
        
			$('#fb8-container-book').unbind('mousedown', Book_v8.drag);
			$('#fb8-container-book').unbind('mouseup', Book_v8.drop);
			$('#fb8-container-book').unbind('mousemove', Book_v8.book_grab);
			$('#fb8-container-book').unbind('mousemove', Book_v8.book_grabbing);
			$('#fb8-container-book').css('cursor', 'default');
		} else {
            //mobile
            $('#fb8-container-book').bind('touchstart', Book_v8.touchstart_book);
            $('#fb8-container-book').bind('touchmove', Book_v8.touchmove_book);
            $('#fb8-container-book').bind('touchend', Book_v8.touchend_book);
            
			$('#fb8-container-book').bind('mousedown', Book_v8.drag);
			$('#fb8-container-book').bind('mouseup', Book_v8.drop);
			$('#fb8-container-book').bind('mousemove', Book_v8.book_grab);
            Book_v8.book_grab();
		}
		Book_v8.resize_page();
	},
	
	scaleStart: function() {
		//if ( this.on_start == true ) {
			this.checkScrollBook();			
			//this.on_start = false;
		//}
	},
    
    setSize:function(w_,h_){
    
       $('#fb8-container-book').css({ width:w_, height:h_ });
	   $('#fb8-book').turn('size',w_,h_);
    
    },
    
    zoomTo:function(zoom_){
       
       this.zoom=zoom_;
         
       var new_width=(WIDTH_BOOK*this.zoom);
       var new_height=(HEIGHT_BOOK*this.zoom);
       
      
       this.setSize(new_width,new_height);
       this.scale_arrows()
       
       this.book_position();
       Book_v8.dragdrop_init();
       Book_v8.resize_page()
	   
	   Book_v8.center_icon();
      
       
    },
    
    zoomOriginal:function(){
    
        this.zoomTo(1);
             
    },   
   
    scale_arrows:function(){
       
       var HEIGHT_ARROW=128;
       var WIDTH_ARROW=61;
       
       var height_arrow=this.heightBook()*0.25;
       if( height_arrow > 136 ){
         height_arrow=136;
       }
        
       
       var width_arrow= (height_arrow*WIDTH_ARROW)/HEIGHT_ARROW;
      
       this.zoom_arrows=height_arrow/HEIGHT_ARROW;   
         
           				$('.fb8-nav-arrow').css({'transform':'scale('+this.zoom_arrows+')','-ms-transform':'scale('+this.zoom_arrows+')','-webkit-transform':'scale('+this.zoom_arrows+')'});    
    },
    
	zoomAuto: function() {
				
		Book_v8.scaleStart();	
        
          
        ////resize one 
        var zoom=this.getAutoZoomBook(0);   
        this.zoomTo( zoom  ) 
          
		////resize two (with arrow)
        this.scale_arrows();
        var arrow_width=$('.fb8-nav-arrow').width()*this.zoom_arrows; 
        this.arrow_width=arrow_width;
        var zoom=this.getAutoZoomBook(arrow_width*2);
        //calculate optimal zoom
        zoom=Math.round(zoom * 100) / 100
        var percent=zoom*100;
        if(percent%2!=0){
          zoom=zoom-0.01;
        }
   		this.zoomTo( zoom   )

		Book_v8.resize_page()
      
	},
         
    getAutoZoomBook: function(arrow_width_){
       
        var book_width=this.widthBook();
		var book_height=this.heightBook();
		var screen_width	=  $("#fb8").width()-  ( this.autoMarginL()+this.autoMarginR() + (arrow_width_) );
		var screen_height	= $("#fb8").height()-this.toolsHeight-( this.autoMarginT()+this.autoMarginB()  )
 
		
		if(screen_width>WIDTH_BOOK){
		  screen_width=WIDTH_BOOK	
		}
		
		if(screen_height>HEIGHT_BOOK){
		  screen_height=HEIGHT_BOOK	
		}
		
		
		var scaleW=screen_width/book_width;
		var scaleH=screen_height/book_height;
		
		var scale=Math.min(scaleW,scaleH)	
		var new_width		= book_width*scale;
		var new_height		= book_height*scale;
        var auto_zoom= new_width/WIDTH_BOOK
        return auto_zoom;
    
    },

	zoomIn: function() {
       var zoom=this.zoom;  
       
        
       this.zoomTo(zoom+ZOOM_STEP  );
	},
	
	zoomOut: function() {
	   this.zoomTo( this.zoom-ZOOM_STEP );
	},
    
    resize_page: function (){
		
         /* RESIZE PAGE IN FLIPBOOK  /*/
         //resize class .fb8-page-book
         var page_width=this.widthBook()/2;
         var width_current_page=(page_width)
         var width_orginal_page=  ( WIDTH_BOOK/2 )     
         var zoom= (width_current_page / width_orginal_page);
         $('.fb8-cont-page-book').css({'transform':'scale('+zoom+')','-ms-transform':'scale('+zoom+')','-webkit-transform':'scale('+zoom+')'});
         ///center class .fb8-page-book
         var paddingL=(this.widthBook()*this.paddingL)/zoom;
         var paddingT=(this.widthBook()*this.paddingT)/zoom;
         $('.fb8-page-book').css({'left':paddingL+'px','top':paddingT+'px'});
            
         /* RESIZE ABOUT IN FLIPBOOK  /*/
         $('#fb8-about').css({'transform':'scale('+zoom+')','-ms-transform':'scale('+zoom+')','-webkit-transform':'scale('+zoom+')'});
         //padding top
         var padding_top=(this.heightBook()*0.05);
         $('#fb8-about').css('top',padding_top+'px');
         //height
         var height=(this.heightBook()-( padding_top*2) )/zoom;
         $('#fb8-about').css('height',height+'px');
         //width
         var width=(  (this.widthBook()/2)-( this.widthBook()*0.05  ) )/zoom;
         $('#fb8-about').css('width',width+'px');
		 
		 
		 //CENTER VERTICAL FOR HOME PAGE
		 //var posY=$('.fb8-page-book').height()/2 - $('#fb8 #fb8-cover ul').innerHeight()/2;
		 //$('#fb8 #fb8-cover ul').css('top',posY+'px');
		 
		 
	},
    
    resize_font:  function($size_original_,path_){
		var w=this.widthBook();
		var size= ($size_original_*w)/WIDTH_BOOK;
		var new_size=Math.round(parseInt(size))+"px";
		///$(path_).css('font-size',new_size);
		///$(path_).css('line-height',new_size);
        $(path_).css('font-size',$size_original_+"px");
		$(path_).css('line-height',$size_original_+"px");
	}
}


/* =  Navigation
--------------------------*/

var Navigation_v8 = {
	
	tooltip: function() {
    
    
		$('.fb8-menu li').filter(':not(.fb8-goto)').each(function() {
			var description = $('a', this).attr('title');
			var tooltip = '<span class="fb8-tooltip">'+description+'<b></b></span>';
			$('a', this).removeAttr("title");
			$(this).append(tooltip);
		});
		
		$('.fb8-menu li').mousemove(function(e) {
                        
            var tooltip=$('.fb8-tooltip', this);
			var offset = $(this).offset(); 
            var relY = e.pageY - offset.top;
            var x2= e.pageX-$('#fb8').offset().left+tooltip.width()  
            var width_area=$('#fb8').width()
            
            if( (x2+10)>width_area){
                var orient="right";
            }else{
            	var orient="left";
            }
            
            if(orient=="left"){
     			var relX = e.pageX - offset.left;
                $('#fb8 .fb8-tooltip b').css('left','6px')
            }else{
                var relX = e.pageX - offset.left-tooltip.width()-5;
                $('#fb8 .fb8-tooltip b').css('left',(tooltip.width()+6)+'px') 
            }			            
            
            //$('.fb8-tooltip', this).html( x2+" > "+width_area  );
			$('.fb8-tooltip', this).css({ left: relX, top: relY+35 });
		})
		
		$('.fb8-menu li').hover(function() { 
			$('.fb8-tooltip').stop();
			$('.fb8-tooltip', this).fadeIn();
		}, function() {
			$('.fb8-tooltip').hide();
		});
		
		Book_v8.resize_page()

	},


    ///event mouse down in book 
	book_mouse_down: function(){
   			$('#fb8-about').css('z-index',5);
			//Book_v8.resize_page();
	},
	
	book_mouse_up: function(e){
		 var offset = $(this).offset();
		 var relativeX = (e.pageX - offset.left);
         if( relativeX > ( WIDTH_BOOK / 2 )  ){
			//$('#fb8-about').css('z-index',11); 
		 }
	    
	},

	init: function() {

		// Double Click
        if(ZOOM_DOUBLE_CLICK_ENABLED=="true"){
		$('#fb8-book').dblclick(function() {
			           
            if(Book_v8.checkScrollBook()==false){ //zoom
                 Book_v8.zoomTo(ZOOM_DOUBLE_CLICK)
            }else{
               Book_v8.zoomAuto();
               $('#fb8-container-book').css('cursor', 'default');
            }
		});
        }


     
	//focus for page manager
	var page_manager=$('#fb8-page-number');
	page_manager.focus(function(e) {
		var target=$(e.currentTarget);
		target.data('current',target.val());
		target.val('')
		target.addClass('focus_input');
		
        
    });
	page_manager.focusout(function(e) {
		var target=$(e.currentTarget);
		var old=target.data('current');
		target.removeClass('focus_input');
		if( target.val() ==''){
		  target.val(old);	
		}
    }); 


    //full screen
    $('.fb8-fullscreen').on('click', function() {
			
     $('.fb8-tooltip').hide();
     
     $('#fb8').fullScreen({
         
         'callback': function(isFullScreen){
         
           Book_v8.book_area();
           Book_v8.zoomAuto();
           Book_v8.center_icon();
         
             if(isFullScreen){
                
             }else{
                
             }
        
          }
         });
         e.preventDefault();
            
	  });
         
		 
		//download
		
		 
		 
		 $('.fb8-download').on('click', function(event) {
     	 
		 
		  
		 
		 
		  //$.address.update();
		 // event.preventDefault();
		  
		}); 

	    // Home 
	    $('.fb8-home').on('click', function() {     	  
		  setPage(1);
	      //setAddress('book5-1');		  
		});
	
		// Zoom Original
		$('.fb8-zoom-original').click(function() {
			

            Book_v8.zoomOriginal();
      
			
		});
	
		// Zoom Auto
		$('.fb8-zoom-auto').on('click', function() {
			Book_v8.zoomAuto();
		});

		// Zoom In
		$('.fb8-zoom-in').on('click', function() {
			
				Book_v8.zoomIn();
				
							
		});
	
		// Zoom Out
		$('.fb8-zoom-out').on('click', function() {
			
				Book_v8.zoomOut();
				
		});

		// All Pages
		$('.fb8-show-all').on('click', function() {
			$('#fb8-all-pages').
				addClass('active').
				css('opacity', 0).
				animate({ opacity: 1 }, 1000);
			Book_v8.all_pages();
			return false;
		})
		
		// Goto Page
		$('#fb8-page-number').keydown(function(e) {
			if (e.keyCode == 13) {
               setPage( $('#fb8-page-number').val() );
            }
		});
		
		$('.fb8-goto button').click(function(e) {
            setPage( $('#fb8-page-number').val() );
		});


		// Contact
		$('.contact').click(function() {
			$('#fb8-contact').addClass('active').animate({ opacity: 1 }, 1000);
			contact_form();
			clear_on_focus();
			return false;
		})
		
		//change z-index in about
		$('#fb8-book').bind('mousedown',this.book_mouse_down);
		$('#fb8-book').bind('mouseup',this.book_mouse_up);
		if (Book_v8.isiPhone()) {//for IPhone		
		$('#fb8-book').bind('touchstart',this.book_mouse_down);
		$('#fb8-book').bind('touchend',this.book_mouse_up);
		}

		//show tooltip for icon
		if ( !Book_v8.isiPhone() && TOOL_TIP_VISIBLE=="true" ) {
			this.tooltip();
		}
	}
}

 
/* = CONTACT FORM
--------------------------*/

function clear_on_focus() {
	$('input[type="text"], input[type="password"], textarea').each( function() {
		var startValue = $(this).val();
		$.data(this, "startValue", startValue);	
        this.value=startValue;
	})

	$('input[type="text"], input[type="password"], textarea').focus(function() {
		var startValue = $.data(this, "startValue");		
		if ( this.value == startValue ) {
			this.value = '';
		}
	});
	$('input[type="text"], input[type="password"], textarea').blur(function() {
        var startValue = $.data(this, "startValue");
		if ( this.value == '' ) {
			this.value = startValue;
		}
	})
}


function close_overlay() {
	$('.fb8-overlay').removeClass('active');
	setTimeout(function(){
	Book_v8.corner_change(false);
	},1000);
}


function contact_form() {

	$('#fb8-contact .req').each(function() {
		var startValue = $(this).val();
		$.data(this, "startValue", startValue);
	});

	$('#fb8-contact button[type="submit"]').click(function() {

		$('#fb8-contact .req').removeClass('fb8-error');
		$('#fb8-contact button').fadeOut('fast');

		var isError = 0;

		// Get the data from the form
		var name	= $('#fb8-contact #fb8-form-name').val();
		var email	= $('#fb8-contact #fb8-form-email').val();
		var message	= $('#fb8-contact #fb8-form-message').val();

		// Validate the data
		$('#fb8-contact .req').each(function() {
			var startValue = jQuery.data(this, "startValue");
			if ( ($(this).val() == '') || (this.value == startValue) ) {
				$(this).addClass('fb8-error');
				isError = 1;
			}
		});

		var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		if (reg.test(email)==false) {
			$('#fb8-contact #fb8-form-email').addClass('fb8-error');
			isError=1;
		}

		// Terminate the script if an error is found
		if (isError == 1) {
			$('#fb8-contact button').fadeIn('fast');
			return false;
		}

		$.ajaxSetup ({
			cache: false
		});

        var _email=Book_v8.config['email_form']; 
		var dataString = 'name='+ name + '&email=' + email + '&message=' + message+'&_email='+_email;  
		
		$.ajax({
			type: "POST",
			url: "php/submit-form-ajax.php",
			data: dataString,
			success: function(msg) {
				
				// Check to see if the mail was successfully sent
				if (msg == 'Mail sent') {
					$("#fb8-contact fieldset").hide();
					$("#fb8-contact fieldset.fb8-thanks").show();
					
					setTimeout(function() {
						close_overlay();
					}, 5000);
					
				} else {
					$('#fb8-contact button').fadeIn('fast');
					alert('The problem with sending it, please try again!');
				}
			},

			error: function(ob,errStr) {
				alert('The problem with sending it, please try again.');
			}
		});
		return false;
	});

	$('#fb8-contact .fb8-close').click(function() {
		close_overlay();
	})
}



/*
 * $ Easing v1.3 - http://gsgd.co.uk/sandbox/$/easing/
 *
 * Uses the built in easing capabilities added In $ 1.1
 * to offer multiple easing options
*/

$.easing["jswing"]=$.easing["swing"];$.extend($.easing,{def:"easeOutQuad",swing:function(a,b,c,d,e){return $.easing[$.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b+c;return-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b+c;return d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b+c;return-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b*b+c;return d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return-d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return b==0?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){if(b==0)return c;if(b==e)return c+d;if((b/=e/2)<1)return d/2*Math.pow(2,10*(b-1))+c;return d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return-d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){if((b/=e/2)<1)return-d/2*(Math.sqrt(1-b*b)-1)+c;return d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c},easeOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c},easeInOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e/2)==2)return c+d;if(!g)g=e*.3*1.5;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);if(b<1)return-.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c;return h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)*.5+d+c},easeInBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;if((b/=e/2)<1)return d/2*b*b*(((f*=1.525)+1)*b-f)+c;return d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-$.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){if((b/=e)<1/2.75){return d*7.5625*b*b+c}else if(b<2/2.75){return d*(7.5625*(b-=1.5/2.75)*b+.75)+c}else if(b<2.5/2.75){return d*(7.5625*(b-=2.25/2.75)*b+.9375)+c}else{return d*(7.5625*(b-=2.625/2.75)*b+.984375)+c}},easeInOutBounce:function(a,b,c,d,e){if(b<e/2)return $.easing.easeInBounce(a,b*2,0,d,e)*.5+c;return $.easing.easeOutBounce(a,b*2-e,0,d,e)*.5+d*.5+c}})



})(jQuery)



 
