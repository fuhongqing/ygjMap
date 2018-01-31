window.onload=function(){
    //图片路径变量
    var imgSrc='./img/';
    // 参数声明
    var longitudeMin=100.2,longitudeMax=100.23,latitudeMin=100.2,latitudeMax=100.325,propertyIDs='84,64';
    var img=document.querySelector('header>img');
    img.onclick=function(){
        history.back();
    };
    //依据设计图视口尺寸动态设置根标签字体大小
    //document.documentElement.style.fontSize = document.documentElement.clientWidth / 3.75 + 'px';
    // 百度地图API功能
    map = new BMap.Map("allmap", {
        minZoom: 14,
        maxZoom: 20,
        enableMapClick: false
    });
    //map.disableDoubleClickZoom();
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
    map.enableDragging();   //开启拖拽
    //缩放控件
    //map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_ZOOM}));
    map.centerAndZoom(new BMap.Point(121.434702,31.266207), 14);
    //添加地图类型控件
    // map.addControl(new BMap.MapTypeControl({
    //     mapTypes:[
    //         BMAP_NORMAL_MAP,
    //         BMAP_HYBRID_MAP
    //     ]}));
    map.setCurrentCity("上海");          // 设置地图显示的城市 此项是必须设置的
    //map.enableInertialDragging();   //开启惯性拖拽
    // map.disableDragging();     //禁止拖拽
    //比例尺控件
    var scaleCtrl = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT,offset: new BMap.Size(10,10)});
    map.addControl(scaleCtrl);
    // 添加定位控件
    var geolocationControl = new BMap.GeolocationControl({anchor: BMAP_ANCHOR_TOP_RIGHT,offset: new BMap.Size(10,10)});
    map.addControl(geolocationControl);
    //setCenter()、panTo()、zoomTo()
    var geolocation = new BMap.Geolocation();
    // 开启SDK辅助定位
    geolocation.enableSDKLocation();
    geolocation.getCurrentPosition(function(r){
            //console.log(r.point);
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                var mk = new BMap.Marker(r.point);
                map.addOverlay(mk);//标出所在地
                map.panTo(r.point);//地图中心移动
                // 添加自定义覆盖物
                var circle = new BMap.Circle(r.point,500,{fillColor:"#93B4E2", strokeWeight: 1 ,fillOpacity: 0.4});
                map.addOverlay(circle);
                //alert('您的位置：'+r.point.lng+','+r.point.lat);
                longitudeMin=r.point.lng-0.009;
                longitudeMin=r.point.lng+0.009;
                latitudeMin=r.point.lat-0.01;
                latitudeMax=r.point.lat+0.01;
                getData();
            }else {
                console.log('failed'+this.getStatus());
            }
        },{enableHighAccuracy: true});
    //获取渠道经纬度信息，添加标注，注册点击事件
    var latitudeArr =[121.434702,121.444702,121.454702,121.464702,121.474702,121.484702,121.494702],
        longitudeArr=[31.236207,31.246207,31.256207,31.266207,31.276207,31.286207,31.296207],
        addressArr=[],agencyNameArr=[],telephoneArr=[],isPartnerArr=[];
    //[121.434702,31.266207,"上海市东城区王府井大街88号乐天银泰百货八层",'通协路268号尚品都汇','15692928888'],
    function getData(){
        //2.2:创建XHR对象
        var xhr = new XMLHttpRequest();
        //*2.4:打开一个与服务器连接
        xhr.open('POST','http://192.168.1.140/efangygj/coordinate/loadCoordinate',true);
        //*2.5:设置请求消息头
        xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        //*2.6:发送请求数据
        xhr.send(`longitudeMin=${longitudeMin}&longitudeMax=${longitudeMax}&latitudeMin=${latitudeMin}&latitudeMax=${latitudeMax}&propertyIDs=${propertyIDs}`);
        //2.3:为XHR绑定事件(接收服务器返回数据)
        xhr.onreadystatechange = function(){
            if(xhr.readyState===4&&xhr.status===200){
                //console.log(JSON.parse(xhr.responseText).data);
                document.getElementById('sign').innerHTML=JSON.parse(xhr.responseText).data.isPartner||0;
                document.getElementById('noSign').innerHTML=JSON.parse(xhr.responseText).data.isNotPartner||0;
                var mapDatas=JSON.parse(xhr.responseText).data.data;
                if(mapDatas){
                    mapDatas.forEach(function(val){
                        agencyNameArr.push(val.agencyName);
                        addressArr.push(val.address);
                        telephoneArr.push(val.telephone);
                        //latitudeArr.push(val.latitude);
                        //longitudeArr.push(val.longitude);
                        isPartnerArr.push(val.isPartner);
                    });
                    var opts = {
                        width : 250,     // 信息窗口宽度
                        height: 80,     // 信息窗口高度
                        title : "" , // 信息窗口标题
                        enableMessage:true//设置允许信息窗发送短息
                    };
                    //自定义marker
                    // function addMarker(point) {  // 创建图标对象
                    //     var myIcon = new BMap.Icon("img/sign-big.png", new BMap.Size(28, 39));
                    //     // 创建标注对象并添加到地图
                    //     var marker = new BMap.Marker(point, {icon: myIcon});
                    //     map.addOverlay(marker);
                    // }
                    if(agencyNameArr.length>0){
                        for(var i=0;i<agencyNameArr.length;i++){
                            //var marker = new BMap.Marker(new BMap.Point(data_info[i][0],data_info[i][1]));  // 创建标注
                            var point = new BMap.Point(latitudeArr[i],longitudeArr[i]);
                            var content =`
                                   <ul class="info_window">
                                     <li>${agencyNameArr[i]}</li>
                                     <li style='color:#999999;font-size: 14px;margin: 10px 0;'>${addressArr[i]}</li>
                                     <li>
                                        <button onclick="phone(${telephoneArr[i]})||AndroidWebView.call(${telephoneArr[i]})">${telephoneArr[i]}<img src='${imgSrc}phone.png'></button on>
                                     </li>
                                   </ul>
                                `;//agencyNameArr[i]+'<br/>'+"<p style='color:#999999;font-size: 14px;'>"+addressArr[i]+"</p>"+"<button style='color:#999999;font-size: 14px;' class="+telephoneArr[i]+">"+telephoneArr[i]+'&nbsp;&nbsp;'+"<img src='img/phone.png'></button>";
                            //addMarker(point);
                            var myIcon;// = new BMap.Icon("img/sign-big.png", new BMap.Size(28, 39));
                            if(isPartnerArr[i]>0){
                                myIcon=new BMap.Icon(imgSrc+"sign-big.png", new BMap.Size(28, 39));
                            }else{
                                myIcon=new BMap.Icon(imgSrc+"noSign-big.png", new BMap.Size(28, 39));
                            }
                            // 创建标注对象并添加到地图
                            var marker = new BMap.Marker(point, {icon: myIcon});
                            map.addOverlay(marker);
                            addClickHandler(content,marker);
                            //marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
                        }
                    }else{
                        return;
                    }
                    function addClickHandler(content,marker){
                        marker.addEventListener("click",function(e){
                            openInfo(content,e)});
                    }
                    function openInfo(content,e){
                        var p = e.target;
                        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
                        var infoWindow = new BMap.InfoWindow(content,opts);  // 创建信息窗口对象
                        map.openInfoWindow(infoWindow,point); //开启信息窗口
                    }
                }
            }else{
                return;
            }
        };
    }
    getData();
};
//点击电话及图表进行拨号
// phone($(e.target).attr('class'));
// AndroidWebView.call($(e.target).attr('class'));
