;(function($, window, undefined){


    // データリスト、東京都のラーメン＆つけ麺
    // 緯度経度取得後に、各データ毎にlat(緯度),lng(経度)が入ります。
    var dataList = [
        {"id":"JB22","sta":"錦糸町駅","lat":35.6967393, "lng":139.812294},
        {"id":"JB23","sta":"亀戸駅","lat":35.6967393, "lng":139.8122948},
        {"id":"JB24","sta":"平井駅","lat":35.7063649, "lng":139.8402012},
        {"id":"JB25","sta":"新小岩駅","lat":35.7168767, "lng":139.8556236},
        {"id":"JB26","sta":"小岩駅","lat":35.7333105, "lng":139.8775926},
        {"id":"JB27","sta":"市川駅","lat":35.728821, "lng":139.9060083},
        {"id":"JB28","sta":"本八幡駅","lat":35.7210914, "lng":139.9250454},
        {"id":"JB29","sta":"下総中山駅","lat":35.7143272, "lng":139.9408277},
        {"id":"JB30","sta":"西船橋駅","lat":35.7074693, "lng":139.9567781},
        {"id":"JB31","sta":"船橋駅","lat":35.7015843, "lng":139.9831735},
        {"id":"JB32","sta":"東船橋駅","lat":35.6998137, "lng":140.0021092},
        {"id":"JB33","sta":"津田沼駅","lat":35.691361, "lng":140.020444},
        {"id":"JB34","sta":"幕張本郷駅","lat":35.6727454, "lng":140.0401153},
        {"id":"JB35","sta":"幕張駅","lat":35.6594163, "lng":140.0556368}
     
    ];


    


    // 現在位置の取得
    function dfdCurrentPosition(){
        var dfd = $.Deferred();

        // Geolocationが使用可能かチェック
        if( !window.navigator.geolocation ) dfd.reject();

        // 現在地の取得
        window.navigator.geolocation.getCurrentPosition(
            // Success
            function(position){
                dfd.resolve(position);
            },
            // Error
            function(error){
                dfd.reject();
            },
            // Options
            {
                enableHighAccuracy:true, //位置情報の精度を高く
                timeout: 10000, //10秒でタイムアウト
                maximumAge: 600000 //10分間有効
            }
        );

        return dfd.promise();
    }


    // DOM Content Loaded
    function dfdDocumentReady(){
        var dfd = $.Deferred();
        $(function(){
            dfd.resolve($(document));
        });
        return dfd.promise();
    }


    // データが揃った段階でソートを開始
    $.when(
        dfdCurrentPosition(),
        
        dfdDocumentReady()
    )
    .done(function(position){

        // 現在地
        var coords = position.coords;

        // 距離の割り出しを行ない、各データにdistance属性を設定
        $.each(dataList, function(i, data){
            data.distance = getDistance(data.lat, data.lng, coords.latitude, coords.longitude, 0) / 1000; //kmで算出
        });

        // 現在地からの距離が小さい順にソート
        dataList.sort(function(a, b){
            return (a.distance < b.distance) ? -1 : 1;
        });

        // データを出力
        var html =  "";

        $.each(dataList, function(i, data){
            html += '<tr>';
                html += '<td>'+(i+1)+'</td>';
                html += '<td><a href="https://maps.google.co.jp/maps?q='+data.lat+','+data.lng+'&z=17&iwloc=A" target="_blank">';
                    html += data.sta;
                html += '</a></td>';
                html += '<td>'+data.distance+'km</td>';
            html += '</tr>';
        });

        $("#data-list").append(html);

    })
    .fail(function(){
        alert("お使いの端末の位置情報サービスが無効になっているか対応していないため、エラーが発生しました");
        console.log("error", arguments);
    });


    /**
     * 2点間の緯度経度から距離を取得
     * 測地線航海算法を使用して距離を算出する。
     * @see http://hamasyou.com/blog/2010/09/07/post-2/
     * @param float 緯度1
     * @param float 経度2
     * @param float 緯度2
     * @param float 経度2
     * @param 小数点以下の桁数(べき乗で算出精度を指定)
     */
    function getDistance(lat1, lng1, lat2, lng2, precision){
      var distance = 0;
      if( ( Math.abs(lat1 - lat2) < 0.00001 ) && ( Math.abs(lng1 - lng2) < 0.00001 ) ) {
        distance = 0;
      }else{
        lat1 = lat1 * Math.PI / 180;
        lng1 = lng1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;
        lng2 = lng2 * Math.PI / 180;

        var A = 6378140;
        var B = 6356755;
        var F = ( A - B ) / A;

        var P1 = Math.atan( ( B / A ) * Math.tan(lat1) );
        var P2 = Math.atan( ( B / A ) * Math.tan(lat2) );

        var X = Math.acos( Math.sin(P1) * Math.sin(P2) + Math.cos(P1) * Math.cos(P2) * Math.cos(lng1 - lng2) );
        var L = ( F / 8 ) * ( ( Math.sin(X) - X ) * Math.pow( (Math.sin(P1) + Math.sin(P2) ), 2) / Math.pow( Math.cos(X / 2), 2 ) - ( Math.sin(X) - X ) * Math.pow( Math.sin(P1) - Math.sin(P2), 2 ) / Math.pow( Math.sin(X), 2) );

        distance = A * ( X + L );
        var decimal_no = Math.pow(10, precision);
        distance = Math.round(decimal_no * distance / 1) / decimal_no;
      }
      return distance;
    }


}(jQuery, window));