/* Fewest-hop hospital routing. Each graph edge is a direct leg of at most 10 miles. */
const houstonRoutingState={source:'',destination:'',pick:'source',path:null,weatherNoPath:false};
function findShortestHospitalPath(source,destination,{ignoreWeather=false}={}){
  const adjacency=new Map(facilities.map(f=>[f.id,[]]));
  if(!adjacency.has(source)||!adjacency.has(destination))return null;
  if(source===destination)return [source];
  for(const [a,b] of houstonNetworkLinks()){
    if(!ignoreWeather&&flightWeatherState.mode==='demo'&&demoFlightWeatherLeg(a.id,b.id).status!=='clear')continue;
    adjacency.get(a.id).push(b.id);adjacency.get(b.id).push(a.id);
  }
  // Breadth-first search discovers nodes in increasing hop count; visited nodes cannot loop.
  const queue=[source],parents=new Map([[source,null]]);
  for(let cursor=0;cursor<queue.length;cursor++){
    for(const next of adjacency.get(queue[cursor])){
      if(parents.has(next))continue;
      parents.set(next,queue[cursor]);
      if(next===destination){const path=[];for(let id=destination;id!==null;id=parents.get(id))path.push(id);return path.reverse();}
      queue.push(next);
    }
  }
  return null;
}
function replanHospitalWeatherRoute(){
  const r=houstonRoutingState;r.weatherNoPath=false;
  if(!r.source||!r.destination){r.path=null;return;}
  const available=findShortestHospitalPath(r.source,r.destination),physical=findShortestHospitalPath(r.source,r.destination,{ignoreWeather:true});
  r.weatherNoPath=!available&&Boolean(physical)&&flightWeatherState.mode==='demo';
  r.path=available||physical;
}
function plannedHospitalRoute(){
  const path=houstonRoutingState.path;if(!path)return null;
  const legs=path.slice(1).map((to,i)=>({from:path[i],to,miles:routeDistanceMiles(path[i],to)}));
  return {path,legs,hops:legs.length,stops:Math.max(0,path.length-2),totalMiles:legs.reduce((sum,leg)=>sum+leg.miles,0)};
}
function hospitalRouteRole(id){
  const s=houstonRoutingState;
  if(id===s.source&&id===s.destination)return 'source-destination';
  if(id===s.source)return 'source';
  if(id===s.destination)return 'destination';
  return s.path?.includes(id)?'intermediate':'';
}
function routingHospitalOptions(selected){return '<option value="">Choose on the map or here</option>'+facilities.map(f=>'<option value="'+f.id+'" '+(f.id===selected?'selected':'')+'>'+escapeHtml(f.name)+'</option>').join('');}
function hospitalRouteResult(){
  const s=houstonRoutingState,route=plannedHospitalRoute();
  if(!s.source)return '<p class="route-prompt">'+icon('target')+'Click your source hospital or lab on the map, then your destination.</p>';
  if(!s.destination)return '<p class="route-prompt">'+icon('target')+'Now click a destination hospital or lab. Intermediate stops will be found automatically.</p>';
  if(!route)return '<div class="relay-result no-path"><strong>'+icon('info')+'No available path</strong><p>'+escapeHtml(facility(s.source).short)+' and '+escapeHtml(facility(s.destination).short)+' are not connected in the current '+facilities.length+'-hospital network with hops of 10 miles or less.</p></div>';
  if(route.hops===0)return '<div class="relay-result"><strong>'+icon('check')+'Already at the destination</strong><p>Source and destination are the same hospital. No flight is needed.</p></div>';
  if(s.weatherNoPath)return '<div class="relay-result no-path"><strong>'+icon('info')+'No weather-safe path available</strong><p>All possible routes were checked. Rain and other blocked areas cannot be crossed; low-visibility hops must be 5 miles or less. The map shows a blocked network path for reference. Change the weather or choose other hospitals.</p>'+hospitalDeliveryStartControl(route)+'</div>';
  return `<div class="relay-result"><div class="relay-result-top"><strong>${icon('check')}Route found <span>${route.hops} ${route.hops===1?'hop':'hops'} · ${route.path.length} facilities</span></strong><span class="relay-total">${formatRouteMiles(route.totalMiles)} mi total</span></div><p>${route.stops} intermediate ${route.stops===1?'stop':'stops'} · Fewest allowed hops · 10 mi clear / 5 mi low visibility</p><ol class="relay-itinerary" aria-label="Hospital route in travel order">${route.path.map((id,i)=>`<li><span class="relay-stop-number ${i===0?'source':i===route.path.length-1?'destination':''}">${i===0?'S':i===route.path.length-1?'D':i+1}</span><button data-facility="${id}" title="View hospital details">${escapeHtml(facility(id).short)}</button>${i<route.legs.length?'<span class="relay-leg-distance">'+formatRouteMiles(route.legs[i].miles)+' mi '+icon('arrow-right')+'</span>':''}</li>`).join('')}</ol>${hospitalDeliveryStartControl(route)}</div>`;
}
function houstonRoutingPanel(){
  const s=houstonRoutingState;
  return `<section class="hospital-route-planner" aria-label="Facility route planner"><div class="route-planner-heading"><div><h3>${icon('network')}Find a facility route</h3><p>Fewest allowed hops. Clear: 10 mi · Low visibility: 5 mi.</p></div><div class="route-planner-actions"><button class="button text" data-route-action="fit" ${s.path?.length>1?'':'disabled'}>Fit route ${icon('target')}</button><button class="button text" data-route-action="clear" ${s.source||s.destination?'':'disabled'}>Clear ${icon('x')}</button></div></div><div class="route-endpoints"><div class="route-endpoint ${s.pick==='source'?'is-picking':''}" data-route-endpoint="source"><button class="route-pick" data-route-pick="source" aria-pressed="${s.pick==='source'}" aria-label="Choose source facility on the map"><span class="route-step source">S</span>Source<span class="route-pick-hint">${s.pick==='source'?'Click on map':''}</span></button><select id="route-source" aria-label="Source facility">${routingHospitalOptions(s.source)}</select></div><button class="route-swap" data-route-action="swap" aria-label="Swap source and destination" ${s.source&&s.destination?'':'disabled'}>${icon('arrow-right')}</button><div class="route-endpoint ${s.pick==='destination'?'is-picking':''}" data-route-endpoint="destination"><button class="route-pick" data-route-pick="destination" aria-pressed="${s.pick==='destination'}" aria-label="Choose destination facility on the map"><span class="route-step destination">D</span>Destination<span class="route-pick-hint">${s.pick==='destination'?'Click on map':''}</span></button><select id="route-destination" aria-label="Destination facility">${routingHospitalOptions(s.destination)}</select></div></div><div id="hospital-route-result" aria-live="polite" aria-atomic="true">${hospitalRouteResult()}</div></section>`;
}
function renderHoustonRouting(){
  const s=houstonRoutingState;
  for(const role of ['source','destination']){
    const select=document.getElementById('route-'+role);if(select)select.value=s[role];
    const endpoint=document.querySelector('[data-route-endpoint="'+role+'"]'),pick=endpoint?.querySelector('[data-route-pick]');
    endpoint?.classList.toggle('is-picking',s.pick===role);
    pick?.setAttribute('aria-pressed',String(s.pick===role));
    const hint=endpoint?.querySelector('.route-pick-hint');if(hint)hint.textContent=s.pick===role?'Click on map':'';
  }
  const result=document.getElementById('hospital-route-result');if(result)result.innerHTML=hospitalRouteResult();
  const fit=document.querySelector('[data-route-action="fit"]');if(fit)fit.disabled=!(s.path?.length>1);
  const swap=document.querySelector('[data-route-action="swap"]');if(swap)swap.disabled=!s.source||!s.destination;
  const clear=document.querySelector('[data-route-action="clear"]');if(clear)clear.disabled=!s.source&&!s.destination;
  renderFlightWeatherViews();queueFlightWeatherCheck(s.path);
}
function fitPlannedHospitalRoute(){
  const s=houstonMapState,r=houstonRoutingState;if(!s.map)return;
  const ids=r.path?.length?r.path:[r.source,r.destination].filter(Boolean);if(!ids.length)return;
  s.map.closePopup();
  const points=ids.map(id=>facility(id)).map(f=>[f.lat,f.lng]);
  const paddingTopLeft=[45,50],paddingBottomRight=[45,45];
  s.map.fitBounds(L.latLngBounds(points),{paddingTopLeft,paddingBottomRight,maxZoom:12,animate:false,reset:true});
  drawHoustonFacilities();drawPlannedHospitalRoute();
}
function chooseHospitalRouteEndpoint(id,role=houstonRoutingState.pick){
  if(!['source','destination'].includes(role))return;
  if(id&&!facilities.some(f=>f.id===id))return;
  const r=houstonRoutingState;r[role]=id;r.pick=role==='source'&&id?'destination':role;
  replanHospitalWeatherRoute();
  renderHoustonRouting();
  if(id)focusHoustonFacility(id,{fitCoverage:false,openPopup:false});
  else{drawHoustonFacilities();drawHoustonRoutes();drawPlannedHospitalRoute();}
  if(r.source&&r.destination)fitPlannedHospitalRoute();
}
function selectHospitalOnMap(id){chooseHospitalRouteEndpoint(id);}
function resetHospitalRouteState(){const r=houstonRoutingState;r.source='';r.destination='';r.path=null;r.pick='source';r.weatherNoPath=false;}
function clearHospitalRoute(){resetHospitalRouteState();renderHoustonRouting();fitHoustonNetwork({clearRoute:false});}
function drawPlannedHospitalRoute(){
  const s=houstonMapState,route=plannedHospitalRoute();if(!s.map||!s.plannedRouteLayer)return;s.plannedRouteLayer.clearLayers();if(!route)return;
  route.legs.forEach((leg,i)=>{
    const from=facility(leg.from),to=facility(leg.to),points=[[from.lat,from.lng],[to.lat,to.lng]];
    L.polyline(points,{pane:'plannedRoutes',color:'#fffdf3',weight:10,opacity:.95,interactive:false}).addTo(s.plannedRouteLayer);
    const verdict=routeFlightWeather(route.path),legVerdict=verdict.legs[i],blocked=legVerdict?.status==='blocked',unchecked=['checking','unavailable'].includes(verdict.status);
    const reduced=legVerdict?.maxMiles===5;
    const line=L.polyline(points,{pane:'plannedRoutes',color:blocked?'#c54b43':unchecked?'#81908b':reduced?'#ca9133':'#bd742c',weight:5,opacity:1,dashArray:blocked||unchecked?'7 6':null,className:'houston-planned-hop'+(blocked?' weather-blocked':'')}).bindTooltip('Hop '+(i+1)+' · '+escapeHtml(from.short)+' → '+escapeHtml(to.short)+' · '+formatRouteMiles(leg.miles)+' mi'+(legVerdict?.maxMiles?' · '+legVerdict.maxMiles+' mi limit':''),{sticky:true}).addTo(s.plannedRouteLayer);
    const el=line.getElement();el?.setAttribute('data-hop-index',String(i+1));el?.setAttribute('data-hop-from',leg.from);el?.setAttribute('data-hop-to',leg.to);el?.setAttribute('data-hop-miles',String(leg.miles));el?.setAttribute('data-weather-status',blocked?'blocked':unchecked?'unverified':'clear');el?.setAttribute('data-hop-limit',String(legVerdict?.maxMiles||10));
    const length=s.map.latLngToContainerPoint(points[0]).distanceTo(s.map.latLngToContainerPoint(points[1]));
    if(length>=100)L.marker([(from.lat+to.lat)/2,(from.lng+to.lng)/2],{interactive:false,keyboard:false,icon:L.divIcon({className:'relay-hop-label',html:'<span>'+formatRouteMiles(leg.miles)+' mi</span>',iconSize:[56,20],iconAnchor:[28,10]})}).addTo(s.plannedRouteLayer);
  });
}
document.addEventListener('change',event=>{if(event.target.id==='route-source')chooseHospitalRouteEndpoint(event.target.value,'source');if(event.target.id==='route-destination')chooseHospitalRouteEndpoint(event.target.value,'destination');});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-route-action],[data-route-pick]');if(!button)return;
  const r=houstonRoutingState;
  if(button.dataset.routePick){r.pick=button.dataset.routePick;renderHoustonRouting();}
  if(button.dataset.routeAction==='clear')clearHospitalRoute();
  if(button.dataset.routeAction==='fit')fitPlannedHospitalRoute();
  if(button.dataset.routeAction==='swap'&&r.source&&r.destination){[r.source,r.destination]=[r.destination,r.source];replanHospitalWeatherRoute();renderHoustonRouting();drawHoustonFacilities();drawHoustonRoutes();drawPlannedHospitalRoute();fitPlannedHospitalRoute();}
});
