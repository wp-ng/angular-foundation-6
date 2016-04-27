angular.module('mm.foundation.modal', [])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
.factory('$$stackedMap', function() {
    'ngInject';
    return {
        createNew: () => {
            let stack = [];

            return {
                add: (key, value) => {
                    stack.push({
                        key: key,
                        value: value
                    });
                },
                get: (key) => {
                    for (let i = 0; i < stack.length; i++) {
                        if (key === stack[i].key) {
                            return stack[i];
                        }
                    }
                },
                keys: () => {
                    let keys = [];
                    for (let i = 0; i < stack.length; i++) {
                        keys.push(stack[i].key);
                    }
                    return keys;
                },
                top: () => stack[stack.length - 1],
                remove: (key) => {
                    let idx = -1;
                    for (let i = 0; i < stack.length; i++) {
                        if (key == stack[i].key) {
                            idx = i;
                            break;
                        }
                    }
                    return stack.splice(idx, 1)[0];
                },
                removeTop: () => stack.splice(stack.length - 1, 1)[0],
                length: () => stack.length,
            };
        },
    };
})

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
.directive('modalBackdrop', ($modalStack) => {
    'ngInject';
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/modal/backdrop.html',
        link: (scope) => {
            scope.close = (evt) => {
                let modal = $modalStack.getTop();
                if (modal && modal.value.backdrop && modal.value.backdrop !== 'static' && (evt.target === evt.currentTarget)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    $modalStack.dismiss(modal.key, 'backdrop click');
                }
            };
        },
    };
})

.directive('modalWindow', () => {
    'ngInject';
    return {
        restrict: 'EA',
        scope: {
            index: '@',
        },
        replace: true,
        transclude: true,
        templateUrl: 'template/modal/window.html',
        link: (scope, element, attrs) => {
            scope.windowClass = attrs.windowClass || '';
        },
    };
})

