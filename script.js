$(document).ready(function(){
    $(window).scroll(function(){
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        }else{
            $('.navbar').removeClass("sticky");
        }
        
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        }else{
            $('.scroll-up-btn').removeClass("show");
        }
    });

    $('.scroll-up-btn').click(function(){
        $('html').animate({scrollTop: 0});
        $('html').css("scrollBehavior", "auto");
    });

    $('.navbar .menu li a').click(function(){
        $('html').css("scrollBehavior", "smooth");
    });

    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    var typed = new Typed(".typing", {
        strings: ["Data","Code","Ideas","Insights"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    });

    var typed = new Typed(".typing-2", {
        strings: ["Analyst","Programmer","Developer"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    });

    $('.carousel').owlCarousel({
        margin: 20,
        loop: true,
        autoplay: true,
        autoplayTimeOut: 2000,
        autoplayHoverPause: true,
        responsive: {
            0:{
                items: 1,
                nav: false
            },
            600:{
                items: 2,
                nav: false
            },
            1000:{
                items: 3,
                nav: false
            }
        }
    });
});

const progressBar = document.getElementById("myProgressBar");
    const predefinedPercentage = 70; // Set your desired percentage here (change to a number between 0 and 100)

    function fillProgressBar() {
      const containerRect = progressBar.parentElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (containerRect.top <= windowHeight && containerRect.bottom >= 0) {
        // Element is visible on the viewport
        progressBar.style.width = `${predefinedPercentage}%`;
      }
    }

    window.addEventListener("scroll", fillProgressBar);
    window.addEventListener("load", fillProgressBar);
