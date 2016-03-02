angular.module("mm.foundation.offcanvas", [])
    .directive('offCanvasWrap', function($window) {
        'ngInject';
        return {
            scope: {},
            restrict: 'C',
            link: function($scope, element, attrs) {
                var win = angular.element($window);
                var sidebar = $scope.sidebar = element;

                $scope.hide = function() {
                    sidebar.removeClass('move-left');
                    sidebar.removeClass('move-right');
                };

                win.bind("resize.body", $scope.hide);

                $scope.$on('$destroy', function() {
                    win.unbind("resize.body", $scope.hide);
                });

            },
            controller: ['$scope', function($scope) {

                this.leftToggle = function() {
                    $scope.sidebar.toggleClass("move-right");
                };

                this.rightToggle = function() {
                    $scope.sidebar.toggleClass("move-left");
                };

                this.hide = function() {
                    $scope.hide();
                };
            }]
        };
    })
    .directive('leftOffCanvasToggle', function() {
        'ngInject';
        return {
            require: '^offCanvasWrap',
            restrict: 'C',
            link: function($scope, element, attrs, offCanvasWrap) {
                element.on('click', function() {
                    offCanvasWrap.leftToggle();
                });
            }
        };
    })
    .directive('rightOffCanvasToggle', function() {
        'ngInject';
        return {
            require: '^offCanvasWrap',
            restrict: 'C',
            link: function($scope, element, attrs, offCanvasWrap) {
                element.on('click', function() {
                    offCanvasWrap.rightToggle();
                });
            }
        };
    })
    .directive('exitOffCanvas', function() {
        'ngInject';
        return {
            require: '^offCanvasWrap',
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
            require: '^offCanvasWrap',
            restrict: 'C',
            link: function($scope, element, attrs, offCanvasWrap) {
                element.on('click', function() {
                    offCanvasWrap.hide();
                });
            }
        };
    });
