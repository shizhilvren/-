function alert_my(str, type) {
    var msg = '<div class="alert alert-' + type + ' alert_my" role="alert" id="alert">' + str + '</div>';
    $("body").prepend(msg);
    $("#alert").fadeIn(100);
    setTimeout(function() {
        $("#alert").fadeOut('slow', function() {
            $("#alert").remove();
        });
    }, 1000);
    setTimeout(function() {
        $("#alert").remove();
    }, 3000);
}
var app = new Vue({
    el: '#main',
    data: {
        login: {
            name: '',
            id: ''
        }
    },
    methods: {
        login_my: function() {
            $.post('/api/student/login', app.login, function(data) {
                if (data.flag == true) {
                    window.location = data.url;
                } else {
                    alert_my(data.data.meg, 'warning');
                    // alert("登录失败");
                }
            });
        }
    }
});