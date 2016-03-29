System.config({
  baseURL: "",
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  map: {
    "angular": "github:angular/bower-angular@1.5.3",
    "angular-legacy": "github:angular/bower-angular@1.5.3",
    "angular-mocks": "github:angular/bower-angular-mocks@1.5.3",
    "angular-mocks-legacy": "github:angular/bower-angular-mocks@1.5.3",
    "jquery": "github:components/jquery@2.1.4",
    "github:angular/bower-angular-mocks@1.5.3": {
      "angular": "github:angular/bower-angular@1.5.3"
    }
  }
});
