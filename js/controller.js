angular.element(function() {
    angular.bootstrap(document, ['WarrantyModule']);
});

angular.module('WarrantyModule', ['angularFileUpload', 'darthwade.loading', 'ngTagsInput', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.select', 'ui.toggle', 'dndLists', 'ngPatternRestrict'])

        .controller('ctrlWarrantyHome', ['$scope', '$http', '$loading', '$uibModal', 'FileUploader', function ($scope, $http, $loading, $uibModal, FileUploader) {
            // Base de data
            $scope.data = {};
            // Valores por defecto de modales
            $scope.MessagesModalInterface = {};
            $scope.ClearDeviceData = function ClearDeviceData() {
                $scope.device = {};
                $scope.device.make = '';
                $scope.device.model = '';
                $scope.device.category = {};
                $scope.device.subcategory = {};
                $scope.device.warrantytime = {};
                $scope.device.strSerial = '';
                $scope.device.datDatePurchase = new Date();
                $scope.device.strVendor = '';
            };
            // Inicio variables
            $scope.ClearDeviceData();
            $scope.strSerialClass = 'form-group';
            $scope.modelClass = 'form-group';
            $scope.warantyClass = 'form-group';
            $scope.datDatePurchaseClass = 'form-group';
            $scope.subcategoryClass = 'form-group';
            $scope.strVendorClass = 'form-group';
            $scope.user = {};
            $scope.country = {};
            $scope.country.selected = {};
            $scope.user.strFirstName = '';
            $scope.user.strLastName = '';
            $scope.user.strEmail = '';
            $scope.user.strPassword = '';
            $scope.user.strConfirmPassword = '';
            $scope.user.strPhoneNumber = '';
            $scope.filterDeviceCurrent = true;
            $scope.filterDevicePast = true;
            $scope.filterDeviceClose = true;
            $scope.strFirstNameClass = 'form-group';
            $scope.strLastNameClass = 'form-group';
            $scope.strEmailClass = 'form-group';
            $scope.strPasswordClass = 'form-group';
            $scope.strConfirmPasswordClass = 'form-group';
            $scope.strPhoneClass = 'form-group';
            $scope.strCountryClass = 'form-group';
            $scope.strEmailLogonClass = 'form-group';
            $scope.strPasswordLogonClass = 'form-group';
            // Funci�n de ejecuci�n al llamar modal
            $scope.CallBackModal = function () { return 0; };
            // Para identificar el serial del producto al que se le suben files. NOTA: Mejorar a guardar en DataUpload event a futuro
            $scope.DeviceActiveSerial = '';
            // Get Initial Data
            $scope.GetInitialData = function () {
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/GetInitialData',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    if (response.data.Result == 'usrnc') {
                        window.location = '/index.html';
                        return 0;
                    };
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.user = response.data.User;
                        $scope.messages = response.data.Messages;
                        $scope.devices = response.data.Devices;
                        // Dispositivos del home quedan en un array para filtrar
                        $scope.devicesfiltered = $scope.devices;
                        // Los usuarios de la plataforma para poder transferir el device
                        $scope.transferusers = response.data.transferusers;
                    }
                    else if (response.data.Result == 'userExist') {
                        window.location.href = '/home.html';
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            $scope.GetInitialData();
            // Crear nuevo dispositivo
            $scope.NewDeviceRegister = function () {
                var booError = false;
                if ($scope.device.strSerial.trim() == '') {
                    $scope.strSerialClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strSerialClass = 'form-group'
                }
                if (typeof $scope.device.model.name == 'undefined') {
                    $scope.modelClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.modelClass = 'form-group'
                }
                if (typeof $scope.device.subcategory.name == 'undefined') {
                    $scope.subcategoryClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.subcategoryClass = 'form-group'
                }
                if ($scope.device.strVendor.trim() == '') {
                    $scope.strVendorClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strVendorClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var DataDevice = {};
                DataDevice.device = $scope.device;
                DataDevice.device.email = $scope.user.strEmail;
                DataDevice.device.FileName = '';
                DataDevice.device.Files = [];
                DataDevice.device.Status = 'Active';
                $scope.DeviceActiveSerial = $scope.device.strSerial;
                if ($scope.uploader.queue.length > 0) {
                    DataDevice.device.FileName = $scope.uploader.queue[0].file.name;
                }
                $scope.devices.push(DataDevice.device);
                var Data = {};
                Data.devices = $scope.devices;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/NewDeviceRegister',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $scope.messages.push({ email: $scope.user.strEmail, messagetype: 'alert alert-danger alert-dismissible', messagetype2: 'text-danger', messagetype3: 'fa fa-warning', message: $scope.user.strFirstName + ' Hey!', message2: ' I see you have a new device :)  ...', read: false });
                    $scope.ClearDeviceData();
                    if (response.data.Result == 'ok') {
                        $scope.QuantityFiles = $scope.uploader.queue.length;
                        if ($scope.QuantityFiles > 0) {
                            $scope.uploader.uploadAll();
                        }
                        else {
                            $loading.finish('myloading');
                            $scope.MessagesModalInterface.button1Name = 'Ok';
                            $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                            $scope.MessagesModalInterface.button2Name = '';
                            $scope.MessagesModalInterface.bodyTitleMessage = 'Great!';
                            $scope.MessagesModalInterface.bodyMessage = 'Your Device Warranty is safed now!';
                            $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                            $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                            $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                            $scope.open();
                        }
                        $scope.devices = response.data.Devices;
                    }
                    else if (response.data.Result == 'userExist') {
                        window.location.href = '/home.html';
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            // Close session
            $scope.Logout = function () {
                $scope.CallBackModal = $scope.CloseSession;
                $scope.MessagesModalInterface.button1Name = 'Ok';
                $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                $scope.MessagesModalInterface.button2Class = 'btn btn-default btn-margen';
                $scope.MessagesModalInterface.button2Name = 'Cancel';
                $scope.MessagesModalInterface.bodyTitleMessage = 'Sure?';
                $scope.MessagesModalInterface.bodyMessage = 'Are you sure that you like to close session?';
                $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-question fa-4x i-green';
                $scope.open();
            };
            $scope.CloseSession = function () {
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/Logout',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        window.location.href = '/index.html';
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            // update messages
            $scope.UpdateMessages = function (message) {
                $loading.start('myloading');
                message.messagetype2 = 'text-success';
                message.messagetype3 = 'fa fa-check';
                message.read = true;
                var Data = {};
                Data.Messages = $scope.messages;
                $http({
                    method: 'POST',
                    url: '/api/UpdateMessages',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            $scope.MakeVisible = function () {
                $loading.start('myloading');
                var Data = {};
                Data.lastupdate = new Date();
                Data.isvisible = $scope.user.isvisible;
                $http({
                    method: 'POST',
                    url: '/api/MakeVisible',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.user.lastupdate = Data.lastupdate;
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Ready!';
                        if ($scope.user.isvisible == true) {
                            $scope.MessagesModalInterface.bodyMessage = 'Another user can send you a warranty for 48 hours!';
                        }
                        else {
                            $scope.MessagesModalInterface.bodyMessage = 'You are not visible for warranty transfers!';
                        }
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            $scope.UpdateUser = function () {
                var booError = false;
                if ($scope.user.strFirstName.trim() == '') {
                    $scope.strFirstNameClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strFirstNameClass = 'form-group'
                }
                if ($scope.user.strLastName.trim() == '') {
                    $scope.strLastNameClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strLastNameClass = 'form-group'
                }
                if (!validateEmail($scope.user.strEmail.trim())) {
                    $scope.strEmailClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strEmailClass = 'form-group'
                }
                if ($scope.user.strPassword.trim() == '' || $scope.user.strPassword.trim() != $scope.user.strConfirmPassword.trim()) {
                    $scope.strPasswordClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strPasswordClass = 'form-group'
                }
                if ($scope.user.strPhoneNumber.trim() == '') {
                    $scope.strPhoneNumberClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strPhoneNumberClass = 'form-group'
                }
                if (typeof $scope.user.country.name == 'undefined') {
                    $scope.strCountryClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strCountryClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                Data.user = $scope.user;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/UpdateUser',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Great!';
                        $scope.MessagesModalInterface.bodyMessage = 'Your user account was updated!';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                    else if (response.data.Result == 'userExist') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                        $scope.MessagesModalInterface.bodyMessage = 'This account was taken!';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            // Set home devices
            $scope.SetHomeDevices = function () {
                $scope.devicesfiltered = $scope.devices;
            }
            // Set home devices
            $scope.SetListDevice = function () {
                $scope.deviceslistfiltered = $scope.devices;
            }
            // B�squeda de devices en dashboard y lista de dispositivos
            $scope.SearchDevices = function () {
                $scope.devicesfiltered = $scope.devices;
                $scope.devicesfiltered = $scope.devicesfiltered.filter(function (el) {
                    return el.make.name.toUpperCase().indexOf($scope.strSearchDevice.toUpperCase()) > -1 || el.model.name.toUpperCase().indexOf($scope.strSearchDevice.toUpperCase()) > -1 || el.category.name.toUpperCase().indexOf($scope.strSearchDevice.toUpperCase()) > -1
                })
            }
            // B�squeda de devices en dashboard y lista de dispositivos para pantalla de listados
            $scope.SearchDevicesList = function () {
                $scope.deviceslistfiltered = $scope.devices;
                $scope.deviceslistfiltered = $scope.deviceslistfiltered.filter(function (el) {
                    return el.make.name.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.model.name.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.category.name.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.subcategory.name.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.strSerial.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.strVendor.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1
                })
            }
            // Confirmaci�n de desactivaci�n
            $scope.CallConfirmDeactivate = function (device) {
                $scope.deactivatedevice = device;
                $scope.CallBackModal = $scope.DeactivateDevice;
                $scope.MessagesModalInterface.button1Name = 'Ok';
                $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                $scope.MessagesModalInterface.button2Class = 'btn btn-default btn-margen';
                $scope.MessagesModalInterface.button2Name = 'Cancel';
                $scope.MessagesModalInterface.bodyTitleMessage = 'Sure?';
                if (device.Status == 'Active') {
                    $scope.MessagesModalInterface.bodyMessage = 'Are you sure that you like to deactivate this device?';
                }
                else {
                    $scope.MessagesModalInterface.bodyMessage = 'Are you sure that you like to re-activate this device?';
                }
                $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-question fa-4x i-green';
                $scope.open();
            };
            // Confirmaci�n de traspaso
            $scope.CallConfirmTransfer = function (device) {
                var transferuser = $scope.transferusers.filter(function (el) { return el.email == device.strEmailTransfer });
                if (transferuser.length == 0) {
                    $scope.MessagesModalInterface.button1Name = 'Ok';
                    $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                    $scope.MessagesModalInterface.button2Name = '';
                    $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                    $scope.MessagesModalInterface.bodyMessage = 'You must select a valid user!';
                    $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-red';
                    $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-times fa-4x i-red';
                    $scope.open();
                    return 0;
                }
                $scope.deactivatedevice = device;
                $scope.CallBackModal = $scope.TransferDevice;
                $scope.MessagesModalInterface.button1Name = 'Ok';
                $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                $scope.MessagesModalInterface.button2Class = 'btn btn-default btn-margen';
                $scope.MessagesModalInterface.button2Name = 'Cancel';
                $scope.MessagesModalInterface.bodyTitleMessage = 'Sure?';
                $scope.MessagesModalInterface.bodyMessage = 'Are you sure that you like to transfer this device?';
                $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-question fa-4x i-green';
                $scope.open();
            };
            // Desactiva el dispositivo
            $scope.DeactivateDevice = function (device) {
                var Data = {};
                Data.strSerial = device.strSerial;
                Data.Status = device.Status;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/DeactivateDevice',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        if (device.Status == false) {
                            $scope.MessagesModalInterface.bodyMessage = 'Your device was deativated! Remember you can re-activate any time.';
                        }
                        else {
                            $scope.MessagesModalInterface.bodyMessage = 'Your device is active now.';
                        }
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Ready!';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            // Transfiere el dispositivo
            $scope.TransferDevice = function () {
                var Data = {};
                Data.strSerial = $scope.deactivatedevice.strSerial;
                Data.strEmailTransfer = $scope.deactivatedevice.strEmailTransfer;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/TransferDevice',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.devices = $scope.devices.filter(function (el) { return el.strSerial != Data.strSerial });
                        $scope.deviceslistfiltered = $scope.deviceslistfiltered.filter(function (el) { return el.strSerial != Data.strSerial });
                        $scope.devicesfiltered = $scope.devicesfiltered.filter(function (el) { return el.strSerial != Data.strSerial });
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Ready!';
                        $scope.MessagesModalInterface.bodyMessage = 'The device was transfered!';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            // Modal de mensajes
            $scope.animationsEnabled = true;
            $scope.open = function (size, Solicitud, parentSelector) {
                var parentElem = parentSelector ?
                  angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'messagemodal.html',
                    controller: 'MessagesModalCtrl',
                    controllerAs: '$ctrl',
                    size: size,
                    appendTo: parentElem,
                    resolve: {
                        MessagesModalInterface: function () {
                            return $scope.MessagesModalInterface;
                        }
                    }
                });
                modalInstance.result.then(function (selectedItem) {
                    if (selectedItem.action == 'btn1') {
                        $scope.CallBackModal();
                    }
                    $scope.CallBackModal = function () { return 0; };
                }, function () {
                    $scope.CallBackModal();
                    $scope.CallBackModal = function () { return 0; };
                });
            };
            $scope.QuantityFiles = 0;
            $scope.uploader = new FileUploader();
            $scope.uploader.url = "/api/uploadFile";
            $scope.uploader.onBeforeUploadItem = function (item) {
                var Data = {};
                Data.DeviceActiveSerial = $scope.DeviceActiveSerial;
                item.formData.push(Data);
            };
            // Para llenar las marcas de forma as�ncrona
            $scope.getMakes = function (val) {
                if (val.length < 2) { return 0 };
                $loading.start('myloading');
                return $http.post('/api/GetMakes', {
                    params: {
                        val: val
                    }
                }).then(function (response) {
                    $loading.finish('myloading');
                    return response.data.Makes;
                });
            };
            // Para llenar los modelos de forma as�ncrona
            $scope.getModels = function (val) {
                if (val.length < 2) { return 0 };
                $loading.start('myloading');
                return $http.post('/api/GetModels', {
                    params: {
                        val: val
                    }
                }).then(function (response) {
                    $loading.finish('myloading');
                    return response.data.Models;
                });
            };
            $scope.uploader.onSuccessItem = function (item, response) {
                if ($scope.QuantityFiles == 1) {
                    $scope.uploader.clearQueue();
                    $loading.finish('myloading');
                    $scope.devices = response.Devices;
                    $scope.MessagesModalInterface.button1Name = 'Ok';
                    $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                    $scope.MessagesModalInterface.button2Name = '';
                    $scope.MessagesModalInterface.bodyTitleMessage = 'Great!';
                    $scope.MessagesModalInterface.bodyMessage = 'Your Device Warranty is safed now!';
                    $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                    $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                    $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                    $scope.open();
                }
                $scope.QuantityFiles--;
            }
            $scope.FillSubCategories = function () {
                // Lista de subcategor�as (Fijos por traer de base de datos)
                $scope.device.subcategory = {};
                $scope.subcategories = [ // Taken from https://gist.github.com/unceus/6501985
                { id: 1, name: 'SmartPhone', code: 'DA', categoryid: 1 },
                { id: 2, name: 'Computer', code: 'FI', categoryid: 2 },
                { id: 3, name: 'TV', code: 'FI', categoryid: 2 },
                { id: 4, name: 'Tablet', code: 'FI', categoryid: 2 },
                { id: 5, name: 'Refrigerator', code: 'FI', categoryid: 3 },
                { id: 6, name: 'Light', code: 'FI', categoryid: 3 },
                { id: 7, name: 'Blender', code: 'FI', categoryid: 3 },
                { id: 8, name: 'Baby Carriage', code: 'FI', categoryid: 4 },
                { id: 9, name: 'Batery', code: 'FI', categoryid: 5 },
                { id: 10, name: 'Watch', code: 'FI', categoryid: 6 },
                { id: 11, name: 'Ring', code: 'FI', categoryid: 6 },
                { id: 12, name: 'Hairdryer', code: 'FI', categoryid: 7 },
                { id: 13, name: 'Hair shaver', code: 'FI', categoryid: 7 },
                { id: 15, name: 'Digital thermometer', code: 'FI', categoryid: 8 },
                { id: 16, name: 'Lawn mower', code: 'FI', categoryid: 9 },
                { id: 17, name: 'Barbecue grill', code: 'FI', categoryid: 9 }
                ];
            };
            // Lista de marcas (Fijos por traer de base de datos)
            $scope.makes = [ // Taken from https://gist.github.com/unceus/6501985
            { id: 1, name: 'Daewood', code: 'DA' },
            { id: 2, name: 'Fiat', code: 'FI' },
            { id: 3, name: 'Toyota', code: 'TO' },
            ];
            // Lista de modelos (Fijos por traer de base de datos)
            $scope.models = [ // Taken from https://gist.github.com/unceus/6501985
            { id: 1, name: 'Daewood Modelo 1', code: 'DA', makeid: 1 },
            { id: 2, name: 'Daewood Modelo 2', code: 'FI', makeid: 1 },
            { id: 3, name: 'Fiat Modelo 1', code: 'TO', makeid: 2 },
            ];
            // Lista de categor�as (Fijos por traer de base de datos)
            $scope.categories = [ // Taken from https://gist.github.com/unceus/6501985
            { id: 1, name: 'Cell Phone', code: 'DA' },
            { id: 2, name: 'Electronic', code: 'EL' },
            { id: 3, name: 'House & Kitchen', code: 'KI' },
            { id: 4, name: 'Babies', code: 'BA' },
            { id: 5, name: 'Car', code: 'CA' },
            { id: 6, name: 'Jewerly', code: 'JE' },
            { id: 7, name: 'Beauty', code: 'BE' },
            { id: 8, name: 'Health & Personal Care', code: 'HE' },
            { id: 9, name: 'Garden', code: 'GA' }
            ];
            // Lista de Warranty Life
            $scope.WarratyTimes = [ // Taken from https://gist.github.com/unceus/6501985
            { id: 1, name: '1 year', code: 'DA' },
            { id: 2, name: '2 years', code: 'EL' },
            { id: 3, name: '3 years', code: 'EL' },
            { id: 4, name: '4 years', code: 'EL' },
            { id: 5, name: '5 years', code: 'EL' },
            { id: 6, name: '6 years', code: 'EL' },
            { id: 7, name: '7 years', code: 'EL' },
            { id: 8, name: '8 years', code: 'EL' },
            { id: 9, name: 'Lifetime Warranty', code: 'EL' }
            ];
            // Angular code date picker control
            $scope.today = function () {
                $scope.dt = new Date();
            };
            $scope.today();
            $scope.clear = function () {
                $scope.dt = null;
            };
            $scope.inlineOptions = {
                customClass: getDayClass,
                minDate: new Date(),
                showWeeks: true
            };
            $scope.dateOptions = {
                dateDisabled: disabled,
                formatYear: 'yy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(),
                startingDay: 1
            };
            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                  mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }
            $scope.toggleMin = function () {
                $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            };
            $scope.toggleMin();
            $scope.open1 = function () {
                $scope.popup1.opened = true;
            };
            $scope.setDate = function (year, month, day) {
                $scope.dt = new Date(year, month, day);
            };
            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];
            $scope.altInputFormats = ['M!/d!/yyyy'];
            $scope.popup1 = {
                opened: false
            };
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            var afterTomorrow = new Date();
            afterTomorrow.setDate(tomorrow.getDate() + 1);
            $scope.events = [
              {
                  date: tomorrow,
                  status: 'full'
              },
              {
                  date: afterTomorrow,
                  status: 'partially'
              }
            ];
            function getDayClass(data) {
                var date = data.date,
                  mode = data.mode;
                if (mode === 'day') {
                    var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
                    for (var i = 0; i < $scope.events.length; i++) {
                        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                        if (dayToCheck === currentDay) {
                            return $scope.events[i].status;
                        }
                    }
                }
                return '';
            }
            // Lista de pa�ses (Fijos)
            $scope.countries = lCountries;
            // End countries control code
        }])

        .controller('ctrlServiceHistory', ['$scope', '$http', '$loading', '$uibModal', function ($scope, $http, $loading, $uibModal) {

          $scope.CloseSession = function(){
            delete localStorage.cnnData2;
            window.location = '/login.html';
          }

          function getArray(object){
              if (Array.isArray(object)){
                return object;
              }
              else{
                return [object]
              }
          }

          $scope.GetWorkOrderDetail = function(WorkOrderId){
            $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"GetServiceInfo","conncode":"' + cnnData.DBNAME + '","serviceid":"' + WorkOrderId + '"}', {headers: headers}).then(function (response) {
              $scope.WorkOrder = response.data.CubeFlexIntegration.DATA;
              $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"GetServiceDetails","conncode":"' + cnnData.DBNAME + '","serviceid":"' + WorkOrderId + '"}', {headers: headers}).then(function (response) {
                $scope.WorkOrderDetail = getArray(response.data.CubeFlexIntegration.DATA);
                $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"GetServiceRecomendations","conncode":"' + cnnData.DBNAME + '","serviceid":"' + WorkOrderId + '"}', {headers: headers}).then(function (response) {
                  $scope.WorkOrderRecomendation = response.data.CubeFlexIntegration.DATA;
                })
                .catch(function (data) {
                  console.log('Error 12');
                  console.log(data);
                  swal("Cube Service", "Unexpected error. Check console Error 12.");
                });
              })
              .catch(function (data) {
                console.log('Error 13');
                console.log(data);
                swal("Cube Service", "Unexpected error. Check console Error 13.");
              });
            })
            .catch(function (data) {
              console.log('Error 14');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 14.");
            });
          }

          $scope.NameUser = localStorage.NameUser;

          var headers = {"Authorization": "Basic Y3ViZXU6Y3ViZTIwMTc="};

          if (typeof localStorage.cnnData2 != 'undefined'){

            $loading.start('myloading');

            var cnnData = JSON.parse(localStorage.cnnData2);
            var EmployeeData = JSON.parse(localStorage.EmployeeData);
            $scope.cnnData = cnnData;

            $scope.NameUser = cnnData.Name;

            $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Get_Services_History_Customer","conncode":"' + cnnData.DBNAME + '","customerid":"' + EmployeeData.EMPLOYEEID + '"}', {headers: headers}).then(function (response) {
              $scope.CustomerOrderHistory = response.data.CubeFlexIntegration.DATA;

              $loading.finish('myloading');

              $scope.CustomerOrderHistory.forEach(function(element) {
                element.Schedule_Date = new Date(element.Schedule_Date);
              });

              $scope.CustomerOrderHistoryFiltered = $scope.CustomerOrderHistory;

              $scope.SearchWOL();

            })
            .catch(function (data) {
              console.log('Error 16');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 16.");
            });

          }

          $scope.ValidaDate = function(dDate){
            if ( Object.prototype.toString.call(dDate) === "[object Date]" ) {
              if ( isNaN( dDate.getTime() ) ) {
                return false;
              }
              else {
                return true;
              }
            }
            else {
              return false;
            }
          }

          $scope.SearchWOL = function(){

            if (!$scope.ValidaDate($scope.fromDate) || !$scope.ValidaDate($scope.toDate)){
              $scope.CustomerOrderHistoryFiltered = [];
              return 0;
            }

            var fromDate = $scope.fromDate;

            $scope.CustomerOrderHistoryFiltered = $scope.CustomerOrderHistory;

            var fromDateOneDay = fromDate;
            fromDateOneDay.setDate(fromDateOneDay.getDate()-1);

            $scope.CustomerOrderHistoryFiltered = $scope.CustomerOrderHistoryFiltered.filter(function (el){
              return el.Schedule_Date >= fromDateOneDay && el.Schedule_Date <= $scope.toDate && (el.Reported_Issue.toUpperCase().indexOf($scope.SearchText.toUpperCase()) > -1 || el.ITEMNAME.toUpperCase().indexOf($scope.SearchText.toUpperCase()) > -1);
            })

          }

          $scope.SearchText = '';
          var date = new Date();
          $scope.fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
          $scope.toDate = new Date();
          $scope.toDate.setDate($scope.toDate.getDate()+1);

          // Date Control Functions
          $scope.today = function() {
            $scope.dt = new Date();
          };
          $scope.today();

          $scope.clear = function() {
            $scope.dt = null;
          };

          $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
          };

          $scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
          };

          // Disable weekend selection
          function disabled(data) {
            var date = data.date,
              mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
          }
          $scope.toggleMin = function() {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
          };
          $scope.toggleMin();
          $scope.open1 = function() {
            $scope.popup1.opened = true;
          };
          $scope.open2 = function() {
            $scope.popup2.opened = true;
          };
          $scope.setDate = function(year, month, day) {
            $scope.dt = new Date(year, month, day);
          };
          $scope.formats = ['MM-dd-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
          $scope.format = $scope.formats[0];
          $scope.altInputFormats = ['M!/d!/yyyy'];
          $scope.popup1 = {
            opened: false
          };
          $scope.popup2 = {
            opened: false
          };
          var tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          var afterTomorrow = new Date();
          afterTomorrow.setDate(tomorrow.getDate() + 1);
          $scope.events = [
            {
              date: tomorrow,
              status: 'full'
            },
            {
              date: afterTomorrow,
              status: 'partially'
            }
          ];
          function getDayClass(data) {
            var date = data.date,
              mode = data.mode;
            if (mode === 'day') {
              var dayToCheck = new Date(date).setHours(0,0,0,0);

              for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

                if (dayToCheck === currentDay) {
                  return $scope.events[i].status;
                }
              }
            }

            return '';
          }
          // End Date Control Functions

        }])

        .controller('ctrlWarrantyLogin', ['$scope', '$http', '$loading', '$uibModal', function ($scope, $http, $loading, $uibModal) {

          $scope.User = {};
          $scope.User.name = '';
          $scope.User.password = '';
          $scope.ShowSideBar = true;
          $scope.LeftMenu = 'left-side sidebar-offcanvas';
          $scope.RightMenu = 'right-side';

          function getArray(object){
              if (Array.isArray(object)){
                return object;
              }
              else{
                return [object]
              }
          }

          $scope.GetWorkOrderDetail = function(WorkOrderId){
            $loading.start('myloading');
            $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"GetServiceInfo","conncode":"' + cnnData.DBNAME + '","serviceid":"' + WorkOrderId + '"}', {headers: headers}).then(function (response) {
              $scope.WorkOrder = response.data.CubeFlexIntegration.DATA;
              $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"GetServiceDetails","conncode":"' + cnnData.DBNAME + '","serviceid":"' + WorkOrderId + '"}', {headers: headers}).then(function (response) {
                $scope.WorkOrderDetail = getArray(response.data.CubeFlexIntegration.DATA);
                $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"GetServiceRecomendations","conncode":"' + cnnData.DBNAME + '","serviceid":"' + WorkOrderId + '"}', {headers: headers}).then(function (response) {
                  $loading.finish('myloading');
                  $scope.WorkOrderRecomendation = response.data.CubeFlexIntegration.DATA;
                })
                .catch(function (data) {
                  console.log('Error 20');
                  console.log(data);
                  swal("Cube Service", "Unexpected error. Check console Error 20.");
                });
              })
              .catch(function (data) {
                console.log('Error 21');
                console.log(data);
                swal("Cube Service", "Unexpected error. Check console Error 21.");
              });
            })
            .catch(function (data) {
              console.log('Error 22');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 22.");
            });
          }

          $scope.HideMenu = function(){
            if ($scope.ShowSideBar == false){
              $scope.LeftMenu = 'left-side sidebar-offcanvas';
              $scope.RightMenu = 'right-side';
              $scope.ShowSideBar = true;
            }
            else{
              $scope.LeftMenu = 'left-side sidebar-offcanvas collapse-left';
              $scope.RightMenu = 'right-side strech';
              $scope.ShowSideBar = false;
            }
          }

          // Connect Cube Service
          $scope.Login = function(){

            $loading.start('myloading');

            $http.get('http://www.cube-mia.com/api/CubeClientAuthentication.ashx?obj={"username":"' + $scope.User.name + '","password":"' + $scope.User.password + '"}', {headers: headers}).then(function (response) {
                var cnnData2 = response.data.CubeAuthentication.DATA;

                if (typeof cnnData2 == 'undefined'){
                  $loading.finish('myloading');
                  swal("Cube Interface", "Invalid Credentials.");
                }
                else{
                  localStorage.cnnData2 = JSON.stringify(cnnData2);
                  window.location = '/index.html';
                }

            })
            .catch(function (data) {
              console.log('Error 23');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 23.");
            });

          }

          $scope.CloseSession = function(){
            delete localStorage.cnnData2;
            window.location = '/login.html';
          }

          var headers = {"Authorization": "Basic Y3ViZXU6Y3ViZTIwMTc="};

          if (typeof localStorage.cnnData2 != 'undefined'){

            $loading.start('myloading');

            var cnnData = JSON.parse(localStorage.cnnData2);
            $scope.cnnnData2 = cnnData;

            $scope.NameUser = cnnData.Name;
            localStorage.NameUser = $scope.NameUser;

            $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Get_EmployeeID","conncode":"' + cnnData.DBNAME + '","masteruserid":"' + cnnData.ID + '"}', {headers: headers}).then(function (response) {

                var EmployeeData = response.data.CubeFlexIntegration.DATA;
                $scope.EmployeeData = EmployeeData;

                localStorage.EmployeeData = JSON.stringify(EmployeeData);

                $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Get_Services_Customer","conncode":"' + cnnData.DBNAME + '","customerid":"' + EmployeeData.EMPLOYEEID + '"}', {headers: headers}).then(function (response) {

                  var CustomerData = response.data.CubeFlexIntegration.DATA;
                  $scope.CustomerData = getArray(response.data.CubeFlexIntegration.DATA);

                  CustomerData.Schedule_Date = new Date(CustomerData.Schedule_Date);

                  // Get service sites for customer to populate select sites in create new order
                  $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Get_Services_Sites_Customer","conncode":"' + cnnData.DBNAME + '","customerid":"' + EmployeeData.EMPLOYEEID + '"}', {headers: headers}).then(function (response) {
                    $scope.CustomerSites = getArray(response.data.CubeFlexIntegration.DATA);
                    $scope.CustomerSitesFiltered = $scope.CustomerSites;
                  })
                  .catch(function (data) {
                    console.log('Error 27');
                    console.log(data);
                    swal("Cube Service", "Unexpected error. Check console Error 27.");
                  });

                  // GetPriorities to populate select Priorities in create new order
                  $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"GetServicePriority","conncode":"' + cnnData.DBNAME + '"}', {headers: headers}).then(function (response) {
                    $scope.Priorities = getArray(response.data.CubeFlexIntegration.DATA);
                  })
                  .catch(function (data) {
                    console.log('Error 28');
                    console.log(data);
                    swal("Cube Service", "Unexpected error. Check console Error 28.");
                  });

                  $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Get_Services_Count_Customer","conncode":"' + cnnData.DBNAME + '","customerid":"' + EmployeeData.EMPLOYEEID + '"}', {headers: headers}).then(function (response) {

                    $scope.ServiceCountCustomer = response.data.CubeFlexIntegration.DATA;

                    // Get Knowleges for home
                    $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Get_MessagesBoard","conncode":"' + cnnData.DBNAME + '"}', {headers: headers}).then(function (response) {
                      $scope.Knowleges = getArray(response.data.CubeFlexIntegration.DATA);
                    })
                    .catch(function (data) {
                      console.log('Error 26');
                      console.log(data);
                      swal("Cube Service", "Unexpected error. Check console Error 26.");
                    });

                    $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"GetServiceOpen_Recomendations","conncode":"' + cnnData.DBNAME + '","customerid":"' + EmployeeData.EMPLOYEEID + '"}', {headers: headers}).then(function (response) {

                      $scope.Recomendations = getArray(response.data.CubeFlexIntegration.DATA);

                      $loading.finish('myloading');

                      $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Get_User_DashboardConf","conncode":"' + cnnData.DBNAME + '", "userid":"' + $scope.cnnnData2.ID + '"}', {headers: headers}).then(function (response) {
                        var lRows = getArray(response.data.CubeFlexIntegration.DATA);
                        if (typeof lRows[0] == 'undefined'){
                          $scope.Rows = [
                              {
                                  Columns: [
                                      {ID: 4, name: "Tabla 1", type: "man", page: "table-order-list.html", title: "Open Service Work Orders List"},
                                      {ID: 5, name: "Tabla 2", type: "man", page: "table-knowlege.html", title:"Knowledge Base Articles"},
                                      {ID: 6, name: "Tabla 3", type: "woman", page: "table-recomendations.html", title: "Open Recommendations on you sites"},
                                  ]
                              }
                          ];
                        }
                        else{
                          try {
                            $scope.Rows = JSON.parse(lRows[0].CONFIGURATION.replace(/@@@/gi, '"'));
                          }
                          catch(err) {
                            $scope.Rows = [
                                {
                                    Columns: [
                                        {ID: 4, name: "Tabla 1", type: "man", page: "table-order-list.html", title: "Open Service Work Orders List"},
                                        {ID: 5, name: "Tabla 2", type: "man", page: "table-knowlege.html", title:"Knowledge Base Articles"},
                                        {ID: 6, name: "Tabla 3", type: "woman", page: "table-recomendations.html", title: "Open Recommendations on you sites"},
                                    ]
                                }
                            ];
                          }
                        }
                      })
                      .catch(function (data) {
                        console.log('Error 1');
                        console.log(data);
                        swal("Cube Service", "Unexpected error. Check console Error 1.");
                      });

                    })
                    .catch(function (data) {
                      console.log('Error 2');
                      console.log(data);
                      swal("Cube Service", "Unexpected error. Check console Error 2.");
                    });

                  })
                  .catch(function (data) {
                    console.log('Error 3');
                    console.log(data);
                    swal("Cube Service", "Unexpected error. Check console Error 3.");
                  });


                })
                .catch(function (data) {
                  console.log('Error 5');
                  console.log(data);
                  swal("Cube Service", "Unexpected error. Check console Error 5.");
                });


            })
            .catch(function (data) {
              console.log('Error 6');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 6.");
            });

          }

          $scope.AddWidget = function(WidgetId){
            $scope.Rows[0].Columns.push($scope.ListRows[WidgetId])
            localStorage.Rows = JSON.stringify($scope.Rows);

            var jsonFormatted = localStorage.Rows.replace(/"/gi, "@@@");

            $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Save_User_DashboardConf","conncode":"' + cnnData.DBNAME + '", "userid":"' + $scope.cnnnData2.ID + '", "configuration": "' + jsonFormatted + '"}', {headers: headers}).then(function (response) {
            })
            .catch(function (data) {
              console.log('Error 7');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 7.");
            });

          }

          $scope.ListRows = [{ID: 1, name: "Tabla 1", type: "man", page: "table-order-list.html", title: "Open Service Work Orders List"},
          {ID: 2, name: "Tabla 2", type: "man", page: "table-knowlege.html", title:"Knowledge Base Articles"},
          {ID: 3, name: "Tabla 3", type: "woman", page: "table-recomendations.html", title: "Open Recommendations on you sites"}]

          $scope.SearchSites = function(){

            $scope.CustomerSitesFiltered = $scope.CustomerSites;

            $scope.CustomerSitesFiltered = $scope.CustomerSitesFiltered.filter(function (el){
              return el.SITENAME.toUpperCase().indexOf($scope.SearchText.toUpperCase()) > -1;
            })

          }

          $scope.DropHomeTable = function(tablename) {
            $scope.Rows[0].Columns = $scope.Rows[0].Columns.filter(function(el){
              return el.page != tablename;
            })
            localStorage.Rows = JSON.stringify($scope.Rows);

            var jsonFormatted = localStorage.Rows.replace(/"/gi, "@@@");

            $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Save_User_DashboardConf","conncode":"' + cnnData.DBNAME + '", "userid":"' + $scope.cnnnData2.ID + '", "configuration": "' + jsonFormatted + '"}', {headers: headers}).then(function (response) {
            })
            .catch(function (data) {
              console.log('Error 8');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 8.");
            });

          };

          $scope.CustomerPO = '';
          $scope.ReasonForService = '';

          $scope.CreateOrder = function() {
            // Call method to create order
            var headers = {"Authorization": "Basic Y3ViZXU6Y3ViZTIwMTc="};
            var cnnData = JSON.parse(localStorage.cnnData2);

            if (typeof $scope.selectedCustomerSite == 'undefined' || $scope.CustomerPO.trim() == '' || typeof $scope.selectedPriority == 'undefined' || $scope.ReasonForService.trim() == '') {
                swal("Cube Service", "You must fill all fields.");
                return 0;
            }

            var urlRq = 'http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"SaveServiceInfo_Customer","conncode":"' + cnnData.DBNAME + '","siteid":"' + $scope.selectedCustomerSite.ID + '", "customerpo": "' + $scope.CustomerPO + '", "priorityid": "' + $scope.selectedPriority.ID + '", "reasonforservice": "' + $scope.ReasonForService + '", "reqbyid": "' + $scope.cnnnData2.ID + '"}';

            $loading.start('myloading');
            $http.get(urlRq, {headers: headers}).then(function (response) {
              if (response.data.responseCode.substring(0, 3) == '200'){
                $scope.CustomerPO = '';
                $scope.ReasonForService = '';
                $scope.selectedCustomerSite = undefined;
                $scope.selectedPriority = undefined;
                // Refresh Services
                $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Get_Services_Customer","conncode":"' + cnnData.DBNAME + '","customerid":"' + $scope.EmployeeData.EMPLOYEEID + '"}', {headers: headers}).then(function (response) {
                  $scope.CustomerData = getArray(response.data.CubeFlexIntegration.DATA);
                  $loading.finish('myloading');
                  swal("Cube Service", "Service was created.");
                  // Close modal
                  $('#create_order').modal('hide');
                })

              }
            })
            .catch(function (data) {
              console.log('Error 9');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 9.");
            });


          };

          $scope.DragFinish = function(index, item, external) {
            $scope.Rows[0].Columns = _.uniqBy($scope.Rows[0].Columns, 'ID');
            localStorage.Rows = JSON.stringify($scope.Rows);

            var jsonFormatted = localStorage.Rows.replace(/"/gi, "@@@");

            $http.get('http://www.cube-mia.com/api/CubeFlexIntegration.ashx?obj={"method":"Save_User_DashboardConf","conncode":"' + cnnData.DBNAME + '", "userid":"' + $scope.cnnnData2.ID + '", "configuration": "' + jsonFormatted + '"}', {headers: headers}).then(function (response) {
            })
            .catch(function (data) {
              console.log('Error 10');
              console.log(data);
              swal("Cube Service", "Unexpected error. Check console Error 10.");
            });

          };

            // Valores por defecto de modales
            $scope.MessagesModalInterface = {};
            // Inicio variables
            $scope.user = {};
            $scope.user.country = {};
            $scope.user.strFirstName = '';
            $scope.user.strLastName = '';
            $scope.user.strEmail = '';
            $scope.user.strPassword = '';
            $scope.user.strConfirmPassword = '';
            $scope.user.strPhoneNumber = '';
            $scope.userLogon = {};
            $scope.userLogon.strEmail = '';
            $scope.userLogon.strPassword = '';
            $scope.strFirstNameClass = 'form-group';
            $scope.strLastNameClass = 'form-group';
            $scope.strEmailClass = 'form-group';
            $scope.strPasswordClass = 'form-group';
            $scope.strConfirmPasswordClass = 'form-group';
            $scope.strPhoneClass = 'form-group';
            $scope.strCountryClass = 'form-group';
            $scope.strEmailLogonClass = 'form-group';
            $scope.strPasswordLogonClass = 'form-group';

            // Crear nuevo usuario
            $scope.NewUserRegister = function () {
                var booError = false;
                if ($scope.user.strFirstName.trim() == '') {
                    $scope.strFirstNameClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strFirstNameClass = 'form-group'
                }
                if ($scope.user.strLastName.trim() == '') {
                    $scope.strLastNameClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strLastNameClass = 'form-group'
                }
                if (!validateEmail($scope.user.strEmail.trim())) {
                    $scope.strEmailClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strEmailClass = 'form-group'
                }
                if ($scope.user.strPassword.trim() == '' || $scope.user.strPassword.trim() != $scope.user.strConfirmPassword.trim()) {
                    $scope.strPasswordClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strPasswordClass = 'form-group'
                }
                if ($scope.user.strPhoneNumber.trim() == '') {
                    $scope.strPhoneNumberClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strPhoneNumberClass = 'form-group'
                }
                if (typeof $scope.user.country.name == 'undefined') {
                    $scope.strCountryClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strCountryClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                $scope.user.isvisible = false;
                Data.user = $scope.user;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/NewUserRegister',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        window.location.href = '/home.html';
                    }
                    else if (response.data.Result == 'userExist') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                        $scope.MessagesModalInterface.bodyMessage = 'This account was taken!';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-red';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-times fa-4x i-red';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.Logon = function () {
                var booError = false;
                if (!validateEmail($scope.userLogon.strEmail.trim())) {
                    $scope.strEmailLogonClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strEmailLogonClass = 'form-group'
                }
                if ($scope.userLogon.strPassword.trim() == '') {
                    $scope.strPasswordLogonClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strPasswordLogonClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                Data.userLogon = $scope.userLogon;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/Logon',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        window.location.href = '/home.html';
                    }
                    else if (response.data.Result == 'userDoesNotExist') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                        $scope.MessagesModalInterface.bodyMessage = 'Credentials are invalid! Please register';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-red';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-times fa-4x i-red';
                        $scope.open();
                        $('[href="#sign-out"]').tab('show');
                        $scope.user.strEmail = $scope.userLogon.strEmail;
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            $scope.RecoverPassword = function () {
                var booError = false;
                if (!validateEmail($scope.userLogon.strEmail.trim())) {
                    $scope.strEmailLogonClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strEmailLogonClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                Data.userLogon = $scope.userLogon;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/RecoverPassword',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'Ok') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Great!';
                        $scope.MessagesModalInterface.bodyMessage = 'We send you a new password to your email account!';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                    else if (response.data.Result == 'userDoesNotExist') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                        $scope.MessagesModalInterface.bodyMessage = 'This email does not have any account! Please check your email or create an user!';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-red';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-times fa-4x i-red';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            // Modal de mensajes
            $scope.animationsEnabled = true;
            $scope.open = function (size, Solicitud, parentSelector) {
                $scope.MessagesModalInterface.Message = '';
                var parentElem = parentSelector ?
                  angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'messagemodal.html',
                    controller: 'MessagesModalCtrl',
                    controllerAs: '$ctrl',
                    size: size,
                    appendTo: parentElem,
                    resolve: {
                        MessagesModalInterface: function () {
                            return $scope.MessagesModalInterface;
                        }
                    }
                });
            };
            // Lista de pa�ses (Fijos)
            $scope.countries = lCountries;
            // End countries control code
        }])

        // Controlador de la ventana de modal de mensajes
        .controller('MessagesModalCtrl', function ($uibModalInstance, MessagesModalInterface) {
            var $ctrl = this;
            $ctrl.titleMessage = MessagesModalInterface.titleMessage;
            $ctrl.bodyTitleMessage = MessagesModalInterface.bodyTitleMessage;
            $ctrl.bodyMessage = MessagesModalInterface.bodyMessage;
            $ctrl.button1Name = MessagesModalInterface.button1Name;
            $ctrl.button1Class = MessagesModalInterface.button1Class;
            $ctrl.button2Name = MessagesModalInterface.button2Name;
            $ctrl.button2Class = MessagesModalInterface.button2Class;
            $ctrl.bodyTitleMessageClass1 = MessagesModalInterface.bodyTitleMessageClass1;
            $ctrl.bodyTitleMessageClass2 = MessagesModalInterface.bodyTitleMessageClass2;
            $ctrl.button1Click = function () {
                $uibModalInstance.close({ action: 'btn1' });
            };
            $ctrl.button2Click = function () {
                $uibModalInstance.close({ action: 'btn2' });
            };
        })
