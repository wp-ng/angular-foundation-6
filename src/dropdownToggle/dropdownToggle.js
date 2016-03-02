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
var mod = angular.module('mm.foundation.dropdownToggle', ['mm.foundation.position', 'mm.foundation.mediaQueries']);

function DropdownToggleController($scope, $attrs, mediaQueries, $element, $position, $window) {
    'ngInject';
    var $ctrl = this;

    $ctrl.css = {};

    $ctrl.toggle = function(){
      $ctrl.active = !$ctrl.active;

      $ctrl.css = {};

      if(!$ctrl.active){
        return;
      }

      var dropdown = angular.element($element[0].querySelector('.dropdown-pane'));
      var dropdownTrigger = angular.element($element[0].querySelector('toggle'));

      var dropdownWidth = dropdown.prop('offsetWidth');
      var triggerPosition = $position.position(dropdownTrigger);

      $ctrl.css.top = triggerPosition.top + triggerPosition.height + 5 + 'px';
      $ctrl.css.left = triggerPosition.left + 'px';

      if (mediaQueries.small() && !mediaQueries.medium()) {

      }
    };
}

mod.directive('dropdownToggle', function($document, $window, $location, $position) {
    'ngInject';
    var openElement = null;
    var closeMenu = angular.noop;
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
});
