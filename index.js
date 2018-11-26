
"use strict";

const Config = {
    "URL_GET_GOOGLE_AUTOCOMPLETE_DATA": "https://wonder.vannizhang.com/getData",

    "STATES_ABBREVIATION": {
        "AL": "Alabama",
        "AK": "Alaska",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "DC",
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

const Controller = function(infoWindow){

    let googleAutoCompleteData = null;

    const loadData = function(onSuccessHandler){

        const requestUrl = Config.URL_GET_GOOGLE_AUTOCOMPLETE_DATA;

        getJson(requestUrl, function(data){
            
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

    const showInfoPanel = function(stateID, clientX){
        const data = getDataByStateID(stateID);
        infoWindow.show(data, clientX);
    };

    const hideInfoPanel  = function(){
        infoWindow.hide();
    };

    const getJson = function(url, callback){

        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        
        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                const data = JSON.parse(this.response);
                callback(data);
            } else {
                // We reached our target server, but it returned an error
            
            }
        };
        
        request.onerror = function() {
          // There was a connection error of some sort
        };
        
        request.send();
    };

    return {
        loadData: loadData,
        showInfoPanel: showInfoPanel,
        hideInfoPanel: hideInfoPanel
    };

};

const SvgMap = function(){

    const $polygons = document.querySelectorAll('polygon');

    const init = function(appController){
        initEventHandler(appController);
    };

    const initEventHandler = function(controller){

        $polygons.forEach(function(polygon){

            polygon.addEventListener('mouseover', function(e) {
                const target = e.currentTarget;
                const x = e.clientX;
                const stateID = target.getAttribute('id');
                target.classList.add('is-active');
                controller.showInfoPanel(stateID, x);
                // console.log(x);
            });

            polygon.addEventListener('mouseout', function(e) {
                const target = e.currentTarget;
                target.classList.remove('is-active');
                controller.hideInfoPanel();
                // console.log('mouse out');
            });
        })
    };

    return {
        init: init
    };
};

const InfoWindow = function(options){

    options = options || {};

    const $container = options.container ? document.getElementById(options.container) : null;

    const init = function(){
        if(!$container){
            console.error('container DOM ID is required to init info panel');
            return;
        }
    };

    const show = function(data, clientX){
        render(data);
        setPosition(clientX);
        $container.classList.remove('hide');
    };

    const hide = function(){
        render(null);
        $container.classList.add('hide');
    };

    const setPosition = function(clientX){
        const windowMidPoint = window.innerWidth / 2;
        const isRight = clientX <= windowMidPoint ? true : false;

        if(isRight){
            $container.classList.add('is-right');
        } else {
            $container.classList.remove('is-right');
        }

        // console.log(clientX, window.innerWidth);
    };

    const render = function(data){
        const infoWindowHtml = data ? getContentHtml(data) : '';
        $container.innerHTML = infoWindowHtml;
    };

    const getContentHtml = function(data){

        const contentHtml = data.map(function(d){

            const sectionHtml = d.autocompletes.map(function(q){
                return '<p class="font-size--3 trailer-0">' + q + '</p>';
            }).join('');

            return '<div class="info-window-content">'+sectionHtml+'</div>';

        }).join('');

        return '<div class="info-window">' + contentHtml + '</div>';
    };

    return {
        init: init,
        show: show,
        hide: hide
    };
};

// init app
document.addEventListener("DOMContentLoaded", function(event) { 

    const svgMap = new SvgMap();
    
    const infoWindow = new InfoWindow({
        container: 'infoWindowDiv'
    });
    
    const appController = new Controller(infoWindow);

    appController.loadData(function(){
        infoWindow.init();
        svgMap.init(appController);
    });

});