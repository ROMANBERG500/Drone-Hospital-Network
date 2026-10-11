/* Public Houston coordinates only; current conditions are modeled by Open-Meteo. */
const WEATHER_CACHE_MS=15*60*1000;
const houstonWeatherState={visible:false,expanded:false,cache:new Map(),locationKey:'',loading:false,error:'',controller:null,requestId:0,timer:null};
const weatherDescriptions={0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Freezing fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',56:'Freezing drizzle',57:'Freezing drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Heavy freezing rain',71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Light showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm / hail',97:'Heavy thunderstorm',99:'Thunderstorm / hail'};
function weatherIcon(kind,isDay=1){
  const paths={
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon:'<path d="M20.8 13.2A9 9 0 0 1 10.8 3.3a9 9 0 1 0 10 9.9Z"/>',
    cloud:'<path d="M7 18a5 5 0 0 1-1-9.9A6 6 0 0 1 17.7 10H18a4 4 0 0 1 0 8H7Z"/>',
    partly:'<path d="M7 3v2M2 8h2m-.5-4.5L5 5m6-1.5L9.5 5"/><path d="M5 11a3.5 3.5 0 1 1 5.7-4"/><path d="M8 20a4 4 0 0 1-1-7.9A5 5 0 0 1 16.7 13H18a3.5 3.5 0 0 1 0 7H8Z"/>',
    rain:'<path d="M6 14a4 4 0 0 1-1-7.9A5.5 5.5 0 0 1 15.8 8H18a3 3 0 0 1 0 6H6ZM8 17l-1 3m6-3-1 3m6-3-1 3"/>',
    snow:'<path d="M6 14a4 4 0 0 1-1-7.9A5.5 5.5 0 0 1 15.8 8H18a3 3 0 0 1 0 6H6ZM8 18v4m-2-2h4m8-2v4m-2-2h4"/>',
    storm:'<path d="M5 14a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.8 2H18a3 3 0 0 1 0 6M13 12l-4 6h4l-2 5 7-8h-5l2-3"/>',
    fog:'<path d="M6 12a4 4 0 0 1-1-7.9A5.5 5.5 0 0 1 15.8 6H18a3 3 0 0 1 0 6M3 16h18M5 20h14"/>',
    wind:'<path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a2 2 0 1 1-2 2M3 16h7a3 3 0 1 1-3 3"/>',
    drop:'<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11ZM9 15a3 3 0 0 0 3 3"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2M18 18A8 8 0 0 1 5 16"/>',
    chevron:'<path d="m6 9 6 6 6-6"/>'
  };
  if(kind==='sun'&&!isDay)kind='moon';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[kind]||paths.cloud)+'</svg>';
}
function weatherKind(code){if(code===0||code===1)return 'sun';if(code===2)return 'partly';if(code===3)return 'cloud';if(code===45||code===48)return 'fog';if(code>=95)return 'storm';if((code>=71&&code<=77)||code===85||code===86)return 'snow';return code>=51&&code<=82?'rain':'cloud';}
function houstonWeatherLocation(){const f=facilities.find(f=>f.id===houstonMapState.focus);return f?{key:f.id,name:f.short,lat:f.lat,lng:f.lng}:{key:'houston',name:'Houston, TX',lat:29.7604,lng:-95.3698};}
function weatherNumber(value,digits=0){return Number.isFinite(value)?value.toFixed(digits):'—';}
function weatherDirection(degrees){return Number.isFinite(degrees)?['N','NE','E','SE','S','SW','W','NW'][Math.round(((degrees%360)+360)%360/45)%8]:'—';}
function weatherTime(seconds,includeDate=false){return new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',...(includeDate?{month:'short',day:'numeric'}:{}),hour:'numeric',minute:includeDate?'2-digit':undefined,...(includeDate?{timeZoneName:'short'}:{})}).format(new Date(seconds*1000));}
function weatherRequestUrl(location){
  const params=new URLSearchParams({latitude:String(location.lat),longitude:String(location.lng),current:'temperature_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m',hourly:'temperature_2m,precipitation_probability,weather_code,wind_speed_10m,is_day',temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'inch',timeformat:'unixtime',timezone:'America/Chicago',forecast_hours:'8'});
  return 'https://api.open-meteo.com/v1/forecast?'+params;
}
function normalizeHoustonWeather(data){
  const current=data.current,hourly=data.hourly;
  if(!current||!Number.isFinite(current.time)||!Number.isFinite(current.temperature_2m)||!Number.isFinite(current.weather_code)||data.current_units?.temperature_2m!=='°F')throw new Error('Weather response unavailable');
  const hours=Array.isArray(hourly?.time)?hourly.time.map((time,i)=>({time,temp:hourly.temperature_2m?.[i],rain:hourly.precipitation_probability?.[i],code:hourly.weather_code?.[i],wind:hourly.wind_speed_10m?.[i],isDay:hourly.is_day?.[i]})).filter(h=>Number.isFinite(h.time)&&h.time>current.time).slice(0,6):[];
  return {current,hours};
}
function houstonWeatherContent(){
  const s=houstonWeatherState,location=houstonWeatherLocation(),entry=s.cache.get(location.key),data=entry?.data,c=data?.current;
  const loading=s.locationKey===location.key&&s.loading,error=s.locationKey===location.key?s.error:'';
  const older=entry&&(Date.now()-entry.fetchedAt>=WEATHER_CACHE_MS||Date.now()-c.time*1000>90*60*1000);
  let body;
  if(!data){body='<p class="weather-empty" role="status">'+(loading?'Loading local weather…':'Weather is unavailable. Try refreshing.')+'</p>';}
  else{
    const next=data.hours[0],description=weatherDescriptions[c.weather_code]||'Conditions unavailable';
    body=`<div class="weather-reading"><span class="weather-condition-icon">${weatherIcon(weatherKind(c.weather_code),c.is_day)}</span><strong>${weatherNumber(c.temperature_2m)}<small>°F</small></strong><div>${escapeHtml(description)}<small>Feels like ${weatherNumber(c.apparent_temperature)}°F</small></div></div><div class="weather-quick"><span>${weatherIcon('wind')}<strong>${weatherNumber(c.wind_speed_10m)} mph</strong> ${weatherDirection(c.wind_direction_10m)}</span><span>${weatherIcon('drop')}<strong>${weatherNumber(next?.rain)}%</strong> next hr</span></div><div class="weather-expanded" id="weather-expanded" ${s.expanded?'':'hidden'}><div class="weather-metrics"><span>Gusts<strong>${weatherNumber(c.wind_gusts_10m)} mph</strong></span><span>Humidity<strong>${weatherNumber(c.relative_humidity_2m)}%</strong></span><span>Precipitation<strong>${c.precipitation>0&&c.precipitation<.01?'&lt;0.01':weatherNumber(c.precipitation,2)} in</strong></span></div><p class="weather-forecast-label">NEXT 6 HOURS <span>Rain chance</span></p><div class="weather-forecast">${data.hours.map(h=>`<div title="${escapeHtml(weatherDescriptions[h.code]||'Weather')} · Wind ${weatherNumber(h.wind)} mph"><time datetime="${new Date(h.time*1000).toISOString()}">${weatherTime(h.time)}</time>${weatherIcon(weatherKind(h.code),h.isDay)}<strong>${weatherNumber(h.temp)}°</strong><span>${weatherNumber(h.rain)}%</span></div>`).join('')||'<p>Hourly forecast unavailable.</p>'}</div></div><button class="weather-expand" data-weather-action="expand" aria-controls="weather-expanded" aria-expanded="${s.expanded}">${s.expanded?'Less detail':'Forecast & details'}${weatherIcon('chevron')}</button>`;
  }
  return `<div class="weather-card-head"><div><span class="weather-eyebrow">LOCAL WEATHER</span><h3>${escapeHtml(location.name)}</h3></div><button class="weather-refresh ${loading?'is-loading':''}" data-weather-action="refresh" aria-label="Refresh weather" ${loading?'disabled':''}>${weatherIcon('refresh')}</button><button class="weather-close" data-weather-action="close" aria-label="Close weather menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>${body}<div class="weather-source"><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo ↗</a><span>Modeled conditions</span></div>${c?'<p class="weather-as-of">'+(older?'Earlier update · ':'As of ')+weatherTime(c.time,true)+'</p>':''}${loading&&data?'<p class="weather-feedback" role="status">Refreshing…</p>':''}${error&&data?'<p class="weather-feedback" role="status">Refresh unavailable · Showing last update</p>':''}`;
}
function houstonWeatherPanel(){return `<aside id="houston-weather" class="map-weather-card" aria-label="Local weather for the Houston hospital map" ${houstonWeatherState.visible?'':'hidden'}>${houstonWeatherContent()}</aside>`;}
function renderHoustonWeather(){
  const panel=document.getElementById('houston-weather');if(!panel)return;
  const active=document.activeElement?.closest('[data-weather-action]')?.dataset.weatherAction;
  const layout=document.querySelector('.houston-map-layout'),layoutChanged=layout&&layout.classList.contains('has-weather')!==houstonWeatherState.visible;
  layout?.classList.toggle('has-weather',houstonWeatherState.visible);
  panel.hidden=!houstonWeatherState.visible;panel.innerHTML=houstonWeatherContent();
  if(layoutChanged&&houstonMapState.map){
    const s=houstonMapState;s.map.invalidateSize({pan:false,debounceMoveend:true});
    if(houstonRoutingState.path?.length>1)fitPlannedHospitalRoute();
    else{s.map.fitBounds(s.focus&&s.rangeLayer.getLayers()[0]?s.rangeLayer.getLayers()[0].getBounds():L.latLngBounds(facilities.map(f=>[f.lat,f.lng])),{padding:[40,40],maxZoom:12,animate:false,reset:true});drawHoustonFacilities();drawHoustonRoutes();}
  }
  if(active)panel.querySelector('[data-weather-action="'+active+'"]')?.focus({preventScroll:true});
  const toggle=document.querySelector('[data-map-action="weather"]');if(toggle){toggle.classList.toggle('active',houstonWeatherState.visible);toggle.setAttribute('aria-expanded',String(houstonWeatherState.visible));}
}
async function refreshHoustonWeather(force=false){
  const s=houstonWeatherState;if(!s.visible||!houstonMapState.map)return;
  const location=houstonWeatherLocation(),entry=s.cache.get(location.key);
  if(!force&&s.locationKey===location.key&&s.loading)return;
  if(!force&&entry&&Date.now()-entry.fetchedAt<WEATHER_CACHE_MS){s.controller?.abort();s.requestId++;s.controller=null;s.loading=false;s.error='';s.locationKey=location.key;renderHoustonWeather();return;}
  s.controller?.abort();const controller=new AbortController(),requestId=++s.requestId;
  s.controller=controller;s.locationKey=location.key;s.loading=true;s.error='';renderHoustonWeather();
  const timeout=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(weatherRequestUrl(location),{signal:controller.signal});
    if(!response.ok)throw new Error('Weather request unavailable');
    const data=normalizeHoustonWeather(await response.json());
    if(requestId!==s.requestId||!houstonMapState.map)return;
    s.cache.set(location.key,{data,fetchedAt:Date.now()});
  }catch(error){if(requestId!==s.requestId||!houstonMapState.map)return;s.error='unavailable';}
  finally{clearTimeout(timeout);if(requestId===s.requestId){s.loading=false;s.controller=null;renderHoustonWeather();}}
}
function mountHoustonWeather(){clearInterval(houstonWeatherState.timer);refreshHoustonWeather();houstonWeatherState.timer=setInterval(()=>refreshHoustonWeather(),WEATHER_CACHE_MS);}
function disposeHoustonWeather(){const s=houstonWeatherState;clearInterval(s.timer);s.timer=null;s.controller?.abort();s.controller=null;s.requestId++;s.loading=false;}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-weather-action],[data-map-action="weather"]');
  if(!button){if(houstonWeatherState.visible&&!event.target.closest('#houston-weather'))closeHoustonWeatherMenu();return;}
  const s=houstonWeatherState;
  if(button.dataset.mapAction==='weather'){if(s.visible)closeHoustonWeatherMenu();else{s.visible=true;renderHoustonWeather();refreshHoustonWeather();document.querySelector('[data-weather-action="close"]')?.focus({preventScroll:true});}}
  if(button.dataset.weatherAction==='close')closeHoustonWeatherMenu(true);
  if(button.dataset.weatherAction==='expand'){s.expanded=!s.expanded;renderHoustonWeather();}
  if(button.dataset.weatherAction==='refresh')refreshHoustonWeather(true);
});
function closeHoustonWeatherMenu(returnFocus=false){const s=houstonWeatherState;if(!s.visible)return;s.visible=false;s.expanded=false;s.controller?.abort();s.controller=null;s.requestId++;s.loading=false;renderHoustonWeather();if(returnFocus)document.querySelector('[data-map-action="weather"]')?.focus({preventScroll:true});}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&houstonWeatherState.visible){event.preventDefault();closeHoustonWeatherMenu(true);}});
