function DropdownToggleController($scope, $attrs, mediaQueries, $element, $position) {
    'ngInject';
    var $ctrl = this;

    $ctrl.css = {};

    $ctrl.toggle = function() {
        $ctrl.active = !$ctrl.active;

        $ctrl.css = {};

        if (!$ctrl.active) {
            return;
        }

        var dropdown = angular.element($element[0].querySelector('.dropdown-pane'));
        var dropdownTrigger = angular.element($element[0].querySelector('toggle *:first-child'));

        console.log(dropdownTrigger, $element[0]);

        // var dropdownWidth = dropdown.prop('offsetWidth');
        var triggerPosition = $position.position(dropdownTrigger);

        $ctrl.css.top = triggerPosition.top + triggerPosition.height + 2 + 'px';
        $ctrl.css.left = triggerPosition.left + 'px';

        // if (mediaQueries.small() && !mediaQueries.medium()) {

        // }
    };
}

function dropdownToggle($document, $window, $location) {
    'ngInject';
    return {
        scope: {},
        restrict: 'EA',
        transclude: {
            'toggle': 'toggle',
            'pane': 'pane'
        },
        templateUrl: 'template/dropdownToggle/dropdownToggle.html',
        controller: DropdownToggleController,
        controllerAs: '$ctrl'
    };
}


/*
 * dropdownToggle - Provides dropdown menu functionality
 * @restrict class or attribute
 * @example:

   <a dropdown-toggle="#dropdown-menu">My Dropdown Menu</a>
   <ul id="dropdown-menu" class="f-dropdown">
     <li ng-repeat="choice in dropChoices">
       <a ng-href="{{choice.href}}">{{choice.text}}</a>
     </li>
   </ul>
 */
angular.module('mm.foundation.dropdownToggle', ['mm.foundation.position', 'mm.foundation.mediaQueries'])
.directive('dropdownToggle', dropdownToggle);
