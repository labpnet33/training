var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a franchise shop that must keep trading when head office is unreachable. You now have the whole kit: the four ideas, the four objects, the VLAN rules, the local authentication path and the troubleshooting order. Use this chapter as a final revision sheet.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Chain from AP to tags to profiles">
<rect x="10" y="50" width="90" height="50" rx="8" fill="#fed7aa"/><text x="55" y="80" text-anchor="middle" class="svg-ink" font-size="13">AP (MAC)</text>
<rect x="130" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="195" y="45" text-anchor="middle" class="svg-ink" font-size="12">site tag</text>
<rect x="130" y="90" width="130" height="40" rx="8" fill="#bae6fd"/><text x="195" y="115" text-anchor="middle" class="svg-ink" font-size="12">policy tag</text>
<rect x="300" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="375" y="45" text-anchor="middle" class="svg-ink" font-size="12">flex profile</text>
<rect x="300" y="90" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="375" y="115" text-anchor="middle" class="svg-ink" font-size="12">policy profile</text>
<rect x="490" y="20" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="12">native, VLAN map,</text><text x="560" y="54" text-anchor="middle" class="svg-ink" font-size="12">ACL, local auth</text>
<rect x="490" y="90" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="12">VLAN, switching,</text><text x="560" y="124" text-anchor="middle" class="svg-ink" font-size="12">central auth</text>
<line x1="100" y1="65" x2="130" y2="40" stroke="#64748b" stroke-width="2"/><line x1="100" y1="85" x2="130" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="40" x2="300" y2="40" stroke="#64748b" stroke-width="2"/><line x1="260" y1="110" x2="300" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="40" x2="490" y2="40" stroke="#64748b" stroke-width="2"/><line x1="450" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The AP wears two tags; each tag leads to a profile with the details.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain central versus local switching, and central versus local authentication, and say which survives a WAN loss.</li>
<li>Build FLEX-PUNE (native 210, STAFF-PUN to 220), SITE-PUNE (<code>no local-site</code>), PP-STAFF-PUN (<code>no central switching</code>) and PT-PUNE and tag the APs.</li>
<li>Configure the switch port as a trunk with native 210 and allowed 210,220, and the DHCP pools with option 43.</li>
<li>Predict where a client lands for a mapped and an unmapped VLAN.</li>
<li>Recognise native VLAN mismatch and local-site symptoms in the log and in show ap name config general.</li>
<li>Configure local authentication and register APs on the branch RADIUS server.</li>
<li>Describe efficient AP upgrade, key caching and OEAP, and say they are concept only here.</li>
<li>Design a branch from requirements and walk a ticket through the seven-step workflow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FlexConnect</dt><dd>AP operation that allows local switching and standalone operation.</dd>
<dt>Local-site</dt><dd>Site tag setting; yes means local mode, <code>no local-site</code> means flex.</dd>
<dt>Native VLAN</dt><dd>Untagged VLAN of the AP trunk; used for AP management.</dd>
<dt>Standalone mode</dt><dd>AP without a controller, serving what needs nothing from it.</dd>
<dt>Central / local switching</dt><dd>Tunnel to the controller / switched on the branch VLAN.</dd>
<dt>NAS</dt><dd>Network access device, the RADIUS client; with local auth it is the AP.</dd>
<dt>OEAP</dt><dd>OfficeExtend AP, a flex AP at home with a DTLS tunnel and split tunnelling.</dd>
<dt>Efficient upgrade</dt><dd>Master AP downloads over the WAN once; others copy over the LAN.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Flex mode source</td><td>site tag with <code>no local-site</code> plus a flex profile</td></tr>
<tr><td>Local switching</td><td><code>no central switching</code> in the policy profile (profile shut first)</td></tr>
<tr><td>Native VLAN</td><td>flex profile native-vlan-id equals trunk native VLAN; default 1</td></tr>
<tr><td>Unmapped VLAN</td><td>client falls to the native VLAN</td></tr>
<tr><td>WAN down</td><td>local, PSK and local-auth WLANs survive; central WLANs do not</td></tr>
<tr><td>Local auth</td><td>group in the flex profile, no central authentication, AP as RADIUS client</td></tr>
<tr><td>Default objects</td><td>default-flex-profile and default-site-tag cannot be changed or deleted</td></tr>
<tr><td>Ports and numbers</td><td>CAPWAP control 5246, data 5247; RADIUS auth 1812</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code">wireless profile flex FLEX-PUNE
 native-vlan-id 210
 vlan-name STAFF-PUN
  vlan-id 220
 local-auth radius-server-group RG-PUN
