var e={id:`web-ui-profiles-tags`,h:{en:`The Catalyst 9800 web UI: WLAN profiles, policy profiles and tags`,hi:`Catalyst 9800 web UI: WLAN profiles, policy profiles aur tags`},body:{en:`
<p>ENCOR 3.3 asks you to configure and troubleshoot WLANs <b>using the GUI only</b>, and 3.3.f asks you to explain segmentation with <b>groups, profiles and tags</b>. This chapter is the tour you need before the security chapters: the object model of a Catalyst 9800 controller, where each object lives in the web UI, and the order in which things must be built. The labs of this module run on a 9800-style learning model (not Cisco software), and its web UI sends exactly the same configuration lines as the console, so everything here works in both.</p>

<h3>An analogy: a restaurant chain</h3>
<p>The <b>WLAN profile</b> is the menu card: the SSID name and the security rules (who may order). The <b>policy profile</b> is the service style: which dining hall the guests are seated in (VLAN), whether the kitchen is central or local (switching), and which house rules apply (ACL, QoS). The <b>policy tag</b> is the table plan that says "menu A is served in hall X". Finally each waiter, an <b>AP</b>, is handed a tag that decides which table plan he follows. Change the plan once and every waiter with that plan changes.</p>

<h3>The objects of the 9800 model</h3>
<table class="cmp"><tr><th>Object</th><th>What it holds</th><th>Lab example</th></tr>
<tr><td>WLAN profile</td><td>Profile name, WLAN ID, SSID, security (WPA2/WPA3, PSK/SAE/802.1X, PMF)</td><td>NK-STAFF (ID 1), NK-CORP (ID 2)</td></tr>
<tr><td>Policy profile</td><td>VLAN, central switching, ACL, QoS, AAA override</td><td>PP-STAFF (VLAN 20), PP-CORP (VLAN 40)</td></tr>
<tr><td>Policy tag</td><td>A list of WLAN profile to policy profile maps</td><td>PT-CAMPUS</td></tr>
<tr><td>Site tag</td><td>AP join profile, local or FlexConnect site</td><td>default-site-tag (FlexConnect is in wl-flex)</td></tr>
<tr><td>RF tag</td><td>RF profiles per band</td><td>default-rf-tag</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="WLAN profile and policy profile joined by a policy tag, tag applied to an AP">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">WLAN profile NK-CORP</text>
<rect x="10" y="100" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="127" text-anchor="middle" class="svg-ink" font-size="13">Policy PP-CORP</text>
<rect x="215" y="55" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="13">Policy tag PT-CAMPUS</text><text x="315" y="100" text-anchor="middle" class="svg-muted" font-size="12">NK-CORP maps to PP-CORP</text>
<rect x="480" y="55" width="150" height="60" rx="8" fill="#fde68a"/><text x="555" y="82" text-anchor="middle" class="svg-ink" font-size="13">AP1 and AP2</text><text x="555" y="100" text-anchor="middle" class="svg-muted" font-size="12">use PT-CAMPUS</text>
<line x1="150" y1="42" x2="215" y2="78" stroke="#64748b"/><line x1="150" y1="122" x2="215" y2="95" stroke="#64748b"/><line x1="415" y1="85" x2="480" y2="85" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">an SSID is on air only where the AP's policy tag maps it to an enabled policy profile</text>
</svg><p class="cap">Profile, policy and tag: three objects, one result on the AP.</p></div>

<h3>Where each object is in the web UI</h3>
<table class="cmp"><tr><th>Task</th><th>Web UI path</th></tr>
<tr><td>See AP and client state</td><td>Monitoring &gt; Wireless &gt; Access Points | Clients | WLANs | Radios</td></tr>
<tr><td>WLAN profile, policy profile, tags</td><td>Configuration &gt; Tags &amp; Profiles &gt; WLANs | Policy | Tags (Policy, Site, RF tabs)</td></tr>
<tr><td>RADIUS servers, groups, method lists</td><td>Configuration &gt; Security &gt; AAA (Servers, Server Groups, AAA Method List)</td></tr>
<tr><td>AP mode, AP tags, AP country</td><td>Configuration &gt; Wireless &gt; Access Points | Global</td></tr>
<tr><td>VLAN database</td><td>Configuration &gt; Layer2 &gt; VLAN</td></tr>
<tr><td>Save to startup</td><td>Administration &gt; Management &gt; Save Configuration</td></tr>
<tr><td>Logs, ping</td><td>Troubleshooting &gt; Logs | Ping</td></tr></table>

<h3>The build order and the rules that bite</h3>
<ol><li><b>VLAN first.</b> The policy VLAN must exist in the controller VLAN database, otherwise clients are refused (the lab logs VLAN_MISSING).</li>
<li><b>WLAN profile.</b> A new WLAN starts disabled. On the lab controller, and in practice for security changes, you disable the WLAN, edit, then enable it again; the web UI does this for you when you switch Status off first.</li>
<li><b>Policy profile.</b> New policy profiles start disabled; change the VLAN only while disabled, then enable it.</li>
<li><b>Policy tag.</b> Add the WLAN-to-policy map in the tag.</li>
<li><b>Tag the APs.</b> An AP without a tag uses <code>default-policy-tag</code>, which maps no WLAN, so it serves no SSID. On a real 9800 a tag change makes the AP rejoin CAPWAP, so plan changes outside busy hours.</li></ol>
<p>The CLI behind the pages is short. This is the policy half of lab 1 (the WLAN half and RADIUS are built in chapters 10 and 11):</p>
<pre class="code"><span class="c">! GUI: Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; Add, then Tags &gt; Policy &gt; PT-CAMPUS</span>
WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# vlan 40
WLC1(config-wireless-policy)# no shutdown
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-CORP policy PP-CORP
WLC1# show wireless tag policy detailed PT-CAMPUS</pre>
<pre class="out">Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: <span class="hl">2</span>
WLAN Profile Name                  Policy Name
------------------------------------------------------------
NK-STAFF                           PP-STAFF
NK-CORP                            <span class="hl">PP-CORP</span></pre>
<pre class="out">AP Name             AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
-----------------------------------------------------------------------------------------------------------------------------
AP1                 0050.42a6.9801  default-site-tag      <span class="hl">PT-CAMPUS</span>             default-rf-tag      No             Static</pre>
<p>The second output is one line of <code>show ap tag summary</code>: both APs already carry PT-CAMPUS, so adding a map to the tag is enough and no AP needs to be retagged.</p>

<div class="eg"><p><b>Worked example.</b> Two SSIDs, one tag. NK-STAFF maps to PP-STAFF (VLAN 20) and NK-CORP to PP-CORP (VLAN 40) inside PT-CAMPUS. Every AP with PT-CAMPUS offers both SSIDs and drops each client into its own VLAN. A branch that needs only the staff SSID gets its own tag PT-BRANCH with one map. Segmentation is therefore a property of the tag, not of the AP hardware.</p></div>

<div class="note"><p><b>Honest scope.</b> Site tags with FlexConnect (local switching), flex profiles, mobility tunnels and anchoring are real 9800 features that the lab does not simulate: concept only here. They are taught and practised in module <b>wl-flex</b> (FlexConnect and branch design) and module <b>wl-mobility</b> (Roaming, mobility and anchoring). The tag model itself is practised in <b>wl-start</b> (Wireless from zero) and <b>wl-roaming</b> (Roaming, tags and segmentation).</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Creating the WLAN and the policy profile and forgetting the policy tag map: the SSID is on no AP. (2) Editing the policy tag but not tagging the AP: it still uses the default tag. (3) Leaving a policy profile disabled. (4) Pointing a policy profile at a VLAN that is not in the controller VLAN database.</p></div>

<div class="exam"><p><b>Exam traps.</b> A policy tag maps WLAN profiles to policy profiles; it does not contain the VLAN itself. The VLAN lives in the policy profile. A WLAN profile name and its SSID can differ. PMF belongs to the WLAN profile: on a real 9800 you find it under the WLAN's Security, Layer2 tab; the lab keeps the same setting on the Web Auth, WLANs tab of the web UI. Every GUI change is a configuration command underneath.</p></div>

<div class="scn"><h4>The new SSID nobody could see</h4><p>A retailer added a guest SSID in the web UI on Friday. The WLAN profile and the policy profile were saved and enabled, yet no phone saw the SSID. The engineer opened Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; Policy, saw that the policy tag used by the shop APs had no map for the new WLAN, and added it. Both objects existed; the link between them did not.</p><p><b>Lesson:</b> when a configured SSID is invisible, check the tag map and the tag on the AP before touching RF.</p></div>

<div class="iv"><p class="q">"Explain WLAN profile, policy profile and policy tag on a Catalyst 9800."</p><p>Strong answer: the WLAN profile defines the SSID and security, the policy profile defines what happens to the client's traffic (VLAN, switching mode, ACL, QoS), and the policy tag joins them per AP. Mention site and RF tags, that an untagged AP uses the default tags and serves nothing, and that a tag change makes the AP rejoin. Compare with AireOS, where one WLAN carried everything and AP groups did the rest.</p></div>

<div class="tip"><p><b>Doing it in the web UI</b></p><p>Lab 1 tasks 1 to 3 are GUI only. Open WLC1 from its icon (the web UI, not the console). (1) Configuration &gt; Tags &amp; Profiles &gt; WLANs: pick NK-STAFF, switch Status off, change the Security tab, Apply to Device, switch Status on. (2) Configuration &gt; Security &gt; AAA: add the server, the server group and the method list. (3) Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add for NK-CORP, then Policy &gt; Add for PP-CORP (VLAN 40, Status enabled), then Tags &gt; Policy &gt; PT-CAMPUS to add the map. Every page shows the red banner of the engine if a rule is broken, for example when you edit an enabled WLAN. Finish with Administration &gt; Management &gt; Save Configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WLAN profile = SSID and security; policy profile = VLAN and traffic handling; policy tag = the map; AP = the tag holder.</li>
<li>An AP without a tag uses default-policy-tag and serves no SSID; a tag change makes a real AP rejoin.</li>
<li>Build order: VLAN, WLAN, policy profile, policy tag map, AP tag; disable before editing security or VLAN.</li>
<li>Web UI paths: Configuration &gt; Tags &amp; Profiles, Security &gt; AAA, Wireless &gt; Access Points, Monitoring &gt; Wireless.</li>
<li>FlexConnect site tags and mobility are concept only here: see wl-flex and wl-mobility.</li>
</ul></div>
`,hi:`
<p>ENCOR 3.3 aapse WLANs ko <b>sirf GUI se</b> configure aur troubleshoot karne ko kehta hai, aur 3.3.f <b>groups, profiles aur tags</b> ke saath segmentation samjhane ko. Yeh chapter security chapters se pehle ka tour hai: Catalyst 9800 controller ka object model, har object web UI mein kahan hai, aur cheezein kis order mein banani hain. Is module ki labs 9800-style learning model par chalti hain (Cisco software nahi), aur uska web UI bilkul wahi configuration lines bhejta hai jo console leta hai, isliye yahan sab kuch dono mein chalta hai.</p>

<h3>Ek analogy: restaurant chain</h3>
<p><b>WLAN profile</b> menu card hai: SSID ka naam aur security rules (kaun order kar sakta hai). <b>Policy profile</b> service style hai: guests ko kaunse dining hall mein baithaya jaye (VLAN), kitchen central hai ya local (switching), aur kaunse house rules lagte hain (ACL, QoS). <b>Policy tag</b> table plan hai jo kehta hai "menu A hall X mein serve hoga". Aur har waiter, yaani <b>AP</b>, ko ek tag diya jaata hai jo tay karta hai woh kaunsa table plan follow kare. Plan ek baar badlo to us plan wale har waiter ka kaam badal jaata hai.</p>

<h3>9800 model ke objects</h3>
<table class="cmp"><tr><th>Object</th><th>Isme kya hota hai</th><th>Lab example</th></tr>
<tr><td>WLAN profile</td><td>Profile name, WLAN ID, SSID, security (WPA2/WPA3, PSK/SAE/802.1X, PMF)</td><td>NK-STAFF (ID 1), NK-CORP (ID 2)</td></tr>
<tr><td>Policy profile</td><td>VLAN, central switching, ACL, QoS, AAA override</td><td>PP-STAFF (VLAN 20), PP-CORP (VLAN 40)</td></tr>
<tr><td>Policy tag</td><td>WLAN profile se policy profile ke maps ki list</td><td>PT-CAMPUS</td></tr>
<tr><td>Site tag</td><td>AP join profile, local ya FlexConnect site</td><td>default-site-tag (FlexConnect wl-flex mein hai)</td></tr>
<tr><td>RF tag</td><td>Har band ke RF profiles</td><td>default-rf-tag</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="WLAN profile aur policy profile ko policy tag jodta hai, tag AP par lagta hai">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">WLAN profile NK-CORP</text>
<rect x="10" y="100" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="127" text-anchor="middle" class="svg-ink" font-size="13">Policy PP-CORP</text>
<rect x="215" y="55" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="13">Policy tag PT-CAMPUS</text><text x="315" y="100" text-anchor="middle" class="svg-muted" font-size="12">NK-CORP ka map PP-CORP</text>
<rect x="480" y="55" width="150" height="60" rx="8" fill="#fde68a"/><text x="555" y="82" text-anchor="middle" class="svg-ink" font-size="13">AP1 aur AP2</text><text x="555" y="100" text-anchor="middle" class="svg-muted" font-size="12">PT-CAMPUS use karte hain</text>
<line x1="150" y1="42" x2="215" y2="78" stroke="#64748b"/><line x1="150" y1="122" x2="215" y2="95" stroke="#64748b"/><line x1="415" y1="85" x2="480" y2="85" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">SSID wahi on air hai jahan AP ka policy tag use enabled policy profile se map kare</text>
</svg><p class="cap">Profile, policy aur tag: teen objects, AP par ek result.</p></div>

<h3>Har object web UI mein kahan hai</h3>
<table class="cmp"><tr><th>Kaam</th><th>Web UI path</th></tr>
<tr><td>AP aur client state dekhna</td><td>Monitoring &gt; Wireless &gt; Access Points | Clients | WLANs | Radios</td></tr>
<tr><td>WLAN profile, policy profile, tags</td><td>Configuration &gt; Tags &amp; Profiles &gt; WLANs | Policy | Tags (Policy, Site, RF tabs)</td></tr>
<tr><td>RADIUS servers, groups, method lists</td><td>Configuration &gt; Security &gt; AAA (Servers, Server Groups, AAA Method List)</td></tr>
<tr><td>AP mode, AP tags, AP country</td><td>Configuration &gt; Wireless &gt; Access Points | Global</td></tr>
<tr><td>VLAN database</td><td>Configuration &gt; Layer2 &gt; VLAN</td></tr>
<tr><td>Startup mein save</td><td>Administration &gt; Management &gt; Save Configuration</td></tr>
<tr><td>Logs, ping</td><td>Troubleshooting &gt; Logs | Ping</td></tr></table>

<h3>Build order aur woh rules jo kaat-te hain</h3>
<ol><li><b>Pehle VLAN.</b> Policy VLAN controller ke VLAN database mein hona chahiye, warna clients refuse ho jaate hain (lab VLAN_MISSING log karti hai).</li>
<li><b>WLAN profile.</b> Naya WLAN disabled shuru hota hai. Lab controller par, aur practice mein security changes ke liye, WLAN disable karo, edit karo, phir enable karo; pehle Status off karoge to web UI yeh khud kar deta hai.</li>
<li><b>Policy profile.</b> Naye policy profiles disabled shuru hote hain; VLAN sirf disabled rehte badlo, phir enable karo.</li>
<li><b>Policy tag.</b> Tag mein WLAN-to-policy map jodo.</li>
<li><b>APs ko tag do.</b> Tag ke bina AP <code>default-policy-tag</code> use karta hai, jisme koi WLAN map nahi, isliye woh koi SSID serve nahi karta. Asli 9800 par tag badalne se AP CAPWAP dobara join karta hai, isliye changes busy hours ke bahar plan karo.</li></ol>
<p>Pages ke peeche ka CLI chhota hai. Yeh lab 1 ka policy wala hissa hai (WLAN wala hissa aur RADIUS chapters 10 aur 11 mein banate hain):</p>
<pre class="code"><span class="c">! GUI: Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; Add, phir Tags &gt; Policy &gt; PT-CAMPUS</span>
WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# vlan 40
WLC1(config-wireless-policy)# no shutdown
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-CORP policy PP-CORP
WLC1# show wireless tag policy detailed PT-CAMPUS</pre>
<pre class="out">Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: <span class="hl">2</span>
WLAN Profile Name                  Policy Name
------------------------------------------------------------
NK-STAFF                           PP-STAFF
NK-CORP                            <span class="hl">PP-CORP</span></pre>
<pre class="out">AP Name             AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
-----------------------------------------------------------------------------------------------------------------------------
AP1                 0050.42a6.9801  default-site-tag      <span class="hl">PT-CAMPUS</span>             default-rf-tag      No             Static</pre>
<p>Doosra output <code>show ap tag summary</code> ki ek line hai: dono APs ke paas pehle se PT-CAMPUS hai, isliye tag mein map jodna kaafi hai aur kisi AP ko dobara tag nahi karna padta.</p>

<div class="eg"><p><b>Worked example.</b> Do SSIDs, ek tag. PT-CAMPUS ke andar NK-STAFF, PP-STAFF (VLAN 20) se aur NK-CORP, PP-CORP (VLAN 40) se map hai. PT-CAMPUS wala har AP dono SSIDs offer karta hai aur har client ko uske apne VLAN mein daalta hai. Jis branch ko sirf staff SSID chahiye use apna tag PT-BRANCH milta hai jisme ek map hai. Isliye segmentation tag ki property hai, AP hardware ki nahi.</p></div>

<div class="note"><p><b>Honest scope.</b> FlexConnect (local switching) wale site tags, flex profiles, mobility tunnels aur anchoring asli 9800 features hain jo lab simulate nahi karti: yahan concept only. Inhe module <b>wl-flex</b> (FlexConnect and branch design) aur module <b>wl-mobility</b> (Roaming, mobility and anchoring) mein padhaya aur practise karaya jaata hai. Tag model khud <b>wl-start</b> (Wireless from zero) aur <b>wl-roaming</b> (Roaming, tags and segmentation) mein practise hota hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) WLAN aur policy profile bana diye par policy tag map bhool gaye: SSID kisi AP par nahi. (2) Policy tag edit kiya par AP ko tag nahi diya: woh abhi bhi default tag use karta hai. (3) Policy profile disabled chhod diya. (4) Policy profile ko aise VLAN par point karna jo controller VLAN database mein nahi hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Policy tag WLAN profiles ko policy profiles se map karta hai; VLAN uske andar nahi hota. VLAN policy profile mein hota hai. WLAN profile ka naam aur uska SSID alag ho sakte hain. PMF WLAN profile ka hissa hai: asli 9800 par woh WLAN ke Security, Layer2 tab mein milta hai; lab wahi setting web UI ke Web Auth, WLANs tab par rakhti hai. Har GUI change neeche ek configuration command hai.</p></div>

<div class="scn"><h4>Naya SSID jo kisi ko nahi dikha</h4><p>Ek retailer ne Friday ko web UI mein guest SSID jodi. WLAN profile aur policy profile save aur enabled the, phir bhi kisi phone ko SSID nahi dikhi. Engineer ne Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; Policy kholi, dekha ki dukaan ke APs ka policy tag naye WLAN ka map nahi rakhta, aur use jod diya. Dono objects the; unke beech ka link nahi tha.</p><p><b>Lesson:</b> configured SSID invisible ho to RF chhoone se pehle tag map aur AP par tag check karo.</p></div>

<div class="iv"><p class="q">"Catalyst 9800 par WLAN profile, policy profile aur policy tag samjhao."</p><p>Strong answer: WLAN profile SSID aur security define karta hai, policy profile client ke traffic ka kya hoga (VLAN, switching mode, ACL, QoS) define karta hai, aur policy tag unhe har AP ke liye jodta hai. Site aur RF tags batao, ki tag-less AP default tags use karke kuch serve nahi karta, aur tag change se AP rejoin karta hai. AireOS se compare karo, jahan ek WLAN sab kuch rakhta tha aur AP groups baaki kaam karte the.</p></div>

<div class="tip"><p><b>Web UI mein karna</b></p><p>Lab 1 ke task 1 se 3 sirf GUI hain. WLC1 ko uske icon se kholo (web UI, console nahi). (1) Configuration &gt; Tags &amp; Profiles &gt; WLANs: NK-STAFF chuno, Status off karo, Security tab badlo, Apply to Device, Status on karo. (2) Configuration &gt; Security &gt; AAA: server, server group aur method list jodo. (3) NK-CORP ke liye Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add, phir PP-CORP ke liye Policy &gt; Add (VLAN 40, Status enabled), phir Tags &gt; Policy &gt; PT-CAMPUS mein map jodo. Koi rule toot-ta hai (jaise enabled WLAN edit karna) to har page engine ka laal banner dikhata hai. Aakhir mein Administration &gt; Management &gt; Save Configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WLAN profile = SSID aur security; policy profile = VLAN aur traffic handling; policy tag = map; AP = tag rakhne wala.</li>
<li>Tag-less AP default-policy-tag use karta hai aur koi SSID serve nahi karta; asli AP tag change par rejoin karta hai.</li>
<li>Build order: VLAN, WLAN, policy profile, policy tag map, AP tag; security ya VLAN edit se pehle disable karo.</li>
<li>Web UI paths: Configuration &gt; Tags &amp; Profiles, Security &gt; AAA, Wireless &gt; Access Points, Monitoring &gt; Wireless.</li>
<li>FlexConnect site tags aur mobility yahan concept only hain: wl-flex aur wl-mobility dekho.</li>
</ul></div>
`}};export{e as default};