var e={id:`access-tracker`,h:{en:`The Access Tracker: reading every request`,hi:`Access Tracker: har request ko padhna`},body:{en:`
<p>Every shop has a CCTV recorder. When something goes missing nobody argues about memory; you rewind the tape. The <b>Access Tracker</b> is the recorder of ClearPass: it keeps one record for each RADIUS request that reached the policy engine, with what came in, which decisions were taken and what went out. In the real product you open it under <b>Monitoring &gt; Live Monitoring &gt; Access Tracker</b>. In the lab shell the same data is under <code>monitoring access-tracker</code>.</p>

<h3>The list view</h3>
<p>The list shows one row per request: time, login status (ACCEPT or REJECT), username or MAC, the access device (NAD), the service that handled it and the enforcement profile. In the real GUI you can filter by username, service, login status and time range, and add columns. Rule of thumb: <b>filter by the identity or MAC of the affected user first, then read the newest row</b>. Old rows from last week confuse beginners.</p>
<pre class="code"><span class="c">! Lab shell (GUI: Monitoring > Live Monitoring > Access Tracker)</span>
CPPM# monitoring access-tracker
CPPM# monitoring access-tracker detail latest summary
CPPM# monitoring access-tracker detail alice alerts
CPPM# monitoring access-tracker detail 00:50:67:fb:67:01 input</pre>
<p><code>detail</code> accepts a request ID, a MAC address, a username or the word <code>latest</code>, followed by one tab name: <code>summary</code>, <code>input</code>, <code>output</code> or <code>alerts</code>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Four tabs of a record">
<rect x="10" y="20" width="145" height="110" rx="8" fill="#bae6fd"/><text x="82" y="44" text-anchor="middle" class="svg-ink" font-size="14">Summary</text><text x="82" y="68" text-anchor="middle" class="svg-muted" font-size="11">status, service,</text><text x="82" y="84" text-anchor="middle" class="svg-muted" font-size="11">method, roles,</text><text x="82" y="100" text-anchor="middle" class="svg-muted" font-size="11">profiles</text>
<rect x="170" y="20" width="145" height="110" rx="8" fill="#ddd6fe"/><text x="242" y="44" text-anchor="middle" class="svg-ink" font-size="14">Input</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="11">username, NAD IP,</text><text x="242" y="84" text-anchor="middle" class="svg-muted" font-size="11">RADIUS request</text><text x="242" y="100" text-anchor="middle" class="svg-muted" font-size="11">attributes</text>
<rect x="330" y="20" width="145" height="110" rx="8" fill="#bbf7d0"/><text x="402" y="44" text-anchor="middle" class="svg-ink" font-size="14">Output</text><text x="402" y="68" text-anchor="middle" class="svg-muted" font-size="11">profiles applied,</text><text x="402" y="84" text-anchor="middle" class="svg-muted" font-size="11">RADIUS response</text><text x="402" y="100" text-anchor="middle" class="svg-muted" font-size="11">attributes</text>
<rect x="490" y="20" width="140" height="110" rx="8" fill="#fed7aa"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="14">Alerts</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">error code,</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">category,</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">message</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Question per tab: what happened? what came in? what went out? why did it fail?</text>
</svg><p class="cap">The four tabs of one Access Tracker record.</p></div>

<h3>Summary: what happened</h3>
<pre class="out">Summary
-------
  Request ID                : R00000103-01-5a3c91e2
  Login Status              : <span class="hl">REJECT</span>
  End-Host Identifier       : 00-50-2f-e9-9a-01
  Username                  : alice
  Access Device IP/Port     : 10.20.99.2:1/1/3
  Access Device Name        : ACCESS

Policies Used
-------------
  Service                   : Wired 802.1X
  Authentication Method     : [EAP PEAP]
  Authentication Source     : [Local User Repository]
  Roles                     : -
  Enforcement Profiles      : -</pre>
<p>Notice that Roles and Enforcement Profiles are empty: the request died in stage 3, before role mapping. The Summary alone tells you <i>how far</i> the request got. The service name tells you which service claimed it, which is the first thing to check when the user lands in a strange role.</p>

<h3>Input: what came in</h3>
<p>The Input tab shows the identity and the RADIUS attributes the switch sent. Two attributes matter most for services: <b>NAS-Port-Type</b> (Ethernet 15 for wired, Wireless-802.11 19 for wireless) and <b>Service-Type</b> (Framed-User 2 for 802.1X, Call-Check 10 for MAC authentication). Also read <b>NAS-IP-Address</b> (the NAD) and <b>Calling-Station-Id</b> (the client MAC). If a service rule does not match, the Input tab shows you the real values to compare with.</p>

<h3>Output: what went out</h3>
<pre class="out">Output
------
  Enforcement Profiles      : EP-CONTRACTOR
  RADIUS Response
  Radius:Aruba:Aruba-User-Role           = <span class="hl">CONTRACTOR</span></pre>
<p>This is the exact promise ClearPass made to the switch. Compare it character by character with the switch configuration: role name case matters, and a VLAN attribute needs all three attributes (Tunnel-Type, Tunnel-Medium-Type, Tunnel-Private-Group-Id).</p>

<h3>Alerts: why it failed</h3>
<pre class="out">Alerts
------
  Error Code                : <span class="hl">215</span>
  Error Category            : Authentication failure
  Error Message             : Authentication failed: password mismatch (MSCHAPv2)</pre>
<p>The Alerts tab is the shortest path from "REJECT" to a cause. Chapter 4 explains the codes.</p>

<h3>Acting from the Access Tracker</h3>
<p>In the real product you can send a Change of Authorization or a disconnect to a session from the record, for example when you changed policy and want the user re-evaluated. This uses RFC 5176 on UDP port 3799 and needs two things: the NAD entry in ClearPass has CoA enabled on that port, and the switch has <code>radius dyn-authorization</code> enabled with the same secret. The lab shell has <code>monitoring access-tracker disconnect MAC</code> and <code>reauthorize MAC</code>. If you only changed a policy, remember: <b>enforcement runs at login</b>, so an old session keeps its old role until it is reauthenticated.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "LAPTOP2 got VLAN 10, should be 20." Filter by bob. Summary: Service Wired 802.1X, Roles EMPLOYEE (expected CONTRACTOR). The role mapping gave the wrong role, so this is stage 4, not the switch. Without the Summary you might have edited switch VLANs for an hour.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading the oldest row, or the row of a different user with a similar name. Always match the MAC or the time of your own test, and confirm the Access Device IP is the switch you are troubleshooting.</p></div>

<div class="exam"><p><b>Exam trap.</b> The Access Tracker shows what ClearPass decided; it cannot prove that the switch applied it. Also, a REJECT in the tracker is not the same as a silent drop: dropped requests are in the Event Viewer.</p></div>

<div class="scn"><h4>Printer lands in the employee role</h4><p>A new printer was authorised by MAC but joined VLAN 10. The helpdesk edited switch ports. The tracker Summary showed the service "Wired Allow-All Test" had handled it, left over from a pilot. Moving the production service to the top fixed it.</p><p><b>Lesson:</b> read the Service line of the Summary before changing anything else.</p></div>

<div class="iv"><p class="q">"What do the tabs of an Access Tracker record tell you?"</p><p>Summary: result, service, method, roles, profiles. Input: identity and request attributes. Output: profiles and the attributes returned. Alerts: error code and message. I read Summary for how far it got, then Alerts or Output depending on the symptom.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>One record per request that reached the policy engine.</li>
<li>Summary shows how far the request got; empty Roles means it failed earlier.</li>
<li>Input holds the real attribute values for service rules; Output holds what the switch must apply.</li>
<li>Alerts give the error code and message.</li>
<li>Disconnect and reauthorize act on live sessions; policy changes alone do not.</li>
</ul></div>
`,hi:`
<p>Har dukaan mein CCTV recorder hota hai. Kuch gum ho jaaye to koi yaaddaasht par behas nahi karta; aap tape rewind karte ho. <b>Access Tracker</b> ClearPass ka recorder hai: policy engine tak pahunchi har RADIUS request ka ek record rakhta hai, jisme kya aaya, kaun se decisions hue aur kya bahar gaya. Real product mein ise <b>Monitoring &gt; Live Monitoring &gt; Access Tracker</b> mein kholte hain. Lab shell mein wahi data <code>monitoring access-tracker</code> ke neeche hai.</p>

<h3>List view</h3>
<p>List mein har request ki ek row hoti hai: time, login status (ACCEPT ya REJECT), username ya MAC, access device (NAD), jis service ne handle kiya aur enforcement profile. Real GUI mein aap username, service, login status aur time range se filter kar sakte ho, aur columns add kar sakte ho. Rule of thumb: <b>pehle affected user ki identity ya MAC se filter karo, phir sabse nayi row padho</b>. Pichhle hafte ki purani rows beginners ko confuse karti hain.</p>
<pre class="code"><span class="c">! Lab shell (GUI: Monitoring > Live Monitoring > Access Tracker)</span>
CPPM# monitoring access-tracker
CPPM# monitoring access-tracker detail latest summary
CPPM# monitoring access-tracker detail alice alerts
CPPM# monitoring access-tracker detail 00:50:67:fb:67:01 input</pre>
<p><code>detail</code> ek request ID, MAC address, username ya word <code>latest</code> leta hai, uske baad ek tab name: <code>summary</code>, <code>input</code>, <code>output</code> ya <code>alerts</code>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Four tabs of a record">
<rect x="10" y="20" width="145" height="110" rx="8" fill="#bae6fd"/><text x="82" y="44" text-anchor="middle" class="svg-ink" font-size="14">Summary</text><text x="82" y="68" text-anchor="middle" class="svg-muted" font-size="11">status, service,</text><text x="82" y="84" text-anchor="middle" class="svg-muted" font-size="11">method, roles,</text><text x="82" y="100" text-anchor="middle" class="svg-muted" font-size="11">profiles</text>
<rect x="170" y="20" width="145" height="110" rx="8" fill="#ddd6fe"/><text x="242" y="44" text-anchor="middle" class="svg-ink" font-size="14">Input</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="11">username, NAD IP,</text><text x="242" y="84" text-anchor="middle" class="svg-muted" font-size="11">RADIUS request</text><text x="242" y="100" text-anchor="middle" class="svg-muted" font-size="11">attributes</text>
<rect x="330" y="20" width="145" height="110" rx="8" fill="#bbf7d0"/><text x="402" y="44" text-anchor="middle" class="svg-ink" font-size="14">Output</text><text x="402" y="68" text-anchor="middle" class="svg-muted" font-size="11">profiles applied,</text><text x="402" y="84" text-anchor="middle" class="svg-muted" font-size="11">RADIUS response</text><text x="402" y="100" text-anchor="middle" class="svg-muted" font-size="11">attributes</text>
<rect x="490" y="20" width="140" height="110" rx="8" fill="#fed7aa"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="14">Alerts</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">error code,</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">category,</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">message</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Har tab ka sawaal: kya hua? kya aaya? kya gaya? kyon fail hua?</text>
</svg><p class="cap">Ek Access Tracker record ke chaar tabs.</p></div>

<h3>Summary: kya hua</h3>
<pre class="out">Summary
-------
  Request ID                : R00000103-01-5a3c91e2
  Login Status              : <span class="hl">REJECT</span>
  End-Host Identifier       : 00-50-2f-e9-9a-01
  Username                  : alice
  Access Device IP/Port     : 10.20.99.2:1/1/3
  Access Device Name        : ACCESS

Policies Used
-------------
  Service                   : Wired 802.1X
  Authentication Method     : [EAP PEAP]
  Authentication Source     : [Local User Repository]
  Roles                     : -
  Enforcement Profiles      : -</pre>
<p>Dekho ki Roles aur Enforcement Profiles empty hain: request stage 3 mein mar gayi, role mapping se pehle. Akela Summary batata hai ki request <i>kitni door</i> pahunchi. Service name batata hai kis service ne request claim ki, aur user kisi ajeeb role mein aaye to sabse pehle yahi check karna hai.</p>

<h3>Input: kya aaya</h3>
<p>Input tab identity aur woh RADIUS attributes dikhata hai jo switch ne bheje. Services ke liye do attributes sabse zaroori hain: <b>NAS-Port-Type</b> (wired ke liye Ethernet 15, wireless ke liye Wireless-802.11 19) aur <b>Service-Type</b> (802.1X ke liye Framed-User 2, MAC authentication ke liye Call-Check 10). Saath mein <b>NAS-IP-Address</b> (NAD) aur <b>Calling-Station-Id</b> (client MAC) bhi padho. Service rule match na kare to Input tab asli values dikhata hai jinse compare karna hai.</p>

<h3>Output: kya gaya</h3>
<pre class="out">Output
------
  Enforcement Profiles      : EP-CONTRACTOR
  RADIUS Response
  Radius:Aruba:Aruba-User-Role           = <span class="hl">CONTRACTOR</span></pre>
<p>Yeh woh exact promise hai jo ClearPass ne switch se kiya. Ise switch configuration se character by character compare karo: role name ka case matter karta hai, aur VLAN attribute ke liye teeno attributes chahiye (Tunnel-Type, Tunnel-Medium-Type, Tunnel-Private-Group-Id).</p>

<h3>Alerts: kyon fail hua</h3>
<pre class="out">Alerts
------
  Error Code                : <span class="hl">215</span>
  Error Category            : Authentication failure
  Error Message             : Authentication failed: password mismatch (MSCHAPv2)</pre>
<p>Alerts tab "REJECT" se cause tak ka sabse chhota rasta hai. Chapter 4 codes samjhata hai.</p>

<h3>Access Tracker se action lena</h3>
<p>Real product mein aap record se session par Change of Authorization ya disconnect bhej sakte ho, jaise jab aapne policy badli aur user ko re-evaluate karana hai. Yeh UDP port 3799 par RFC 5176 use karta hai aur do cheezein chahiye: ClearPass mein NAD entry par us port par CoA enabled ho, aur switch par same secret ke saath <code>radius dyn-authorization</code> enabled ho. Lab shell mein <code>monitoring access-tracker disconnect MAC</code> aur <code>reauthorize MAC</code> hain. Agar sirf policy badli, to yaad rakho: <b>enforcement login ke time chalta hai</b>, isliye purana session apna purana role tab tak rakhta hai jab tak reauthenticate na ho.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "LAPTOP2 ko VLAN 10 mila, 20 chahiye." bob se filter karo. Summary: Service Wired 802.1X, Roles EMPLOYEE (expected CONTRACTOR). Role mapping ne galat role diya, yani yeh stage 4 hai, switch nahi. Summary ke bina aap ek ghanta switch VLANs edit karte rehte.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sabse purani row padhna, ya milte-julte naam wale doosre user ki row. Hamesha apne test ka MAC ya time match karo, aur confirm karo ki Access Device IP wahi switch hai jisse aap troubleshoot kar rahe ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Access Tracker dikhata hai ClearPass ne kya decide kiya; woh prove nahi kar sakta ki switch ne apply kiya. Aur tracker mein REJECT silent drop ke barabar nahi hai: dropped requests Event Viewer mein hoti hain.</p></div>

<div class="scn"><h4>Printer employee role mein aa gaya</h4><p>Ek naya printer MAC se authorize hua par VLAN 10 mein gaya. Helpdesk ne switch ports edit kiye. Tracker Summary ne dikhaya ki service "Wired Allow-All Test" ne handle kiya, jo pilot se bachi hui thi. Production service ko top par le jaane se theek ho gaya.</p><p><b>Lesson:</b> kuch aur badalne se pehle Summary ki Service line padho.</p></div>

<div class="iv"><p class="q">"Access Tracker record ke tabs aapko kya batate hain?"</p><p>Summary: result, service, method, roles, profiles. Input: identity aur request attributes. Output: profiles aur return hue attributes. Alerts: error code aur message. Main Summary se dekhta hoon kitni door pahunchi, phir symptom ke hisaab se Alerts ya Output.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Policy engine tak pahunchi har request ka ek record.</li>
<li>Summary dikhata hai request kitni door pahunchi; empty Roles matlab pehle hi fail hui.</li>
<li>Input mein service rules ke liye real attribute values hain; Output mein woh jo switch ko apply karna hai.</li>
<li>Alerts error code aur message dete hain.</li>
<li>Disconnect aur reauthorize live sessions par kaam karte hain; sirf policy change nahi.</li>
</ul></div>
`}};export{e as default};