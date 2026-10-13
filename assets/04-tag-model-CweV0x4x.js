var e={id:`tag-model`,h:{en:`The 9800 tag model: policy tag, site tag, RF tag`,hi:`9800 tag model: policy tag, site tag, RF tag`},body:{en:`
<h3>Why tags exist</h3>
<p>Older AireOS controllers used <b>AP groups</b>: one group per set of APs, with WLANs and interface mappings inside. The Catalyst 9800 splits that single idea into three small, reusable objects called <b>tags</b>. An AP does not hold WLANs directly. It holds three tag names, and each tag points to a bundle of settings. Think of an AP as an employee with three badges: one badge says <i>what services you offer</i> (policy tag), one says <i>which site rules apply</i> (site tag), and one says <i>how you behave on the radio</i> (RF tag).</p>
<table class="cmp"><tr><th>Tag</th><th>Contains</th><th>Answers the question</th><th>Lab object</th></tr>
<tr><td>Policy tag</td><td>Map of WLAN profile to policy profile</td><td>Which SSIDs does this AP broadcast, and into which VLAN?</td><td>PT-CAMPUS</td></tr>
<tr><td>Site tag</td><td>AP profile (country, timers, join settings), FlexConnect or local site</td><td>What are the site-level rules?</td><td>ST-CAMPUS</td></tr>
<tr><td>RF tag</td><td>2.4 GHz and 5 GHz RF profile</td><td>What power and data rates on the radio?</td><td>RF-CAMPUS</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Tags and profiles">
<rect x="20" y="85" width="90" height="50" rx="8" fill="#bae6fd"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<rect x="180" y="15" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="250" y="42" text-anchor="middle" class="svg-ink" font-size="12">policy tag PT-CAMPUS</text>
<rect x="180" y="93" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="250" y="120" text-anchor="middle" class="svg-ink" font-size="12">site tag ST-CAMPUS</text>
<rect x="180" y="171" width="140" height="44" rx="8" fill="#fde68a"/><text x="250" y="198" text-anchor="middle" class="svg-ink" font-size="12">RF tag RF-CAMPUS</text>
<rect x="400" y="15" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="510" y="42" text-anchor="middle" class="svg-ink" font-size="12">WLAN to policy profile maps</text>
<rect x="400" y="93" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="510" y="120" text-anchor="middle" class="svg-ink" font-size="12">AP profile (country, join)</text>
<rect x="400" y="171" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="510" y="198" text-anchor="middle" class="svg-ink" font-size="12">RF profiles 2.4 and 5 GHz</text>
<line x1="110" y1="110" x2="180" y2="37" stroke="#64748b"/><line x1="110" y1="110" x2="180" y2="115" stroke="#64748b"/><line x1="110" y1="110" x2="180" y2="193" stroke="#64748b"/>
<line x1="320" y1="37" x2="400" y2="37" stroke="#64748b"/><line x1="320" y1="115" x2="400" y2="115" stroke="#64748b"/><line x1="320" y1="193" x2="400" y2="193" stroke="#64748b"/>
</svg><p class="cap">An AP carries three tag names; each tag points to settings.</p></div>

<h3>Default tags and what they do</h3>
<p>If an AP has no tag assigned, it uses the built-in <b>default-policy-tag</b>, <b>default-site-tag</b> and <b>default-rf-tag</b>. The default policy tag contains no WLAN maps in this design, so an AP with only default tags serves <b>no SSID at all</b>. That is the cause of the earlier lab "everything is configured but the SSID is invisible". Tags can be assigned statically per AP, or by filters (rules) that match the AP name; the lab uses the static form.</p>
<pre class="code">ap name AP1 policy-tag PT-CAMPUS
ap name AP2 policy-tag PT-CAMPUS</pre>
<pre class="out">WLC1# show ap tag summary

Number of APs: 2

AP Name   AP Mac          Site Tag Name   Policy Tag Name   RF Tag Name     Misconfigured  Tag Source
AP1       0011.2233.4401  default-site-tag  <span class="hl">PT-CAMPUS</span>   default-rf-tag  No             Static
AP2       0011.2233.4402  default-site-tag  <span class="hl">PT-CAMPUS</span>   default-rf-tag  No             Static</pre>
<p>The <b>Misconfigured</b> column says "Yes" if an AP is tagged with a name that does not exist. The <b>Tag Source</b> column tells you whether the tag was set statically or came from a default.</p>

<h3>Why neighbouring APs must carry matching policy tags</h3>
<p>This is the core idea behind the first lab. A client sees one SSID, NK-STAFF. But what the SSID <i>means</i> on each AP depends on that AP's policy tag. If AP1 maps NK-STAFF to PP-STAFF (VLAN 20) and AP2 maps NK-STAFF to some other policy profile in a different VLAN, the SSID name and password are identical. The client roams happily at Layer 2, then asks DHCP on the new VLAN. From the user's side it looks like a roam, but the subnet changes and the sessions break. The rules:</p>
<ul>
<li>Every AP in the same roaming area must carry a policy tag with the <b>same WLAN-to-policy maps</b>, or at least the same VLAN for the SSID that people roam on.</li>
<li>Different areas can have different tags on purpose (a lab area, a warehouse), but then users should not be expected to roam between them seamlessly.</li>
<li>Prefer <b>one policy tag for the whole campus</b> unless there is a real reason to split.</li>
</ul>
<div class="eg"><p>PT-CAMPUS: NK-STAFF to PP-STAFF (VLAN 20). PT-FLOOR2: NK-STAFF to PP-FLOOR2 (VLAN 41). AP1 uses PT-CAMPUS, AP2 uses PT-FLOOR2. LAPTOP1 gets 10.10.20.55 near AP1. Walking to AP2 it must renew and receives 10.10.41.x, and its file copy to the server stops.</p></div>

<h3>Reading a tag on the controller</h3>
<pre class="out">WLC1# show wireless tag policy detailed PT-CAMPUS

Policy Tag Name   : PT-CAMPUS
Description       :
Number of WLAN-POLICY maps: 2

WLAN Profile Name                   Policy Name
NK-STAFF                            PP-STAFF
NK-GUEST                            PP-GUEST</pre>
<p>Two more summaries help: <code>show wireless tag site summary</code> and <code>show wireless tag rf summary</code>. For the policy side, always read both the tag and the policy profile it points to.</p>

<h3>Site tag and RF tag in this module</h3>
<p>The site tag carries the AP profile, which holds the AP country code (earlier module). The RF tag carries RF profiles (also earlier module). They matter for roaming in one way: if two neighbouring APs have very different RF tags (for example AP1 at maximum power, AP2 at low power) the cells become uneven and clients stick to the louder AP. Keep RF tags consistent in a roaming area.</p>
<div class="note"><p><b>Not simulated in the lab.</b> Site tags with a FlexConnect profile (local site off) and tag filters by regex are concepts only. The lab site tag only holds an AP profile.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Creating a second policy tag "just for floor 2" and forgetting to copy every map. (2) Editing a policy tag and assuming APs must be rebooted; on the 9800 the tag change is applied to the AP but in a real network it can cause a brief radio reset, so do it in a window. (3) Changing the tag of an AP that has users on it without warning them.</p></div>
<div class="exam"><p><b>Exam trap.</b> The policy tag maps WLAN profile to policy profile. The VLAN is <b>not</b> in the policy tag and <b>not</b> in the WLAN profile; it is in the policy profile.</p></div>

<div class="scn"><h4>The copy-paste tag</h4><p>An engineer clones PT-CAMPUS to PT-FLOOR2 for a new office wing and later changes one map to test a new VLAN, then forgets to revert. Weeks later helpdesk gets complaints of dropped sessions on that wing. <code>show ap tag summary</code> shows two different policy tags among neighbours.</p><p><b>Lesson:</b> compare policy tags first when the symptom is "worse when I walk".</p></div>

<div class="iv"><p class="q">"Explain policy tag, site tag and RF tag in one minute."</p><p>Policy tag: which WLANs are mapped to which policy profiles, so it decides SSIDs and VLANs. Site tag: AP profile and local or FlexConnect mode, site-level behaviour. RF tag: RF profiles per band. An AP carries one of each, and default tags apply when none is assigned.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An AP carries three tags: policy, site and RF.</li>
<li>The policy tag maps WLAN to policy profile; VLAN lives in the policy profile.</li>
<li>Default tags serve no WLANs in this design.</li>
<li>Neighbouring APs in a roaming area need matching policy tags.</li>
<li><code>show ap tag summary</code> shows the Misconfigured and Tag Source columns.</li>
</ul></div>
`,hi:`
<h3>Tags kyun exist karte hain</h3>
<p>Purane AireOS controllers <b>AP groups</b> use karte the: APs ke har set ke liye ek group, jiske andar WLANs aur interface mappings hote the. Catalyst 9800 us ek idea ko teen chhote, reusable objects mein baant deta hai jinhe <b>tags</b> kehte hain. AP ke paas WLANs directly nahi hote. Uske paas teen tag names hote hain, aur har tag settings ke bundle ko point karta hai. AP ko aise employee ki tarah socho jiske paas teen badges hain: ek badge batata hai <i>kaunsi services offer karni hain</i> (policy tag), ek batata hai <i>kaunse site rules lagu hain</i> (site tag), aur ek batata hai <i>radio par kaise behave karna hai</i> (RF tag).</p>
<table class="cmp"><tr><th>Tag</th><th>Kya contain karta hai</th><th>Kaunsa sawal answer karta hai</th><th>Lab object</th></tr>
<tr><td>Policy tag</td><td>WLAN profile se policy profile ka map</td><td>Yeh AP kaunse SSIDs broadcast karta hai, aur kaunse VLAN mein?</td><td>PT-CAMPUS</td></tr>
<tr><td>Site tag</td><td>AP profile (country, timers, join settings), FlexConnect ya local site</td><td>Site-level rules kya hain?</td><td>ST-CAMPUS</td></tr>
<tr><td>RF tag</td><td>2.4 GHz aur 5 GHz RF profile</td><td>Radio par power aur data rates kya hain?</td><td>RF-CAMPUS</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Tags and profiles">
<rect x="20" y="85" width="90" height="50" rx="8" fill="#bae6fd"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<rect x="180" y="15" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="250" y="42" text-anchor="middle" class="svg-ink" font-size="12">policy tag PT-CAMPUS</text>
<rect x="180" y="93" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="250" y="120" text-anchor="middle" class="svg-ink" font-size="12">site tag ST-CAMPUS</text>
<rect x="180" y="171" width="140" height="44" rx="8" fill="#fde68a"/><text x="250" y="198" text-anchor="middle" class="svg-ink" font-size="12">RF tag RF-CAMPUS</text>
<rect x="400" y="15" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="510" y="42" text-anchor="middle" class="svg-ink" font-size="12">WLAN se policy profile maps</text>
<rect x="400" y="93" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="510" y="120" text-anchor="middle" class="svg-ink" font-size="12">AP profile (country, join)</text>
<rect x="400" y="171" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="510" y="198" text-anchor="middle" class="svg-ink" font-size="12">RF profiles 2.4 aur 5 GHz</text>
<line x1="110" y1="110" x2="180" y2="37" stroke="#64748b"/><line x1="110" y1="110" x2="180" y2="115" stroke="#64748b"/><line x1="110" y1="110" x2="180" y2="193" stroke="#64748b"/>
<line x1="320" y1="37" x2="400" y2="37" stroke="#64748b"/><line x1="320" y1="115" x2="400" y2="115" stroke="#64748b"/><line x1="320" y1="193" x2="400" y2="193" stroke="#64748b"/>
</svg><p class="cap">AP teen tag names carry karta hai; har tag settings ko point karta hai.</p></div>

<h3>Default tags aur woh kya karte hain</h3>
<p>Agar AP ko koi tag assign nahi hai, to woh built-in <b>default-policy-tag</b>, <b>default-site-tag</b> aur <b>default-rf-tag</b> use karta hai. Is design mein default policy tag mein koi WLAN map nahi hota, isliye sirf default tags wala AP <b>koi SSID serve nahi karta</b>. Pichhli lab "everything is configured but the SSID is invisible" ka yahi kaaran tha. Tags static taur par har AP ko diye ja sakte hain, ya filters (rules) se jo AP name match karte hain; lab static form use karti hai.</p>
<pre class="code">ap name AP1 policy-tag PT-CAMPUS
ap name AP2 policy-tag PT-CAMPUS</pre>
<pre class="out">WLC1# show ap tag summary

Number of APs: 2

AP Name   AP Mac          Site Tag Name   Policy Tag Name   RF Tag Name     Misconfigured  Tag Source
AP1       0011.2233.4401  default-site-tag  <span class="hl">PT-CAMPUS</span>   default-rf-tag  No             Static
AP2       0011.2233.4402  default-site-tag  <span class="hl">PT-CAMPUS</span>   default-rf-tag  No             Static</pre>
<p><b>Misconfigured</b> column "Yes" batata hai agar AP ko aisa tag name diya gaya hai jo exist nahi karta. <b>Tag Source</b> column batata hai ki tag static set hua ya default se aaya.</p>

<h3>Padosi APs ke policy tags match kyun hone chahiye</h3>
<p>Pehli lab ka core idea yahi hai. Client ko ek SSID dikhta hai, NK-STAFF. Lekin us SSID ka matlab har AP par us AP ke policy tag par depend karta hai. Agar AP1 NK-STAFF ko PP-STAFF (VLAN 20) se map karta hai aur AP2 NK-STAFF ko kisi aur policy profile se alag VLAN mein map karta hai, to SSID name aur password identical hain. Client Layer 2 par khushi se roam karta hai, phir naye VLAN par DHCP maangta hai. User ko yeh roam lagta hai, lekin subnet badal jaata hai aur sessions toot jaate hain. Rules:</p>
<ul>
<li>Same roaming area ke har AP ko aisa policy tag carry karna chahiye jiske <b>WLAN-to-policy maps same</b> hon, ya kam se kam us SSID ke liye same VLAN jis par log roam karte hain.</li>
<li>Alag areas mein jaan-boojhkar alag tags ho sakte hain (lab area, warehouse), lekin tab users se seamless roaming expect nahi karni chahiye.</li>
<li>Jab tak sach mein kaaran na ho, <b>poore campus ke liye ek policy tag</b> rakho.</li>
</ul>
<div class="eg"><p>PT-CAMPUS: NK-STAFF se PP-STAFF (VLAN 20). PT-FLOOR2: NK-STAFF se PP-FLOOR2 (VLAN 41). AP1 PT-CAMPUS use karta hai, AP2 PT-FLOOR2. LAPTOP1 ko AP1 ke paas 10.10.20.55 milta hai. AP2 tak chalne par use renew karna padta hai aur 10.10.41.x milta hai, aur server ko file copy ruk jaati hai.</p></div>

<h3>Controller par tag padhna</h3>
<pre class="out">WLC1# show wireless tag policy detailed PT-CAMPUS

Policy Tag Name   : PT-CAMPUS
Description       :
Number of WLAN-POLICY maps: 2

WLAN Profile Name                   Policy Name
NK-STAFF                            PP-STAFF
NK-GUEST                            PP-GUEST</pre>
<p>Do aur summaries madad karti hain: <code>show wireless tag site summary</code> aur <code>show wireless tag rf summary</code>. Policy side ke liye hamesha tag aur jis policy profile ko woh point karta hai, dono padho.</p>

<h3>Is module mein site tag aur RF tag</h3>
<p>Site tag AP profile carry karta hai, jisme AP country code hota hai (pichhla module). RF tag RF profiles carry karta hai (woh bhi pichhla module). Roaming ke liye yeh ek tarah se matter karte hain: agar do padosi APs ke RF tags bahut alag hain (jaise AP1 maximum power par, AP2 low power par), to cells uneven ho jaate hain aur clients zyada tez AP se chipak jaate hain. Roaming area mein RF tags consistent rakho.</p>
<div class="note"><p><b>Not simulated in the lab.</b> FlexConnect profile wale site tags (local site off) aur regex se tag filters sirf concepts hain. Lab ka site tag sirf AP profile rakhta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) "Sirf floor 2 ke liye" doosra policy tag banana aur har map copy karna bhool jaana. (2) Policy tag edit karke maan lena ki APs reboot karne padenge; 9800 par tag change AP par apply hota hai lekin real network mein chhota radio reset ho sakta hai, isliye window mein karo. (3) Jis AP par users hain uska tag bina bataye badalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy tag WLAN profile ko policy profile se map karta hai. VLAN policy tag mein <b>nahi</b> hota aur WLAN profile mein bhi <b>nahi</b>; woh policy profile mein hota hai.</p></div>

<div class="scn"><h4>Copy-paste wala tag</h4><p>Ek engineer naye office wing ke liye PT-CAMPUS ko PT-FLOOR2 mein clone karta hai, phir naye VLAN ko test karne ke liye ek map badalta hai aur revert karna bhool jaata hai. Hafton baad helpdesk ko us wing par session drops ki complaints aati hain. <code>show ap tag summary</code> padosi APs mein do alag policy tags dikhata hai.</p><p><b>Lesson:</b> jab symptom "chalte waqt kharab" ho, pehle policy tags compare karo.</p></div>

<div class="iv"><p class="q">"Policy tag, site tag aur RF tag ek minute mein explain karo."</p><p>Policy tag: kaunsa WLAN kaunse policy profile se map hai, isliye SSIDs aur VLANs decide karta hai. Site tag: AP profile aur local ya FlexConnect mode, site-level behaviour. RF tag: har band ke RF profiles. AP har ek ka ek carry karta hai, aur jab koi assign na ho to default tags lagu hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP teen tags carry karta hai: policy, site aur RF.</li>
<li>Policy tag WLAN ko policy profile se map karta hai; VLAN policy profile mein rehta hai.</li>
<li>Is design mein default tags koi WLAN serve nahi karte.</li>
<li>Roaming area ke padosi APs ko matching policy tags chahiye.</li>
<li><code>show ap tag summary</code> Misconfigured aur Tag Source columns dikhata hai.</li>
</ul></div>
`}};export{e as default};