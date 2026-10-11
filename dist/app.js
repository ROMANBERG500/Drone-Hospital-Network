const iconPaths = {
  drone:'<circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m7 7 4 4m6-4-4 4m-6 6 4-4m6 4-4-4"/><rect x="9" y="9" width="6" height="6" rx="2"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  hospital:'<path d="M4 21V6h16v15M2 21h20M9 21v-5h6v5M12 3v6M9 6h6M7 12h2m6 0h2"/>',
  network:'<circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m10.5 7.5-4 9m7-9 4 9M8 19h8"/>',
  package:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10M7.5 4.5l9 5"/>',
  chart:'<path d="M3 3v18h18M7 16v-4m5 4V7m5 9v-7"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/>',
  settings:'<path d="m10 3-1 3-3 .5-2 3 2 2-.5 3 2 3 3-.5L12 21l2-3 3 .5 2-3-.5-3 2-2-2-3L15 6l-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  download:'<path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>',
  'chevron-right':'<path d="m9 5 7 7-7 7"/>',
  'chevron-left':'<path d="m15 5-7 7 7 7"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  battery:'<rect x="2" y="6" width="17" height="12" rx="2"/><path d="M22 10v4M5 9v6m3-6v6m3-6v6m3-6v6"/>',
  wind:'<path d="M3 8h13a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h6a3 3 0 1 1-3 3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check:'<path d="m5 12 4 4 10-10"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
  x:'<path d="m6 6 12 12M6 18 18 6"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  flask:'<path d="M9 3h6M10 3v7L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2l-6-9V3M7 16h10"/>',
  blood:'<path d="M12 2S5 11 5 15a7 7 0 0 0 14 0c0-4-7-13-7-13Z"/>',
  pill:'<path d="M4 20a5 5 0 0 1 0-7l9-9a5 5 0 0 1 7 7l-9 9a5 5 0 0 1-7 0ZM8.5 8.5l7 7"/>',
  bolt:'<path d="m13 2-8 12h6l-1 8 9-13h-6l1-7Z"/>',
  leaf:'<path d="M20 3c-9-1-16 3-16 10a7 7 0 0 0 7 7c7 0 9-9 9-17ZM4 20 15 9"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.package}</svg>`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const facilities = [
  {
    "id": "central",
    "name": "Houston Methodist Hospital",
    "short": "Houston Methodist",
    "type": "Hospital",
    "pad": "H01",
    "city": "Texas Medical Center",
    "address": "6565 Fannin St, Houston, TX 77030",
    "lat": 29.7108167,
    "lng": -95.399264,
    "deliveries": 38,
    "source": "https://www.houstonmethodist.org/contact-us/",
    "coordinateSource": "https://www.openstreetmap.org/way/597306771",
    "direction": "top"
  },
  {
    "id": "north",
    "name": "Memorial Hermann Greater Heights Hospital",
    "short": "Greater Heights",
    "type": "Hospital",
    "pad": "H02",
    "city": "Greater Heights",
    "address": "1635 North Loop W Fwy, Houston, TX 77008",
    "lat": 29.8117,
    "lng": -95.4304,
    "deliveries": 27,
    "source": "https://memorialhermann.org/locations/greater-heights",
    "coordinateSource": "https://memorialhermann.org/locations/greater-heights",
    "direction": "top"
  },
  {
    "id": "west",
    "name": "Memorial Hermann Memorial City Medical Center",
    "short": "Memorial City",
    "type": "Medical center",
    "pad": "H03",
    "city": "West Houston",
    "address": "921 Gessner Rd, Houston, TX 77024",
    "lat": 29.7802,
    "lng": -95.5451,
    "deliveries": 22,
    "source": "https://memorialhermann.org/locations/memorial-city",
    "coordinateSource": "https://memorialhermann.org/locations/memorial-city",
    "direction": "left"
  },
  {
    "id": "east",
    "name": "Harris Health Lyndon B. Johnson Hospital",
    "short": "LBJ Hospital",
    "type": "Hospital",
    "pad": "H04",
    "city": "Northeast Houston",
    "address": "5656 Kelley St, Houston, TX 77026",
    "lat": 29.8115032,
    "lng": -95.3130453,
    "deliveries": 19,
    "source": "https://www.harrishealth.org/locations-hh/Pages/lbj.aspx",
    "coordinateSource": "https://www.openstreetmap.org/way/568037942",
    "direction": "right"
  },
  {
    "id": "south",
    "name": "Harris Health Ben Taub Hospital",
    "short": "Ben Taub",
    "type": "Hospital",
    "pad": "H05",
    "city": "Texas Medical Center",
    "address": "1504 Taub Loop, Houston, TX 77030",
    "lat": 29.7106052,
    "lng": -95.3934046,
    "deliveries": 15,
    "source": "https://www.harrishealth.org/locations-hh/Pages/ben-taub.aspx",
    "coordinateSource": "https://www.openstreetmap.org/way/43035587",
    "direction": "right"
  },
  {
    "id": "lab",
    "name": "Texas Children’s Hospital — West Tower",
    "short": "Texas Children’s",
    "type": "Children’s hospital",
    "pad": "H06",
    "city": "Texas Medical Center",
    "address": "6621 Fannin St, Houston, TX 77030",
    "lat": 29.7080017,
    "lng": -95.4014578,
    "deliveries": 7,
    "source": "https://www.texaschildrens.org/locations/texas-childrens-hospital/west-tower",
    "coordinateSource": "https://www.openstreetmap.org/way/51816102",
    "direction": "bottom"
  },
  {
    "id": "methodist-baytown",
    "name": "Houston Methodist Baytown Hospital",
    "short": "Methodist Baytown",
    "type": "Hospital",
    "city": "Baytown",
    "address": "4401 Garth Rd, Baytown, TX 77521",
    "lat": 29.7680917,
    "lng": -94.9800189,
    "source": "https://www.houstonmethodist.org/contact-us/",
    "coordinateSource": "https://www.openstreetmap.org/way/51916249",
    "pad": "H07",
    "deliveries": 24,
    "direction": "top"
  },
  {
    "id": "methodist-clear-lake",
    "name": "Houston Methodist Clear Lake Hospital",
    "short": "Methodist Clear Lake",
    "type": "Hospital",
    "city": "Clear Lake",
    "address": "18300 Houston Methodist Dr, Houston, TX 77058",
    "lat": 29.5501643,
    "lng": -95.0870049,
    "source": "https://www.houstonmethodist.org/contact-us/",
    "coordinateSource": "https://www.openstreetmap.org/way/53790930",
    "pad": "H08",
    "deliveries": 17,
    "direction": "bottom"
  },
  {
    "id": "methodist-cypress",
    "name": "Houston Methodist Cypress Hospital",
    "short": "Methodist Cypress",
    "type": "Hospital",
    "city": "Cypress",
    "address": "24500 Northwest Fwy, Cypress, TX 77429",
    "lat": 29.9612605,
    "lng": -95.6817787,
    "source": "https://www.houstonmethodist.org/contact-us/",
    "coordinateSource": "https://www.openstreetmap.org/node/13724313501",
    "pad": "H09",
    "deliveries": 32,
    "direction": "left"
  },
  {
    "id": "methodist-sugar-land",
    "name": "Houston Methodist Sugar Land Hospital",
    "short": "Methodist Sugar Land",
    "type": "Hospital",
    "city": "Sugar Land",
    "address": "16655 Southwest Fwy, Sugar Land, TX 77479",
    "lat": 29.5896185,
    "lng": -95.6303337,
    "source": "https://www.houstonmethodist.org/contact-us/",
    "coordinateSource": "https://www.openstreetmap.org/way/506737198",
    "pad": "H10",
    "deliveries": 28,
    "direction": "right"
  },
  {
    "id": "methodist-woodlands",
    "name": "Houston Methodist The Woodlands Hospital",
    "short": "Methodist The Woodlands",
    "type": "Hospital",
    "city": "The Woodlands",
    "address": "17201 Interstate 45 S, The Woodlands, TX 77385",
    "lat": 30.2055971,
    "lng": -95.452096,
    "source": "https://www.houstonmethodist.org/contact-us/",
    "coordinateSource": "https://www.openstreetmap.org/way/568498513",
    "pad": "H11",
    "deliveries": 21,
    "direction": "top"
  },
  {
    "id": "methodist-west",
    "name": "Houston Methodist West Hospital",
    "short": "Methodist West",
    "type": "Hospital",
    "city": "West Houston",
    "address": "18500 Katy Fwy, Houston, TX 77094",
    "lat": 29.7872914,
    "lng": -95.6981067,
    "source": "https://www.houstonmethodist.org/contact-us/",
    "coordinateSource": "https://www.openstreetmap.org/way/567931778",
    "pad": "H12",
    "deliveries": 26,
    "direction": "bottom"
  },
  {
    "id": "methodist-willowbrook",
    "name": "Houston Methodist Willowbrook Hospital",
    "short": "Methodist Willowbrook",
    "type": "Hospital",
    "city": "Northwest Houston",
    "address": "18220 State Hwy 249, Houston, TX 77070",
    "lat": 29.9671381,
    "lng": -95.55113,
    "source": "https://www.houstonmethodist.org/contact-us/",
    "coordinateSource": "https://www.openstreetmap.org/way/511771474",
    "pad": "H13",
    "deliveries": 18,
    "direction": "left"
  },
  {
    "id": "mh-texas-medical-center",
    "name": "Memorial Hermann-Texas Medical Center",
    "short": "MH TMC",
    "type": "Medical center",
    "city": "Texas Medical Center",
    "address": "6411 Fannin St, Houston, TX 77030",
    "lat": 29.713811,
    "lng": -95.396382,
    "source": "https://memorialhermann.org/locations/texas-medical-center",
    "coordinateSource": "https://memorialhermann.org/locations/texas-medical-center",
    "pad": "H14",
    "deliveries": 42,
    "direction": "right"
  },
  {
    "id": "mh-cypress",
    "name": "Memorial Hermann Cypress Hospital",
    "short": "MH Cypress",
    "type": "Hospital",
    "city": "Cypress",
    "address": "27800 Northwest Freeway, Cypress, TX 77433",
    "lat": 29.9871,
    "lng": -95.733,
    "source": "https://memorialhermann.org/locations/cypress",
    "coordinateSource": "https://memorialhermann.org/locations/cypress",
    "pad": "H15",
    "deliveries": 29,
    "direction": "top"
  },
  {
    "id": "mh-katy",
    "name": "Memorial Hermann Katy Hospital",
    "short": "MH Katy",
    "type": "Hospital",
    "city": "Katy",
    "address": "23900 Katy Fwy, Katy, TX 77494",
    "lat": 29.7874,
    "lng": -95.7863,
    "source": "https://memorialhermann.org/locations/katy",
    "coordinateSource": "https://memorialhermann.org/locations/katy",
    "pad": "H16",
    "deliveries": 23,
    "direction": "bottom"
  },
  {
    "id": "mh-northeast",
    "name": "Memorial Hermann Northeast Hospital",
    "short": "MH Humble",
    "type": "Hospital",
    "city": "Humble",
    "address": "18951 North Memorial Dr, Humble, TX 77338",
    "lat": 29.9956,
    "lng": -95.2761,
    "source": "https://memorialhermann.org/locations/northeast",
    "coordinateSource": "https://memorialhermann.org/locations/northeast",
    "pad": "H17",
    "deliveries": 16,
    "direction": "left"
  },
  {
    "id": "mh-pearland",
    "name": "Memorial Hermann Pearland Hospital",
    "short": "MH Pearland",
    "type": "Hospital",
    "city": "Pearland",
    "address": "16100 South Fwy, Pearland, TX 77584",
    "lat": 29.5623,
    "lng": -95.3907,
    "source": "https://memorialhermann.org/locations/pearland",
    "coordinateSource": "https://memorialhermann.org/locations/pearland",
    "pad": "H18",
    "deliveries": 20,
    "direction": "right"
  },
  {
    "id": "mh-southeast",
    "name": "Memorial Hermann Southeast Hospital",
    "short": "MH Southeast",
    "type": "Hospital",
    "city": "Southeast Houston",
    "address": "11800 Astoria Blvd, Houston, TX 77089",
    "lat": 29.5826,
    "lng": -95.2075,
    "source": "https://memorialhermann.org/locations/southeast",
    "coordinateSource": "https://memorialhermann.org/locations/southeast",
    "pad": "H19",
    "deliveries": 14,
    "direction": "top"
  },
  {
    "id": "mh-southwest",
    "name": "Memorial Hermann Southwest Hospital",
    "short": "MH Southwest",
    "type": "Hospital",
    "city": "Southwest Houston",
    "address": "7600 Beechnut St, Houston, TX 77074",
    "lat": 29.6933,
    "lng": -95.5223,
    "source": "https://memorialhermann.org/locations/southwest",
    "coordinateSource": "https://memorialhermann.org/locations/southwest",
    "pad": "H20",
    "deliveries": 31,
    "direction": "bottom"
  },
  {
    "id": "mh-sugar-land",
    "name": "Memorial Hermann Sugar Land Hospital",
    "short": "MH Sugar Land",
    "type": "Hospital",
    "city": "Sugar Land",
    "address": "17500 West Grand Parkway South, Sugar Land, TX 77479",
    "lat": 29.5646825,
    "lng": -95.6906763,
    "source": "https://memorialhermann.org/locations/sugar-land",
    "coordinateSource": "https://memorialhermann.org/locations/sugar-land",
    "pad": "H21",
    "deliveries": 25,
    "direction": "left"
  },
  {
    "id": "mh-the-woodlands",
    "name": "Memorial Hermann The Woodlands Medical Center",
    "short": "MH The Woodlands",
    "type": "Medical center",
    "city": "The Woodlands",
    "address": "9250 Pinecroft Dr, The Woodlands, TX 77380",
    "lat": 30.1748,
    "lng": -95.4547,
    "source": "https://memorialhermann.org/locations/the-woodlands",
    "coordinateSource": "https://memorialhermann.org/locations/the-woodlands",
    "pad": "H22",
    "deliveries": 22,
    "direction": "right"
  },
  {
    "id": "md-anderson",
    "name": "UT MD Anderson Cancer Center",
    "short": "MD Anderson",
    "type": "Cancer hospital",
    "city": "Texas Medical Center",
    "address": "1515 Holcombe Blvd, Houston, TX 77030",
    "lat": 29.7076703,
    "lng": -95.3978436,
    "source": "https://www.mdanderson.org/about-md-anderson/our-locations/texas-medical-center.dir.html/1000",
    "coordinateSource": "https://www.openstreetmap.org/way/51815686",
    "pad": "H23",
    "deliveries": 35,
    "direction": "top"
  },
  {
    "id": "baylor-st-lukes",
    "name": "Baylor St. Luke’s Medical Center",
    "short": "Baylor St. Luke’s",
    "type": "Medical center",
    "city": "Texas Medical Center",
    "address": "1101 Bates Ave, Houston, TX 77030",
    "lat": 29.7081426,
    "lng": -95.4004414,
    "source": "https://www.commonspirit.org/find-a-location/commonspirit-baylor-stlukes-medical-center-houston-1733",
    "coordinateSource": "https://www.openstreetmap.org/way/43666730",
    "pad": "H24",
    "deliveries": 30,
    "direction": "bottom"
  }
];
const initialDeliveries = [
  {id:'HDN-2048',cargo:'Blood products',from:'central',to:'north',status:'In transit',priority:'Urgent',drone:'HD-001',eta:4,weight:1.2,created:'09:42',notes:''},
  {id:'HDN-2047',cargo:'Lab samples',from:'west',to:'central',status:'In transit',priority:'Routine',drone:'HD-004',eta:8,weight:.6,created:'09:38',notes:''},
  {id:'HDN-2046',cargo:'Medication',from:'central',to:'east',status:'In transit',priority:'Urgent',drone:'HD-007',eta:6,weight:.8,created:'09:35',notes:''},
  {id:'HDN-2045',cargo:'Lab samples',from:'south',to:'lab',status:'Preparing',priority:'Routine',drone:null,eta:16,weight:.4,created:'09:31',notes:''},
  {id:'HDN-2044',cargo:'Medical supplies',from:'east',to:'south',status:'In transit',priority:'Routine',drone:'HD-009',eta:11,weight:2.1,created:'09:28',notes:''},
  {id:'HDN-2043',cargo:'Lab samples',from:'north',to:'lab',status:'Delivered',priority:'Routine',drone:'HD-002',eta:0,weight:.7,created:'09:14',notes:''},
  {id:'HDN-2042',cargo:'Medication',from:'west',to:'north',status:'Delivered',priority:'Routine',drone:'HD-003',eta:0,weight:1,created:'09:07',notes:''},
  {id:'HDN-2041',cargo:'Blood products',from:'central',to:'west',status:'Delivered',priority:'Urgent',drone:'HD-005',eta:0,weight:1.4,created:'08:56',notes:''}
];
const FLEET_DRONE_MODEL='DJI Flycart30';
const FLEET_DRONE_IMAGE='assets/dji-flycart30.png';
const FLEET_MAX_PAYLOAD_KG=10;
const fleetDronePhoto=()=>'<img class="fleet-drone-photo" src="'+FLEET_DRONE_IMAGE+'" alt="'+FLEET_DRONE_MODEL+' cargo drone" width="1080" height="1080" loading="lazy">';
const initialFleet = Array.from({length:12}, (_,i) => ({id:`HD-${String(i+1).padStart(3,'0')}`,model:FLEET_DRONE_MODEL,maxPayloadKg:FLEET_MAX_PAYLOAD_KG,status:[0,3,6,8].includes(i)?'In flight':[9,10].includes(i)?'Charging':i===11?'Maintenance':'Available',battery:[87,96,91,72,100,94,81,98,65,34,22,0][i],location:facilities[i%6].id}));
// This copy has isolated browser storage and starts with all sample aircraft grounded.
for(const delivery of initialDeliveries){if(delivery.status==='In transit'){delivery.status='Preparing';delivery.drone=null;delivery.eta=0;}}
for(const drone of initialFleet){if(drone.status==='In flight')drone.status='Available';}
const storageKey='hdn-weather-aware-v1';
const state={view:'overview',filter:'All',query:'',page:1,zoom:1,fleetFilter:'All',deliveries:structuredClone(initialDeliveries),fleet:structuredClone(initialFleet),settings:{name:'Houston care network',email:'coordinator@example.com',motion:false}};
try { const saved=JSON.parse(localStorage.getItem(storageKey)||'null'); if(saved?.version===1 && Array.isArray(saved.deliveries) && Array.isArray(saved.fleet)){restoreCustomFacilities(saved.customFacilities);state.deliveries=saved.deliveries;state.fleet=saved.fleet;state.settings={...state.settings,...saved.settings};} } catch {}
// Apply the fleet configuration to saved units while preserving their IDs and current activity.
for(const drone of state.fleet){drone.model=FLEET_DRONE_MODEL;drone.maxPayloadKg=FLEET_MAX_PAYLOAD_KG;}
if(state.settings.name==='Central care network')state.settings.name='Houston care network';
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify({version:1,deliveries:state.deliveries,fleet:state.fleet,settings:state.settings,customFacilities:facilities.filter(f=>f.custom)}));return true;}catch{toast('Browser storage is unavailable. Changes will last for this session.');return false;}};
const facility = id => facilities.find(f=>f.id===id) || facilities[0];
const cargoIcon = cargo => ({'Blood products':'blood','Lab samples':'flask','Medication':'pill'}[cargo]||'package');
const statusClass = status => status.toLowerCase().replaceAll(' ','-');
const statusPill = status => `<span class="status-pill ${statusClass(status)}"><span class="status-dot"></span>${escapeHtml(status)}</span>`;
function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,4200);}
const viewMeta = {overview:['Network overview','Every flight brings essential care a little closer.'],deliveries:['Deliveries','Coordinate every package, from pickup to arrival.'],network:['Greater Houston network','24 hospitals. Find routes with hops of up to 10 miles.'],fleet:['Drone fleet','Ready for the next essential delivery.'],analytics:['Network analytics','A clearer picture of care in motion.'],settings:['Workspace settings','Make your coordination workspace work for you.']};
function setView(view){if(!viewMeta[view]) view='overview';state.view=view;state.page=1;state.filter='All';state.query='';state.fleetFilter='All';document.getElementById('sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'instant'});}
function render(){disposeHoustonMap();const [title,subtitle]=viewMeta[state.view];document.getElementById('page-title').innerHTML=`${title}<span class="heading-dot">.</span>`;document.getElementById('page-subtitle').textContent=state.view==='network'?facilities.length+' hospitals and labs. 10 mi clear / 5 mi low visibility per hop.':subtitle;document.getElementById('breadcrumb-view').textContent=state.view==='network'?'Hospital network':state.view==='fleet'?'Drone fleet':state.view.charAt(0).toUpperCase()+state.view.slice(1);document.querySelectorAll('.nav-item[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===state.view);el.setAttribute('aria-current',el.dataset.view===state.view?'page':'false');});document.getElementById('delivery-count').textContent=state.deliveries.filter(d=>d.status!=='Delivered').length;document.querySelector('.workspace>div').innerHTML=`${escapeHtml(state.settings.name)}<small>Houston, Texas</small>`;document.body.classList.toggle('reduce-motion',state.settings.motion);const views={overview:renderOverview,deliveries:renderDeliveries,network:renderNetwork,fleet:renderFleet,analytics:renderAnalytics,settings:renderSettings};document.getElementById('view-content').innerHTML=views[state.view]();hydrateIcons();mountHoustonMap();}
function stats(){const active=state.deliveries.filter(d=>d.status==='In transit').length;const ready=state.fleet.filter(d=>d.status==='Available').length;const data=[['Deliveries today',state.deliveries.length+18,'package',`${state.deliveries.filter(d=>d.status==='Delivered').length+18} completed`,'Today’s sample activity'],['Active flights',active,'drone',`${ready} drones available`,'Ready for takeoff'],['Houston facilities',facilities.length,'hospital',`${facilities.length} mapped facilities`,'Hospitals and added labs'],['On-time delivery','99.2<span>%</span>','clock','↑ 1.4%','30-day demo average']];return `<div class="stats-grid">${data.map(([title,val,ico,trend,context],i)=>`<article class="stat-card"><div class="stat-top">${title}<span class="stat-icon">${icon(ico)}</span></div><div class="stat-number">${val}</div><div class="stat-bottom"><span class="stat-trend">${i===0?icon('arrow-up-right'):i===2?'<span class="status-dot"></span>':''}${trend}</span></div><svg class="sparkline" viewBox="0 0 70 30" aria-hidden="true"><path d="M0 25 9 21 15 23 24 15 33 19 42 12 49 15 58 6 70 3" fill="none" stroke="${i===1?'#c8b886':'#b5c59e'}" stroke-width="1.5"/><path d="M0 25 9 21 15 23 24 15 33 19 42 12 49 15 58 6 70 3V30H0Z" fill="#f5f8ef"/></svg><span class="stat-context" style="font-size:8px;color:#a7b19b;display:block;margin-top:5px">${context}</span></article>`).join('')}</div>`;}
function renderOverview(){return `${stats()}<div class="overview-grid">${mapPanel()}${fleetSummary()}</div>${deliveryPanel(true)}<div class="mission-strip"><span class="mission-icon">${icon('leaf')}</span><div><strong>Smarter routes. More connected care.</strong><p>Explore how your network moves essential supplies between facilities.</p></div><button class="button text" data-view="analytics">Explore insights ${icon('arrow-right')}</button></div>`;}
function fleetSummary(){const count=s=>state.fleet.filter(d=>d.status===s).length;const flight=count('In flight'),available=count('Available'),charging=count('Charging');const rows=state.fleet.filter(d=>d.status==='In flight').slice(0,3);return `<section class="panel fleet-card"><div class="panel-head"><div><h2>Fleet at a glance</h2><p>${FLEET_DRONE_MODEL} · Up to ${FLEET_MAX_PAYLOAD_KG} kg</p></div></div><div class="fleet-summary"><div class="donut" style="background:conic-gradient(#3c6850 0 ${flight/12*100}%,#98af7f ${flight/12*100}% ${(flight+available)/12*100}%,#decda3 ${(flight+available)/12*100}% ${(flight+available+charging)/12*100}%,#e8ece2 ${(flight+available+charging)/12*100}%)"><div class="donut-center"><strong>12</strong><span>Total drones</span></div></div><div class="fleet-legend">${[['In flight','#3c6850'],['Available','#98af7f'],['Charging','#decda3'],['Maintenance','#d8ddce']].map(([s,c])=>`<p><span style="--c:${c}"></span>${s}<strong>${count(s)}</strong></p>`).join('')}</div></div>${rows.map(d=>`<div class="fleet-drone-row"><span class="drone-thumbnail">${fleetDronePhoto()}</span><div><strong>${d.id}</strong><p>In flight · ${facility(d.location).short}</p></div><span class="battery">${icon('battery')}${d.battery}%</span></div>`).join('')}<div class="fleet-bottom"><button class="button text" data-view="fleet">View drone fleet ${icon('arrow-right')}</button></div></section>`;}
function filteredDeliveries(){return state.deliveries.filter(d=>(state.filter==='All'||d.status===state.filter)&&(!state.query||[d.id,d.cargo,facility(d.from).name,facility(d.to).name,d.drone,d.priority].join(' ').toLowerCase().includes(state.query.toLowerCase())));}
function tableRows(rows){return rows.map(d=>`<tr><td><button class="delivery-id" data-delivery="${d.id}">${d.id}</button></td><td><div class="cargo-cell"><span class="cargo-icon">${icon(cargoIcon(d.cargo))}</span>${escapeHtml(d.cargo)}</div></td><td><div class="route-cell">${escapeHtml(facility(d.from).short)}${icon('arrow-right')}${escapeHtml(facility(d.to).short)}</div></td><td>${statusPill(d.status)}</td><td><span class="priority ${d.priority.toLowerCase()}">${d.priority==='Urgent'?icon('bolt'):''}${d.priority}</span></td><td data-delivery-eta="${d.id}">${d.status==='Delivered'?'Arrived':d.status==='Out of range'?'Over 10 mi':d.status==='Preparing'?'Queued':`${d.eta} min`}</td><td><button class="icon-button" data-delivery="${d.id}" aria-label="View delivery ${d.id}">${icon('chevron-right')}</button></td></tr>`).join('');}
function deliveryPanel(overview=false){const filtered=filteredDeliveries(),pageSize=overview?5:8,totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));state.page=Math.min(state.page,totalPages);const start=(state.page-1)*pageSize,rows=filtered.slice(start,start+pageSize);return `<section class="panel table-panel"><div class="panel-head"><div><h2>${overview?'Recent deliveries':'Delivery activity'}</h2><p>${overview?'The latest movements across your network':'Sample requests and their current journey'}</p></div>${overview?`<button class="button text" data-view="deliveries">View all deliveries ${icon('arrow-right')}</button>`:`<span class="live-pill">${state.deliveries.length} sample deliveries</span>`}</div><div class="table-toolbar"><div class="filter-tabs" role="group" aria-label="Filter deliveries">${['All','In transit','Delivered',...(state.deliveries.some(d=>d.status==='Out of range')?['Out of range']:[])].map(f=>`<button class="filter-tab ${state.filter===f?'active':''}" data-filter="${f}" aria-pressed="${state.filter===f}">${f}${f==='In transit'?`<span>${state.deliveries.filter(d=>d.status===f).length}</span>`:''}</button>`).join('')}</div><label class="search-field">${icon('search')}<input id="delivery-search" type="search" placeholder="Search deliveries…" value="${escapeHtml(state.query)}" aria-label="Search deliveries"></label></div><div class="table-scroll"><table><thead><tr><th>DELIVERY ID</th><th>PAYLOAD</th><th>ROUTE</th><th>STATUS</th><th>PRIORITY</th><th>ETA</th><th aria-label="Delivery details"></th></tr></thead><tbody>${rows.length?tableRows(rows):'<tr><td colspan="7"><div class="empty-state">No deliveries match this search. Try another route or delivery ID.</div></td></tr>'}</tbody></table></div><div class="table-bottom"><span>Showing ${rows.length?start+1:0}–${start+rows.length} of ${filtered.length} deliveries</span><div class="pagination"><button data-page="${state.page-1}" ${state.page===1?'disabled':''} aria-label="Previous page">${icon('chevron-left')}</button>${Array.from({length:totalPages},(_,i)=>`<button class="${state.page===i+1?'active':''}" data-page="${i+1}" aria-label="Page ${i+1}" ${state.page===i+1?'aria-current="page"':''}>${i+1}</button>`).join('')}<button data-page="${state.page+1}" ${state.page===totalPages?'disabled':''} aria-label="Next page">${icon('chevron-right')}</button></div></div></section>`;}
function renderDeliveries(){return `${stats()}${deliveryPanel()}`;}
function renderNetwork(){return `${mapPanel()}<section class="network-directory" aria-labelledby="directory-title"><div class="directory-head"><div><span class="directory-eyebrow">EXPLORE THE NETWORK</span><h2 id="directory-title">Facility directory <span>${facilities.length}</span></h2><p>Hospitals and labs, from the Medical Center to the surrounding communities.</p></div><div class="directory-join-actions"><button class="button secondary" data-join-network>${icon('plus')}Join the network</button><label class="directory-search">${icon('search')}<input id="hospital-search" type="search" placeholder="Search hospital or area" aria-label="Search facility directory"></label></div></div><p class="directory-results" id="directory-results" role="status">Showing all ${facilities.length} facilities</p><div class="hospital-grid">${facilities.map(f=>`<article class="panel hospital-card" data-hospital-search="${escapeHtml(`${f.name} ${f.city} ${f.address}`.toLowerCase())}"><div class="hospital-card-top"><span class="hospital-avatar ${f.custom?'joined-lab-avatar':''}">${icon(f.custom?'flask':'hospital')}</span><span class="live-pill ${f.custom?'joined-lab-badge':''}"><span class="status-dot"></span>${f.custom?'Joined lab':'Demo facility'}</span></div><h3>${escapeHtml(f.name)}</h3><p>${f.type}<br>${f.city}</p><p class="hospital-address">${escapeHtml(f.address)}</p><p class="hospital-range-count">${reachableHospitals(f.id).length?`${reachableHospitals(f.id).length} nearby ${reachableHospitals(f.id).length===1?'hospital':'hospitals'} within 10 mi`:'No hospital within 10 mi'}</p><div class="hospital-meta"><span><strong>${f.pad}</strong>Demo hub</span><span><strong>${f.deliveries}</strong>30-day sample deliveries</span></div><button class="button text" data-facility="${f.id}">Facility details ${icon('arrow-right')}</button></article>`).join('')}</div><div class="directory-empty" id="directory-empty" hidden>No matching hospitals. Try another name or area.</div></section>`;}
function renderFleet(){return `<div class="section-summary"><span class="status-dot"></span>${state.fleet.filter(d=>d.status==='Available').length} drones ready for a new delivery<span style="margin-left:auto">12 total drones</span></div><div class="filter-tabs" style="display:inline-flex;margin-bottom:20px" role="group" aria-label="Filter drones">${['All','In flight','Available','Charging','Maintenance'].map(s=>`<button class="filter-tab ${state.fleetFilter===s?'active':''}" data-fleet-filter="${s}" aria-pressed="${state.fleetFilter===s}">${s}</button>`).join('')}</div><div class="fleet-grid">${state.fleet.filter(d=>state.fleetFilter==='All'||state.fleetFilter===d.status).map(d=>`<article class="panel drone-card"><div class="drone-card-heading"><div><h3>${escapeHtml(d.model)}</h3><span class="drone-unit-id">${d.id}</span></div>${statusPill(d.status)}</div><div class="drone-large">${fleetDronePhoto()}</div><p>Medical cargo drone · ${facility(d.location).short}</p><div class="drone-card-meta drone-payload-meta"><span>Maximum payload</span><strong>${d.maxPayloadKg} kg</strong></div><div class="drone-card-meta"><span>Battery level</span><strong>${d.battery}%</strong></div><div class="battery-bar" style="--battery:${d.battery}%"><span></span></div><button class="button secondary" data-drone="${d.id}">View drone details ${icon('arrow-right')}</button></article>`).join('')}</div>`;}
function renderAnalytics(){const volumes=[18,23,21,31,27,24,26];return `${stats()}<div class="chart-layout"><section class="panel"><div class="panel-head"><div><h2>Deliveries over time</h2><p>Illustrative delivery volume across the network</p></div><span class="live-pill">Past 7 days</span></div><div class="volume-chart"><div class="chart-bars" role="img" aria-label="Sample delivery counts Monday 18, Tuesday 23, Wednesday 21, Thursday 31, Friday 27, Saturday 24, Sunday 26">${volumes.map(v=>`<div class="chart-day"><div class="chart-bar" style="--height:${v/35*100}%"><span>${v}</span></div></div>`).join('')}</div><div class="chart-labels">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span>${d}</span>`).join('')}</div><p class="chart-note">170 sample deliveries this week. These example figures show how network activity can be viewed over time.</p></div></section><section class="panel"><div class="panel-head"><div><h2>What’s moving</h2><p>Sample payload distribution</p></div></div><div class="cargo-distribution">${[['Lab samples',42,'#719367'],['Medication',28,'#9db887'],['Blood products',19,'#c0cfa7'],['Medical supplies',11,'#daca9f']].map(([name,v,c])=>`<div class="distribution-row"><div><span>${name}</span><strong>${v}%</strong></div><div class="distribution-track" style="--width:${v}%;--color:${c}"><span></span></div></div>`).join('')}<p class="chart-note">No patient information is used in this demo.</p></div></section></div><div class="mission-strip"><span class="mission-icon">${icon('clock')}</span><div><strong>Every minute has a destination.</strong><p>Track network trends and coordinate the next delivery from one workspace.</p></div><button class="button text" data-action="export">Export sample data ${icon('download')}</button></div>`;}
function renderSettings(){return `<section class="panel settings-panel"><h2>Your workspace</h2><p>Personalize this demo. Settings and delivery changes are saved in this browser.</p><form id="settings-form"><div class="form-grid"><label class="field">Network name<input name="name" required maxlength="40" value="${escapeHtml(state.settings.name)}"></label><label class="field">Contact email<input name="email" type="email" required value="${escapeHtml(state.settings.email)}"><small>Stored locally; no email is sent.</small></label></div><div class="settings-row"><div><strong>Reduce motion</strong><p>Turn off the animated route lines.</p></div><label class="switch"><input name="motion" type="checkbox" ${state.settings.motion?'checked':''} aria-label="Reduce motion"><span></span></label></div><div class="form-actions"><button class="button primary" type="submit">Save settings</button></div></form><div class="settings-row"><div><strong>Start fresh</strong><p>Restore the original sample deliveries and drone fleet.</p></div><button class="button secondary" data-action="reset-demo">Reset demo</button></div></section>`;}
let modalReturnFocus=null;
function openModal(title,body,eyebrow='DELIVERY COORDINATION'){disposeLabRegistration();const wasOpen=!document.getElementById('modal-backdrop').hidden;if(!wasOpen)modalReturnFocus=document.activeElement;document.getElementById('modal-title').textContent=title;document.getElementById('modal-eyebrow').textContent=eyebrow;document.getElementById('modal-body').innerHTML=body;document.getElementById('modal-backdrop').hidden=false;document.body.style.overflow='hidden';document.querySelector('.modal').scrollTop=0;hydrateIcons(document.getElementById('modal-backdrop'));setTimeout(()=>document.querySelector('#modal-body input, #modal-body select, .modal-header button')?.focus(),0);}
function closeModal(){disposeLabRegistration();document.getElementById('modal-backdrop').hidden=true;document.body.style.overflow='';if(modalReturnFocus?.isConnected)modalReturnFocus.focus();else document.querySelector('[data-action="new-delivery"]')?.focus();}
const demoNote=text=>`<div class="demo-note">${icon('info')}<span>${text}</span></div>`;
function deliveryDestinationOptions(from,selected){
  const destinations=facilities.filter(f=>f.id!==from).map(f=>({f,path:findShortestHospitalPath(from,f.id),physical:findShortestHospitalPath(from,f.id,{ignoreWeather:true})}));
  const available=destinations.filter(d=>d.path).sort((a,b)=>a.path.length-b.path.length||routeDistanceMiles(from,a.f.id)-routeDistanceMiles(from,b.f.id)),unavailable=destinations.filter(d=>!d.path);
  const option=({f,path,physical})=>'<option value="'+f.id+'" '+(!physical?'disabled':'')+' '+(selected===f.id?'selected':'')+'>'+escapeHtml(f.name)+' · '+(path?(path.length-1)+' '+(path.length===2?'hop':'hops'):physical?'Weather blocked':'No path')+'</option>';
  return '<option value="">Choose a destination hospital</option>'+(available.length?'<optgroup label="Available routes">'+available.map(option).join('')+'</optgroup>':'')+(unavailable.length?'<optgroup label="No available route">'+unavailable.map(option).join('')+'</optgroup>':'');
}
function updateDeliveryRange(keepDestination=true,defaultTo=''){
  const form=document.getElementById('delivery-form');if(!form)return;
  const from=form.elements.from.value,destination=form.elements.to,previous=defaultTo||(keepDestination?destination.value:'');
  const available=facilities.filter(f=>f.id!==from&&findShortestHospitalPath(from,f.id)),candidate=previous||available[0]?.id||'',candidatePath=findShortestHospitalPath(from,candidate,{ignoreWeather:true}),selected=candidatePath?.length>1?candidate:'';
  destination.innerHTML=deliveryDestinationOptions(from,selected);destination.value=selected;destination.disabled=!facilities.some(f=>f.id!==from&&findShortestHospitalPath(from,f.id,{ignoreWeather:true}));
  const path=selected?findShortestHospitalPath(from,selected):null,summary=document.getElementById('delivery-range-summary'),active=path&&activeDeliveryForPath(path),ready=state.fleet.some(f=>f.status==='Available');
  summary.classList.toggle('no-range',!path);
  if(path){const miles=path.slice(1).reduce((sum,id,i)=>sum+routeDistanceMiles(path[i],id),0);summary.innerHTML='<div><strong>'+formatRouteMiles(miles)+' mi · '+(path.length-1)+' '+(path.length===2?'hop':'hops')+'</strong><span>45 mph · Estimated flight '+formatHospitalFlightTime(hospitalRouteFlightTime(path)/1000)+' · 10 mi clear / 5 mi low visibility</span></div><p class="delivery-route-preview">'+path.map(id=>escapeHtml(facility(id).short)).join(' → ')+'</p>'+(active?'<span>This route already has a delivery in progress.</span>':!ready?'<span>No drones available. Wait for a delivery to arrive.</span>':'');}
  else summary.innerHTML='<div><strong>'+(selected?'No weather-safe path':destination.disabled?'No available path':'Choose a destination')+'</strong><span>'+(selected?'Rain blocks flight and low visibility limits hops to 5 miles. No allowed route connects these hospitals. Change the weather or destination.':destination.disabled?'This pickup hospital is disconnected from the current network. Choose another pickup.':'Select a hospital to find the fewest-hop route.')+'</span></div>';
  form.querySelector('[type="submit"]').disabled=!path||Boolean(active)||!ready;
  document.getElementById('delivery-error').hidden=true;
  renderFlightWeatherViews();queueFlightWeatherCheck(path);applyFlightWeatherToForm();
}
function newDelivery(defaultFrom=houstonRoutingState.source||houstonMapState.focus||'central',defaultTo=houstonRoutingState.destination||''){
  if(!facilities.some(f=>f.id===defaultFrom))defaultFrom='central';
  const options=facilities.map(f=>'<option value="'+f.id+'" '+(defaultFrom===f.id?'selected':'')+'>'+escapeHtml(f.name)+'</option>').join('');
  openModal('New delivery',demoNote('Simulated flight at 45 mph. Hops allow 10 miles in clear weather and 5 miles in low visibility. Routes can use intermediate hospitals.')+'<form id="delivery-form"><div class="form-grid"><label class="field">Pickup facility<select name="from" required>'+options+'</select></label><label class="field">Destination<select name="to" required aria-describedby="delivery-range-summary"></select></label><div class="delivery-range-summary field full" id="delivery-range-summary" role="status" aria-live="polite"></div><label class="field">Payload type<select name="cargo"><option>Lab samples</option><option>Medication</option><option>Blood products</option><option>Medical supplies</option></select></label><label class="field">Priority<select name="priority"><option>Routine</option><option>Urgent</option></select></label><label class="field">Payload weight (kg)<input name="weight" type="number" required min="0.1" max="'+FLEET_MAX_PAYLOAD_KG+'" step="0.1" value="0.5"><small>Payload range: 0.1–'+FLEET_MAX_PAYLOAD_KG+' kg</small></label><label class="field">Reference note (optional)<input name="notes" maxlength="100" placeholder="e.g. Laboratory transfer"><small>Use sample information only.</small></label></div>'+flightWeatherControls(true)+'<p class="form-error" id="delivery-error" role="alert" hidden></p><div class="form-actions"><button class="button secondary" type="button" data-action="close-modal">Cancel</button><button class="button primary" type="submit">Start delivery '+icon('arrow-right')+'</button></div></form>');
  updateDeliveryRange(false,defaultTo);
}

document.addEventListener('change',e=>{if(e.target.closest('#delivery-form')&&e.target.matches('select[name="from"],select[name="to"]'))updateDeliveryRange();});
function deliveryDetails(id){const d=state.deliveries.find(d=>d.id===id);if(!d)return;if(d.flight&&deliveryRouteIsValid(d)){hospitalFlightDetails(d);return;}const delivered=d.status==='Delivered',queued=d.status==='Preparing',inRange=routeWithinRange(d.from,d.to);if(!inRange&&!delivered){openModal(d.id,demoNote(routeRangeMessage(d.from,d.to))+'<div class="detail-route"><strong>'+escapeHtml(facility(d.from).short)+'</strong>'+icon('arrow-right')+'<strong>'+escapeHtml(facility(d.to).short)+'</strong></div>'+statusPill('Out of range')+'<p class="range-blocked-note">This request is kept for reference. A flight cannot start for this route.</p><div class="form-actions"><button class="button secondary" data-action="close-modal">Close</button><button class="button primary" data-pickup="'+d.from+'">Choose a nearby destination</button></div>','DELIVERY DETAILS');return;}openModal(d.id,`${demoNote('Sample tracking data. You can advance this demo delivery to explore each stage.')}<div class="detail-route"><div><strong>${escapeHtml(facility(d.from).short)}</strong><p>Pickup · ${facility(d.from).pad}</p></div>${icon('arrow-right')}<div><strong>${escapeHtml(facility(d.to).short)}</strong><p>Destination · ${facility(d.to).pad}</p></div></div>${statusPill(d.status)}<dl class="detail-grid"><div><dt>Direct distance</dt><dd>${formatRouteMiles(routeDistanceMiles(d.from,d.to))} mi · ${inRange?'Within 10 mi':'Exceeds current 10 mi limit'}</dd></div><div><dt>Payload</dt><dd>${escapeHtml(d.cargo)} · ${d.weight} kg</dd></div><div><dt>Priority</dt><dd>${d.priority}</dd></div><div><dt>Assigned drone</dt><dd>${d.drone||'Awaiting assignment'}</dd></div><div><dt>Estimated arrival</dt><dd>${delivered?'Arrived':queued?'Awaiting preparation':`${d.eta} minutes`}</dd></div>${d.notes?`<div style="grid-column:1/-1"><dt>Reference note</dt><dd>${escapeHtml(d.notes)}</dd></div>`:''}</dl><ol class="timeline"><li>Request created<small>${escapeHtml(d.created)} · Demo request received</small></li><li ${queued?'class="pending"':''}>Package picked up<small>${queued?'Waiting for drone assignment':'Payload collected at origin facility'}</small></li><li ${queued?'class="pending"':''}>In transit<small>${queued?'Ready after pickup':delivered?'Flight completed':'Drone traveling along the sample route'}</small></li><li ${delivered?'':'class="pending"'}>Delivered<small>${delivered?'Package received at destination':'Awaiting arrival at the destination'}</small></li></ol><div class="form-actions"><button class="button secondary" data-action="close-modal">Close</button>${!delivered?`<button class="button primary" data-advance="${d.id}">${queued?'Start demo flight':'Complete demo delivery'} ${icon('arrow-right')}</button>`:''}</div>`,'DELIVERY DETAILS');}
function facilityDetails(id){const f=facility(id);if(f.custom){memberLabDetails(f);return;}const related=state.deliveries.filter(d=>d.from===id||d.to===id);openModal(f.name,`${demoNote('Real Houston hospital location, used in a demo network. No hospital affiliation or active drone service is implied.')}<div style="display:flex;align-items:center;gap:12px"><span class="hospital-avatar">${icon('hospital')}</span><div><strong>${f.type}</strong><p style="font-size:11px;color:#7e916f;margin:6px 0">${f.city}</p></div></div><p class="facility-address">${escapeHtml(f.address)}</p><dl class="detail-grid"><div><dt>Demo hub</dt><dd>${f.pad} · Illustrative</dd></div><div><dt>Nearby hospitals</dt><dd>${reachableHospitals(f.id).length} within 10 miles</dd></div><div><dt>Maximum direct distance</dt><dd>10 miles</dd></div><div><dt>Campus coordinates</dt><dd>${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}</dd></div><div><dt>30-day sample deliveries</dt><dd>${f.deliveries}</dd></div><div><dt>Recent demo route activity</dt><dd>${related.length} deliveries</dd></div></dl><p class="facility-source"><a href="${f.source}" target="_blank" rel="noopener noreferrer">Official hospital location ↗</a><span>Campus pins are approximate; they are not landing pads.</span></p><div class="form-actions"><button class="button secondary" data-map-focus="${f.id}">Show on map ${icon('target')}</button><button class="button primary" data-pickup="${f.id}">New demo delivery ${icon('plus')}</button></div>`,'HOUSTON HOSPITAL NETWORK');}
function droneDetails(id){const d=state.fleet.find(d=>d.id===id);if(!d)return;const active=state.deliveries.find(s=>s.drone===id&&s.status==='In transit');openModal(d.model+' · '+d.id,`${demoNote('Demo fleet information. No real telemetry or flight controls are connected.')}<div class="drone-large drone-detail-image">${fleetDronePhoto()}</div>${statusPill(d.status)}<dl class="detail-grid"><div><dt>Battery level</dt><dd>${d.battery}%</dd></div><div><dt>Home facility</dt><dd>${escapeHtml(facility(d.location).short)}</dd></div><div><dt>Active delivery</dt><dd>${active?active.id:'No active delivery'}</dd></div><div><dt>Drone model</dt><dd>${escapeHtml(d.model)}</dd></div><div><dt>Maximum payload</dt><dd>${d.maxPayloadKg} kg</dd></div></dl><div class="form-actions"><button class="button secondary" data-action="close-modal">Close</button>${active?`<button class="button primary" data-delivery="${active.id}">Track delivery ${icon('arrow-right')}</button>`:''}${d.status==='Charging'?`<button class="button primary" data-charge="${id}">Complete demo charge ${icon('battery')}</button>`:''}</div>`,'DRONE FLEET');}
function enforceDeliveryRange(){
  const released=new Map();let changed=false;
  for(const delivery of state.deliveries){if(delivery.status==='Delivered'||deliveryRouteIsValid(delivery))continue;
    if(delivery.drone)released.set(delivery.drone,delivery.from);
    if(delivery.status!=='Out of range'||delivery.drone){delivery.previousStatus=delivery.status;delivery.status='Out of range';delivery.drone=null;delivery.eta=0;changed=true;}
  }
  for(const [id,from] of released){const drone=state.fleet.find(f=>f.id===id);if(drone&&!state.deliveries.some(d=>d.status==='In transit'&&d.drone===id)){drone.status='Available';drone.location=facilities.some(f=>f.id===from)?from:facilities[0].id;changed=true;}}
  if(changed)save();
}
function advanceDelivery(id){const d=state.deliveries.find(d=>d.id===id);if(!d)return;if(d.flight&&deliveryRouteIsValid(d)){hospitalFlightDetails(d);toast('This map delivery advances automatically through each hospital.');return;}if(!deliveryRouteIsValid(d)){toast(routeRangeMessage(d.from,d.to));return;}if(d.status==='Preparing'){if(!Number.isFinite(d.weight)||d.weight<.1||d.weight>FLEET_MAX_PAYLOAD_KG){toast('Payload must be between 0.1 and '+FLEET_MAX_PAYLOAD_KG+' kg.');return;}const path=[d.from,d.to];if(!flightWeatherIsClear(path)){queueFlightWeatherCheck(path);toast('Launch blocked until this route passes a fresh weather check. Use New delivery to review flight weather.');return;}const drone=state.fleet.find(f=>f.status==='Available');if(!drone){toast('No demo drones are available. Complete an active delivery or charge first.');return;}d.status='In transit';d.drone=drone.id;d.eta=12;drone.status='In flight';drone.location=d.from;}else if(d.status==='In transit'){d.status='Delivered';d.eta=0;const drone=state.fleet.find(f=>f.id===d.drone);if(drone){drone.status='Available';drone.location=d.to;drone.battery=Math.max(20,drone.battery-12);}}save();render();deliveryDetails(id);toast(d.status==='Delivered'?'Demo delivery completed. Drone is now available.':'Demo flight started. Tracking has been updated.');}
function exportReport(){const csvValue=v=>`"${String(v??'').replaceAll('"','""')}"`;const rows=[['Delivery ID','Payload','Pickup','Destination','Status','Priority','Drone','ETA minutes','Weight kg'],...state.deliveries.map(d=>[d.id,d.cargo,facility(d.from).name,facility(d.to).name,d.status,d.priority,d.drone||'',d.eta,d.weight])];const csv='Hospital Drone Network - SAMPLE DATA ONLY\r\n'+rows.map(r=>r.map(csvValue).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const link=document.createElement('a');link.href=url;link.download='hospital-drone-network-demo-report.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your sample delivery report has been exported.');}
function help(){openModal('A quick look around',`${demoNote('Version 1 uses real Houston geography and hospital addresses with simulated routes, operations, and browser-local storage.')}<div class="help-step"><span>1</span><div><h3>Explore your network</h3><p>Drag the Houston map, zoom into the Texas Medical Center, or choose a hospital from the map menu. Click a source hospital, then a destination to find the route with the fewest hops. Each hop stays within 10 miles. Use Hospital details or a route stop to view facility information.</p></div></div><div class="help-step"><span>2</span><div><h3>Create a sample delivery</h3><p>Choose a pickup and a hospital within 10 miles. The form shows direct distance and disables farther destinations. Add a payload and priority. The request appears in the delivery list as Preparing.</p></div></div><div class="help-step"><span>3</span><div><h3>Follow the journey</h3><p>Open a delivery to start its demo flight and mark it delivered. Fleet availability and map routes update together.</p></div></div><div class="help-step"><span>4</span><div><h3>Keep or reset your changes</h3><p>Demo changes stay in this browser. Export a CSV report, or restore the sample network in Settings.</p></div></div><button class="button primary" style="width:100%" data-action="close-modal">Got it ${icon('check')}</button>`,'HELP & RESOURCES');}
document.addEventListener('click',e=>{const target=e.target.closest('[data-action],[data-view],[data-filter],[data-page],[data-delivery],[data-facility],[data-drone],[data-pickup],[data-advance],[data-fleet-filter],[data-charge]');if(!target){if(e.target===document.getElementById('modal-backdrop'))closeModal();else if(!e.target.closest('.sidebar,.menu-toggle'))document.getElementById('sidebar').classList.remove('open');return;}if(target.dataset.view){location.hash=target.dataset.view;return;}if(target.dataset.filter){state.filter=target.dataset.filter;state.page=1;render();return;}if(target.dataset.page){state.page=Number(target.dataset.page);render();return;}if(target.dataset.delivery){deliveryDetails(target.dataset.delivery);return;}if(target.dataset.facility){facilityDetails(target.dataset.facility);return;}if(target.dataset.drone){droneDetails(target.dataset.drone);return;}if(target.dataset.pickup){newDelivery(target.dataset.pickup);return;}if(target.dataset.advance){advanceDelivery(target.dataset.advance);return;}if(target.dataset.fleetFilter){state.fleetFilter=target.dataset.fleetFilter;render();return;}if(target.dataset.charge){const drone=state.fleet.find(d=>d.id===target.dataset.charge);drone.battery=100;drone.status='Available';save();render();droneDetails(drone.id);toast('Demo charge completed. Drone is available.');return;}switch(target.dataset.action){case 'menu':document.getElementById('sidebar').classList.toggle('open');break;case 'new-delivery':newDelivery();break;case 'close-modal':closeModal();break;case 'help':help();break;case 'export':exportReport();break;case 'map-reset':fitHoustonNetwork();break;case 'notifications':openModal('Network updates',`${demoNote('These notifications illustrate the sample network activity.')}<div class="notification-row"><span class="cargo-icon">${icon('check')}</span><div><strong>Delivery received at Memorial City</strong><p>HDN-2041 · Blood products arrived at the destination facility.</p><small>Sample event · Earlier today</small></div></div><div class="notification-row"><span class="cargo-icon">${icon('battery')}</span><div><strong>Fleet ready for the next delivery</strong><p>${state.fleet.filter(d=>d.status==='Available').length} drones are currently available in this demo.</p><small>Current demo status</small></div></div><div class="notification-row"><span class="cargo-icon">${icon('network')}</span><div><strong>Houston demo network ready</strong><p>${facilities.length} hospital and lab locations across Greater Houston are available in this demo network.</p><small>Network status</small></div></div>`,'NOTIFICATIONS');break;case 'reset-demo':openModal('Reset the demo?',`<p style="font-size:12px;color:#8d9d7e;line-height:1.8">This will remove the deliveries you created and restore the original sample fleet. Your added labs and workspace settings will be kept.</p><div class="form-actions"><button class="button secondary" data-action="close-modal">Keep changes</button><button class="button primary" data-action="confirm-reset">Reset sample data</button></div>`,'WORKSPACE SETTINGS');break;case 'confirm-reset':state.deliveries=structuredClone(initialDeliveries);state.fleet=structuredClone(initialFleet);save();closeModal();render();toast('Original sample network restored.');break;}});
document.addEventListener('input',e=>{if(e.target.id==='delivery-search'){state.query=e.target.value;state.page=1;const overview=state.view==='overview',filtered=filteredDeliveries(),size=overview?5:8;const rows=filtered.slice(0,size);const panel=e.target.closest('.table-panel');panel.querySelector('tbody').innerHTML=rows.length?tableRows(rows):'<tr><td colspan="7"><div class="empty-state">No deliveries match this search. Try another route or delivery ID.</div></td></tr>';const totalPages=Math.max(1,Math.ceil(filtered.length/size));panel.querySelector('.table-bottom').innerHTML=`<span>Showing ${rows.length?1:0}–${rows.length} of ${filtered.length} deliveries</span><div class="pagination"><button disabled aria-label="Previous page">${icon('chevron-left')}</button>${Array.from({length:totalPages},(_,i)=>`<button class="${i===0?'active':''}" data-page="${i+1}" aria-label="Page ${i+1}">${i+1}</button>`).join('')}<button data-page="2" ${totalPages===1?'disabled':''} aria-label="Next page">${icon('chevron-right')}</button></div>`;}});
document.addEventListener('submit',e=>{if(e.target.id==='delivery-form'){e.preventDefault();const data=new FormData(e.target),from=data.get('from'),to=data.get('to');const error=document.getElementById('delivery-error');if(from===to){error.textContent='Choose a destination different from the pickup facility.';error.hidden=false;return;}const weight=Number(data.get('weight'));if(!facilities.some(f=>f.id===from)||!facilities.some(f=>f.id===to)||!Number.isFinite(weight)||weight<.1||weight>FLEET_MAX_PAYLOAD_KG){error.textContent='Please check the facilities and payload weight (0.1–'+FLEET_MAX_PAYLOAD_KG+' kg).';error.hidden=false;return;}const path=findShortestHospitalPath(from,to);if(!path||path.length<2){error.textContent='No allowed route connects these hospitals under the current weather and hop-distance limits.';error.hidden=false;return;}const cargo=String(data.get('cargo')),priority=String(data.get('priority'));if(!['Lab samples','Medication','Blood products','Medical supplies'].includes(cargo)||!['Routine','Urgent'].includes(priority)){error.textContent='Please check the payload and priority options.';error.hidden=false;return;}if(!state.fleet.some(f=>f.status==='Available')){error.textContent='No demo drones are available. Wait for a delivery to arrive.';error.hidden=false;return;}if(!flightWeatherIsClear(path)){queueFlightWeatherCheck(path);error.textContent='Delivery blocked. The route must pass a fresh weather check before launch.';error.hidden=false;return;}const delivery=startHospitalDelivery(path,{cargo,priority,weight,notes:String(data.get('notes')||'')});if(!delivery)return;closeModal();showHospitalDeliveryOnMap(delivery.id);}else if(e.target.id==='settings-form'){e.preventDefault();const data=new FormData(e.target);const name=String(data.get('name')).trim();if(!name){toast('Please enter a network name.');return;}state.settings={name,email:String(data.get('email')).trim(),motion:data.has('motion')};save();render();toast('Workspace settings saved in this browser.');}});
document.addEventListener('keydown',e=>{if(e.defaultPrevented)return;if(e.key==='Escape'){closeModal();document.getElementById('sidebar').classList.remove('open');}if(['Enter',' '].includes(e.key)&&e.target.matches('.map-node')){e.preventDefault();e.target.click();}if(e.key==='Tab'&&!document.getElementById('modal-backdrop').hidden){const focusable=[...document.querySelectorAll('.modal button,.modal input,.modal select,.modal a')].filter(el=>!el.disabled);const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
window.addEventListener('hashchange',()=>setView(location.hash.slice(1)));
enforceDeliveryRange();
reconcileHospitalDeliveries();
migrateHospitalDeliverySpeed();
reconcileHospitalDeliveries();
setView(location.hash.slice(1)||'overview');
initializeHospitalDeliveries();
initializeFlightWeather();

// Keep directory filtering local, so searching does not reset the map.
document.addEventListener('input',event=>{if(event.target.id!=='hospital-search')return;const query=event.target.value.trim().toLowerCase();let count=0;document.querySelectorAll('[data-hospital-search]').forEach(card=>{card.hidden=!card.dataset.hospitalSearch.includes(query);if(!card.hidden)count++;});document.getElementById('directory-results').textContent=query?`Showing ${count} of ${facilities.length} facilities`:`Showing all ${facilities.length} facilities`;document.getElementById('directory-empty').hidden=count>0;});
