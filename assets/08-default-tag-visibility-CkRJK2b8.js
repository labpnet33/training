var e={id:`default-tag-visibility`,h:{en:`Default tags and why an SSID goes missing (lab wl-default-tag)`,hi:`Default tags aur SSID gayab kyun hota hai (lab wl-default-tag)`},body:{en:`
<p>The third lab is a trouble ticket. Everything looks built, yet LAPTOP1 reports that NK-STAFF is not found. This chapter teaches the rule behind that symptom and a method to find the broken link without recreating anything.</p>

<h3>Analogy: the delivery person with the wrong list</h3>
<p>A courier arrives at a building with the right parcels in the warehouse, but his delivery list is blank. He is standing at the door, healthy and willing, but he delivers nothing because nobody gave him a list. The parcels (WLAN, policy profile, tag) all exist. What is missing is the AP's own assignment.</p>

<h3>The rule</h3>
<div class="note"><p><b>An AP broadcasts an SSID only if its policy tag maps that WLAN to a policy profile, the WLAN is enabled, the policy profile is enabled, the policy VLAN exists, and the radio is on.</b></p></div>
<p>An AP with no static tag uses the <code>default-policy-tag</code>. In the lab model that tag contains no WLAN-to-policy pairs, so an untagged AP serves no SSID. In real software the default policy tag behaviour depends on release and on whether you used the GUI wizard (which can add default mappings); treat it as unreliable and always assign tags yourself.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Visibility chain">
<rect x="10" y="10" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="75" y="35" text-anchor="middle" class="svg-ink" font-size="12">WLAN enabled?</text>
<rect x="160" y="10" width="130" height="40" rx="8" fill="#fed7aa"/><text x="225" y="35" text-anchor="middle" class="svg-ink" font-size="12">Policy enabled?</text>
<rect x="310" y="10" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="385" y="35" text-anchor="middle" class="svg-ink" font-size="12">Pair in policy tag?</text>
<rect x="480" y="10" width="150" height="40" rx="8" fill="#fde68a"/><text x="555" y="35" text-anchor="middle" class="svg-ink" font-size="12">AP carries that tag?</text>
<line x1="140" y1="30" x2="160" y2="30" stroke="#64748b"/><line x1="290" y1="30" x2="310" y2="30" stroke="#64748b"/><line x1="460" y1="30" x2="480" y2="30" stroke="#64748b"/>
<rect x="160" y="100" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="235" y="125" text-anchor="middle" class="svg-ink" font-size="12">Policy VLAN exists?</text>
<rect x="340" y="100" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="415" y="125" text-anchor="middle" class="svg-ink" font-size="12">Radio on (country)?</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">Lab wl-default-tag: only the 4th box is wrong</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">AP1 and AP2 still sit on default-policy-tag</text>
</svg><p class="cap">The chain from object to radio. A single broken box hides the SSID. Check the boxes from left to right.</p></div>

<h3>The lab ticket</h3>
<p>WLAN, policy profile and policy tag exist and are enabled. Both APs are registered. LAPTOP1 cannot find NK-STAFF. Find which object is missing between the policy tag and the APs and fix it without recreating anything.</p>
<p><b>Step 1: inspect.</b></p>
<pre class="out">WLC1# show ap tag summary

Number of APs: 2

AP Name              AP Mac           Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
------------------------------------------------------------
AP1                  aaaa.bb01.0001   default-site-tag      <span class="hl">default-policy-tag</span>    default-rf-tag      No             Default
AP2                  aaaa.bb01.0002   default-site-tag      <span class="hl">default-policy-tag</span>    default-rf-tag      No             Default</pre>
<p>The clue is in two columns. <b>Policy Tag Name</b> reads default-policy-tag and <b>Tag Source</b> reads Default: nobody assigned a tag. Contrast this with a good table where the source is Static.</p>
<p><b>Step 2: confirm the rest is fine</b> so you fix only the true cause.</p>
<pre class="out">WLC1# show wlan summary
1    NK-STAFF    NK-STAFF    <span class="hl">UP</span>    [WPA2][PSK][AES]

WLC1# show wireless tag policy detailed PT-CAMPUS
<span class="hl">NK-STAFF      PP-STAFF</span></pre>
<p><b>Step 3: repair.</b> Give both APs the existing tag. Nothing is recreated.</p>
<pre class="code">WLC1# ap name AP1 policy-tag PT-CAMPUS
WLC1# ap name AP2 policy-tag PT-CAMPUS
WLC1# show ap tag summary</pre>
<p><b>Step 4: prove.</b> On LAPTOP1 run <code>wifi status</code> to see NK-STAFF with an IP in 10.10.20.0/24, then <code>ping 10.10.60.20</code> to reach RAD1. If the client was retrying, give it a few seconds to reconnect; you may need to start the connection again.</p>

<h3>The method: top-down, one fact per command</h3>
<table class="cmp"><tr><th>Question</th><th>Command</th><th>Healthy answer</th></tr>
<tr><td>Is the AP joined?</td><td><code>show ap summary</code></td><td>Registered</td></tr>
<tr><td>Does the AP carry a tag?</td><td><code>show ap tag summary</code></td><td>Policy tag is PT-CAMPUS, source Static</td></tr>
<tr><td>Does the tag map the WLAN?</td><td><code>show wireless tag policy detailed</code></td><td>NK-STAFF paired with PP-STAFF</td></tr>
<tr><td>Is the WLAN enabled?</td><td><code>show wlan summary</code></td><td>UP</td></tr>
<tr><td>Is the policy enabled with a VLAN?</td><td><code>show wireless profile policy detailed</code></td><td>ENABLED, VLAN 20</td></tr>
<tr><td>Are radios on?</td><td><code>show ap dot11 24ghz summary</code></td><td>Enabled</td></tr></table>
<p>You can also read one AP: <code>show ap name AP1 config general</code> prints its tags, country code and CAPWAP state in one view.</p>
<pre class="out">WLC1# show ap name AP1 config general

CISCO AP Name   : AP1
AP Mode         : Local
IP Address      : 10.10.10.21
Controller      : WLC1
CAPWAP state    : Joined
Site Tag Name   : default-site-tag
Policy Tag Name : <span class="hl">PT-CAMPUS</span>
RF Tag Name     : default-rf-tag
Country Code    : IN</pre>

<div class="eg"><p><b>Worked example.</b> Only AP2 was tagged. LAPTOP1 near AP1 sees nothing while LAPTOP2 near AP2 works. A single <code>show ap tag summary</code> shows AP1 on default-policy-tag and AP2 on PT-CAMPUS. Repair AP1 only; no need to touch AP2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Rebuilding the WLAN, policy and tag when the real problem is the AP assignment. (2) Looking at the client for clues first: a missing SSID on the client says "nobody broadcasts it", not why. (3) Tagging only one AP. (4) Assuming the "Misconfigured: Yes" column is always the answer; that flag appears when an AP points at a tag that does not exist, which is a different fault.</p></div>
<div class="exam"><p><b>Exam trap.</b> AP joined does not mean AP serving. Join (CAPWAP) and serving (tags) are separate stages. A registered AP with default tags serves no SSID.</p></div>

<div class="scn"><h4>Half a floor offline</h4><p>After a hardware refresh, six new APs joined automatically but the engineer tagged only the four that had old names. Users near the two untagged APs saw no network and called the helpdesk. The helpdesk lead ran <code>show ap tag summary</code> and read the two Default source rows aloud. Tagging them took thirty seconds.</p><p><b>Lesson:</b> new APs always join with default tags, so a tagging step belongs in every AP deployment checklist.</p></div>

<div class="iv"><p class="q">"The SSID is not visible but the AP shows as joined. What do you check?"</p><p>Strong answer: policy tag assigned to that AP (show ap tag summary), the tag maps the WLAN to a policy, both WLAN and policy are enabled, the policy VLAN exists, and the radios and country are valid. Mention that untagged APs use default tags and serve no SSID, and that you fix the specific broken link rather than rebuilding.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> Read the tag columns in <b>Monitoring &gt; Wireless &gt; Access Points</b>, fix them in <b>Configuration &gt; Wireless &gt; Access Points</b> (select the AP, tab <b>Tags</b>, choose PT-CAMPUS), then confirm the client in <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Untagged APs use default tags and, in the lab, serve no SSID.</li>
<li>show ap tag summary: look at Policy Tag Name and Tag Source.</li>
<li>Fix with ap name AP1 policy-tag PT-CAMPUS; nothing needs recreating.</li>
<li>Joined and serving are separate stages.</li>
<li>Walk the chain: AP, tag, map, WLAN, policy, VLAN, radio.</li>
</ul></div>
`,hi:`
<p>Teesra lab ek trouble ticket hai. Sab kuch bana hua dikhta hai, phir bhi LAPTOP1 kehta hai ki NK-STAFF nahi mila. Yeh chapter us symptom ke peeche ka rule sikhata hai aur ek method ki bina kuch dobara banaye broken link kaise dhoondhein.</p>

<h3>Analogy: galat list wala delivery person</h3>
<p>Ek courier building par aata hai, godown mein sahi parcels hain, lekin uski delivery list khaali hai. Woh darwaze par healthy aur tayyar khada hai, par kuch deliver nahi karta kyunki kisi ne use list nahi di. Parcels (WLAN, policy profile, tag) sab exist karte hain. Jo missing hai woh AP ka apna assignment hai.</p>

<h3>Rule</h3>
<div class="note"><p><b>AP SSID tabhi broadcast karta hai jab uska policy tag us WLAN ko ek policy profile se map kare, WLAN enabled ho, policy profile enabled ho, policy VLAN exist kare, aur radio on ho.</b></p></div>
<p>Jis AP ko static tag nahi mila woh <code>default-policy-tag</code> use karta hai. Lab model mein us tag mein koi WLAN-to-policy jodi nahi hoti, isliye untagged AP koi SSID serve nahi karta. Real software mein default policy tag ka behaviour release par aur is par depend karta hai ki GUI wizard use hua ya nahi (jo default mappings add kar sakta hai); ise unreliable maano aur tags hamesha khud assign karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Visibility chain">
<rect x="10" y="10" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="75" y="35" text-anchor="middle" class="svg-ink" font-size="12">WLAN enabled?</text>
<rect x="160" y="10" width="130" height="40" rx="8" fill="#fed7aa"/><text x="225" y="35" text-anchor="middle" class="svg-ink" font-size="12">Policy enabled?</text>
<rect x="310" y="10" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="385" y="35" text-anchor="middle" class="svg-ink" font-size="12">Tag mein jodi?</text>
<rect x="480" y="10" width="150" height="40" rx="8" fill="#fde68a"/><text x="555" y="35" text-anchor="middle" class="svg-ink" font-size="12">AP ke paas woh tag?</text>
<line x1="140" y1="30" x2="160" y2="30" stroke="#64748b"/><line x1="290" y1="30" x2="310" y2="30" stroke="#64748b"/><line x1="460" y1="30" x2="480" y2="30" stroke="#64748b"/>
<rect x="160" y="100" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="235" y="125" text-anchor="middle" class="svg-ink" font-size="12">Policy VLAN exist?</text>
<rect x="340" y="100" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="415" y="125" text-anchor="middle" class="svg-ink" font-size="12">Radio on (country)?</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">Lab wl-default-tag: sirf 4th box galat hai</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">AP1 aur AP2 abhi bhi default-policy-tag par hain</text>
</svg><p class="cap">Object se radio tak ki chain. Ek bhi broken box SSID chhupa deta hai. Boxes ko left se right check karo.</p></div>

<h3>Lab ticket</h3>
<p>WLAN, policy profile aur policy tag exist karte hain aur enabled hain. Dono APs registered hain. LAPTOP1 NK-STAFF nahi dhoondh pa raha. Policy tag aur APs ke beech kaunsa object missing hai yeh dhoondho aur bina kuch recreate kiye fix karo.</p>
<p><b>Step 1: inspect.</b></p>
<pre class="out">WLC1# show ap tag summary

Number of APs: 2

AP Name              AP Mac           Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
------------------------------------------------------------
AP1                  aaaa.bb01.0001   default-site-tag      <span class="hl">default-policy-tag</span>    default-rf-tag      No             Default
AP2                  aaaa.bb01.0002   default-site-tag      <span class="hl">default-policy-tag</span>    default-rf-tag      No             Default</pre>
<p>Clue do columns mein hai. <b>Policy Tag Name</b> default-policy-tag padhta hai aur <b>Tag Source</b> Default padhta hai: kisi ne tag assign nahi kiya. Isse achhi table se compare karo jahan source Static hota hai.</p>
<p><b>Step 2: baaki sab theek hai confirm karo</b> taaki sirf asli cause fix ho.</p>
<pre class="out">WLC1# show wlan summary
1    NK-STAFF    NK-STAFF    <span class="hl">UP</span>    [WPA2][PSK][AES]

WLC1# show wireless tag policy detailed PT-CAMPUS
<span class="hl">NK-STAFF      PP-STAFF</span></pre>
<p><b>Step 3: repair.</b> Dono APs ko maujooda tag do. Kuch recreate nahi hota.</p>
<pre class="code">WLC1# ap name AP1 policy-tag PT-CAMPUS
WLC1# ap name AP2 policy-tag PT-CAMPUS
WLC1# show ap tag summary</pre>
<p><b>Step 4: prove.</b> LAPTOP1 par <code>wifi status</code> chalao taaki NK-STAFF ke saath 10.10.20.0/24 ka IP dikhe, phir <code>ping 10.10.60.20</code> se RAD1 tak pahuncho. Agar client retry kar raha tha to reconnect hone ke liye kuch seconds do; connection dobara shuru karni pad sakti hai.</p>

<h3>Method: top-down, ek command ek fact</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Command</th><th>Healthy jawab</th></tr>
<tr><td>AP joined hai?</td><td><code>show ap summary</code></td><td>Registered</td></tr>
<tr><td>AP ke paas tag hai?</td><td><code>show ap tag summary</code></td><td>Policy tag PT-CAMPUS, source Static</td></tr>
<tr><td>Tag WLAN ko map karta hai?</td><td><code>show wireless tag policy detailed</code></td><td>NK-STAFF PP-STAFF ke saath jodi</td></tr>
<tr><td>WLAN enabled hai?</td><td><code>show wlan summary</code></td><td>UP</td></tr>
<tr><td>Policy enabled aur VLAN ke saath?</td><td><code>show wireless profile policy detailed</code></td><td>ENABLED, VLAN 20</td></tr>
<tr><td>Radios on hain?</td><td><code>show ap dot11 24ghz summary</code></td><td>Enabled</td></tr></table>
<p>Ek AP ko akele bhi padh sakte ho: <code>show ap name AP1 config general</code> uske tags, country code aur CAPWAP state ek view mein print karta hai.</p>
<pre class="out">WLC1# show ap name AP1 config general

CISCO AP Name   : AP1
AP Mode         : Local
IP Address      : 10.10.10.21
Controller      : WLC1
CAPWAP state    : Joined
Site Tag Name   : default-site-tag
Policy Tag Name : <span class="hl">PT-CAMPUS</span>
RF Tag Name     : default-rf-tag
Country Code    : IN</pre>

<div class="eg"><p><b>Worked example.</b> Sirf AP2 tag hua tha. AP1 ke paas LAPTOP1 ko kuch nahi dikhta jabki AP2 ke paas LAPTOP2 chalta hai. Ek <code>show ap tag summary</code> AP1 ko default-policy-tag par aur AP2 ko PT-CAMPUS par dikhata hai. Sirf AP1 repair karo; AP2 ko chhedne ki zaroorat nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) WLAN, policy aur tag dobara bana dena jabki asli problem AP assignment hai. (2) Pehle client mein clue dhoondhna: client par SSID missing ka matlab "koi broadcast nahi kar raha" hai, kyun nahi, yeh nahi. (3) Sirf ek AP tag karna. (4) Yeh maan lena ki "Misconfigured: Yes" column hamesha jawab hai; woh flag tab aata hai jab AP aise tag ko point kare jo exist nahi karta, jo alag fault hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> AP joined ka matlab AP serving nahi. Join (CAPWAP) aur serving (tags) alag stages hain. Default tags wala registered AP koi SSID serve nahi karta.</p></div>

<div class="scn"><h4>Aadhi floor offline</h4><p>Hardware refresh ke baad chhe naye APs automatically join ho gaye lekin engineer ne sirf un chaar ko tag kiya jinke purane naam the. Do untagged APs ke paas ke users ko network nahi dikha aur unhone helpdesk ko call kiya. Helpdesk lead ne <code>show ap tag summary</code> chalaya aur do Default source rows ko zor se padha. Unhe tag karne mein tees second lage.</p><p><b>Seekh:</b> naye APs hamesha default tags ke saath join hote hain, isliye har AP deployment checklist mein tagging step hona chahiye.</p></div>

<div class="iv"><p class="q">"SSID visible nahi hai lekin AP joined dikh raha hai. Kya check karte ho?"</p><p>Strong answer: us AP ko policy tag assigned hai (show ap tag summary), tag WLAN ko policy se map karta hai, WLAN aur policy dono enabled hain, policy VLAN exist karta hai, aur radios aur country valid hain. Bolo ki untagged APs default tags use karte hain aur koi SSID serve nahi karte, aur tum rebuild nahi karte balki specific broken link fix karte ho.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> Tag columns <b>Monitoring &gt; Wireless &gt; Access Points</b> mein padho, fix karo <b>Configuration &gt; Wireless &gt; Access Points</b> mein (AP select karo, tab <b>Tags</b>, PT-CAMPUS chuno), phir client confirm karo <b>Monitoring &gt; Wireless &gt; Clients</b> mein.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Untagged APs default tags use karte hain aur lab mein koi SSID serve nahi karte.</li>
<li>show ap tag summary: Policy Tag Name aur Tag Source dekho.</li>
<li>ap name AP1 policy-tag PT-CAMPUS se fix karo; kuch recreate nahi karna.</li>
<li>Joined aur serving alag stages hain.</li>
<li>Chain chalo: AP, tag, map, WLAN, policy, VLAN, radio.</li>
</ul></div>
`}};export{e as default};