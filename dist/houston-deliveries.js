/* Browser-local deliveries at 45 mph. Saved timestamps preserve actual elapsed flight time. */
const HOSPITAL_FLIGHT_SPEED_MPH=45;
const HOSPITAL_FLIGHT_STOP_MS=2000;
const houstonDeliveryState={timer:null,featuredId:'',layer:null,markers:new Map(),lines:[],lastUiSecond:-1};

function validHospitalDeliveryPath(path,from,to){
  return Array.isArray(path)&&path.length>=2&&path.length<=facilities.length&&path[0]===from&&path.at(-1)===to&&new Set(path).size===path.length&&path.slice(1).every((id,i)=>routeWithinRange(path[i],id));
}
function deliveryRouteIsValid(d){
  if(!d.flight)return routeWithinRange(d.from,d.to);
  const f=d.flight;
  const validTiming=f.version===2?f.speedMph===HOSPITAL_FLIGHT_SPEED_MPH:f.version===1&&Number.isFinite(f.hopMs)&&f.hopMs>=1000&&f.hopMs<=60000;
  return validTiming&&validHospitalDeliveryPath(f.path,d.from,d.to)&&Number.isFinite(f.startedAt)&&f.startedAt>0&&Number.isFinite(f.stopMs)&&f.stopMs>=0&&f.stopMs<=10000;
}
function hospitalFlightLegTimes(path,speedMph=HOSPITAL_FLIGHT_SPEED_MPH){return path.slice(1).map((id,i)=>routeDistanceMiles(path[i],id)/speedMph*3600000);}
function hospitalRouteFlightTime(path){return hospitalFlightLegTimes(path).reduce((sum,ms)=>sum+ms,0)+Math.max(0,path.length-2)*HOSPITAL_FLIGHT_STOP_MS;}
function formatHospitalFlightTime(seconds){const total=Math.max(0,Math.ceil(seconds)),minutes=Math.floor(total/60),remaining=total%60;return minutes?minutes+'m '+String(remaining).padStart(2,'0')+'s':total+'s';}
function hospitalDeliveryProgress(d,now=Date.now()){
  if(!d.flight||!deliveryRouteIsValid(d))return null;
  const f=d.flight,path=f.path,hops=path.length-1,legTimes=f.version===2?hospitalFlightLegTimes(path,f.speedMph):path.slice(1).map(()=>f.hopMs),totalMs=legTimes.reduce((sum,ms)=>sum+ms,0)+(hops-1)*f.stopMs;
  const elapsed=d.status==='Delivered'?totalMs:Math.max(0,Math.min(totalMs,now-f.startedAt));
  const complete=elapsed>=totalMs;
  let hopIndex=hops-1,phase=complete?'delivered':'flying',fraction=1,completedHops=hops;
  if(!complete){
    let start=0;
    for(let i=0;i<hops;i++){
      if(elapsed<start+legTimes[i]){hopIndex=i;fraction=(elapsed-start)/legTimes[i];phase='flying';completedHops=i;break;}
      if(i<hops-1&&elapsed<start+legTimes[i]+f.stopMs){hopIndex=i;fraction=1;phase='relay';completedHops=i+1;break;}
      start+=legTimes[i]+f.stopMs;
    }
  }
  const from=facility(path[hopIndex]),to=facility(path[hopIndex+1]);
  return {path,hops,totalMs,elapsed,complete,hopIndex,phase,fraction,completedHops,progress:totalMs>0?elapsed/totalMs:1,remainingSeconds:Math.ceil((totalMs-elapsed)/1000),currentHospital:complete?path.at(-1):path[completedHops],nextHospital:phase==='relay'?path[hopIndex+2]:to.id,lat:from.lat+(to.lat-from.lat)*fraction,lng:from.lng+(to.lng-from.lng)*fraction};
}
function activeDeliveryForPath(path){return state.deliveries.find(d=>d.status==='In transit'&&d.flight&&deliveryRouteIsValid(d)&&d.flight.path.length===path.length&&d.flight.path.every((id,i)=>id===path[i]));}
function hospitalDeliveryStartControl(route){
  const active=activeDeliveryForPath(route.path),ready=state.fleet.some(f=>f.status==='Available'),weather=routeFlightWeather(route.path);
  return `<div class="relay-dispatch"><button class="button primary" data-flight-action="start" ${active||!ready||weather.status!=='clear'?'disabled':''}>${icon('drone')}${active?'Delivery in progress':weather.status==='blocked'?'Weather blocked':weather.status==='clear'?'Start delivery':weather.status==='checking'?'Checking weather…':'Weather unavailable'}</button><p>${active?'This route already has an active delivery.':!ready?'No drones available. Wait for an active delivery to arrive.':weather.status!=='clear'?'Launch requires a passed weather check. See Flight weather above.':'45 mph · Estimated flight '+formatHospitalFlightTime(hospitalRouteFlightTime(route.path)/1000)+' · Choose payload and priority'}</p></div>`;
}
function startPlannedHospitalDelivery(now=Date.now(),details={}){
  const route=plannedHospitalRoute();
  if(!route||!validHospitalDeliveryPath(route.path,houstonRoutingState.source,houstonRoutingState.destination)){toast('Choose different source and destination hospitals with an available route.');return null;}
  return startHospitalDelivery(route.path,details,now);
}
function startHospitalDelivery(path,details={},now=Date.now()){
  if(!validHospitalDeliveryPath(path,path?.[0],path?.at(-1))){toast('No available path with hops of 10 miles or less.');return null;}
  const weather=routeFlightWeather(path);
  if(weather.status!=='clear'){queueFlightWeatherCheck(path);toast(weather.status==='blocked'?'Delivery blocked: weather exceeds this demo’s flight limits.':'Launch blocked until fresh weather is verified for every hop.');return null;}
  const cargo=details.cargo||'Lab samples',weight=details.weight??0.5,priority=details.priority||'Routine';
  if(!['Lab samples','Medication','Blood products','Medical supplies'].includes(cargo)||!['Routine','Urgent'].includes(priority)||!Number.isFinite(weight)||weight<.1||weight>FLEET_MAX_PAYLOAD_KG){toast('Please check the payload and priority options. Payload must be between 0.1 and '+FLEET_MAX_PAYLOAD_KG+' kg.');return null;}
  const existing=activeDeliveryForPath(path);if(existing){houstonDeliveryState.featuredId=existing.id;toast('This route already has a delivery in progress.');return existing;}
  const drone=state.fleet.find(f=>f.status==='Available');if(!drone){toast('No demo drones are available. Wait for a delivery to arrive.');return null;}
  const nextId=Math.max(2048,...state.deliveries.map(d=>Number(d.id.replace('HDN-',''))||0))+1;
  const d={id:'HDN-'+nextId,cargo,from:path[0],to:path.at(-1),status:'In transit',priority,drone:drone.id,eta:Math.ceil(hospitalRouteFlightTime(path)/60000),weight,created:new Date(now).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),notes:String(details.notes||'').trim().slice(0,100),flight:{version:2,path:[...path],startedAt:now,speedMph:HOSPITAL_FLIGHT_SPEED_MPH,stopMs:HOSPITAL_FLIGHT_STOP_MS}};
  d.weatherCheck={mode:weather.mode,scenario:weather.scenario||null,checkedAt:weather.checkedAt,observedAt:weather.observedAt,sampleCount:weather.sampleCount,pattern:weather.pattern||null,regions:weather.regions||null,legLimits:weather.legs.map(l=>l.maxMiles||10),limitsVersion:2};
  state.deliveries.unshift(d);drone.status='In flight';drone.location=d.from;
  houstonRoutingState.source=d.from;houstonRoutingState.destination=d.to;houstonRoutingState.path=[...path];houstonRoutingState.weatherNoPath=false;houstonRoutingState.pick='destination';
  houstonDeliveryState.featuredId=d.id;save();
  if(state.view==='overview')render();else{renderHoustonRouting();drawHoustonDeliveryFlights();renderHoustonDeliveryTracking(now);}
  updateHospitalDeliveryCount();
  toast(d.id+' started. Follow '+drone.id+' along the highlighted route.');return d;
}
function migrateHospitalDeliverySpeed(now=Date.now()){
  let changed=false;
  for(const d of state.deliveries){
    if(d.status!=='In transit'||d.flight?.version!==1)continue;
    const p=hospitalDeliveryProgress(d,now);if(!p||p.complete)continue;
    const times=hospitalFlightLegTimes(p.path);
    const elapsed=times.slice(0,p.hopIndex).reduce((sum,ms)=>sum+ms,0)+p.hopIndex*d.flight.stopMs+times[p.hopIndex]*p.fraction+(p.phase==='relay'?p.elapsed-(p.hopIndex*(d.flight.hopMs+d.flight.stopMs)+d.flight.hopMs):0);
    d.flight={version:2,path:[...p.path],startedAt:now-elapsed,speedMph:HOSPITAL_FLIGHT_SPEED_MPH,stopMs:d.flight.stopMs};changed=true;
  }
  if(changed)save();
}
function reconcileHospitalDeliveries(now=Date.now()){
  let changed=false;const completed=[];
  for(const d of state.deliveries){
    if(d.status!=='In transit'||!d.flight)continue;
    const p=hospitalDeliveryProgress(d,now);if(!p)continue;
    d.eta=Math.ceil(p.remainingSeconds/60);
    const drone=state.fleet.find(f=>f.id===d.drone);
    if(drone&&drone.location!==p.currentHospital){drone.location=p.currentHospital;changed=true;}
    if(p.complete){d.status='Delivered';d.eta=0;d.flight.arrivedAt=d.flight.startedAt+p.totalMs;completed.push(d.id);changed=true;if(drone){drone.status='Available';drone.location=d.to;drone.battery=Math.max(20,drone.battery-3*p.hops);}}
  }
  if(changed)save();return completed;
}
function trackedHospitalDelivery(){
  const eligible=state.deliveries.filter(d=>d.flight&&deliveryRouteIsValid(d)&&['In transit','Delivered'].includes(d.status));
  return eligible.find(d=>d.id===houstonDeliveryState.featuredId)||eligible.find(d=>d.status==='In transit')||eligible[0]||null;
}
function hospitalDeliveryTrackingPanel(){return '<section id="hospital-delivery-tracking" class="hospital-delivery-tracking" aria-label="Delivery tracking" hidden></section>';}
function hospitalFlightStatusText(d,p){
  if(p.complete)return 'Delivered to '+facility(d.to).short;
  if(p.phase==='relay')return 'Relay stop '+p.completedHops+' of '+(p.hops-1)+' · '+facility(p.currentHospital).short;
  return 'Hop '+(p.hopIndex+1)+' of '+p.hops+' · '+facility(p.path[p.hopIndex]).short+' → '+facility(p.nextHospital).short;
}
function renderHoustonDeliveryTracking(now=Date.now()){
  const el=document.getElementById('hospital-delivery-tracking'),d=trackedHospitalDelivery(),p=d&&hospitalDeliveryProgress(d,now);
  if(el){
    el.hidden=!p;
    if(p){
      const key=d.id+':'+p.complete;
      if(el.dataset.flightKey!==key){el.dataset.flightKey=key;el.innerHTML=`<div class="flight-tracking-head"><span class="flight-tracking-icon">${icon(p.complete?'check':'drone')}</span><div><span class="flight-eyebrow">${p.complete?'DELIVERY COMPLETE':'DELIVERY IN PROGRESS'}</span><h3>${escapeHtml(d.id)} <small>· ${escapeHtml(d.drone)} · ${escapeHtml(d.cargo)}</small></h3></div><button class="button text" data-flight-action="show" data-flight-id="${d.id}">Show flight ${icon('target')}</button><button class="button text" data-delivery="${d.id}">Details ${icon('arrow-right')}</button></div><p class="flight-trip">${escapeHtml(facility(d.from).short)} → ${escapeHtml(facility(d.to).short)}</p><p class="flight-current-status" data-flight-status role="status" aria-live="polite"></p><div class="flight-progress-row"><progress max="100" value="0" aria-label="Delivery progress"></progress><span data-flight-percent></span><span data-flight-eta></span></div><p class="flight-demo-note">${d.flight.version===2?'45 mph · Real-time simulation':'Earlier demo'} · ${p.hops} ${p.hops===1?'hop':'hops'} · Every hop ≤10 mi</p>`;}
      const status=el.querySelector('[data-flight-status]'),text=hospitalFlightStatusText(d,p);if(status.textContent!==text)status.textContent=text;
      const pct=Math.floor(p.progress*100);el.querySelector('progress').value=p.progress*100;el.querySelector('[data-flight-percent]').textContent=pct+'%';el.querySelector('[data-flight-eta]').textContent=p.complete?'Arrived':formatHospitalFlightTime(p.remainingSeconds)+' remaining';
    }
  }
  const details=document.getElementById('delivery-flight-details-status');
  if(details){const record=state.deliveries.find(item=>item.id===details.dataset.deliveryId),position=record&&hospitalDeliveryProgress(record,now);if(position){const text=hospitalFlightStatusText(record,position);if(details.textContent!==text)details.textContent=text;}}
}
function disposeHoustonDeliveryMap(){houstonDeliveryState.layer=null;houstonDeliveryState.markers.clear();houstonDeliveryState.lines=[];}
function drawHoustonDeliveryFlights(){
  const map=houstonMapState.map,s=houstonDeliveryState;if(!map||!map.getCenter())return;
  if(!s.layer)s.layer=L.layerGroup().addTo(map);s.layer.clearLayers();s.markers.clear();s.lines=[];
  const tracked=trackedHospitalDelivery();
  const records=state.deliveries.filter(d=>d.flight&&deliveryRouteIsValid(d)&&(d.status==='In transit'||(d.id===tracked?.id&&d.status==='Delivered')));
  for(const d of records){
    const p=hospitalDeliveryProgress(d);
    p.path.slice(1).forEach((id,i)=>{
      const from=facility(p.path[i]),to=facility(id),points=[[from.lat,from.lng],[to.lat,to.lng]];
      L.polyline(points,{pane:'deliveryRoutes',color:'#ffffff',weight:8,opacity:.9,interactive:false}).addTo(s.layer);
      const line=L.polyline(points,{pane:'deliveryRoutes',color:'#137e77',weight:4,opacity:i<p.completedHops?1:.55,dashArray:i<p.completedHops?null:'5 7',className:'houston-flight-hop'}).bindTooltip(escapeHtml(d.id)+' · Hop '+(i+1)+' · '+formatRouteMiles(routeDistanceMiles(from.id,to.id))+' mi',{sticky:true}).addTo(s.layer);
      line.getElement()?.setAttribute('data-flight-id',d.id);line.getElement()?.setAttribute('data-hop-miles',String(routeDistanceMiles(from.id,to.id)));s.lines.push({line,id:d.id,index:i,completed:i<p.completedHops});
    });
    const marker=L.marker([p.lat,p.lng],{pane:'deliveryDrones',title:'Track '+d.id,alt:'Delivery drone '+d.drone,zIndexOffset:1200,icon:L.divIcon({className:'houston-live-drone',html:'<span class="live-drone-pin">'+icon('drone')+'</span>',iconSize:[38,38],iconAnchor:[19,19]})}).bindTooltip(escapeHtml(d.drone)+' · '+escapeHtml(d.id),{direction:'top',offset:[0,-22],className:'flight-drone-label'}).on('click',()=>deliveryDetails(d.id)).addTo(s.layer);
    const el=marker.getElement();el?.setAttribute('aria-label','Track delivery '+d.id+' on drone '+d.drone);el?.setAttribute('data-flight-id',d.id);s.markers.set(d.id,marker);
  }
  updateHoustonDeliveryMarkers();
}
function updateHoustonDeliveryMarkers(now=Date.now()){
  const s=houstonDeliveryState;
  for(const [id,marker] of s.markers){
    const d=state.deliveries.find(item=>item.id===id),p=d&&hospitalDeliveryProgress(d,now);if(!p)continue;
    marker.setLatLng([p.lat,p.lng]);const el=marker.getElement();
    if(el){el.dataset.progress=String(p.progress);el.dataset.hop=String(p.hopIndex+1);el.dataset.phase=p.phase;el.dataset.speedMph=d.flight.speedMph||'';el.dataset.lat=String(p.lat);el.dataset.lng=String(p.lng);el.classList.toggle('has-arrived',p.complete);}
  }
  for(const record of s.lines){const d=state.deliveries.find(item=>item.id===record.id),p=d&&hospitalDeliveryProgress(d,now);if(!p)continue;const completed=record.index<p.completedHops;if(completed!==record.completed){record.completed=completed;record.line.setStyle({opacity:completed?1:.55,dashArray:completed?null:'5 7'});}}
}
function updateHospitalDeliveryCount(){const el=document.getElementById('delivery-count');if(el)el.textContent=state.deliveries.filter(d=>d.status!=='Delivered').length;}
function tickHospitalDeliveries(now=Date.now()){
  const completed=reconcileHospitalDeliveries(now);
  if(completed.length){
    if(state.view==='overview'||(!houstonMapState.map&&['deliveries','fleet'].includes(state.view)))render();else if(houstonMapState.map){renderHoustonRouting();drawHoustonDeliveryFlights();}
    updateHospitalDeliveryCount();toast(completed.join(', ')+' delivered. The drone is ready for its next delivery.');
  }
  updateHoustonDeliveryMarkers(now);
  const second=Math.floor(now/1000);if(second!==houstonDeliveryState.lastUiSecond||completed.length){houstonDeliveryState.lastUiSecond=second;renderHoustonDeliveryTracking(now);document.querySelectorAll('[data-delivery-eta]').forEach(cell=>{const d=state.deliveries.find(item=>item.id===cell.dataset.deliveryEta);if(d?.flight&&['In transit','Delivered'].includes(d.status)&&deliveryRouteIsValid(d))cell.textContent=d.status==='Delivered'?'Arrived':d.eta+' min';});}
}
function initializeHospitalDeliveries(){
  reconcileHospitalDeliveries();
  if(houstonDeliveryState.timer)clearInterval(houstonDeliveryState.timer);
  houstonDeliveryState.timer=setInterval(()=>tickHospitalDeliveries(),100);renderHoustonDeliveryTracking();
}
function showHospitalDeliveryOnMap(id){
  const d=state.deliveries.find(item=>item.id===id);if(!d?.flight||!deliveryRouteIsValid(d))return;
  houstonDeliveryState.featuredId=id;houstonRoutingState.source=d.from;houstonRoutingState.destination=d.to;houstonRoutingState.path=[...d.flight.path];houstonRoutingState.weatherNoPath=false;houstonRoutingState.pick='destination';closeModal();
  if(!houstonMapState.map){houstonMapState.pendingFocus=null;location.hash='network';return;}
  renderHoustonRouting();drawHoustonFacilities();drawHoustonRoutes();fitPlannedHospitalRoute();renderHoustonDeliveryTracking();
}
function hospitalFlightDetails(d){
  const p=hospitalDeliveryProgress(d);if(!p)return;
  const miles=p.path.slice(1).reduce((sum,id,i)=>sum+routeDistanceMiles(p.path[i],id),0);
  openModal(d.id,`${demoNote(d.flight.version===2?'Simulated delivery at 45 mph. Flight time follows the distance of each hop.':'Earlier demo delivery. The drone traveled each hop automatically.')}<div class="detail-route"><strong>${escapeHtml(facility(d.from).short)}</strong>${icon('arrow-right')}<strong>${escapeHtml(facility(d.to).short)}</strong></div><p id="delivery-flight-details-status" data-delivery-id="${d.id}" class="flight-detail-status" role="status" aria-live="polite">${escapeHtml(hospitalFlightStatusText(d,p))}</p><dl class="detail-grid"><div><dt>Route distance</dt><dd>${formatRouteMiles(miles)} mi · ${p.hops} ${p.hops===1?'hop':'hops'}</dd></div><div><dt>Launch hop limits</dt><dd>${d.weatherCheck?.legLimits?d.weatherCheck.legLimits.map((limit,i)=>'Hop '+(i+1)+': '+limit+' mi').join(' · '):'10 mi'}</dd></div><div><dt>Launch weather</dt><dd>${d.weatherCheck?.mode==='demo'?'Demo · '+escapeHtml(houstonWeatherPatterns[d.weatherCheck.pattern]?.label||flightWeatherScenarios[d.weatherCheck.scenario]?.label||'Custom regional weather'):d.weatherCheck?'Live feed · Checked before launch':'Earlier sample record'}</dd></div><div><dt>Cruise speed</dt><dd>${d.flight.version===2?'45 mph':'Earlier demo'}</dd></div><div><dt>Estimated flight time</dt><dd>${formatHospitalFlightTime(p.totalMs/1000)}</dd></div><div><dt>Priority</dt><dd>${escapeHtml(d.priority)}</dd></div><div><dt>Payload</dt><dd>${escapeHtml(d.cargo)} · ${d.weight} kg</dd></div><div><dt>Assigned drone</dt><dd>${escapeHtml(d.drone)}</dd></div>${d.notes?'<div style="grid-column:1/-1"><dt>Reference note</dt><dd>'+escapeHtml(d.notes)+'</dd></div>':''}</dl><ol class="flight-detail-stops">${p.path.map((id,i)=>'<li>'+escapeHtml(facility(id).short)+(i===0?' · Source':i===p.path.length-1?' · Destination':' · Relay stop')+'</li>').join('')}</ol><div class="form-actions"><button class="button secondary" data-action="close-modal">Close</button><button class="button primary" data-flight-action="show" data-flight-id="${d.id}">Show flight on map ${icon('target')}</button></div>`,'DELIVERY TRACKING');renderHoustonDeliveryTracking();
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-flight-action]');if(!button||button.disabled)return;if(button.dataset.flightAction==='start')newDelivery(houstonRoutingState.source,houstonRoutingState.destination);if(button.dataset.flightAction==='show')showHospitalDeliveryOnMap(button.dataset.flightId);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tickHospitalDeliveries();});
