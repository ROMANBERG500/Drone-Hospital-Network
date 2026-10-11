/* Preflight weather screening for this demonstration only. No aircraft is controlled. */
const FLIGHT_WEATHER_CACHE_MS=120000;
const FLIGHT_WEATHER_MAX_AGE_MS=45*60000;
const FLIGHT_WEATHER_LIMITS={windMph:20,gustMph:25,minTempF:32,maxTempF:104,minVisibilityM:1609.344,reducedVisibilityM:3*1609.344,reducedRangeMiles:5};
const flightWeatherState={mode:'live',scenario:'regional',pattern:'rain-northwest',regions:{northwest:'rain',north:'clear',northeast:'clear',southwest:'clear',central:'clear',southeast:'clear'},cache:new Map(),timer:null,zoneLayer:null};
// These rectangular regions are explicitly simulated weather areas, not city districts.
const houstonWeatherRegions=[
  {id:'northwest',label:'Northwest',area:'Cypress',bounds:[[29.86,-96],[30.28,-95.60]]},
  {id:'north',label:'North / Woodlands',area:'Willowbrook · The Woodlands',bounds:[[29.86,-95.60],[30.28,-95.30]]},
  {id:'northeast',label:'Northeast',area:'Humble',bounds:[[29.86,-95.30],[30.28,-94.84]]},
  {id:'southwest',label:'West / Southwest',area:'Katy · Sugar Land',bounds:[[29.35,-96],[29.86,-95.60]]},
  {id:'central',label:'Central / South',area:'TMC · Heights · Pearland',bounds:[[29.35,-95.60],[29.86,-95.30]]},
  {id:'southeast',label:'East / Southeast',area:'Clear Lake · Baytown',bounds:[[29.35,-95.30],[29.86,-94.84]]}
];
const houstonWeatherPatterns={
  'rain-northwest':{label:'Rain in northwest · clear elsewhere',regions:{northwest:'rain'}},
  'rain-southeast':{label:'Rain in southeast · clear elsewhere',regions:{southeast:'rain'}},
  'visibility-central':{label:'Low visibility in central Houston · clear elsewhere',regions:{central:'visibility'}},
  mixed:{label:'Northwest rain + central low visibility',regions:{northwest:'rain',central:'visibility'}},
  clear:{label:'Clear across Houston',regions:{}},
  'rain-all':{label:'Rain across Houston',regions:Object.fromEntries(houstonWeatherRegions.map(r=>[r.id,'rain']))},
  'visibility-all':{label:'Low visibility across Houston · 5 mi hops',regions:Object.fromEntries(houstonWeatherRegions.map(r=>[r.id,'visibility']))}
};
const flightWeatherScenarios={
  clear:{label:'Clear skies',temperature_2m:75,wind_speed_10m:6,wind_gusts_10m:9,precipitation:0,weather_code:0,visibility:16000},
  visibility:{label:'Low visibility · 5 mi range',temperature_2m:67,wind_speed_10m:5,wind_gusts_10m:8,precipitation:0,weather_code:45,visibility:2*1609.344},
  wind:{label:'High winds',temperature_2m:75,wind_speed_10m:27,wind_gusts_10m:36,precipitation:0,weather_code:2,visibility:16000},
  rain:{label:'Rain',temperature_2m:68,wind_speed_10m:8,wind_gusts_10m:12,precipitation:.08,weather_code:63,visibility:8000},
  fog:{label:'Dense fog',temperature_2m:61,wind_speed_10m:3,wind_gusts_10m:5,precipitation:0,weather_code:45,visibility:300},
  storm:{label:'Thunderstorm',temperature_2m:72,wind_speed_10m:24,wind_gusts_10m:38,precipitation:.2,weather_code:95,visibility:1000},
  ice:{label:'Freezing / icing',temperature_2m:27,wind_speed_10m:8,wind_gusts_10m:12,precipitation:.03,weather_code:66,visibility:5000}
};
function flightWeatherPathKey(path){return path?.join('>')||'';}
function flightWeatherFormPath(){const form=document.getElementById('delivery-form');if(!form||document.getElementById('modal-backdrop')?.hidden)return null;const from=form.elements.from.value,to=form.elements.to.value;return findShortestHospitalPath(from,to)||findShortestHospitalPath(from,to,{ignoreWeather:true});}
function weatherFlightSamples(path){
  let elapsed=0;const samples=[];
  path.slice(1).forEach((id,i)=>{
    const from=facility(path[i]),to=facility(id),duration=routeDistanceMiles(from.id,to.id)/45*3600000;
    for(const fraction of [0,.5,1])samples.push({leg:i,lat:from.lat+(to.lat-from.lat)*fraction,lng:from.lng+(to.lng-from.lng)*fraction,label:fraction===0?from.short:fraction===1?to.short:'Midpoint of hop '+(i+1),startMs:elapsed,endMs:elapsed+duration});
    elapsed+=duration+HOSPITAL_FLIGHT_STOP_MS;
  });
  return samples;
}
function flightWeatherReasons(reading){
  const r=[],l=FLIGHT_WEATHER_LIMITS;
  if(reading.wind_speed_10m>=l.windMph)r.push('Wind '+Math.round(reading.wind_speed_10m)+' mph');
  if(reading.wind_gusts_10m>=l.gustMph)r.push('Gusts '+Math.round(reading.wind_gusts_10m)+' mph');
  const c=reading.weather_code;
  if(c>=95)r.push('Thunderstorm / lightning risk');
  else if(c===48)r.push('Freezing fog / icing risk');
  else if([56,57,66,67,71,73,75,77,85,86].includes(c))r.push('Snow or icing risk');
  else if(c>=51)r.push('Rain / precipitation');
  if(reading.precipitation>0&&!r.some(reason=>/precipitation|Thunderstorm|icing/.test(reason)))r.push('Rain / precipitation');
  if(reading.visibility<l.minVisibilityM)r.push('Visibility below 1 mile');
  if(reading.temperature_2m<l.minTempF||reading.temperature_2m>l.maxTempF)r.push('Temperature '+Math.round(reading.temperature_2m)+'°F outside 32–104°F');
  return r;
}
function flightWeatherRangeMiles(reading){return reading.visibility<FLIGHT_WEATHER_LIMITS.reducedVisibilityM?FLIGHT_WEATHER_LIMITS.reducedRangeMiles:MAX_ROUTE_MILES;}
function finishFlightWeatherLeg(leg){
  leg.reasons=[...new Set(leg.reasons)];
  if(leg.miles>leg.maxMiles+1e-9)leg.reasons.push(formatRouteMiles(leg.miles)+' mi hop exceeds the '+leg.maxMiles+' mi low-visibility limit');
  leg.status=leg.reasons.length?'blocked':'clear';return leg;
}
function weatherRegionContains(region,lat,lng){const [lo,hi]=region.bounds;return lat>=lo[0]-1e-10&&lat<=hi[0]+1e-10&&lng>=lo[1]-1e-10&&lng<=hi[1]+1e-10;}
function demoWeatherRegionsAt(lat,lng){return houstonWeatherRegions.filter(r=>weatherRegionContains(r,lat,lng));}
function demoLegWeatherRegions(from,to){
  // Sample all boundary crossings and the intervals between them, so a short crossing cannot be missed.
  const fractions=[0,1],dLat=to.lat-from.lat,dLng=to.lng-from.lng;
  for(const r of houstonWeatherRegions)for(const corner of r.bounds){
    if(dLat){const t=(corner[0]-from.lat)/dLat;if(t>0&&t<1)fractions.push(t);}
    if(dLng){const t=(corner[1]-from.lng)/dLng;if(t>0&&t<1)fractions.push(t);}
  }
  fractions.sort((a,b)=>a-b);const points=[...fractions];for(let i=1;i<fractions.length;i++)points.push((fractions[i-1]+fractions[i])/2);
  return houstonWeatherRegions.filter(r=>points.some(t=>weatherRegionContains(r,from.lat+dLat*t,from.lng+dLng*t)));
}
function demoFlightWeatherLeg(fromId,toId){
  const from=facility(fromId),to=facility(toId),regions=demoLegWeatherRegions(from,to);
  const leg={from:fromId,to:toId,miles:routeDistanceMiles(fromId,toId),maxMiles:MAX_ROUTE_MILES,status:'clear',reasons:[],regions:regions.map(r=>r.id)};
  for(const region of regions){const reading=flightWeatherScenarios[flightWeatherState.regions[region.id]]||flightWeatherScenarios.clear;leg.maxMiles=Math.min(leg.maxMiles,flightWeatherRangeMiles(reading));leg.reasons.push(...flightWeatherReasons(reading).map(reason=>region.label+' · '+reason));}
  return finishFlightWeatherLeg(leg);
}
function applyDemoWeatherPattern(pattern){
  const value=houstonWeatherPatterns[pattern];if(!value)return;
  flightWeatherState.pattern=pattern;flightWeatherState.regions=Object.fromEntries(houstonWeatherRegions.map(r=>[r.id,value.regions[r.id]||'clear']));
}
function replanForFlightWeather(){
  replanHospitalWeatherRoute();
  if(document.getElementById('delivery-form')&&!document.getElementById('modal-backdrop')?.hidden)updateDeliveryRange();
  renderHoustonRouting();drawHoustonCoverage();drawHoustonFacilities();drawHoustonRoutes();drawDemoWeatherZones();
}
function drawDemoWeatherZones(){
  const s=houstonMapState;if(!s.map)return;
  if(!flightWeatherState.zoneLayer)flightWeatherState.zoneLayer=L.layerGroup().addTo(s.map);
  flightWeatherState.zoneLayer.clearLayers();if(flightWeatherState.mode!=='demo')return;
  for(const region of houstonWeatherRegions){
    const condition=flightWeatherState.regions[region.id],clear=condition==='clear',reduced=condition==='visibility',color=clear?'#639473':reduced?'#ca9133':'#4589b2';
    const zone=L.rectangle(region.bounds,{pane:'weatherZones',color,weight:1,dashArray:'5 6',fillColor:color,fillOpacity:clear?.035:.18,interactive:false,className:'demo-weather-zone is-'+condition}).addTo(flightWeatherState.zoneLayer);
    zone.getElement()?.setAttribute('data-weather-region',region.id);zone.getElement()?.setAttribute('data-weather-condition',condition);
    const [lo,hi]=region.bounds;
    L.marker([(lo[0]+hi[0])/2,(lo[1]+hi[1])/2],{pane:'weatherLabels',interactive:false,keyboard:false,icon:L.divIcon({className:'demo-weather-zone-label is-'+condition,html:'<span>DEMO · '+escapeHtml(region.label)+'<strong>'+escapeHtml(clear?'Clear · 10 mi':reduced?'Low visibility · 5 mi':flightWeatherScenarios[condition]?.label||'Weather blocked')+'</strong></span>',iconSize:[156,36],iconAnchor:[78,18]})}).addTo(flightWeatherState.zoneLayer);
  }
}
function validFlightWeatherReading(r){return r&&['temperature_2m','wind_speed_10m','wind_gusts_10m','precipitation','weather_code','visibility'].every(k=>Number.isFinite(r[k]))&&Object.hasOwn(weatherDescriptions,r.weather_code)&&r.wind_speed_10m>=0&&r.wind_gusts_10m>=0&&r.precipitation>=0&&r.visibility>=0;}
function validFlightWeatherUnits(units){return units?.temperature_2m==='°F'&&['mp/h','mph'].includes(units.wind_speed_10m)&&['mp/h','mph'].includes(units.wind_gusts_10m)&&units.precipitation==='inch'&&['m','ft'].includes(units.visibility);}
function assessLiveFlightWeather(path,responses,now=Date.now()){
  const samples=weatherFlightSamples(path),legs=path.slice(1).map((id,i)=>({from:path[i],to:id,miles:routeDistanceMiles(path[i],id),maxMiles:MAX_ROUTE_MILES,status:'clear',reasons:[]}));
  if(!Array.isArray(responses)||responses.length!==samples.length)throw new Error('Incomplete route weather');
  let observedAt=Infinity;
  samples.forEach((sample,i)=>{
    const response=responses[i],c=response.current,h=response.hourly;
    if(!validFlightWeatherUnits(response.current_units)||!validFlightWeatherUnits(response.hourly_units)||!validFlightWeatherReading(c)||!Number.isFinite(c.time)||now-c.time*1000>FLIGHT_WEATHER_MAX_AGE_MS||c.time*1000>now+300000)throw new Error('Missing or stale weather');
    observedAt=Math.min(observedAt,c.time*1000);
    const currentReading={...c,visibility:c.visibility*(response.current_units.visibility==='ft'?.3048:1)},currentReasons=flightWeatherReasons(currentReading);
    legs[sample.leg].maxMiles=Math.min(legs[sample.leg].maxMiles,flightWeatherRangeMiles(currentReading));
    const start=(now+sample.startMs)/1000,end=(now+sample.endMs)/1000;
    if(!Array.isArray(h?.time)||!h.time.every((t,index)=>Number.isFinite(t)&&(!index||t>h.time[index-1]))||h.time[0]>start||h.time.at(-1)+3600<=end)throw new Error('Forecast does not cover the flight');
    const indices=h.time.map((t,index)=>t<=end&&t+3600>start?index:-1).filter(index=>index>=0);
    if(!indices.length)throw new Error('Missing flight forecast');
    let coveredUntil=start;
    for(const index of indices){if(h.time[index]>coveredUntil)throw new Error('Gap in flight forecast');coveredUntil=Math.max(coveredUntil,h.time[index]+3600);}
    if(coveredUntil<=end)throw new Error('Forecast ends before arrival');
    const reasons=currentReasons.map(reason=>sample.label+' · '+reason+' now');
    for(const index of indices){
      const reading=Object.fromEntries(['temperature_2m','wind_speed_10m','wind_gusts_10m','precipitation','weather_code','visibility'].map(k=>[k,h[k]?.[index]]));
      if(!validFlightWeatherReading(reading))throw new Error('Incomplete flight forecast');
      reading.visibility*=response.hourly_units.visibility==='ft'?.3048:1;
      legs[sample.leg].maxMiles=Math.min(legs[sample.leg].maxMiles,flightWeatherRangeMiles(reading));
      reasons.push(...flightWeatherReasons(reading).map(reason=>sample.label+' · '+reason+' during this hop'));
    }
    if(reasons.length){legs[sample.leg].status='blocked';legs[sample.leg].reasons.push(...reasons);}
  });
  for(const leg of legs)finishFlightWeatherLeg(leg);
  return {mode:'live',status:legs.some(l=>l.status==='blocked')?'blocked':'clear',legs,sampleCount:samples.length,checkedAt:now,observedAt};
}
function demoFlightWeather(path,now=Date.now()){
  const legs=path.slice(1).map((to,i)=>demoFlightWeatherLeg(path[i],to));
  return {mode:'demo',scenario:'regional',pattern:flightWeatherState.pattern,regions:{...flightWeatherState.regions},status:legs.some(l=>l.status==='blocked')?'blocked':'clear',legs,sampleCount:0,checkedAt:now,observedAt:now};
}
function routeFlightWeather(path,now=Date.now()){
  if(!path||path.length<2)return {status:'none',mode:flightWeatherState.mode,legs:[]};
  if(flightWeatherState.mode==='demo')return demoFlightWeather(path,now);
  const entry=flightWeatherState.cache.get(flightWeatherPathKey(path));
  if(entry?.loading)return {status:'checking',mode:'live',legs:[]};
  if(entry&&now-entry.checkedAt<FLIGHT_WEATHER_CACHE_MS)return entry.assessment;
  return {status:'checking',mode:'live',legs:[]};
}
function flightWeatherIsClear(path){return routeFlightWeather(path).status==='clear';}
function flightWeatherRequestUrl(samples){
  const variables='temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation,weather_code,visibility';
  const params=new URLSearchParams({latitude:samples.map(s=>s.lat.toFixed(5)).join(','),longitude:samples.map(s=>s.lng.toFixed(5)).join(','),current:variables,hourly:variables,temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'inch',timeformat:'unixtime',timezone:'America/Chicago',past_hours:'1',forecast_hours:'6'});
  return 'https://api.open-meteo.com/v1/forecast?'+params;
}
async function checkRouteFlightWeather(path,{force=false}={}){
  if(!path||path.length<2||!validHospitalDeliveryPath(path,path[0],path.at(-1)))return;
  if(flightWeatherState.mode==='demo'){renderFlightWeatherViews();return demoFlightWeather(path);}
  const key=flightWeatherPathKey(path),prior=flightWeatherState.cache.get(key);
  if(prior?.loading&&!force)return prior.promise;
  if(!force&&prior&&Date.now()-prior.checkedAt<FLIGHT_WEATHER_CACHE_MS)return prior.assessment;
  prior?.controller?.abort();
  const controller=new AbortController(),entry={loading:true,checkedAt:0,controller,promise:null};
  flightWeatherState.cache.set(key,entry);renderFlightWeatherViews();
  const timeout=setTimeout(()=>controller.abort(),20000);
  entry.promise=(async()=>{
    let assessment;
    try{
      const response=await fetch(flightWeatherRequestUrl(weatherFlightSamples(path)),{signal:controller.signal});
      if(!response.ok)throw new Error('Weather service unavailable (HTTP '+response.status+')');
      const payload=await response.json();assessment=assessLiveFlightWeather(path,Array.isArray(payload)?payload:[payload]);
    }catch(error){console.warn('Route weather check failed:',error.message);assessment={mode:'live',status:'unavailable',legs:[],checkedAt:Date.now(),message:'Fresh weather could not be verified for the whole route. Check your connection and retry.'};}
    finally{clearTimeout(timeout);}
    if(flightWeatherState.cache.get(key)!==entry)return assessment;
    entry.loading=false;entry.checkedAt=Date.now();entry.assessment=assessment;entry.controller=null;renderFlightWeatherViews();return assessment;
  })();return entry.promise;
}
function queueFlightWeatherCheck(path){if(path?.length>1)checkRouteFlightWeather([...path]);}
function flightWeatherStatusHtml(path){
  const a=routeFlightWeather(path),title={none:'Choose a route to check flight weather',checking:'Checking route weather…',clear:'Weather check passed',blocked:'Delivery blocked by weather',unavailable:'No fresh weather — launch blocked'}[a.status];
  const origin=a.mode==='demo'?'DEMO · Houston weather zones':'LIVE FEED · Open-Meteo';
  const reduced=a.legs.filter(l=>l.maxMiles===5);
  let detail=a.status==='none'?'Demo weather is tied to areas of Houston. Clear areas can keep flying while rainy areas are blocked.':a.status==='checking'?'Launch is disabled while current conditions and the flight forecast are checked.':a.status==='unavailable'?a.message:a.status==='clear'?'Every hop passes. '+(reduced.length?reduced.length+' low-visibility '+(reduced.length===1?'hop has':'hops have')+' a 5-mile limit.':'Clear-weather hops allow up to 10 miles.'):'One or more hops cannot fly. Rain blocks flight; low visibility reduces the maximum hop to 5 miles.';
  let issues='';
  if(a.status==='blocked')issues='<ul class="flight-weather-issues">'+a.legs.map((l,i)=>l.status==='blocked'?'<li><strong>Hop '+(i+1)+' · '+escapeHtml(facility(l.from).short)+' → '+escapeHtml(facility(l.to).short)+'</strong><span>'+escapeHtml(l.reasons.slice(0,3).join(' · '))+'</span>'+(l.reasons.length>3?'<details><summary>All weather reasons</summary><ul>'+l.reasons.map(r=>'<li>'+escapeHtml(r)+'</li>').join('')+'</ul></details>':'')+'</li>':'').join('')+'</ul>';
  const limits=reduced.length?'<div class="flight-visibility-note">'+reduced.map(l=>escapeHtml(facility(l.from).short)+' → '+escapeHtml(facility(l.to).short)+' · '+formatRouteMiles(l.miles)+' mi / 5 mi limit').join('<br>')+'</div>':'';
  return '<div class="flight-weather-status is-'+a.status+'" role="status"><span class="flight-weather-origin">'+origin+'</span><strong>'+icon(a.status==='clear'?'check':a.status==='blocked'||a.status==='unavailable'?'info':'target')+title+'</strong><p>'+escapeHtml(detail)+'</p>'+issues+limits+(a.checkedAt&&a.observedAt?'<small>'+(a.mode==='demo'?'Simulated pattern · '+escapeHtml(houstonWeatherPatterns[a.pattern]?.label||'Custom regional weather'):'Checked '+weatherTime(a.checkedAt/1000,true)+' · Weather as of '+weatherTime(a.observedAt/1000,true)+' · '+a.sampleCount+' route samples')+'</small>':'')+'</div>';
}
function flightWeatherControls(isForm=false){
  return '<section class="flight-weather-controls '+(isForm?'in-delivery-form':'')+'" data-flight-weather-context="'+(isForm?'form':'map')+'" aria-label="'+(isForm?'Delivery':'Map')+' flight weather"><div class="flight-weather-head"><div>'+weatherIcon('partly')+'<strong>Flight weather</strong><span>Before launch</span></div><div class="flight-weather-modes"><button type="button" data-flight-weather-mode="live" aria-pressed="'+(flightWeatherState.mode==='live')+'">Live weather</button><button type="button" data-flight-weather-mode="demo" aria-pressed="'+(flightWeatherState.mode==='demo')+'">Demo weather</button></div></div><div class="flight-weather-demo" '+(flightWeatherState.mode==='demo'?'':'hidden')+'><p>DEMO · Regional conditions shown on the map. Clear areas can fly; rainy areas cannot.</p><label>Houston weather pattern<select data-flight-weather-pattern>'+Object.entries(houstonWeatherPatterns).map(([key,value])=>'<option value="'+key+'">'+value.label+'</option>').join('')+'<option value="custom">Custom regional weather</option></select></label><div class="regional-weather-key"><span class="is-clear">Clear · 10 mi</span><span class="is-rain">Rain · no flight</span><span class="is-visibility">Low visibility · 5 mi</span></div><details class="regional-weather-editor"><summary>Customize the six Houston zones</summary><div class="regional-weather-grid">'+houstonWeatherRegions.map(r=>'<label>'+escapeHtml(r.label)+'<small>'+escapeHtml(r.area)+'</small><select data-flight-weather-region="'+r.id+'" aria-label="Demo weather in '+escapeHtml(r.label)+'">'+Object.entries(flightWeatherScenarios).map(([key,v])=>'<option value="'+key+'">'+v.label+'</option>').join('')+'</select></label>').join('')+'</div></details></div><div data-flight-weather-status>'+flightWeatherStatusHtml(isForm?flightWeatherFormPath():houstonRoutingState.path)+'</div><div class="flight-weather-foot"><button type="button" class="button text" data-flight-weather-refresh>Check again '+weatherIcon('refresh')+'</button><details><summary>Demo flight limits & data</summary><p>Clear weather permits hops up to 10 miles. Visibility from 1 mile to less than 3 miles reduces each affected hop to 5 miles. Visibility below 1 mile blocks launch. Rain, thunderstorms, snow, icing, high winds, and temperatures outside the limits also block flight.</p><p>Demo routing finds the fewest hops through allowed connections, checking the whole line through each zone. Live mode screens its chosen network path using current conditions and the forecast at each hospital and midpoint, and applies the same 5-mile visibility rule. Live mode does not search alternate routes.</p><p>Wind must be below 20 mph, gusts below 25 mph, and temperature 32–104°F. Checks refresh every 2 minutes; missing or stale data blocks launch. These are demonstration limits. In-progress simulations keep their existing flight plan.</p><a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener noreferrer">Open-Meteo weather documentation ↗</a></details></div></section>';
}
function applyFlightWeatherToForm(){
  const form=document.getElementById('delivery-form');if(!form||document.getElementById('modal-backdrop')?.hidden)return;
  const path=flightWeatherFormPath(),button=form.querySelector('[type="submit"]');
  button.disabled=!path||path.length<2||Boolean(activeDeliveryForPath(path))||!state.fleet.some(f=>f.status==='Available')||!flightWeatherIsClear(path);
}
function renderFlightWeatherViews(){
  for(const el of document.querySelectorAll('[data-flight-weather-context]')){
    if(el.dataset.flightWeatherContext==='form'&&document.getElementById('modal-backdrop')?.hidden)continue;
    const path=el.dataset.flightWeatherContext==='form'?flightWeatherFormPath():houstonRoutingState.path;
    el.querySelector('[data-flight-weather-status]').innerHTML=flightWeatherStatusHtml(path);
    el.querySelector('.flight-weather-demo').hidden=flightWeatherState.mode!=='demo';
    for(const b of el.querySelectorAll('[data-flight-weather-mode]'))b.setAttribute('aria-pressed',String(b.dataset.flightWeatherMode===flightWeatherState.mode));
    el.querySelector('[data-flight-weather-pattern]').value=flightWeatherState.pattern;
    for(const control of el.querySelectorAll('[data-flight-weather-region]'))control.value=flightWeatherState.regions[control.dataset.flightWeatherRegion]||'clear';
    el.querySelector('[data-flight-weather-refresh]').disabled=!path||path.length<2||flightWeatherState.mode==='demo'||routeFlightWeather(path).status==='checking';
  }
  applyFlightWeatherToForm();
  const result=document.getElementById('hospital-route-result');if(result)result.innerHTML=hospitalRouteResult();
  drawPlannedHospitalRoute();
}
function initializeFlightWeather(){
  clearInterval(flightWeatherState.timer);
  flightWeatherState.timer=setInterval(()=>{queueFlightWeatherCheck(houstonRoutingState.path);queueFlightWeatherCheck(flightWeatherFormPath());renderFlightWeatherViews();},30000);
  renderFlightWeatherViews();
}
document.addEventListener('click',event=>{
  const mode=event.target.closest('[data-flight-weather-mode]');
  if(mode){flightWeatherState.mode=mode.dataset.flightWeatherMode;replanForFlightWeather();queueFlightWeatherCheck(houstonRoutingState.path);queueFlightWeatherCheck(flightWeatherFormPath());}
  const refresh=event.target.closest('[data-flight-weather-refresh]');
  if(refresh&&!refresh.disabled){const context=refresh.closest('[data-flight-weather-context]'),path=context.dataset.flightWeatherContext==='form'?flightWeatherFormPath():houstonRoutingState.path;checkRouteFlightWeather(path,{force:true});}
});
document.addEventListener('change',event=>{
  if(event.target.matches('[data-flight-weather-pattern]')){if(event.target.value==='custom'){event.target.closest('.flight-weather-demo').querySelector('.regional-weather-editor').open=true;}else{applyDemoWeatherPattern(event.target.value);replanForFlightWeather();}}
  if(event.target.matches('[data-flight-weather-region]')){const region=event.target.dataset.flightWeatherRegion;if(!houstonWeatherRegions.some(r=>r.id===region)||!Object.hasOwn(flightWeatherScenarios,event.target.value))return;flightWeatherState.regions[region]=event.target.value;flightWeatherState.pattern='custom';replanForFlightWeather();}
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){queueFlightWeatherCheck(houstonRoutingState.path);queueFlightWeatherCheck(flightWeatherFormPath());renderFlightWeatherViews();}});