.factory('$modalStack', ($window, $timeout, $document, $compile, $rootScope, $$stackedMap, $animate, $q) => {
    'ngInject';
    const OPENED_MODAL_CLASS = 'is-reveal-open';
    let backdropDomEl;
    let backdropScope;
    let openedWindows = $$stackedMap.createNew();
    let $modalStack = {};

    function backdropIndex() {
        let topBackdropIndex = -1;
        let opened = openedWindows.keys();
        for (let i = 0; i < opened.length; i++) {
            if (openedWindows.get(opened[i]).value.backdrop) {
                topBackdropIndex = i;
            }
        }
        return topBackdropIndex;
    }

    $rootScope.$watch(backdropIndex, (newBackdropIndex) => {
        if (backdropScope) {
            backdropScope.index = newBackdropIndex;
        }
    });

    function resizeHandler() {
        let opened = openedWindows.keys();
        let fixedPositiong = true;
        let body = $document.find('body').eq(0);

        for (let i = 0; i < opened.length; i++) {
            let modalPos = $modalStack.reposition(opened[i]);
            if(modalPos && modalPos.position !== 'fixed'){
                fixedPositiong = false;
            }
        }
        if(fixedPositiong){
            body.addClass(OPENED_MODAL_CLASS);
        } else {
            body.removeClass(OPENED_MODAL_CLASS);
        }
    }

    function removeModalWindow(modalInstance) {
        const body = $document.find('body').eq(0);
        const modalWindow = openedWindows.get(modalInstance).value;

        // clean up the stack
        openedWindows.remove(modalInstance);

        // remove window DOM element
        $animate.leave(modalWindow.modalDomEl).then(() => {
            modalWindow.modalScope.$destroy();
        });
        checkRemoveBackdrop();
        if (openedWindows.length() === 0) {
            body.removeClass(OPENED_MODAL_CLASS);
            angular.element($window).unbind('resize', resizeHandler);
        }
    }

    function checkRemoveBackdrop() {
        // remove backdrop if no longer needed
        if (backdropDomEl && backdropIndex() === -1) {
            let backdropScopeRef = backdropScope;

            $animate.leave(backdropDomEl).then(() => {
                backdropScopeRef && backdropScopeRef.$destroy();
                backdropScopeRef = null;
            });
            backdropDomEl = null;
            backdropScope = null;
        }
    }

    function getModalCenter(modalInstance) {

        let options = modalInstance.options;
        let el = options.modalDomEl;
        var body = $document.find('body').eq(0);

        let windowWidth = $window.innerWidth || $document.documentElement.clientWidth || body.clientWidth;
        let windowHeight = $window.innerHeight || $document.documentElement.clientHeight || body.clientHeight;

        let width = el[0].offsetWidth;
        let height = el[0].offsetHeight;

        let left = parseInt((windowWidth - width) / 2, 10);
        let top;
        if (height > windowHeight) {
            top = parseInt(Math.min(100, windowHeight / 10), 10);
        } else {
            top = parseInt((windowHeight - height) / 4, 10);
        }

        // let fitsWindow = windowHeight >= top + height; // Alwats fits on mobile
        let fitsWindow = false; // Disable annying fixed positing

        let modalPos = options.modalPos = options.modalPos || {};

        if(modalPos.windowHeight !== windowHeight){
            modalPos.scrollY = $window.pageYOffset || 0;
        }

        if(modalPos.position !== 'fixed'){
            modalPos.top = fitsWindow ? top : top + modalPos.scrollY;
        }
        modalPos.left = left;
        modalPos.position = fitsWindow ? 'fixed' : 'absolute';
        modalPos.windowHeight = windowHeight;

        return modalPos;
    }

    $document.bind('keydown', (evt) => {
        let modal;

        if (evt.which === 27) {
            modal = openedWindows.top();
            if (modal && modal.value.keyboard) {
                $rootScope.$apply(() => {
                    $modalStack.dismiss(modal.key);
                });
            }
        }
    });

    $modalStack.open = (modalInstance, options) => {
        modalInstance.options = {
            deferred: options.deferred,
            modalScope: options.scope,
            backdrop: options.backdrop,
            keyboard: options.keyboard,
        };
        openedWindows.add(modalInstance, modalInstance.options);

        let currBackdropIndex = backdropIndex();

        if (currBackdropIndex >= 0 && !backdropDomEl) {
            backdropScope = $rootScope.$new(true);
            backdropScope.index = currBackdropIndex;
            backdropDomEl = $compile('<div modal-backdrop></div>')(backdropScope);
        }

        if (openedWindows.length() === 1) {
            angular.element($window).on('resize', resizeHandler);
        }

        let classes = [];
        options.windowClass &&  classes.push(options.windowClass);
        options.size && classes.push(options.size);

        let modalDomEl = angular.element('<div modal-window></div>').attr({
            style: `
                visibility: visible;
                z-index: -1;
                display: block;
            `,
            'window-class': classes.join(' '),
            index: openedWindows.length() - 1,
        });

        modalDomEl.html(options.content);
        $compile(modalDomEl)(options.scope);

        return $timeout(() => {
            // let the directives kick in
            options.scope.$apply();

            openedWindows.top().value.modalDomEl = modalDomEl;

            // Attach, measure, remove
            let body = $document.find('body').eq(0);
            body.prepend(modalDomEl);
            let modalPos = getModalCenter(modalInstance, true);
            modalDomEl.detach();

            modalDomEl.attr({
                'style': `
                    visibility: visible;
                    top: ${modalPos.top}px;
                    left: ${modalPos.left}px;
                    display: block;
                    position: ${modalPos.position};
                `,
            });

            let promises = [];

            if(backdropDomEl){
                promises.push($animate.enter(backdropDomEl, body));
            }
            promises.push($animate.enter(modalDomEl, body));
            if(modalPos.position === 'fixed'){
                body.addClass(OPENED_MODAL_CLASS);
            }

            return $q.all(promises);
        });

    };

    $modalStack.reposition = (modalInstance) => {
        let modalWindow = openedWindows.get(modalInstance).value;
        if (modalWindow) {
            let modalDomEl = modalWindow.modalDomEl;
            let modalPos = getModalCenter(modalInstance);
            modalDomEl.css('top', modalPos.top + 'px');
            modalDomEl.css('left', modalPos.left + 'px');
            modalDomEl.css('position', modalPos.position);
            return modalPos;
        }
        return {};
    };

    $modalStack.close = (modalInstance, result) => {
        let modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
            modalWindow.value.deferred.resolve(result);
            removeModalWindow(modalInstance);
        }
    };

    $modalStack.dismiss = (modalInstance, reason) => {
        let modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
            modalWindow.value.deferred.reject(reason);
            removeModalWindow(modalInstance);
        }
    };

    $modalStack.dismissAll = (reason) => {
        let topModal = $modalStack.getTop();
        while (topModal) {
            $modalStack.dismiss(topModal.key, reason);
            topModal = $modalStack.getTop();
        }
    };

    $modalStack.getTop = () => {
        return openedWindows.top();
    };

    return $modalStack;
})

