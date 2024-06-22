const bgPrimary = '#1ee384';
const hash = document.location.hash;
const showBgAnimation = (hash == '');

var darkMode = false;
const navElem = $('#nav');
const spotlight = $('#spotlight');

// typewriter effect
const typewriterElems = $('.typewriter');
const typewriterInitDelay = 7500; // delay in ms before initializing
const typewriterSpeed = 36; // speed in ms between each character
const typewriterPause = 300; // pause in ms between each element
const homeIconBottom = $('section#home .icon-bottom');
function typewriterInit() {
    let currentElem = 0;
    let charIndex = 0;

    // Function to write text in typewriter effect
    function typewriterWrite() {
        let element = typewriterElems.eq(currentElem);
        let text = element.data('text');

        if (charIndex < text.length) {
            element.append(text.charAt(charIndex));
            element.addClass('active').removeClass('waiting');
            charIndex++;
            setTimeout(typewriterWrite, typewriterSpeed);
        } else {
            // Move to the next element after a pause
            element.removeClass('active');
            charIndex = 0;
            currentElem++;
            if (currentElem < typewriterElems.length) {
                setTimeout(typewriterWrite, typewriterPause);
            } else {
                homeIconBottom.slideDown();
            }
        }
    }

    // Start the typewriter effect
    typewriterWrite();
}
$(document).ready(function() {
    if (showBgAnimation) {
        // store and clear the elems text content
        homeIconBottom.hide();
        typewriterElems.each(function(index) {
            let text = $(this).text();
            $(this).data('text', text);
            $(this).empty();
            if (index == 0) {
                $(this).addClass('active waiting');
            }
        });
        // initialize after delay
        setTimeout(typewriterInit, typewriterInitDelay);
    }
});


// project timeline
function createTimeline() {
    const groupCount = $('.timeline-group').length;
    
    $('.timeline-group').each(function(i) {
        let dotAnimDelay = (i == 0) ? '0s' : '1s';
        let groupIcon = $(this).data('icon') || 'globe';
        let elemHtml = `<div class="timeline-dot flex-center" style="animation-delay:${dotAnimDelay};"><i class="fas fa-${groupIcon}"></i></div>`;

        if (i < groupCount-1) {
            elemHtml += `<div class="timeline-line-container">
                <div class="timeline-line"></div>
            </div>`;
        }

        $(this).children('.timeline-year').append(elemHtml);
    });
    updateTimeline();
}

function updateTimeline() {
    if ($('.timeline-group:not(.active-timeout)').length > 0) {
        let windowHeight = $(window).height();
        let scrollTop = $(window).scrollTop();
        
        $('.timeline-group:not(.active-timeout)').each(function(i) {
            let elemTop = $(this).offset().top;
            let elemHeight = $(this).outerHeight();
            let elemBottom = elemTop + elemHeight;
            let elemDelay = Math.min(i * 1500, 3000);
            
            if (elemTop < scrollTop + (0.75 * windowHeight) || elemBottom < scrollTop + windowHeight) {
                $(this).addClass('active-timeout');
                setTimeout(() => {
                    $(this).addClass('active');
                }, elemDelay);
            }
        });
    }
}
$(document).ready(createTimeline); // create html for project section timeline

$(window).on('scroll', function() {
    // update nav backdrop
    let windowScrollTop = $(window).scrollTop();
    if (windowScrollTop > 100 && !darkMode) {
        navElem.addClass('backdrop');
    } else {
        navElem.removeClass('backdrop');
    }

    updateTimeline();
});

// contact me
$('#contactMe').on('click', function() {
    let confirmMsg = 'Send me an email!';
    if (confirm(confirmMsg)) {
        location.href = 'mailto:jamesmwalling@gmail.com';
    }
});


// mobile menu
function toggleMobileMenu() {
    $('#nav .nav-right').toggleClass('display-mobile-menu');
}
$('#toggle-mobile-menu').on('click', toggleMobileMenu);
$(document).on('click', '.nav-right.display-mobile-menu a', toggleMobileMenu);

// dark mode
function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
        $('body').addClass('dark-mode');
        $('#toggle-dark-mode').attr('title','Light Mode');
        $('#toggle-dark-mode i').removeClass('fa-moon').addClass('fa-sun');
        spotlight.fadeIn();
        spotlight.css('pointer-events', (pointerIsCoarse()) ? 'auto' : 'none');
        $(document).on('mousemove click', mouseMoveSpotlight);

    } else {
        $('body').removeClass('dark-mode');
        $('#toggle-dark-mode').attr('title','Dark Mode');
        $('#toggle-dark-mode i').removeClass('fa-sun').addClass('fa-moon');
        spotlight.fadeOut();
        $(document).off('mousemove click', mouseMoveSpotlight);

    }
}
$('#toggle-dark-mode').on('click', toggleDarkMode);

let spotlightClickTimeout;
let spotlightClickResetTimeout;
function mouseMoveSpotlight(e) {
    let positionLeft = e.clientX - spotlight.width()/2;
    let positionTop = e.clientY - spotlight.height()/2;

    spotlight.css({'left': positionLeft, 'top': positionTop});

    // if mobile, only allow double clicks when using spotlight
    if (pointerIsCoarse()) {
        clearTimeout(spotlightClickTimeout);
        clearTimeout(spotlightClickResetTimeout);
        spotlightClickTimeout = setTimeout(function() {
            spotlight.css('pointer-events','none');
        }, 50);
        spotlightClickResetTimeout = setTimeout(function() {
            spotlight.css('pointer-events','auto');
        }, 600);
    }
}
function pointerIsCoarse() {
    return (window.matchMedia("(pointer: coarse)").matches);
}

// background animation
function skipBgAnimation() {
    $('#slime').hide();
    $('#slime-bg').show();
}
if (showBgAnimation) {
    // fetch content of file and store in html elem
    const filePathOptions = ['index.html','port.css','port.js'];
    const bgFilePath = filePathOptions[Math.floor(Math.random() * 3)];
    fetch(bgFilePath) 
        .then(response => {
            if (!response.ok) {
                console.error('network response was not ok');
                return;
            }
            return response.text();
        })
        .then(fileCode => {
            const codeBlock = $('#bg-code code');
            const codeLang = bgFilePath.split('.')[1];
            codeBlock.addClass(`lang-${codeLang}`);
            codeBlock.text(fileCode);
            Prism.highlightElement(codeBlock[0]);
        })
        .catch(error => {
            console.error('Error fetching file:', error);
        });

} else {
    skipBgAnimation();
}

$(window).on('resize', skipBgAnimation);