wireless tag site SITE-PUNE
 flex-profile FLEX-PUNE
 no local-site
wireless profile policy PP-STAFF-PUN
 shutdown
 vlan 220
 no central switching
 no central authentication
 no shutdown
wireless tag policy PT-PUNE
 wlan NK-STAFF policy PP-STAFF-PUN
ap &lt;mac&gt;
 site-tag SITE-PUNE
 policy-tag PT-PUNE</pre>
<pre class="out">show wireless profile flex summary | detailed &lt;name&gt;
show wireless tag site detailed &lt;name&gt;
show ap name &lt;ap&gt; config general
show ap summary | show ap tag summary
show wireless client summary
show wireless client mac-address &lt;mac&gt; detail
show logging</pre>
<p>Web UI: Configuration &gt; Tags &amp; Profiles &gt; Flex, Policy and Tags; Monitoring &gt; Wireless &gt; Access Points and Clients; Troubleshooting &gt; Logs.</p>

<h3>What is concept only, and what to confirm</h3>
<ul>
<li>Concept only in the labs: efficient AP upgrade and pre-download, OEAP and split tunnelling, key caching between flex APs, per-AP overrides, central DHCP details, VLAN-based central switching, ACL enforcement and ARP caching effects.</li>
<li>To confirm on your IOS XE release: the exact command for local authentication in the policy profile (<code>no central authentication</code> is the form used here), the way unmapped VLANs are reported, the per-site AP limit, and the place of the efficient upgrade setting.</li>
</ul>

<div class="warn"><p><b>Common mistake in exams.</b> Choosing "local mode" for a branch with a 200 ms link. Local mode wants a short round trip; FlexConnect is the answer.</p></div>

<div class="exam"><p><b>Exam trap.</b> Central association, central DHCP and central authentication each need the WAN. Local switching alone does not make a WLAN survive an outage.</p></div>

<div class="scn"><h4>The annual disaster drill</h4><p>A logistics firm tests each branch yearly by unplugging the WAN for ten minutes. The checklist: staff on PSK still connect; corporate users join through the branch RADIUS; guests are expected to lose service; the controller shows the APs as missing and the NOC sees the AP_LOST alert; after plugging back, the APs rejoin and the log confirms it. All Pune checks passed because every item of this chapter had been configured.</p><p><b>Lesson:</b> rehearse the failure you designed for.</p></div>

