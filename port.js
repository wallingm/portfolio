var darkMode = sessionStorage.getItem('darkMode') || false;
darkMode = (darkMode == 'true');
var darkModeFirst = darkMode;

const bgPrimary = '#1ee384';
const hash = document.location.hash;
const showBgAnimation = (hash == '');
var currentSection = (hash == '') ? 'home' : hash.substr(1);


$('[data-action="displaySection"]').on('click', function() {
    let section = $(this).attr('href');
    displaySection(section);
});

function displaySection(section) {
    currentSection = (section.substr(0,1) == '#') ? section.substr(1) : section;
    let sectionElem = $(`#main-container section.${currentSection}`);
    let sectionNotElem = $(`#main-container section:not(.${currentSection})`);
    if (sectionElem.length === 1) {
        sectionElem.css('display','flex');
        sectionNotElem.hide();
    } else {
        currentSection = 'home';
    }

    if (currentSection == 'projects') {
        updateTimeline();
    }
}

// homepage wheel
const wheelLeft = $('.wheel.left');
const wheelRight = $('.wheel.right');

let adjStart = 'Website';
let nounStart = 'Developer';
let adjArray = ['JavaScript','HTML','CSS','SQL','PHP','UI','Cool','Above Average','Creative','Proficient'];
let nounArray = ['Designer','Creator','Coder','Dude','Engineer','Programmer','Musician','Guy','Maestro','Guru'];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function multiplyArray(array, multiple) {
    let result = [];
    for (let i = 0; i < multiple; i++) {
        result = result.concat(array);
    }
    return result;
}

// shuffle and insert the main words in the array's center
adjArray = shuffleArray(adjArray);
nounArray = shuffleArray(nounArray);
adjArray.splice(Math.ceil(adjArray.length / 2), 0, adjStart);
nounArray.splice(Math.ceil(nounArray.length / 2), 0, nounStart);

// duplicate the arrays so that you do not see ends and all spots in wheel are filled
const wheelSetMultiplier = 3;
const wheelInitRows = adjArray.length;
const wheelTotalRows = wheelInitRows * wheelSetMultiplier;
const wheelActiveRows = wheelInitRows * (wheelSetMultiplier - 2);
const wheelCenterIndex = Math.floor(wheelTotalRows / 2);
adjArray = multiplyArray(adjArray, wheelSetMultiplier);
nounArray = multiplyArray(nounArray, wheelSetMultiplier);

function getWheelRowStyle(i, targetIndex) {
    let newIndex = i - targetIndex;
    const indexSign = Math.sign(newIndex);

    const translateYInterval = 45;
    const translateYMax = (translateYInterval * 3) - (translateYInterval / 3);
    let translateY = newIndex * translateYInterval;
    if (Math.abs(translateY) > translateYMax) { translateY = translateYMax * indexSign; }

    const rotateXInterval = -20;
    const rotateXMax = (rotateXInterval * 4); // - (translateYInterval / 2);
    let rotateX = newIndex * rotateXInterval;
    if (Math.abs(rotateX) > Math.abs(rotateXMax)) { rotateX = rotateXMax * indexSign; }

    opacity = (newIndex == 0) ? 1 : Math.max(0, 0.5 - Math.abs(newIndex * 0.2)).toFixed(1);


    let elemStyle = `transform: translateY(${translateY}px) rotateX(${rotateX}deg); opacity:${opacity};`;
    return elemStyle;
}

function rotateWheel() {
    let randomAdjIndex = wheelInitRows + Math.floor(Math.random() * wheelActiveRows);
    let randomNounIndex = wheelInitRows + Math.floor(Math.random() * wheelActiveRows);

    // loop through wheel rows and update styles
    $('.wheel .row').removeClass('main');
    for (var i = 0; i < wheelTotalRows; i++) {
        
        let adjElem = $(`.wheel.left .row[data-index="${i}"]`);
        let adjStyle = getWheelRowStyle(i, randomAdjIndex);
        adjElem.attr('style', adjStyle);
        if (i == randomAdjIndex) { adjElem.addClass('main'); }
        
        let nounElem = $(`.wheel.right .row[data-index="${i}"]`);
        let nounStyle = getWheelRowStyle(i, randomNounIndex);
        nounElem.attr('style', nounStyle);
        if (i == randomNounIndex) { nounElem.addClass('main'); }
    }

}


const spotlight = $('#spotlight');

$(document).ready(function() {

    // create wheel rows
    for (var i = 0; i < wheelTotalRows; i++) {

        if (adjArray[i] != null) {
            let adj = adjArray[i];
            let adjClass = (i == wheelCenterIndex) ? 'row main' : 'row';
            let adjStyle = getWheelRowStyle(i, wheelCenterIndex);
            let adjHtml = `<div data-index="${i}" class="${adjClass}" style="${adjStyle}">${adj}</div>`;
            wheelLeft.append(adjHtml);
        }
        if (nounArray[i] != null) {
            let noun = nounArray[i];
            let nounClass = (i == wheelCenterIndex) ? 'row main' : 'row';
            let nounStyle = getWheelRowStyle(i, wheelCenterIndex);
            let nounHtml = `<div data-index="${i}" class="${nounClass}" style="${nounStyle}">${noun}</div>`;
            wheelRight.append(nounHtml);
        }
    }

    // rotate wheel
    const wheelWaitTime = 4000;
    const wheelRotateInt = 4000;
    // $('.wheel-container').css('display','flex');
    setTimeout(function() {
        setInterval(rotateWheel, wheelRotateInt);
    }, wheelWaitTime);


    // create html for project section timeline
    createTimeline();

    checkDarkMode();

});


// project timeline
function createTimeline() {
    const leftPad = $('.timeline-year')[0].clientWidth || 85;
    let dotLeft = leftPad + 13;
    let lineLeft = leftPad + 23;

    const groupCount = $('.timeline-group').length;
    
    $('.timeline-group').each(function(i) {
        let dotAnimDelay = (i == 0) ? '0s' : '1s';
        let groupIcon = $(this).data('icon') || 'globe';
        let elemHtml = `<div class="timeline-dot flex-center" style="left:${dotLeft}px; animation-delay:${dotAnimDelay};"><i class="fas fa-${groupIcon}"></i></div>`;

        if (i < groupCount-1) {
            elemHtml += `<div class="timeline-line-container" style="left:${lineLeft}px">
                <div class="timeline-line"></div>
            </div>`;
        }

        $(this).children('.timeline-year').append(elemHtml);
    });
}
function updateTimeline() {
    console.log('updateTimeline');
    if (currentSection == 'projects' && $('.timeline-group:not(.active-timeout)').length > 0) {
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
    
    // set section animation speed

} else {
    skipBgAnimation();
    displaySection(hash);
}

$(window).on('resize', skipBgAnimation);