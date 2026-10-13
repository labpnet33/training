var e={id:`site-tag-policy`,h:{en:`Site tag, policy profile and policy tag: wiring the AP`,hi:`Site tag, policy profile aur policy tag: AP ko wire karna`},body:{en:`
<p>The flex profile is the rulebook, but a rulebook in a drawer helps nobody. The <b>site tag</b> is the label on the shop door that says "use this rulebook", and the <b>policy tag</b> is the menu that says which WLAN is served in which way. An AP wears one tag of each kind (plus an RF tag you know from earlier modules). The controller reads the tags and decides everything.</p>

<h3>The site tag and local-site</h3>
<p>A site tag has two relevant settings. <code>flex-profile &lt;name&gt;</code> links the flex profile. <code>local-site</code> says whether APs on this tag are <b>local mode</b> (yes, the default) or <b>FlexConnect</b> (<code>no local-site</code>). Both are needed: the flex profile gives the rules, <code>no local-site</code> turns the rules on.</p>
<pre class="code"><span class="c">! lab 1: a flex site for Pune</span>
wireless tag site SITE-PUNE
 flex-profile FLEX-PUNE
 no local-site
 exit</pre>
<ul>
<li>The built-in <code>default-site-tag</code> is a local site and cannot be changed. Never try to make it flex; make your own tag.</li>
<li>A site tag that names a flex profile but keeps <code>local-site</code> is a classic trap. The AP stays in local mode and <b>ignores</b> the flex profile. The detail command even says so.</li>
<li>A flex profile cannot be deleted while a site tag uses it.</li>
</ul>

<h3>The policy profile and the tag that carries it</h3>
<p>The policy profile of a branch WLAN has the VLAN, and the switching and authentication knobs from chapter 2. The policy tag maps WLANs to policy profiles. Pune gets its own policy tag, because the staff WLAN must be locally switched at Pune but may be centrally switched at headquarters:</p>
<pre class="code">wireless profile policy PP-STAFF-PUN
 vlan 220
 no central switching
 no shutdown
 exit
wireless tag policy PT-PUNE
 wlan NK-STAFF policy PP-STAFF-PUN
 wlan NK-CORP policy PP-CORP-PUN
 wlan NK-GUEST policy PP-GUEST
 exit</pre>
<p>The same WLAN NK-STAFF therefore behaves differently on two tags: <code>PT-MUM</code> maps it to the central <code>PP-STAFF</code>, <code>PT-PUNE</code> maps it to the local <code>PP-STAFF-PUN</code>. That is the real power of the tag model: one SSID, many behaviours.</p>

<h3>Tagging the APs</h3>
<p>Static tagging is done per AP, by Ethernet MAC address. After you tag an AP, the controller applies the tags to it.</p>
<pre class="code">ap 0050.7966.6811
 site-tag SITE-PUNE
 policy-tag PT-PUNE
 exit
ap 0050.7966.6812
 site-tag SITE-PUNE
 policy-tag PT-PUNE
 exit</pre>
<p>In the web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; Tags</b> has the <b>Policy</b>, <b>Site</b> and <b>RF</b> tabs to create the tags; <b>Configuration &gt; Wireless &gt; Access Points</b> lets you pick tags per AP.</p>
<div class="note"><p><b>In production</b>, changing the site tag makes the AP drop its CAPWAP session and rejoin, so a branch has a short outage. Do tag changes in a window. A common automation is a tag filter or rule by AP-name pattern (for example every AP named PUN-*), so that new APs land on the right site tag automatically.</p></div>

<h3>Verification</h3>
<pre class="out">WLC1# show ap tag summary
Number of APs: 3

AP Name              AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
-----------------------------------------------------------------------------------------------------------------------------
AP-PUN1              0050.7966.6811  <span class="hl">SITE-PUNE</span>             PT-PUNE               default-rf-tag      No             Static
AP-PUN2              0050.7966.6812  <span class="hl">SITE-PUNE</span>             PT-PUNE               default-rf-tag      No             Static
AP1                  0050.7966.6801  default-site-tag      PT-MUM                default-rf-tag      No             Static

WLC1# show ap name AP-PUN1 config general
CISCO AP Name   : AP-PUN1
<span class="hl">AP Mode         : FlexConnect</span>
IP Address      : 10.30.10.11
Controller      : WLC1
CAPWAP state    : Joined
Site Tag Name   : SITE-PUNE
Policy Tag Name : PT-PUNE
Flex Profile Name : FLEX-PUNE
Flex Native VLAN  : 210
Switch Port Native: 210
<span class="hl">FlexConnect State : Connected</span></pre>
<p>The three lines to read are <b>AP Mode</b>, the <b>flex native VLAN versus the switch port native</b>, and <b>FlexConnect State</b>. If AP Mode says Local, your site tag is still a local site.</p>

<h3>The local-site symptom</h3>
<p>If an AP has a locally switched policy but a local-site tag, the controller refuses the client, because a local-mode AP cannot switch locally.</p>
<pre class="out">WLC1# show logging
%CLIENT_ORCH_LOG-3-CLIENT_ASSOC_FAIL: policy profile PP-STAFF-PUN has central switching disabled but AP AP-PUN2 is in local mode (no FlexConnect profile)

WLC1# show wireless tag site detailed SITE-PUNE-B
Site Tag Name   : SITE-PUNE-B
AP Profile      : default-ap-profile
<span class="hl">Local-site      : Yes</span>
Flex Profile    : FLEX-PUNE  (ignored: the tag is a local site)</pre>
<p>After you fix the tag, the client does not return by itself in the lab: its auto-connect paused after the refusal, so run <code>wifi connect</code> on the laptop.</p>

<div class="warn"><p><b>Common mistake.</b> Giving the AP a flex site tag but leaving it on a policy tag whose policy profile uses central switching for every WLAN. The AP is a FlexConnect AP, yet the data still crosses the WAN. Check both tags.</p></div>

<div class="exam"><p><b>Exam trap.</b> The word "FlexConnect" appears nowhere in the AP mode setting on a 9800 in this design. The mode is derived: site tag with <code>no local-site</code> means FlexConnect. And the policy tag decides local switching, not the site tag.</p></div>

<div class="scn"><h4>The tag that was almost right</h4><p>An engineer created SITE-PUNE-B, pointed it at the right flex profile and moved AP-PUN2 to it, but forgot <code>no local-site</code>. Staff near AP-PUN2 could see NK-STAFF yet association failed. The log showed CLIENT_ASSOC_FAIL naming the local mode AP. One line, <code>no local-site</code>, fixed it; the laptop needed a manual reconnect.</p><p><b>Lesson:</b> flex profile attached is not flex mode; read show ap name config general first.</p></div>

<div class="iv"><p class="q">"How does an AP become a FlexConnect AP on a Catalyst 9800?"</p><p>Through its site tag: the tag must link a flex profile and carry <code>no local-site</code>. The policy tag then selects the policy profiles, where <code>no central switching</code> gives local switching per WLAN. Mention that the default site tag is a local site and cannot be edited.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site tag: <code>flex-profile NAME</code> plus <code>no local-site</code> makes a flex site.</li>
<li>A local-site tag ignores its flex profile; the AP stays in local mode.</li>
<li>Policy tag maps each WLAN to a policy profile; local switching lives in the policy profile.</li>
<li>Tag APs by MAC; a tag change makes the AP rejoin.</li>
<li>Read AP Mode and FlexConnect State in show ap name config general.</li>
</ul></div>
`,hi:`
<p>Flex profile rulebook hai, lekin drawer mein padi rulebook kisi ke kaam nahi aati. <b>Site tag</b> shop ke darwaze ka label hai jo kehta hai "yeh rulebook use karo", aur <b>policy tag</b> woh menu hai jo batata hai kaunsa WLAN kis tarah serve hoga. Ek AP har kism ka ek tag pehenta hai (aur RF tag jo aap pehle ke modules se jaante ho). Controller tags padhta hai aur sab decide karta hai.</p>

<h3>Site tag aur local-site</h3>
<p>Site tag ki do relevant settings hain. <code>flex-profile &lt;name&gt;</code> flex profile ko link karta hai. <code>local-site</code> batata hai ki is tag ke APs <b>local mode</b> hain (yes, default) ya <b>FlexConnect</b> (<code>no local-site</code>). Dono chahiye: flex profile rules deta hai, <code>no local-site</code> rules ko on karta hai.</p>
<pre class="code"><span class="c">! lab 1: Pune ke liye flex site</span>
wireless tag site SITE-PUNE
 flex-profile FLEX-PUNE
 no local-site
 exit</pre>
<ul>
<li>Built-in <code>default-site-tag</code> ek local site hai aur badla nahi ja sakta. Use flex banane ki koshish mat karo; apna tag banao.</li>
<li>Jo site tag flex profile ka naam leta hai lekin <code>local-site</code> rakhta hai woh classic trap hai. AP local mode mein rehta hai aur flex profile ko <b>ignore</b> karta hai. Detail command yeh bata bhi deta hai.</li>
<li>Jab tak koi site tag flex profile use kar raha ho, use delete nahi kar sakte.</li>
</ul>

<h3>Policy profile aur use carry karne wala tag</h3>
<p>Branch WLAN ke policy profile mein VLAN hota hai, aur chapter 2 ke switching aur authentication knobs. Policy tag WLANs ko policy profiles se map karta hai. Pune ko apna policy tag milta hai, kyunki staff WLAN Pune mein locally switch hona chahiye lekin headquarters mein centrally switch ho sakta hai:</p>
<pre class="code">wireless profile policy PP-STAFF-PUN
 vlan 220
 no central switching
 no shutdown
 exit
wireless tag policy PT-PUNE
 wlan NK-STAFF policy PP-STAFF-PUN
 wlan NK-CORP policy PP-CORP-PUN
 wlan NK-GUEST policy PP-GUEST
 exit</pre>
<p>Isliye wahi WLAN NK-STAFF do tags par alag behave karta hai: <code>PT-MUM</code> use central <code>PP-STAFF</code> se map karta hai, <code>PT-PUNE</code> use local <code>PP-STAFF-PUN</code> se. Tag model ki asli taqat yahi hai: ek SSID, kai behaviours.</p>

<h3>APs ko tag karna</h3>
<p>Static tagging per AP hoti hai, Ethernet MAC address se. AP ko tag karne ke baad controller tags us par lagata hai.</p>
<pre class="code">ap 0050.7966.6811
 site-tag SITE-PUNE
 policy-tag PT-PUNE
 exit
ap 0050.7966.6812
 site-tag SITE-PUNE
 policy-tag PT-PUNE
 exit</pre>
<p>Web UI mein: <b>Configuration &gt; Tags &amp; Profiles &gt; Tags</b> mein tags banane ke liye <b>Policy</b>, <b>Site</b> aur <b>RF</b> tabs hain; <b>Configuration &gt; Wireless &gt; Access Points</b> se per AP tags choose karte ho.</p>
<div class="note"><p><b>Production mein</b>, site tag badalne se AP apna CAPWAP session girata hai aur rejoin karta hai, isliye branch ka chhota outage hota hai. Tag changes window mein karo. Ek common automation AP-name pattern ka tag filter ya rule hai (jaise har AP jiska naam PUN-* ho), taaki naye APs apne aap sahi site tag par jayein.</p></div>

<h3>Verification</h3>
<pre class="out">WLC1# show ap tag summary
Number of APs: 3

AP Name              AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
-----------------------------------------------------------------------------------------------------------------------------
AP-PUN1              0050.7966.6811  <span class="hl">SITE-PUNE</span>             PT-PUNE               default-rf-tag      No             Static
AP-PUN2              0050.7966.6812  <span class="hl">SITE-PUNE</span>             PT-PUNE               default-rf-tag      No             Static
AP1                  0050.7966.6801  default-site-tag      PT-MUM                default-rf-tag      No             Static

WLC1# show ap name AP-PUN1 config general
CISCO AP Name   : AP-PUN1
<span class="hl">AP Mode         : FlexConnect</span>
IP Address      : 10.30.10.11
Controller      : WLC1
CAPWAP state    : Joined
Site Tag Name   : SITE-PUNE
Policy Tag Name : PT-PUNE
Flex Profile Name : FLEX-PUNE
Flex Native VLAN  : 210
Switch Port Native: 210
<span class="hl">FlexConnect State : Connected</span></pre>
<p>Teen lines padhni hain: <b>AP Mode</b>, <b>flex native VLAN versus switch port native</b>, aur <b>FlexConnect State</b>. AP Mode Local dikhaye to aapka site tag abhi bhi local site hai.</p>

<h3>Local-site ka symptom</h3>
<p>Agar AP ke paas locally switched policy hai lekin local-site tag, controller client ko mana kar deta hai, kyunki local-mode AP locally switch nahi kar sakta.</p>
<pre class="out">WLC1# show logging
%CLIENT_ORCH_LOG-3-CLIENT_ASSOC_FAIL: policy profile PP-STAFF-PUN has central switching disabled but AP AP-PUN2 is in local mode (no FlexConnect profile)

WLC1# show wireless tag site detailed SITE-PUNE-B
Site Tag Name   : SITE-PUNE-B
AP Profile      : default-ap-profile
<span class="hl">Local-site      : Yes</span>
Flex Profile    : FLEX-PUNE  (ignored: the tag is a local site)</pre>
<p>Tag fix karne ke baad lab mein client apne aap wapas nahi aata: refusal ke baad uska auto-connect pause ho gaya, isliye laptop par <code>wifi connect</code> chalao.</p>

<div class="warn"><p><b>Common mistake.</b> AP ko flex site tag dena lekin use aisa policy tag par chhodna jiska policy profile har WLAN ke liye central switching use karta hai. AP FlexConnect AP hai, phir bhi data WAN cross karta hai. Dono tags check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Is design mein 9800 par AP mode setting mein "FlexConnect" shabd kahin nahi aata. Mode derived hota hai: <code>no local-site</code> wala site tag matlab FlexConnect. Aur local switching policy tag decide karta hai, site tag nahi.</p></div>

<div class="scn"><h4>Almost sahi tag</h4><p>Ek engineer ne SITE-PUNE-B banaya, sahi flex profile par point kiya aur AP-PUN2 ko use par move kiya, lekin <code>no local-site</code> bhool gaya. AP-PUN2 ke paas staff ko NK-STAFF dikhta tha lekin association fail hota tha. Log mein CLIENT_ASSOC_FAIL local mode AP ka naam leta tha. Ek line, <code>no local-site</code>, ne fix kar diya; laptop ko manual reconnect chahiye tha.</p><p><b>Lesson:</b> flex profile attach hona flex mode nahi hai; pehle show ap name config general padho.</p></div>

<div class="iv"><p class="q">"Catalyst 9800 par AP FlexConnect AP kaise banta hai?"</p><p>Apne site tag se: tag ko flex profile link karna hai aur <code>no local-site</code> rakhna hai. Phir policy tag policy profiles select karta hai, jahan <code>no central switching</code> per WLAN local switching deta hai. Bolo ki default site tag local site hai aur edit nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site tag: <code>flex-profile NAME</code> aur <code>no local-site</code> flex site banate hain.</li>
<li>Local-site tag apne flex profile ko ignore karta hai; AP local mode mein rehta hai.</li>
<li>Policy tag har WLAN ko policy profile se map karta hai; local switching policy profile mein hai.</li>
<li>APs ko MAC se tag karo; tag change AP ko rejoin karwata hai.</li>
<li>show ap name config general mein AP Mode aur FlexConnect State padho.</li>
</ul></div>
`}};export{e as default};