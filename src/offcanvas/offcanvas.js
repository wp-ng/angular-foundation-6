angular.module('mm.foundation.offcanvas', [])
.directive('offCanvasWrapper', function($window) {
    'ngInject';
    return {
        scope: {},
        restrict: 'C',
        controller: function($scope, $element) {
            'ngInject';
            var $ctrl = this;

            var left = angular.element($element[0].querySelector('.position-left'));
            var right = angular.element($element[0].querySelector('.position-right'));
            var inner = angular.element($element[0].querySelector('.off-canvas-wrapper-inner'));

            $ctrl.leftToggle = function() {
                inner && inner.toggleClass('is-off-canvas-open');
                inner && inner.toggleClass('is-open-left');
                left && left.toggleClass('is-open');
            };

            $ctrl.rightToggle = function() {
                inner && inner.toggleClass('is-off-canvas-open');
                inner && inner.toggleClass('is-open-right');
                right && right.toggleClass('is-open');
            };

            $ctrl.hide = function() {
                inner && inner.removeClass('is-open-left');
                inner && inner.removeClass('is-open-right');
                left && left.removeClass('is-open');
                right && right.removeClass('is-open');
                inner && inner.removeClass('is-off-canvas-open');
            };

            var win = angular.element($window);

            win.bind('resize.body', $ctrl.hide);

            $scope.$on('$destroy', function() {
                win.unbind('resize.body', $ctrl.hide);
            });
        }
    };
})
.directive('leftOffCanvasToggle', function() {
    'ngInject';
    return {
        require: '^offCanvasWrapper',
        restrict: 'C',
        link: function($scope, element, attrs, offCanvasWrapper) {
            element.on('click', function() {
                offCanvasWrapper.leftToggle();
            });
        }
    };
})
.directive('rightOffCanvasToggle', function() {
    'ngInject';
    return {
        require: '^offCanvasWrapper',
        restrict: 'C',
        link: function($scope, element, attrs, offCanvasWrapper) {
            element.on('click', function() {
                offCanvasWrapper.rightToggle();
            });
        }
    };
})
.directive('exitOffCanvas', function() {
    'ngInject';
    return {
        require: '^offCanvasWrapper',
        restrict: 'C',
        link: function($scope, element, attrs, offCanvasWrap) {
            element.on('click', function() {
                offCanvasWrap.hide();
            });
        }
    };
})
.directive('offCanvasList', function() {
    'ngInject';
    return {
        require: '^offCanvasWrapper',
        restrict: 'C',
        link: function($scope, element, attrs, offCanvasWrap) {
            element.on('click', function() {
                offCanvasWrap.hide();
            });
        }
    };
});
