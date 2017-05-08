var app2 = new Vue({
    el: '#show',
    data: {
        user: [],
        // {
        //     name: '',
        //     img_path: '',
        //     meg: ''
        // }
        checkeid: []
    },
    mounted: function() {
        var url = window.location.href;
        var uid = url.split('/').reverse()[0];
        var data = {
            uid: uid
        }
        var flag;
        $.ajax({
            type: 'post',
            url: '/api/student/get_vote',
            data: data,
            async: false,
            success: function(data) {
                flag = data.flag;
                if (data.flag) {

                } else {
                    window.location.href = '/static/anser/' + uid;
                }
            }
        });
        var data_out = [];
        if (flag) {
            $.ajax({
                type: 'post',
                url: '/api/student/get_all',
                data: data,
                async: false,
                success: function(data) {
                    if (data.flag) {
                        console.log(data.data);
                        data_out = data.data;
                    } else {
                        console.log('err');
                    }
                }
            });
        }
        this.user = data_out;
    },
    methods: {
        checkeid_check: function(len) {
            // console.log(len);
            // console.log(this.checkeid.length);
            if (this.checkeid.length > len) {
                this.checkeid.splice(len, this.checkeid.length - len);
                alert("只能选择" + len + "个");
            } else {
                // console.log("ok");
            }
        },
        vote: function() {
            var data = {
                uid: window.location.href.split('/').reverse()[0],
                _id: this.checkeid
            }
            $.post('/api/student/vote', data, function(data) {
                console.log(data);
                if (data.flag) {
                    console.log("true");
                    window.location.href = '/static/anser/' + window.location.href.split('/').reverse()[0];
                } else {
                    console.log("false");
                    alert(data.data.meg);
                }
            });
        }
    }
});