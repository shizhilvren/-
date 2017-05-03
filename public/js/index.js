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
                    alert("登录失败");
                }
            });
        }
    }
});