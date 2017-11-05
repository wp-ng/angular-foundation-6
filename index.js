
    angular.module('foundationDemoApp').controller('AccordionDemoCtrl', function($scope) {
    $scope.oneAtATime = true;

    $scope.groups = [{
        title: "Dynamic Group Header - 1",
        content: "Dynamic Group Body - 1"
    }, {
        title: "Dynamic Group Header - 2",
        content: "Dynamic Group Body - 2"
    }];

    $scope.items = ['Item 1', 'Item 2', 'Item 3'];

    $scope.addItem = function() {
        var newItemNo = $scope.items.length + 1;
        $scope.items.push('Item ' + newItemNo);
    };
});


    angular.module('foundationDemoApp').controller('AlertDemoCtrl', function($scope) {
  $scope.alerts = [
    { type: 'alert', msg: 'Oh snap! Change a few things up and try submitting again.' },
    { type: 'success round', msg: 'Well done! You successfully read this important alert message.' }
  ];

  $scope.addAlert = function() {
    $scope.alerts.push({type: 'alert', msg: "Another alert!"});
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

});


    angular.module('foundationDemoApp').controller('ButtonsCtrl', function ($scope) {

  $scope.singleModel = 1;

  $scope.radioModel = 'Middle';

  $scope.checkModel = {
    left: false,
    middle: true,
    right: false
  };
});


    angular.module('foundationDemoApp')
.controller('DrillDownDemoCtrl', function($scope, $element, $timeout, $log) {
    'ngInject';
    const vm = {
        ddmApi: null,
        shouldShow: false,
        haveShown: false,
        haveResized: false,
        alerts: [],

        showHideMenu: showHideMenu,

        showSubmenu1: showSubmenu1,
        hideSubmenu1: hideSubmenu1,

        closeAlert: closeAlert,
    };
    $scope.vm = vm;

    /**
     * Initial alert used as part of the API Usage demo
     */
    vm.alerts = [{
        type: 'alert',
        msg: 'The menu below is hidden with css. Press the button to show it (using ng-show).',
    }];

    /**
     * Event handlers for the menu events
     */
    $scope.$on('resize.mm.foundation.drilldownMenu', onMenuResized);
    $scope.$on('open.mm.foundation.drilldownMenu', onSubmenuOpen);
    $scope.$on('hide.mm.foundation.drilldownMenu', onSubmenuClosed);

    /**
     * Sets the variable to show or hide the menu block
     */
    function showHideMenu() {
        vm.shouldShow = !vm.shouldShow;

        if (!vm.haveShown) {
            closeAlert(0);
            addAlert(
                'alert',
                'The menu is now "shown", but because it was hidden initially it will start with ' +
                '"max-width: 0px" and doesn\'t appear! Press the resize button to trigger ' +
                'a resize via the API'
            );
            vm.haveShown = true;
        }
    }

    /**
     * Get the UL for submenu 1.
     * NOTE: You MUST use the UL for the submenu to show/hide, NOT the parent LI!
     *
     * @returns {angular.element}   - The element for submenu 1 in the API section
     */
    function getSubmenu1() {
        return angular.element($element[0].querySelector('ul#drilldown-api-submenu-1'));
    }

    /**
     * Function to use the API to open a specific menu item
     */
    function showSubmenu1() {
        //
        // Find the item
        //
        var element = getSubmenu1();

        //
        // Use the API to open it
        //
        vm.ddmApi.show(element);
    }

    /**
     * Function to use the API to close a specific menu item
     */
    function hideSubmenu1() {
        //
        // Find the item
        //
        var element = getSubmenu1();

        //
        // Use the API to open it
        //
        vm.ddmApi.hide(element);
    }

    /**
     * Handler for the resized event from the menu
     *
     * @param {Object} event                - Angular `event` object (see $rootScope.$on)
     * @param {angular.element} menuElement - The root element of the menu
     */
    function onMenuResized(event, menuElement) {
        if (menuElement.attr('id') !== 'drilldown-api-menu') {
            return; // One of the other menus
        }
        if (vm.haveShown && !vm.haveResized) {
            closeAlert(0);
            addAlert(
                'success',
                'Congratulations! The menu should now be visible!'
            );
            addAlert(
                'alert',
                'The same 0-width problem will happen again if the menu is hidden then ' +
                'resized (via the API or via a viewport size change). ' +
                'You MUST trigger a resize via the API after showing it again if this happens.'
            );
            vm.haveResized = true;
        }
    }

    /**
     * Example handler for the submenu open event
     *
     * @param {Object} event                    - Angular `event` object (see $rootScope.$on)
     * @param {angular.element} menuElement     - The root element of the menu
     * @param {angular.element} submenuElement  - The submenu element that has just opened
     */
    function onSubmenuOpen(event, menuElement, submenuElement) {
        if (submenuElement.attr('id') === 'drilldown-api-submenu-1') {
            $log.log('Submenu 1 has been opened!');
        }
    }

    /**
     * Example handler for the submenu close event
     *
     * @param {Object} event                    - Angular `event` object (see $rootScope.$on)
     * @param {angular.element} menuElement     - The root element of the menu
     * @param {angular.element} submenuElement  - The submenu element that has just closed
     */
    function onSubmenuClosed(event, menuElement, submenuElement) {
        if (submenuElement.attr('id') === 'drilldown-api-submenu-1') {
            $log.log('Submenu 1 has been closed!');
        }
    }

    /**
     * Closes the specific alert
     *
     * @param {number} index    - The index of the alert to close
     */
    function closeAlert(index) {
        vm.alerts.splice(index, 1);
    }

    /**
     * Adds a new alert programmatically.
     * Used of the explanations of the drilldown menu API and functionality.
     *
     * @param {string} type     - the type of alert
     * @param {string} msg      - the alert message
     */
    function addAlert(type, msg) {
        vm.alerts.push({ type: type, msg: msg });
    }
});


    angular.module('foundationDemoApp').controller('TopBarDemoCtrl', function ($scope) {

});


    angular.module('foundationDemoApp').controller('DropdownCtrl', function($scope) {
  $scope.items = [
    "The first choice!",
    "And another choice for you.",
    "but wait! A third!"
  ];
  $scope.linkItems = {
    "Google": "http://google.com",
    "AltaVista": "http://altavista.com"
  };
});


    angular.module('foundationDemoApp').controller('ModalDemoCtrl', function($scope, $modal, $log) {

    $scope.open = open;

    function open(size, backdrop, itemCount, closeOnClick) {

        $scope.items = [];

        var count = itemCount || 3;

        for(var i = 0; i < count; i++){
            $scope.items.push('item ' + i);
        }

        var params = {
            templateUrl: 'myModalContent.html',
            resolve: {
                items: function() {
                    return $scope.items;
                },
            },
            controller: function($scope, $modalInstance, items) {

                $scope.items = items;
                $scope.selected = {
                    item: $scope.items[0],
                };

                $scope.reposition = function() {
                    $modalInstance.reposition();
                };

                $scope.ok = function() {
                    $modalInstance.close($scope.selected.item);
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                };

                $scope.openNested = function() {
                    open();
                };
            }
        };

        if(angular.isDefined(closeOnClick)){
            params.closeOnClick = closeOnClick;
        }

        if(angular.isDefined(size)){
            params.size = size;
        }

        if(angular.isDefined(backdrop)){
            params.backdrop = backdrop;
        }

        var modalInstance = $modal.open(params);

        modalInstance.result.then(function(selectedItem) {
            $scope.selected = selectedItem;
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
});


    angular.module('foundationDemoApp').controller('OffCanvasDemoCtrl', function ($scope) {

});


    angular.module('foundationDemoApp').controller('OrbitDemoCtrl', function ($scope) {

});


    angular.module('foundationDemoApp').controller('PaginationDemoCtrl', function ($scope) {
  $scope.totalItems = 64;
  $scope.currentPage = 4;
  $scope.maxSize = 5;
  
  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.bigTotalItems = 175;
  $scope.bigCurrentPage = 1;
});


    angular.module('foundationDemoApp').controller('ProgressDemoCtrl', function ($scope) {
  
  $scope.max = 200;

  $scope.random = function() {
    var value = Math.floor((Math.random() * 100) + 1);
    var type;

    if (value < 25) {
      type = 'success';
    } else if (value < 50) {
      type = 'info';
    } else if (value < 75) {
      type = 'warning';
    } else {
      type = 'alert';
    }

    $scope.showWarning = (type === 'alert' || type === 'warning');

    $scope.dynamic = value;
    $scope.type = type;
  };
  $scope.random();
});


    angular.module('foundationDemoApp').controller('RatingDemoCtrl', function ($scope) {
  $scope.rate = 7;
  $scope.max = 10;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };

  $scope.ratingStates = [
    {stateOn: 'fa-check-circle', stateOff: 'fa-check-circle-o'},
    {stateOn: 'fa-star', stateOff: 'fa-start-o'},
    {stateOn: 'fa-heart', stateOff: 'fa-ban'},
    {stateOn: 'fa-heart'},
    {stateOff: 'fa-power-off'}
  ];
});


    angular.module('foundationDemoApp').controller('TabsDemoCtrl', function ($scope) {
  $scope.tabs = [
    { title:"Dynamic Title 1", content:"Dynamic content 1" },
    { title:"Dynamic Title 2", content:"Dynamic content 2" }
  ];

  $scope.alertMe = function() {
    setTimeout(function() {
      alert("You've selected the alert tab!");
    });
  };
});


    angular.module('foundationDemoApp').controller('TooltipDemoCtrl', function($scope) {
    $scope.dynamicTooltip = 'Hello, World!';
    $scope.dynamicTooltipText = 'dynamic';
    $scope.htmlTooltip = "I've been made <b>bold</b>!";
});

