$(document).ready(function(){
	
	$('.tog_dsch01 a').click(function(){
		if ($(this).hasClass('on')){
			$(this).removeClass('on');
			$('.nl_tnb01').slideUp('fast');
			$(this).text("Show Detailed Search");
		} else {
			$(this).addClass('on');
			$('.nl_tnb01').slideDown('fast');
			$(this).text("Hide Detailed Search");
		}
	});
	
	
	$('.nl_tsch01 .w1 .e1 a').hover(function(){
		$('.nl_tsch01 .e2 .r1 input').addClass('pl_on').attr('placeholder','You can enter up to 30 numbers at a time. Separate with a comma(,) or press Enter');
	},function(){
		$('.nl_tsch01 .e2 .r1 input').removeClass('pl_on').attr('placeholder','Please enter B/L No. or Container No. or Invoice No.');
	
	});
	$('.nl_dv1 ul li .w2 .e1').each(function(){
		var thisVal = $(this).text();
		var that = $(this);
		if (thisVal > 99 && thisVal <= 999) {
			var cnt0 = Math.floor(thisVal/100)*100;
		} else if (thisVal > 999) {
			var cnt0 = Math.floor(thisVal/1000)*1000;
		} else {
			var cnt0 = 0;
		}
	  counterFn();

	  function counterFn() {

	    id0 = setInterval(count0Fn, 10);

	    function count0Fn() {
	      cnt0++;
	      if (cnt0 > thisVal) {
	        clearInterval(id0);
	      } else {
	       	that.text(cnt0);
	      }
	    }
	  }
	});
	$('.nl_tl_cc_cancel01').click(function(){
		$('.nl_tl_cdv1 ul li .nl_tl_cdv_chk01').text('');
		$('.nl_tl_cdv1 ul li').removeClass('on');
	});
	$('.nl_tl_cdv1 ul li').click(function(){
		var chkCount = $(this).closest('.nl_tl_cdv1').find('li.on').length;
		if (chkCount < 4 && $(this).find('.nl_tl_cdv_chk01').text() == "") {
		$(this).find('.nl_tl_cdv_chk01').text(chkCount + 1);
		$(this).find('.nl_tl_cdv_chk01').parent().addClass('on');
		}
	});

	$('.nl_tl01_btn01').click(function(){
		$('.nl_tl').hide().removeClass('on');
		$('.nl_tl02').show().addClass('on');
	});
	$('.nl_tl01_btn03').click(function(){
		$('.nl_tl').hide().removeClass('on');
		$('.nl_tl01').show().addClass('on');
	});
	$('.nl_tl_tab01 ul li a').click(function(){
		var idx = $(this).closest('li').index();
		$('.nl_tl').hide().removeClass('on');
		if (idx == 0) {
			$('.nl_tl02').show().addClass('on');
		} else if (idx == 1) {
			$('.nl_tl03').show().addClass('on');
		} else if (idx == 2) {
			$('.nl_tl04').show().addClass('on');
		}
	});
	
	$('.nl_rtm01_tp .w1 a').click(function(){
		
		$('.nl_wrap01').addClass('side_on');
		$('.nl_tl.nl_tl01').show();
		setTimeout(function(){
			$('.nl_tl.nl_tl01').addClass('on');
			$('.nl_dvw1_slide').slick('refresh');
		});
	});
	
	$('.nl_rtm01_tp .w2 a').click(function(){
		$('.nl_wrap01').addClass('side_on');
		$('.nl_tl.nl_tl02').show();
		setTimeout(function(){
			$('.nl_tl.nl_tl02').addClass('on');
			$('.nl_dvw1_slide').slick('refresh');
		});
	});
	
	$('.nl_tl01_btn02').click(function(){
		$('.nl_tl').removeClass('on');
		$('.nl_wrap01').removeClass('side_on');
		
		setTimeout(function(){
			$('.nl_tl').hide();
			$('.nl_dvw1_slide').slick('refresh');
		},200);
	});
	
	$('.tool_set_tm_cancel').click(function(){
		$('#tm_red').click();
	});
	
	$('.tool_set_tm_apply').click(function(){
		var val = $('input[name=tm_sel]:checked').val();
		$('.nl_wrap01').removeClass('tm_red').removeClass('tm_orange').removeClass('tm_green').removeClass('tm_blue').removeClass('tm_pink').removeClass('tm_black');
		$('.nl_wrap01').addClass(val);
	});

	$('.btn_lpop_top_close01').click(function(){
		$.fancybox.close();
	});
	
	if ($('.nl_dvw1_slide').length) {
		$('.nl_dvw1_slide').slick({
			dots: true,
			infinite: true,
			speed: 300,
			slidesToShow: 3,
			slidesToScroll: 3,
			arrows : false,
			autoplay: false,
			autoplaySpeed: 8000,
			appendDots:$('.nl_dw1_sld_tit_lt')
		});
		
		$('.nl_dw1_sld_tit_rt a.nl_dvw1_sld_prev').click(function(){
			$('.nl_dvw1_slide').slick('prev');
		});
		$('.nl_dw1_sld_tit_rt a.nl_dvw1_sld_next').click(function(){
			$('.nl_dvw1_slide').slick('next');
		});
	}
	
	
	
	
});


