var hops_list=[];
var IP_details=[];
var geo_location=[];
var apiKey = "478a10a10ef061";

function plot_map(g)
{
    const geo_position=[];
    const map_div=document.getElementById("global-map");
    map_div.style.height="55vh";
    const map = new google.maps.Map(map_div, {
        mapId:"92dc0707b2202b5a",
        center: { lat: parseFloat(g[0][0]), lng: parseFloat(g[0][1]) }, 
        zoom: 5 
    });
    for(var i=0;i<g.length;i++)
    {
        const latlng=new google.maps.LatLng(parseFloat(g[i][0]),parseFloat(g[i][1]));
        geo_position.push(latlng);
        const marker = new google.maps.Marker({
            position: latlng,
            map: map,
            title: 'Bengaluru',
            icon:{
                url:"/static/images/hops.svg",
                scaledSize:new google.maps.Size(38,31)
            }
        });
    }
    const polyline= new google.maps.Polyline({
        path:geo_position,
        geodesic:true,
        strokeColor:'#fff700',
        strokeOpacity:1.0,
        strokeWeight:2
    });
    polyline.setMap(map);
    
}

function create_detailed_table(data,flag)
{
   // const div_name=document.getElementById("detialed-table");
      const table = document.getElementById("IP_table");
      if(flag==0)
      {
        var IP_headers=["IP","City","Country","Geo Loaction","organizations"];
        var headerRow = document.createElement("tr");
        
        for(var i =0; i<IP_headers.length;i++)
        {
            var th = document.createElement("th");
            th.textContent=IP_headers[i];
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
      }
      var dataRow = document.createElement("tr");
      const keysToInclude = ['ip', 'city', 'country','loc','org'];

        for (var key in data) {
            if (data.hasOwnProperty(key) && keysToInclude.includes(key)) {
                var td = document.createElement("td");
                td.textContent = data[key];
                if(key=='loc')
                {
                    geo_location.push(data[key].split(","));
                }
                dataRow.appendChild(td);
            }
        }
      table.appendChild(dataRow);
      if((flag+1)==hops_list.length)  // when all the values get stored in the table then plot map
      {
        plot_map(geo_location);
      }
     
}


function create_routers(hops)
{
    var router_section=document.getElementById("routers");
    for(var i=0;i<hops.length;i++)
    {
        var router_div=document.createElement("div");
        router_div.className="hop";
        router_div.id="hop"+(i+1);
        router_section.appendChild(router_div);
        var hop_div=document.getElementById("hop"+(i+1));
        var router_image=document.createElement("div");
        router_image.id="router_image";
        var router_IP=document.createElement("p");
        router_IP.innerHTML=hops[i];
        hop_div.appendChild(router_image);
        hop_div.appendChild(router_IP);
    }
}
function fetch_IP_info(hops)
{
    
    for(var i=0;i<hops.length;i++)
    {
        var IP=hops[i];
        //console.log(IP);
        $.get("https://ipinfo.io/" + IP + "?token=" + apiKey, function(response) {
            var city = response.city;
            var country = response.country;
            var loaction= response.loc;
            var organization = response.org;
            IP_info={IP_Address:IP,IP_City:city,IP_Country:country,IP_Location:loaction,IP_Org:organization};
            IP_details.push(response);
            if(IP_details.length==hops_list.length)
            {
                const div_name=document.getElementById("detialed-table");
                var table = document.createElement("table");
                table.id="IP_table";
                div_name.appendChild(table);

                for(var i=0;i<hops_list.length;i++)
                {
                    for(var j=0;j<hops_list.length;j++)
                    {
                        if(IP_details[j]["ip"]==hops_list[i])
                        {
                            create_detailed_table(IP_details[j],i);
                        }
                    }
                }
            }
        });
        
    }
    
    
    
}

function collect_hop_list()
{
    var intermediate_hops = document.querySelectorAll('ul li');
    intermediate_hops.forEach(function(li) {hops_list.push(li.textContent);});
    create_routers(hops_list);
    fetch_IP_info(hops_list);    
    
}



