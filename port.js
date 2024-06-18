var darkMode = sessionStorage.getItem('darkMode') || false;
darkMode = (darkMode == 'true');
var darkModeFirst = darkMode;

const bgPrimary = '#1ee384';
const hash = document.location.hash;
const showBgAnimation = (hash == '');

const spotlight = $('#spotlight');

$(document).ready(function() {
    
    createTimeline(); // create html for project section timeline

    checkDarkMode();

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
$(window).on('scroll', updateTimeline);

// contact me
$('#contactMe').on('click', function() {
    let confirmMsg = 'Send me an email!';
    if (confirm(confirmMsg)) {
        location.href = 'mailto:jamesmwalling@gmail.com';
    }
});


// dark mode
function checkDarkMode(toggle = false) {
    if (toggle) {
        darkMode = !darkMode;
        sessionStorage.setItem('darkMode', darkMode);

        if (darkModeFirst && !darkMode) { location.reload(); }
    }

    if (darkMode) {
        $('body').addClass('dark-mode');
        $('#toggleDarkMode > span').text('Light Mode');
        $('#spotlight').fadeIn();
        $(document).on('mousemove click', mouseMoveSpotlight);

    } else {
        $('body').removeClass('dark-mode');
        $('#toggleDarkMode > span').text('Dark Mode');
        $('#spotlight').fadeOut();
        $(document).off('mousemove click', mouseMoveSpotlight);

    }
}
$('#toggleDarkMode').on('click', function() {
    checkDarkMode(true);
});
function mouseMoveSpotlight(e) {
    let positionLeft = e.clientX - spotlight.width()/2;
    let positionTop = e.clientY - spotlight.height()/2;
    spotlight.css({'left': positionLeft, 'top': positionTop});
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