<div class="iv"><p class="q">"Summarise FlexConnect in thirty seconds."</p><p>FlexConnect lets a branch AP switch client traffic locally and keep working without its controller. A site tag with no local-site and a flex profile (native VLAN, VLAN mapping, local auth group) turns it on; policy profiles choose switching per WLAN; branch DHCP and RADIUS keep it alive in standalone mode.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flex mode comes from the site tag; local switching comes from the policy profile.</li>
<li>Three numbers must agree: flex native VLAN, switch trunk native VLAN, AP pool VLAN.</li>
<li>Standalone mode keeps local, PSK and local-auth WLANs; the controller hides the APs.</li>
<li>Local authentication makes the AP the RADIUS client.</li>
<li>Know the concept-only topics and confirm release-specific commands in the guide.</li>
</ul></div>
`,hi:`
<p>Aapne ek franchise shop se shuruaat ki thi jo head office unreachable hone par bhi trading karti rehti hai. Ab aapke paas poora kit hai: char ideas, char objects, VLAN rules, local authentication path aur troubleshooting order. Is chapter ko final revision sheet ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="AP se tags se profiles tak chain">
<rect x="10" y="50" width="90" height="50" rx="8" fill="#fed7aa"/><text x="55" y="80" text-anchor="middle" class="svg-ink" font-size="13">AP (MAC)</text>
<rect x="130" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="195" y="45" text-anchor="middle" class="svg-ink" font-size="12">site tag</text>
<rect x="130" y="90" width="130" height="40" rx="8" fill="#bae6fd"/><text x="195" y="115" text-anchor="middle" class="svg-ink" font-size="12">policy tag</text>
<rect x="300" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="375" y="45" text-anchor="middle" class="svg-ink" font-size="12">flex profile</text>
<rect x="300" y="90" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="375" y="115" text-anchor="middle" class="svg-ink" font-size="12">policy profile</text>
<rect x="490" y="20" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="12">native, VLAN map,</text><text x="560" y="54" text-anchor="middle" class="svg-ink" font-size="12">ACL, local auth</text>
<rect x="490" y="90" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="12">VLAN, switching,</text><text x="560" y="124" text-anchor="middle" class="svg-ink" font-size="12">central auth</text>
<line x1="100" y1="65" x2="130" y2="40" stroke="#64748b" stroke-width="2"/><line x1="100" y1="85" x2="130" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="40" x2="300" y2="40" stroke="#64748b" stroke-width="2"/><line x1="260" y1="110" x2="300" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="40" x2="490" y2="40" stroke="#64748b" stroke-width="2"/><line x1="450" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">AP do tags pehente hai; har tag details wale profile tak jata hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Central versus local switching, aur central versus local authentication samjhao, aur batao kaunsa WAN loss survive karta hai.</li>
<li>FLEX-PUNE (native 210, STAFF-PUN se 220), SITE-PUNE (<code>no local-site</code>), PP-STAFF-PUN (<code>no central switching</code>) aur PT-PUNE banao aur APs tag karo.</li>
<li>Switch port ko native 210 aur allowed 210,220 wale trunk ke roop mein, aur DHCP pools ko option 43 ke saath configure karo.</li>
<li>Mapped aur unmapped VLAN ke liye predict karo client kahan jata hai.</li>
<li>Log mein aur show ap name config general mein native VLAN mismatch aur local-site symptoms pehchano.</li>
<li>Local authentication configure karo aur APs ko branch RADIUS server par register karo.</li>
<li>Efficient AP upgrade, key caching aur OEAP describe karo, aur batao ki yahan yeh concept only hain.</li>
<li>Requirements se branch design karo aur ticket ko saat-step workflow se chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FlexConnect</dt><dd>AP operation jo local switching aur standalone operation allow karta hai.</dd>
<dt>Local-site</dt><dd>Site tag setting; yes matlab local mode, <code>no local-site</code> matlab flex.</dd>
<dt>Native VLAN</dt><dd>AP trunk ka untagged VLAN; AP management ke liye.</dd>
<dt>Standalone mode</dt><dd>Controller ke bina AP, jo controller se kuch na chahiye wahi serve karta hai.</dd>
<dt>Central / local switching</dt><dd>Controller tak tunnel / branch VLAN par switch.</dd>
<dt>NAS</dt><dd>Network access device, RADIUS client; local auth mein woh AP hota hai.</dd>
<dt>OEAP</dt><dd>OfficeExtend AP, ghar par flex AP jisme DTLS tunnel aur split tunnelling.</dd>
<dt>Efficient upgrade</dt><dd>Master AP WAN par ek baar download karta hai; baaki LAN par copy karte hain.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Flex mode ka source</td><td><code>no local-site</code> wala site tag aur flex profile</td></tr>
<tr><td>Local switching</td><td>policy profile mein <code>no central switching</code> (pehle profile shut)</td></tr>
<tr><td>Native VLAN</td><td>flex profile native-vlan-id trunk native VLAN ke barabar; default 1</td></tr>
<tr><td>Unmapped VLAN</td><td>client native VLAN par girta hai</td></tr>
<tr><td>WAN down</td><td>local, PSK aur local-auth WLANs bachte hain; central WLANs nahi</td></tr>
<tr><td>Local auth</td><td>flex profile mein group, no central authentication, AP RADIUS client</td></tr>
<tr><td>Default objects</td><td>default-flex-profile aur default-site-tag badle ya delete nahi ho sakte</td></tr>
<tr><td>Ports aur numbers</td><td>CAPWAP control 5246, data 5247; RADIUS auth 1812</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code">wireless profile flex FLEX-PUNE
 native-vlan-id 210
 vlan-name STAFF-PUN
  vlan-id 220
 local-auth radius-server-group RG-PUN
