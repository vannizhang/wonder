
"use strict";

const Controller = function(){

    const loadData = function(onSuccessHandler){

        if(onSuccessHandler){
            onSuccessHandler();
        }
    };

    const showInfoPanel = function(){

    };

    const hideInfoPanel  = function(){

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
                const stateID = target.getAttribute('id');
                controller.showInfoPanel(stateID);
                // console.log(stateID);
            });

            polygon.addEventListener('mouseout', function(e) {
                controller.hideInfoPanel();
                // console.log('mouse out');
            });
        })
    };

    return {
        init: init
    };
};

const InfoPanel = function(options){

    options = options || {};

    const $container = options.container ? document.getElementById(options.container) : null;

    const init = function(){
        if(!$container){
            console.error('container DOM ID is required to init info panel');
            return;
        }
    };

    const show = function(){

    };

    const hide = function(){

    };

    const render = function(){

    };

    const getContentHtml = function(){

    };
};

// init app
document.addEventListener("DOMContentLoaded", function(event) { 

    const appController = new Controller();
    const svgMap = new SvgMap();


    svgMap.init(appController);
});