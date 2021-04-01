nginx 301:
if ($host ~ "^(www.yoozworld.co|yoozworld.co|www.yooz.ren|yooz.ren|www.yooz.net.cn|yooz.net.cn)") {
    rewrite ^/(.*)$ http://www.yooz.org.cn/$1 permanent;
}
authorKey：TI_6d3cf74188b7385a14b8e45227eb5751
神马主要推送api：
curl "https://data.zhanzhang.sm.cn/push?site=www.yooz.org.cn&user_name=ayue222@126.com&resource_name=mip_add&token=TI_6d3cf74188b7385a14b8e45227eb5751" --data-binary @site.yooz.org.cn.txt

百度收录推送api：
curl "http://data.zz.baidu.com/urls?site=www.yooz.org.cn&token=F4YKzs49hlXHkywV" --data-binary @site.yooz.org.cn.txt