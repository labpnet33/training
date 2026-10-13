var e={id:`pipeline-map`,h:{en:`The request pipeline: six stages and where to look`,hi:`Request pipeline: six stages aur kahan dekhna hai`},body:{en:`
<p>A courier parcel passes through a sorting centre: gate check, label scan, address check, route choice, delivery. If the parcel is late you do not ask "why is delivery slow?"; you ask <b>at which scan did it stop?</b> A RADIUS request in ClearPass works the same way. It passes a fixed series of checks, and each check leaves a trace in a different place. Knowing the order lets you jump straight to the stage that failed.</p>

<h3>The six stages</h3>
<ol>
<li><b>Network device (NAD) check.</b> The source IP of the RADIUS packet must match a configured network device and the shared secret must match for that device. Unknown device or wrong secret: the request is <b>silently dropped</b>, no reply. The Event Viewer logs it and the switch marks the server dead.</li>
<li><b>Service classification.</b> Services are tested top to bottom, first match wins. No match: error <b>9002</b>, "Failed to classify request to service".</li>
<li><b>Authentication.</b> The service lists methods (such as [EAP PEAP], [MAC AUTH]) and sources ([Local User Repository], [Endpoints Repository]). Wrong password: <b>215</b>. Unknown user or endpoint: <b>216</b>. Disabled account: <b>217</b>.</li>
<li><b>Authorization and role mapping.</b> A role-mapping policy turns attributes (for example Local:Department or Endpoint:Category) into ClearPass roles, with a default role.</li>
<li><b>Enforcement.</b> The enforcement policy chooses one or more enforcement profiles using conditions such as Tips:Role. No rule matches: the default profile, usually [Deny Access Profile].</li>
<li><b>Response.</b> The RADIUS profile returns attributes: Aruba-User-Role (a role name that must exist on the switch) or the three VLAN attributes.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Pipeline and instruments">
<rect x="10" y="20" width="96" height="56" rx="8" fill="#bae6fd"/><text x="58" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 NAD</text><text x="58" y="62" text-anchor="middle" class="svg-muted" font-size="11">IP + secret</text>
<rect x="116" y="20" width="96" height="56" rx="8" fill="#bae6fd"/><text x="164" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Service</text><text x="164" y="62" text-anchor="middle" class="svg-muted" font-size="11">rules, order</text>
<rect x="222" y="20" width="96" height="56" rx="8" fill="#ddd6fe"/><text x="270" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Authen</text><text x="270" y="62" text-anchor="middle" class="svg-muted" font-size="11">method, source</text>
<rect x="328" y="20" width="96" height="56" rx="8" fill="#ddd6fe"/><text x="376" y="44" text-anchor="middle" class="svg-ink" font-size="13">4 Role map</text><text x="376" y="62" text-anchor="middle" class="svg-muted" font-size="11">attrs to roles</text>
<rect x="434" y="20" width="96" height="56" rx="8" fill="#fde68a"/><text x="482" y="44" text-anchor="middle" class="svg-ink" font-size="13">5 Enforce</text><text x="482" y="62" text-anchor="middle" class="svg-muted" font-size="11">policy, profile</text>
<rect x="540" y="20" width="90" height="56" rx="8" fill="#bbf7d0"/><text x="585" y="44" text-anchor="middle" class="svg-ink" font-size="13">6 Response</text><text x="585" y="62" text-anchor="middle" class="svg-muted" font-size="11">role / VLAN</text>
<rect x="10" y="120" width="96" height="44" rx="8" fill="#e2e8f0"/><text x="58" y="147" text-anchor="middle" class="svg-ink" font-size="12">Event Viewer</text>
<rect x="116" y="120" width="414" height="44" rx="8" fill="#e2e8f0"/><text x="323" y="147" text-anchor="middle" class="svg-ink" font-size="12">Access Tracker: Summary, Input, Output, Alerts</text>
<rect x="540" y="120" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="585" y="147" text-anchor="middle" class="svg-ink" font-size="12">Switch show</text>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="13">Stage 1 failures never reach the Access Tracker. Stage 6 must be checked on the switch.</text>
</svg><p class="cap">Each stage leaves evidence in a different place.</p></div>

<h3>Why the switch is stage 7</h3>
<p>ClearPass ends at stage 6 with an Access-Accept. After that the NAD (the switch) has its own pipeline: does a role with exactly that name exist, does the role's VLAN exist, is that VLAN allowed on the uplink trunk, does DHCP answer. None of this is visible in ClearPass. That is why the module's first lab (cp-vlan-missing) fails <i>after</i> a perfect Accept.</p>

<h3>Mapping evidence to stages</h3>
<table class="cmp"><tr><th>Stage</th><th>Tool</th><th>Typical evidence</th></tr>
<tr><td>1 NAD</td><td>Event Viewer, switch <code>show radius-server</code></td><td>"not a registered network device" or "shared secret mismatch"; server shown as dead</td></tr>
<tr><td>2 Service</td><td>Tracker Summary / Alerts</td><td>Service (none), code 9002; or the wrong service name</td></tr>
<tr><td>3 Authentication</td><td>Tracker Alerts</td><td>215, 216, 217, 9005, 9006</td></tr>
<tr><td>4 to 5</td><td>Tracker Summary (Roles, Enforcement Profiles)</td><td>Unexpected role or profile, 9007 to 9010</td></tr>
<tr><td>6 Response</td><td>Tracker Output tab</td><td>Attributes returned; 9011 for incomplete VLAN attributes</td></tr>
<tr><td>7 Switch</td><td><code>show port-access clients detail</code>, <code>show port-access role</code>, <code>show vlan</code></td><td>Role not found, VLAN missing, wrong VLAN</td></tr></table>

<h3>Reading a pipeline from one record</h3>
<pre class="out">Summary
-------
  Login Status              : <span class="hl">ACCEPT</span>
  Username                  : bob
  Access Device Name        : ACCESS
  Service                   : Wired 802.1X
  Authentication Method     : [EAP PEAP]
  Authentication Source     : [Local User Repository]
  Roles                     : CONTRACTOR
  Enforcement Profiles      : EP-CONTRACTOR</pre>
<p>Read it top to bottom as the pipeline: the NAD is known (device name filled in), the service matched, the method and source worked, the role mapped, the profile applied. Everything up to stage 6 is healthy. If bob still has no network, the fault is at the switch.</p>

<div class="eg"><p><b>Worked example.</b> Four symptoms, four stages. (a) Switch says RADIUS server dead and no tracker row: stage 1. (b) Tracker row, service "(none)": stage 2. (c) Row with 215: stage 3. (d) Accept with role CONTRACTOR, but the switch shows no client: stage 7. Each takes one look, not one hour.</p></div>

<div class="warn"><p><b>Common mistake.</b> Looking at the Access Tracker for a stage 1 problem. A request that is dropped before classification may leave nothing in the tracker at all, and an empty list does not mean "users are not trying".</p></div>

<div class="exam"><p><b>Exam trap.</b> The order matters: NAD check, then service classification, then authentication, then role mapping, then enforcement. A question that puts enforcement before role mapping is wrong, because enforcement conditions use the roles that mapping produced (Tips:Role).</p></div>

<div class="scn"><h4>Silent drop after a switch swap</h4><p>A replaced access switch took the management address of the old one on a different VLAN interface. Users failed for an hour. The tracker was empty, so the helpdesk said "nobody is trying". The Event Viewer showed "RADIUS request dropped: not a registered network device".</p><p><b>Lesson:</b> an empty tracker plus a dead RADIUS server on the switch points to stage 1. Read the Event Viewer.</p></div>

<div class="iv"><p class="q">"Walk me through what ClearPass does with a RADIUS request."</p><p>NAD check by source IP and secret, then service classification (top-down, first match), authentication method and source, role mapping, enforcement policy and profile, then the response attributes. I add that the NAD still has to apply them, so I verify the switch side too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Six ClearPass stages: NAD, service, authentication, role mapping, enforcement, response.</li>
<li>Stage 1 drops are silent and visible only in the Event Viewer and on the switch.</li>
<li>The Access Tracker records stages 2 to 6.</li>
<li>A perfect Accept can still fail at the switch: role name, VLAN, trunk, DHCP.</li>
<li>Name the stage first, then choose the tool.</li>
</ul></div>
`,hi:`
<p>Courier parcel ek sorting centre se guzarta hai: gate check, label scan, address check, route choice, delivery. Parcel late ho to aap "delivery slow kyon hai?" nahi poochte; aap poochte ho <b>kis scan par ruka?</b> ClearPass mein RADIUS request bhi isi tarah chalti hai. Woh checks ki ek fixed series se guzarti hai, aur har check alag jagah trace chhodta hai. Order pata ho to aap seedha us stage par jaa sakte ho jo fail hua.</p>

<h3>Six stages</h3>
<ol>
<li><b>Network device (NAD) check.</b> RADIUS packet ka source IP kisi configured network device se match hona chahiye aur us device ke liye shared secret bhi match hona chahiye. Unknown device ya galat secret: request <b>silently drop</b> hoti hai, koi reply nahi. Event Viewer ise log karta hai aur switch server ko dead mark karta hai.</li>
<li><b>Service classification.</b> Services top se bottom test hoti hain, first match jeetta hai. Koi match nahi: error <b>9002</b>, "Failed to classify request to service".</li>
<li><b>Authentication.</b> Service methods (jaise [EAP PEAP], [MAC AUTH]) aur sources ([Local User Repository], [Endpoints Repository]) list karti hai. Galat password: <b>215</b>. Unknown user ya endpoint: <b>216</b>. Disabled account: <b>217</b>.</li>
<li><b>Authorization aur role mapping.</b> Role-mapping policy attributes (jaise Local:Department ya Endpoint:Category) ko ClearPass roles mein badalti hai, default role ke saath.</li>
<li><b>Enforcement.</b> Enforcement policy conditions (jaise Tips:Role) se ek ya zyada enforcement profiles chunti hai. Koi rule match nahi: default profile, usually [Deny Access Profile].</li>
<li><b>Response.</b> RADIUS profile attributes return karta hai: Aruba-User-Role (ek role name jo switch par exist karna chahiye) ya teen VLAN attributes.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Pipeline and instruments">
<rect x="10" y="20" width="96" height="56" rx="8" fill="#bae6fd"/><text x="58" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 NAD</text><text x="58" y="62" text-anchor="middle" class="svg-muted" font-size="11">IP + secret</text>
<rect x="116" y="20" width="96" height="56" rx="8" fill="#bae6fd"/><text x="164" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Service</text><text x="164" y="62" text-anchor="middle" class="svg-muted" font-size="11">rules, order</text>
<rect x="222" y="20" width="96" height="56" rx="8" fill="#ddd6fe"/><text x="270" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Authen</text><text x="270" y="62" text-anchor="middle" class="svg-muted" font-size="11">method, source</text>
<rect x="328" y="20" width="96" height="56" rx="8" fill="#ddd6fe"/><text x="376" y="44" text-anchor="middle" class="svg-ink" font-size="13">4 Role map</text><text x="376" y="62" text-anchor="middle" class="svg-muted" font-size="11">attrs to roles</text>
<rect x="434" y="20" width="96" height="56" rx="8" fill="#fde68a"/><text x="482" y="44" text-anchor="middle" class="svg-ink" font-size="13">5 Enforce</text><text x="482" y="62" text-anchor="middle" class="svg-muted" font-size="11">policy, profile</text>
<rect x="540" y="20" width="90" height="56" rx="8" fill="#bbf7d0"/><text x="585" y="44" text-anchor="middle" class="svg-ink" font-size="13">6 Response</text><text x="585" y="62" text-anchor="middle" class="svg-muted" font-size="11">role / VLAN</text>
<rect x="10" y="120" width="96" height="44" rx="8" fill="#e2e8f0"/><text x="58" y="147" text-anchor="middle" class="svg-ink" font-size="12">Event Viewer</text>
<rect x="116" y="120" width="414" height="44" rx="8" fill="#e2e8f0"/><text x="323" y="147" text-anchor="middle" class="svg-ink" font-size="12">Access Tracker: Summary, Input, Output, Alerts</text>
<rect x="540" y="120" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="585" y="147" text-anchor="middle" class="svg-ink" font-size="12">Switch show</text>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="13">Stage 1 failure Access Tracker tak nahi pahunchte. Stage 6 switch par check hota hai.</text>
</svg><p class="cap">Har stage alag jagah evidence chhodta hai.</p></div>

<h3>Switch stage 7 kyon hai</h3>
<p>ClearPass stage 6 par Access-Accept ke saath khatam ho jaata hai. Uske baad NAD (switch) ki apni pipeline hoti hai: kya exactly us naam ka role exist karta hai, kya role ka VLAN exist karta hai, kya woh VLAN uplink trunk par allowed hai, kya DHCP jawab deta hai. Yeh sab ClearPass mein dikhta nahi. Isi liye module ka pehla lab (cp-vlan-missing) ek perfect Accept ke <i>baad</i> fail hota hai.</p>

<h3>Evidence ko stages se map karna</h3>
<table class="cmp"><tr><th>Stage</th><th>Tool</th><th>Typical evidence</th></tr>
<tr><td>1 NAD</td><td>Event Viewer, switch <code>show radius-server</code></td><td>"not a registered network device" ya "shared secret mismatch"; server dead dikhta hai</td></tr>
<tr><td>2 Service</td><td>Tracker Summary / Alerts</td><td>Service (none), code 9002; ya galat service name</td></tr>
<tr><td>3 Authentication</td><td>Tracker Alerts</td><td>215, 216, 217, 9005, 9006</td></tr>
<tr><td>4 se 5</td><td>Tracker Summary (Roles, Enforcement Profiles)</td><td>Unexpected role ya profile, 9007 se 9010</td></tr>
<tr><td>6 Response</td><td>Tracker Output tab</td><td>Return hue attributes; incomplete VLAN attributes ke liye 9011</td></tr>
<tr><td>7 Switch</td><td><code>show port-access clients detail</code>, <code>show port-access role</code>, <code>show vlan</code></td><td>Role not found, VLAN missing, wrong VLAN</td></tr></table>

<h3>Ek record se pipeline padhna</h3>
<pre class="out">Summary
-------
  Login Status              : <span class="hl">ACCEPT</span>
  Username                  : bob
  Access Device Name        : ACCESS
  Service                   : Wired 802.1X
  Authentication Method     : [EAP PEAP]
  Authentication Source     : [Local User Repository]
  Roles                     : CONTRACTOR
  Enforcement Profiles      : EP-CONTRACTOR</pre>
<p>Ise upar se neeche pipeline ki tarah padho: NAD known hai (device name bhara hua hai), service match hui, method aur source chale, role map hua, profile apply hua. Stage 6 tak sab healthy hai. Agar bob ko phir bhi network nahi mil raha, to fault switch par hai.</p>

<div class="eg"><p><b>Worked example.</b> Chaar symptoms, chaar stages. (a) Switch kehta hai RADIUS server dead aur koi tracker row nahi: stage 1. (b) Tracker row, service "(none)": stage 2. (c) Row with 215: stage 3. (d) Accept with role CONTRACTOR, par switch par koi client nahi: stage 7. Har ek ke liye ek nazar, ek ghanta nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Stage 1 problem ke liye Access Tracker dekhna. Classification se pehle drop hui request tracker mein kuch chhod hi nahi sakti, aur empty list ka matlab "users try nahi kar rahe" nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order important hai: NAD check, phir service classification, phir authentication, phir role mapping, phir enforcement. Jo question enforcement ko role mapping se pehle rakhe woh galat hai, kyunki enforcement conditions (Tips:Role) us role ko use karti hain jo mapping ne banaya.</p></div>

<div class="scn"><h4>Switch swap ke baad silent drop</h4><p>Ek replaced access switch ne purane switch ka management address alag VLAN interface par le liya. Users ek ghanta fail hote rahe. Tracker empty tha, to helpdesk ne kaha "koi try hi nahi kar raha". Event Viewer ne dikhaya "RADIUS request dropped: not a registered network device".</p><p><b>Lesson:</b> empty tracker aur switch par dead RADIUS server stage 1 ki taraf ishara karte hain. Event Viewer padho.</p></div>

<div class="iv"><p class="q">"Mujhe batao ClearPass RADIUS request ke saath kya karta hai."</p><p>Source IP aur secret se NAD check, phir service classification (top-down, first match), authentication method aur source, role mapping, enforcement policy aur profile, phir response attributes. Main yeh bhi jodta hoon ki NAD ko unhe apply karna hota hai, isliye main switch side bhi verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Six ClearPass stages: NAD, service, authentication, role mapping, enforcement, response.</li>
<li>Stage 1 drops silent hote hain aur sirf Event Viewer aur switch par dikhte hain.</li>
<li>Access Tracker stages 2 se 6 record karta hai.</li>
<li>Perfect Accept bhi switch par fail ho sakta hai: role name, VLAN, trunk, DHCP.</li>
<li>Pehle stage ka naam lo, phir tool chuno.</li>
</ul></div>
`}};export{e as default};