wireless tag site SITE-PUNE
 flex-profile FLEX-PUNE
 no local-site
wireless profile policy PP-STAFF-PUN
 shutdown
 vlan 220
 no central switching
 no central authentication
 no shutdown
wireless tag policy PT-PUNE
 wlan NK-STAFF policy PP-STAFF-PUN
ap &lt;mac&gt;
 site-tag SITE-PUNE
 policy-tag PT-PUNE</pre>
<pre class="out">show wireless profile flex summary | detailed &lt;name&gt;
show wireless tag site detailed &lt;name&gt;
show ap name &lt;ap&gt; config general
show ap summary | show ap tag summary
show wireless client summary
show wireless client mac-address &lt;mac&gt; detail
show logging</pre>
<p>Web UI: Configuration &gt; Tags &amp; Profiles &gt; Flex, Policy aur Tags; Monitoring &gt; Wireless &gt; Access Points aur Clients; Troubleshooting &gt; Logs.</p>

<h3>Kya concept only hai, aur kya confirm karna hai</h3>
<ul>
<li>Labs mein concept only: efficient AP upgrade aur pre-download, OEAP aur split tunnelling, flex APs ke beech key caching, per-AP overrides, central DHCP details, VLAN-based central switching, ACL enforcement aur ARP caching effects.</li>
<li>Apne IOS XE release par confirm karo: policy profile mein local authentication ka exact command (yahan <code>no central authentication</code> use hua hai), unmapped VLANs kaise report hote hain, per-site AP limit, aur efficient upgrade setting ki jagah.</li>
</ul>

<div class="warn"><p><b>Exam mein common mistake.</b> 200 ms link wale branch ke liye "local mode" choose karna. Local mode ko chhota round trip chahiye; FlexConnect jawab hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Central association, central DHCP aur central authentication, teeno ko WAN chahiye. Sirf local switching WLAN ko outage survive nahi karwata.</p></div>

<div class="scn"><h4>Saalana disaster drill</h4><p>Ek logistics firm har branch ko saal mein ek baar dus minute WAN unplug karke test karti hai. Checklist: PSK par staff abhi bhi connect hota hai; corporate users branch RADIUS se join hote hain; guests ki service jaana expected hai; controller APs ko missing dikhata hai aur NOC AP_LOST alert dekhta hai; wapas plug karne par APs rejoin karte hain aur log confirm karta hai. Pune ke saare checks pass hue kyunki is chapter ki har cheez configured thi.</p><p><b>Lesson:</b> jis failure ke liye design kiya use rehearse karo.</p></div>

<div class="iv"><p class="q">"FlexConnect ko tees second mein summarise karo."</p><p>FlexConnect branch AP ko client traffic locally switch karne aur controller ke bina kaam karte rehne deta hai. No local-site wala site tag aur flex profile (native VLAN, VLAN mapping, local auth group) use on karte hain; policy profiles per WLAN switching choose karte hain; branch DHCP aur RADIUS use standalone mode mein zinda rakhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flex mode site tag se aata hai; local switching policy profile se.</li>
<li>Teen numbers agree hone chahiye: flex native VLAN, switch trunk native VLAN, AP pool VLAN.</li>
<li>Standalone mode local, PSK aur local-auth WLANs rakhta hai; controller APs chhupata hai.</li>
<li>Local authentication AP ko RADIUS client banata hai.</li>
<li>Concept-only topics jaano aur release-specific commands guide mein confirm karo.</li>
</ul></div>
`}};export{e as default};