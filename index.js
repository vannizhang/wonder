
"use strict";

const Config = {
    "URL_GET_GOOGLE_AUTOCOMPLETE_DATA": "https://static.vannizhang.com/wonder/data.json",
    "URL_QUERY": "https://api.vannizhang.com",

    "STATES_ABBREVIATION": {
        "AL": "Alabama",
        "AK": "Alaska",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "Washington DC",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VA": "Virginia",
        "WA": "Washington State",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
    }
}

const Controller = function(){

    let googleAutoCompleteData = null;
    let infoWindow = null;
    let svgMap = null;

    const hashDataManager  = new HashDataManager();

    const init = function(options){
        infoWindow = options.infoWindow || null;
        svgMap = options.svgMap || null;

        const hash = hashDataManager.getHashData();

        if(hash){
            showPreselectHex(hash);
        }
    };

    const showPreselectHex = function(stateID){
        const preselectHex = document.getElementById(stateID);
        const rect = preselectHex.getBoundingClientRect();
        showInfoPanel(stateID, rect.left);
        svgMap.toggleActiveHexPolygon(preselectHex);
    };

    const loadData = function(onSuccessHandler){

        const requestUrl = Config.URL_GET_GOOGLE_AUTOCOMPLETE_DATA + '?' + getRoundedDate(5);

        ajaxRequest(requestUrl, function(data){
            
            if(!data.error){
                setData(data);

                if(onSuccessHandler){
                    onSuccessHandler();
                }
            }

        });
    };

    const setData = function(data){
        googleAutoCompleteData = data;
    };

    const getDataByStateID = function(stateID){
        const stateName = Config.STATES_ABBREVIATION[stateID];
        return googleAutoCompleteData[stateName];
    };

    const showInfoPanel = function(stateID, clientX, enforceToShow){
        // if enforce to show is ture, then ignore the infoWindow.isSticky state and just show the info window anyway
        const shouldShow = typeof enforceToShow === 'boolean' && enforceToShow ? true : !infoWindow.isSticky();
        if(shouldShow){
            const data = getDataByStateID(stateID);
            infoWindow.show(data, clientX);
            hashDataManager.setHashData(stateID);
        }
    };

    const hideInfoPanel = function(){
        // // hide if it's not sticky
        if( !infoWindow.isSticky() ){
            infoWindow.hide();
            hashDataManager.setHashData();
        }
    };

    const toggleStickInfoPanel = function(isSticky){
        infoWindow.toggleIsSticky(isSticky);
    };

    const ajaxRequest = function(url, callback){

        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        
        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                if(this.response && callback){
                    const data = JSON.parse(this.response);
                    callback(data);
                }

            } else {
                // console.error();
            }
        };
        
        request.onerror = function() {
          // There was a connection error of some sort
        };
        
        request.send();
    };

    // const getSearchTerm = function(stateID){
    //     const requestUrl = encodeURI(Config.URL_QUERY + '/getWonderSearchTerm?stateID=' + stateID);
    //     ajaxRequest(requestUrl);
    // };

    // const getTargetQuery = function(targetQuery){
    //     const requestUrl = encodeURI(Config.URL_QUERY + '/getWonderTargetQuery?query=' + targetQuery);
    //     ajaxRequest(requestUrl);
    // };

    const getRoundedDate = function(numOfMin){
        numOfMin = numOfMin || 5;
        const coeff = 1000 * 60 * numOfMin;
        const date = new Date();  //or use any other date
        const rounded = new Date(Math.floor(date.getTime() / coeff) * coeff).getTime();
        return rounded / 1000;
    };

    return {
        init: init,
        loadData: loadData,
        showInfoPanel: showInfoPanel,
        hideInfoPanel: hideInfoPanel,
        // getSearchTerm: getSearchTerm,
        // getTargetQuery: getTargetQuery,
        toggleStickInfoPanel: toggleStickInfoPanel
    };

};

