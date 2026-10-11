/* Browser-local laboratory enrollment. Census geocoding runs only on an explicit address search. */
const LAB_NETWORK_BOUNDS=[[29.35,-96],[30.28,-94.84]];
const LAB_GEOCODER='https://geocoding.geo.census.gov/geocoder/locations/onelineaddress';
const LAB_GEOCODER_DOCS='https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html';
const labRegistrationState={matches:[],selected:null,address:'',generation:0,loading:false,preview:null,cancel:null,cache:new Map()};
function labLocationInBounds(lat,lng){return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=LAB_NETWORK_BOUNDS[0][0]&&lat<=LAB_NETWORK_BOUNDS[1][0]&&lng>=LAB_NETWORK_BOUNDS[0][1]&&lng<=LAB_NETWORK_BOUNDS[1][1];}
function labAddressQuery(address){
  const value=String(address||'').trim().replace(/\s+/g,' ');
  if(!/^\d+\S*\s+\S/.test(value)||value.length>100)throw new Error('Enter a street number and street name, with city and ZIP code.');
  const query=/\b(?:TX|Texas)\b|\b\d{5}(?:-\d{4})?\b/i.test(value)?value:value+(value.includes(',')?', TX':', Houston, TX');
  if(query.length>100)throw new Error('Shorten the address to 100 characters or fewer, including the city and state.');
  return query;
}
function parseLabAddressMatches(payload){
  const matches=payload?.result?.addressMatches;if(!Array.isArray(matches))throw new Error('The address service returned an incomplete response. Please retry.');
  return matches.filter(m=>m?.addressComponents?.state==='TX'&&labLocationInBounds(m.coordinates?.y,m.coordinates?.x)&&typeof m.matchedAddress==='string'&&m.matchedAddress.trim()).slice(0,5).map(m=>({lat:m.coordinates.y,lng:m.coordinates.x,address:m.matchedAddress.trim().slice(0,200),city:String(m.addressComponents.city||'Houston').slice(0,70),zip:String(m.addressComponents.zip||'').slice(0,10)}));
}
function coordinateDistanceMiles(a,b){
  const rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad,h=Math.min(1,Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2);
  return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))/KM_PER_MILE;
}
function nearbyLabConnections(match){return facilities.map(f=>({facility:f,miles:coordinateDistanceMiles(match,f)})).filter(f=>f.miles<=MAX_ROUTE_MILES).sort((a,b)=>a.miles-b.miles);}
function validCustomLab(lab){return lab&&lab.custom===true&&/^member-[a-z0-9-]{1,80}$/.test(lab.id)&&typeof lab.name==='string'&&lab.name.trim().length>=2&&lab.name.length<=70&&typeof lab.address==='string'&&lab.address.trim().length>=5&&lab.address.length<=200&&labLocationInBounds(lab.lat,lab.lng);}
function cleanCustomLab(lab){return{id:lab.id,name:lab.name.trim(),short:lab.name.trim().slice(0,28),type:'Laboratory',pad:'LAB',city:typeof lab.city==='string'?lab.city.slice(0,70):'Houston',address:lab.address.trim(),lat:lab.lat,lng:lab.lng,deliveries:0,source:LAB_GEOCODER_DOCS,coordinateSource:'U.S. Census Bureau address geocoder',direction:'top',custom:true,joinedAt:typeof lab.joinedAt==='string'?lab.joinedAt.slice(0,40):''};}
function restoreCustomFacilities(saved){
  if(!Array.isArray(saved))return;
  for(const lab of saved.slice(0,100)){if(!validCustomLab(lab)||facilities.some(f=>f.id===lab.id||(f.custom&&f.name.toLowerCase()===lab.name.trim().toLowerCase()&&f.address.toLowerCase()===lab.address.trim().toLowerCase())))continue;facilities.push(cleanCustomLab(lab));}
}
function addCustomLab(name,match){
  name=String(name||'').trim();
  if(name.length<2||name.length>70)throw new Error('Enter a lab name between 2 and 70 characters.');
  if(!match||!labLocationInBounds(match.lat,match.lng)||typeof match.address!=='string'||match.address.length<5||match.address.length>200)throw new Error('Find and confirm a Houston address before adding the lab.');
  if(facilities.filter(f=>f.custom).length>=100)throw new Error('This demo already contains 100 added labs.');
  if(facilities.some(f=>f.custom&&f.name.toLowerCase()===name.toLowerCase()&&f.address.toLowerCase()===match.address.toLowerCase()))throw new Error('This lab and address are already in the network.');
  const suffix=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
  const lab=cleanCustomLab({id:'member-'+suffix,name,address:match.address,city:match.city,lat:match.lat,lng:match.lng,custom:true,joinedAt:new Date().toISOString()});
  facilities.push(lab);replanHospitalWeatherRoute();return lab;
}
function disposeLabRegistration(){
  labRegistrationState.generation++;labRegistrationState.cancel?.();labRegistrationState.cancel=null;labRegistrationState.loading=false;
  if(labRegistrationState.preview){labRegistrationState.preview.remove();labRegistrationState.preview=null;}
}
function requestLabGeocode(address){
  // The Census API documents JSONP for browser clients; it does not support CORS.
  return new Promise((resolve,reject)=>{
    const callback='hdnLabAddress'+Date.now().toString(36)+Math.random().toString(36).slice(2,9),script=document.createElement('script');let finished=false;
    const timer=setTimeout(()=>finish(new Error('Address lookup timed out. Please check your connection and retry.')),20000);
    function finish(error,payload){if(finished)return;finished=true;clearTimeout(timer);script.remove();script.onerror=null;window[callback]=()=>{};setTimeout(()=>{delete window[callback];},30000);labRegistrationState.cancel=null;error?reject(error):resolve(payload);}
    window[callback]=payload=>finish(null,payload);script.async=true;script.referrerPolicy='no-referrer';script.onerror=()=>finish(new Error('Address lookup is unavailable. Please check your connection and retry.'));
    labRegistrationState.cancel=()=>{const error=new Error('Address lookup canceled');error.name='AbortError';finish(error);};
    script.src=LAB_GEOCODER+'?'+new URLSearchParams({address,benchmark:'Public_AR_Current',format:'jsonp',callback});document.head.appendChild(script);
  });
}
function setLabRegistrationError(message){const error=document.getElementById('lab-registration-error');if(error){error.textContent=message;error.hidden=!message;}}
function renderLabAddressPreview(){
  const form=document.getElementById('join-lab-form');if(!form||document.getElementById('modal-backdrop')?.hidden)return;
  const s=labRegistrationState,match=s.selected,results=document.getElementById('lab-address-results');results.hidden=!match;
  form.querySelector('[data-lab-add]').disabled=!match||s.loading;
  if(s.preview){s.preview.remove();s.preview=null;}
  if(!match)return;
  const select=document.getElementById('lab-address-match');select.innerHTML=s.matches.map((m,i)=>'<option value="'+i+'">'+escapeHtml(m.address)+'</option>').join('');select.value=String(s.matches.indexOf(match));
  const nearby=nearbyLabConnections(match);document.getElementById('lab-connection-summary').innerHTML='<strong>'+nearby.length+' nearby network '+(nearby.length===1?'stop':'stops')+'</strong><p>'+(nearby.length?'Connections within 10 miles. Weather determines which hops can fly.':'No existing stop is within 10 miles. The lab will appear on the map, but cannot receive a flight until a nearby stop joins.')+'</p>'+(nearby.length?'<ul>'+nearby.slice(0,4).map(n=>'<li>'+escapeHtml(n.facility.short)+' <span>'+formatRouteMiles(n.miles)+' mi</span></li>').join('')+'</ul>':'');
  if(typeof L==='undefined'){document.getElementById('lab-address-map').textContent='The map preview could not load. Please retry before adding the lab.';form.querySelector('[data-lab-add]').disabled=true;return;}
  s.preview=L.map('lab-address-map',{scrollWheelZoom:false,zoomControl:true,attributionControl:true}).setView([match.lat,match.lng],13);
  L.tileLayer(houstonBasemaps.streets.url,{maxZoom:18,attribution:'Map: USGS The National Map'}).addTo(s.preview);
  L.circle([match.lat,match.lng],{radius:MAX_ROUTE_MILES*KM_PER_MILE*1000,color:'#856391',weight:1,dashArray:'5 6',fillOpacity:.035,interactive:false}).addTo(s.preview);
  for(const n of nearby.slice(0,8))L.circleMarker([n.facility.lat,n.facility.lng],{radius:4,color:'#fff',weight:1,fillColor:'#47775d',fillOpacity:1}).bindTooltip(escapeHtml(n.facility.short)).addTo(s.preview);
  L.marker([match.lat,match.lng],{icon:L.divIcon({className:'joined-lab-preview-pin',html:icon('flask'),iconSize:[32,32],iconAnchor:[16,16]})}).bindTooltip('New lab location',{permanent:true,direction:'top'}).addTo(s.preview);
}
function openLabRegistration(){
  disposeLabRegistration();Object.assign(labRegistrationState,{matches:[],selected:null,address:'',loading:false});
  openModal('Join the network','<p class="lab-join-intro">Add your lab as a pickup, destination, or relay stop in the Houston demo network.</p><form id="join-lab-form"><div class="form-grid"><label class="field full">Lab name<input name="labName" required minlength="2" maxlength="70" placeholder="e.g. Houston Research Lab" autocomplete="organization"></label><label class="field full">Lab street address<input name="labAddress" required maxlength="100" placeholder="e.g. 1000 Main St, Houston, TX 77002" autocomplete="street-address" aria-describedby="lab-address-help"><small id="lab-address-help">Include the street number, city, and ZIP code. Houston area addresses only.</small></label></div><button class="button secondary lab-address-search" type="submit" data-lab-lookup>'+icon('search')+'Find address</button><p id="lab-address-search-status" role="status" class="lab-search-status"></p><p class="form-error" id="lab-registration-error" role="alert" hidden></p><section id="lab-address-results" class="lab-address-results" hidden aria-label="Confirm lab location"><label class="field">Matched address<select id="lab-address-match" aria-label="Matched lab address"></select></label><div id="lab-address-map" class="lab-address-map" role="region" aria-label="Lab address map preview"></div><div id="lab-connection-summary" class="lab-connection-summary"></div><p class="lab-location-note">Check the address and pin before adding. The location is approximate.</p></section><p class="lab-join-storage">New labs are saved in this browser. Address lookup uses the <a href="'+LAB_GEOCODER_DOCS+'" target="_blank" rel="noopener noreferrer">U.S. Census Bureau</a>.</p><div class="form-actions"><button type="button" class="button secondary" data-action="close-modal">Cancel</button><button type="button" class="button primary" data-lab-add disabled>'+icon('plus')+'Add lab to network</button></div></form>','GROW THE HOUSTON NETWORK');
}
async function lookupLabAddress(form){
  if(labRegistrationState.loading)return;setLabRegistrationError('');
  let query;try{query=labAddressQuery(form.elements.labAddress.value);}catch(error){setLabRegistrationError(error.message);return;}
  const s=labRegistrationState,generation=++s.generation,input=form.elements.labAddress.value.trim();s.address=input;s.selected=null;s.matches=[];s.loading=true;renderLabAddressPreview();
  const button=form.querySelector('[data-lab-lookup]');button.disabled=true;button.textContent='Finding address…';document.getElementById('lab-address-search-status').textContent='Looking up your Houston address…';
  try{
    const key=query.toLowerCase(),cached=s.cache.get(key),matches=cached&&Date.now()-cached.at<600000?cached.matches:parseLabAddressMatches(await requestLabGeocode(query));
    if(s.generation!==generation||!form.isConnected||document.getElementById('modal-backdrop')?.hidden)return;
    s.cache.set(key,{at:Date.now(),matches});s.matches=matches;s.selected=matches[0]||null;
    if(!matches.length)setLabRegistrationError('No address match was found in the Houston network area. Check the street number, city, and ZIP code, then try again.');
    document.getElementById('lab-address-search-status').textContent=matches.length?'Address found. Review the pin and add your lab.':'';
  }catch(error){if(s.generation===generation&&error.name!=='AbortError'){setLabRegistrationError(error.message);document.getElementById('lab-address-search-status').textContent='';}}
  finally{if(s.generation===generation&&form.isConnected){s.loading=false;button.disabled=false;button.innerHTML=icon('search')+'Find address';renderLabAddressPreview();}}
}
function submitNewLab(){
  const form=document.getElementById('join-lab-form');if(!form||!form.reportValidity())return;
  const s=labRegistrationState;if(!s.selected||s.loading||form.elements.labAddress.value.trim()!==s.address){setLabRegistrationError('Find and confirm the current address first.');return;}
  try{
    const lab=addCustomLab(form.elements.labName.value,s.selected),persisted=save();closeModal();render();
    if(houstonMapState.map){focusHoustonFacility(lab.id);drawDemoWeatherZones();}else{houstonMapState.pendingFocus=lab.id;location.hash='network';}
    toast(lab.name+' joined the network.'+(persisted?' Saved in this browser.':' Available for this session; browser storage is unavailable.'));
  }catch(error){setLabRegistrationError(error.message);}
}
function memberLabDetails(f){
  openModal(f.name,demoNote('A lab added to this browser’s demo network. Flight and weather limits apply.')+'<div class="joined-lab-detail"><span class="joined-lab-badge">'+icon('flask')+'Joined laboratory</span><p>'+escapeHtml(f.address)+'</p></div><dl class="detail-grid"><div><dt>Nearby network stops</dt><dd>'+reachableHospitals(f.id).length+' within 10 miles</dd></div><div><dt>Hop range</dt><dd>10 mi clear · 5 mi low visibility</dd></div><div><dt>Address location</dt><dd>U.S. Census Bureau · Approximate</dd></div><div><dt>Saved</dt><dd>This browser</dd></div></dl><div class="form-actions"><button class="button secondary" data-map-focus="'+f.id+'">Show on map '+icon('target')+'</button><button class="button primary" data-pickup="'+f.id+'">New delivery '+icon('plus')+'</button></div>','LAB NETWORK MEMBER');
}
document.addEventListener('click',event=>{if(event.target.closest('[data-join-network]'))openLabRegistration();if(event.target.closest('[data-lab-add]'))submitNewLab();});
document.addEventListener('submit',event=>{if(event.target.id==='join-lab-form'){event.preventDefault();lookupLabAddress(event.target);}});
document.addEventListener('input',event=>{
  if(event.target.name!=='labAddress'||!event.target.closest('#join-lab-form'))return;
  disposeLabRegistration();labRegistrationState.selected=null;labRegistrationState.matches=[];setLabRegistrationError('');document.getElementById('lab-address-search-status').textContent='';
  const button=document.querySelector('[data-lab-lookup]');button.disabled=false;button.innerHTML=icon('search')+'Find address';renderLabAddressPreview();
});
document.addEventListener('change',event=>{if(event.target.id==='lab-address-match'){labRegistrationState.selected=labRegistrationState.matches[Number(event.target.value)]||null;renderLabAddressPreview();}});
