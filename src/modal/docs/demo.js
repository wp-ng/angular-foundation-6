angular.module('foundationDemoApp').controller('ModalDemoCtrl', function($scope, $modal, $log) {


    $scope.open = function(size, backdrop, itemCount) {

        $scope.items = [];

        var count = itemCount || 3;

        for(var i = 0; i < count; i++){
            $scope.items.push('item ' + i);
        }

        var params = {
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                items: function() {
                    return $scope.items;
                }
            }
        };

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

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('foundationDemoApp').controller('ModalInstanceCtrl', function($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
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
});