.provider('$modal', () => {
    'ngInject';
    let $modalProvider = {
        options: {
            backdrop: true, // can be also false or 'static'
            keyboard: true,
        },
        $get: function($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {
            'ngInject';

            let $modal = {};

            function getTemplatePromise(options) {
                if(options.template){
                    return $q.resolve(options.template);
                }
                return $http.get(options.templateUrl, {
                    cache: $templateCache
                }).then((result) => {
                    return result.data;
                });
            }

            function getResolvePromises(resolves) {
                let promisesArr = [];
                angular.forEach(resolves, (value) => {
                    if (angular.isFunction(value) || angular.isArray(value)) {
                        promisesArr.push($q.resolve($injector.invoke(value)));
                    }
                });
                return promisesArr;
            }

            $modal.open = (modalOpts) => {

                let modalResultDeferred = $q.defer();
                let modalOpenedDeferred = $q.defer();

                // prepare an instance of a modal to be injected into controllers and returned to a caller
                let modalInstance = {
                    result: modalResultDeferred.promise,
                    opened: modalOpenedDeferred.promise,
                    close: (result) => {
                        $modalStack.close(modalInstance, result);
                    },
                    dismiss: (reason) => {
                        $modalStack.dismiss(modalInstance, reason);
                    },
                    reposition: () => {
                        $modalStack.reposition(modalInstance);
                    }
                };

                // merge and clean up options
                let modalOptions = angular.extend({}, $modalProvider.options, modalOpts);
                modalOptions.resolve = modalOptions.resolve || {};

                // verify options
                if (!modalOptions.template && !modalOptions.templateUrl) {
                    throw new Error('One of template or templateUrl options is required.');
                }

                const templateAndResolvePromise =
                    $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


                const openedPromise = templateAndResolvePromise.then((tplAndVars) => {
                    const modalScope = (modalOptions.scope || $rootScope).$new();
                    modalScope.$close = modalInstance.close;
                    modalScope.$dismiss = modalInstance.dismiss;

                    let ctrlInstance;
                    let ctrlLocals = {};
                    let resolveIter = 1;

                    // controllers
                    if (modalOptions.controller) {
                        ctrlLocals.$scope = modalScope;
                        ctrlLocals.$modalInstance = modalInstance;
                        angular.forEach(modalOptions.resolve, (value, key) => {
                            ctrlLocals[key] = tplAndVars[resolveIter++];
                        });

                        ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                        if (modalOptions.controllerAs) {
                            modalScope[modalOptions.controllerAs] = ctrlInstance;
                        }
                    }

                    return $modalStack.open(modalInstance, {
                        scope: modalScope,
                        deferred: modalResultDeferred,
                        content: tplAndVars[0],
                        backdrop: modalOptions.backdrop,
                        keyboard: modalOptions.keyboard,
                        windowClass: modalOptions.windowClass,
                        size: modalOptions.size,
                    });
                }, (reason) => {
                    modalResultDeferred.reject(reason);
                    return $q.reject(reason);
                });

                openedPromise.then(() => {
                    modalOpenedDeferred.resolve(true);
                }, () => {
                    modalOpenedDeferred.reject(false);
                });

                return modalInstance;
            };
            return $modal;
        },
    };

    return $modalProvider;
});