const SvgMap = function(){

    let controller = null;

    const $polygons = document.querySelectorAll('#Layer1 polygon');
    const $labels = document.querySelectorAll('#Layer1 text');
    
    const init = function(appController){
        controller = appController;
        initEventHandler();
    };

    const initEventHandler = function(){

        $polygons.forEach(function(polygon){

            polygon.addEventListener('mouseover', function(e) {
                triggerShowInfoWindowEvt(e);
            });

            polygon.addEventListener('mouseout', function(e) {
                triggerShowInfoWindowEvt();
            });

            polygon.addEventListener('click', function(e) {
                const target = e.currentTarget;
                toggleActiveHexPolygon(target);
                triggerShowInfoWindowEvt(e);
            });
        })
    };

    const triggerShowInfoWindowEvt = function(e){
        if(e){
            const target = e.currentTarget;
            const x = e.clientX;
            const stateID = target.getAttribute('id');
            const enforceToShow = e.type === 'click' ? true : false;
            controller.showInfoPanel(stateID, x, enforceToShow);
            updateTargetSvgElementStyle(stateID);
        } else {
            controller.hideInfoPanel();
            updateTargetSvgElementStyle();
        }
    };

    const updateTargetSvgElementStyle = function(targetPolygonID){

        $polygons.forEach(function(polygon){
            if(polygon.id === targetPolygonID){
                polygon.classList.add('is-hover');
            } else {
                polygon.classList.remove('is-hover');
            }
        });

        $labels.forEach(function(label){
            if(label.getAttribute('data-target') === targetPolygonID){
                label.classList.add('is-hover');
            } else {
                label.classList.remove('is-hover');
            }
        });
    };

    const toggleActiveHexPolygon = function(element){
        const isAlreadyActive = element ? element.classList.contains('is-active') : false;
        const elementToSetAsActive = element && !isAlreadyActive ? element : null;
        const isInfoWindowSticky = elementToSetAsActive ? true : false;

        setActiveHexPolygon(elementToSetAsActive);
        controller.toggleStickInfoPanel(isInfoWindowSticky);

        // if(elementToSetAsActive){
        //     controller.getSearchTerm(element.id);
        // }
    };

    const setActiveHexPolygon = function(element){

        $polygons.forEach(function(polygon){
            if(polygon === element){
                polygon.classList.add('is-active');
            } else {
                polygon.classList.remove('is-active');
            }
        });

        $labels.forEach(function(label){
            if(element && label.getAttribute('data-target') === element.id){
                label.classList.add('is-active');
            } else {
                label.classList.remove('is-active');
            }
        });
    }

    return {
        init: init,
        setActiveHexPolygon: setActiveHexPolygon,
        toggleActiveHexPolygon: toggleActiveHexPolygon
    };
};

const InfoWindow = function(options){

    options = options || {};

    let isInfoWindowSticky = false;
    let controller = null;

    const $container = options.container ? document.getElementById(options.container) : null;
    const infoWindowOnCloseHandler = options.infoWindowOnCloseHandler || null;

    const init = function(appController){

        if(!$container){
            console.error('container DOM ID is required to init info panel');
            return;
        }

        controller = appController;
    };

    const initEventHandler = function(){

        document.querySelectorAll('.js-open-link').forEach(function(element){
            element.addEventListener('click', function (event) {
                openGoogleSearchPage(event.target.innerHTML);
            });
        });

        document.querySelectorAll('.js-close-panel').forEach(function(element){
            element.addEventListener('click', function (event) {
                hide();
                toggleIsSticky(false);
                if(infoWindowOnCloseHandler){
                    infoWindowOnCloseHandler();
                }
            });
        });
    };

    const openGoogleSearchPage = function(q){
        q = q.replace(/\s/g, '+');
        const url = 'https://www.google.com/search?q=' + q;
        // controller.getTargetQuery(q);
        window.open(url, '_blank');
    }

    const show = function(data, clientX){
        render(data);
        setPosition(clientX);
        $container.classList.remove('hide');
    };

    const hide = function(){
        render(null);
        $container.classList.add('hide');
    };

    const isSticky = function(){
        return isInfoWindowSticky;
    };

    const toggleIsSticky = function(isSticky){
        isSticky = typeof isSticky === 'boolean' ? isSticky : !isInfoWindowSticky;
        isInfoWindowSticky = isSticky;
    }

    const setPosition = function(clientX){
        const windowMidPoint = window.innerWidth / 2;
        const isRight = clientX <= windowMidPoint ? true : false;

        if(isRight){
            $container.classList.add('is-right');
        } else {
            $container.classList.remove('is-right');
        }
    };

    const render = function(data){
        const infoWindowHtml = data ? getContentHtml(data) : '';
        $container.innerHTML = infoWindowHtml;
        initEventHandler();
    };

    const getContentHtml = function(data){

        const contentHtml = data.map(function(d, i){

            const sectionHtml = d.autocompletes.map(function(q){
                return '<p class="font-size--2 trailer-0 js-open-link cursor-pointer">' + q + '</p>';
            }).join('');

            const isBorderVisible = i === 1 ? 'is-middle-section' : '';

            return '<div class="info-window-content ' + isBorderVisible + '">'+sectionHtml+'</div>';

        }).join('');

        return '<div class="info-window"><div class="text-right leader-half"><span class="icon-ui-close margin-right-half cursor-pointer js-close-panel"></span></div>' + contentHtml + '</div>';
    };

    return {
        init: init,
        show: show,
        hide: hide,
        toggleIsSticky: toggleIsSticky,
        isSticky: isSticky
    };
};

const HashDataManager = function(){

    const getHashData = ()=>{
        const hash = window.location.hash;
        return hash ? hash.substring(1) : null;
    };

    const setHashData = (value='')=>{
        window.location.hash = value;
    };

    return {
        getHashData,
        setHashData
    };

}

// init app
document.addEventListener("DOMContentLoaded", function(event) { 

    const appController = new Controller();

    const svgMap = new SvgMap();
    
    const infoWindow = new InfoWindow({
        container: 'infoWindowDiv',
        infoWindowOnCloseHandler: function(){
            svgMap.setActiveHexPolygon(null);
            appController.hideInfoPanel();
        }
    });
    
    appController.loadData(function(){

        infoWindow.init(appController);

        svgMap.init(appController);

        appController.init({
            infoWindow,
            svgMap
        });

    });

});