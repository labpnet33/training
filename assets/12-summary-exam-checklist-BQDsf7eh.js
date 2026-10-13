var e={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs a checklist before every flight, not because she forgot how to fly but because the checklist catches the one thing that would hurt. This chapter is your checklist for wireless QoS, AVC and multicast: what you can do, the words you must know, the facts examiners love, and the commands in one place.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why Wi-Fi QoS is statistical priority (EDCA) and not a guarantee.</li>
<li>Name the four access categories and which UP values select them.</li>
<li>Describe how DSCP, UP and the CAPWAP outer header relate, upstream and downstream.</li>
<li>Choose and attach platinum, gold, silver or bronze in the right direction.</li>
<li>Write a class-map and a policy-map and attach them as input or output.</li>
<li>Explain why a match protocol class needs the AVC flow monitor.</li>
<li>Configure switch trust on the controller port and the AP ports.</li>
<li>Set WMM allowed, require or disabled and predict who is refused.</li>
<li>Choose multicast-unicast or multicast-multicast and explain the underlay needed.</li>
<li>Explain IGMP snooping and the mDNS gateway.</li>
<li>Run a trace and a multicast test and name what each proves.</li>
<li>State what is concept only: queueing, police enforcement, CAC and Videostream, per-application statistics, custom NetFlow records, match access-group, the mDNS data plane, multicast routing from the source.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>WMM</dt><dd>Wi-Fi Multimedia, the certified subset of 802.11e.</dd>
<dt>EDCA</dt><dd>Enhanced Distributed Channel Access: four queues with different AIFSN, CW and TXOP.</dd>
<dt>AC / UP</dt><dd>Access category and 3-bit user priority (0 to 7).</dd>
<dt>DSCP</dt><dd>6-bit IP marking; EF 46, AF41 34, CS3 24, CS1 8.</dd>
<dt>Metal policy</dt><dd>Built-in platinum, gold, silver, bronze policy-maps (output) and their -up forms (input) that cap DSCP.</dd>
<dt>MQC</dt><dd>class-map, policy-map, service-policy.</dd>
<dt>AVC</dt><dd>NBAR2 recognition plus flexible NetFlow monitor (wireless-avc-basic).</dd>
<dt>CAC / TSPEC</dt><dd>Admission control and the traffic specification a client sends in ADDTS.</dd>
<dt>IGMP snooping</dt><dd>Forward multicast only toward receivers that joined.</dd>
<dt>mDNS</dt><dd>Link-local multicast service discovery on 224.0.0.251, UDP 5353.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>AC to UP</td><td>VO 7,6; VI 5,4; BE 0,3; BK 2,1</td></tr>
<tr><td>Metal caps (lab model)</td><td>platinum 46, gold 34, silver 0, bronze 8</td></tr>
<tr><td>Direction</td><td>input = client to network, output = network to client</td></tr>
<tr><td>WMM modes</td><td>allowed (default), require, disabled</td></tr>
<tr><td>Untrusted port with mls qos on</td><td>resets DSCP to 0</td></tr>
<tr><td>Protocol class</td><td>needs wireless-avc-basic in the same direction</td></tr>
<tr><td>Default multicast mode</td><td>multicast-unicast; multicast-multicast needs PIM underlay</td></tr>
<tr><td>Wireless multicast</td><td>off by default; must be enabled</td></tr>
<tr><td>Edits</td><td>WLAN and policy profile must be shut first</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">wlan NK-VOICE
 wmm require | allowed | disabled
wireless profile policy PP-VOICE
 service-policy input platinum-up
 service-policy output platinum
 ipv4 flow monitor wireless-avc-basic input
 mdns-sd service-policy SP-OFFICE
class-map match-any NAME
 match dscp ef | match protocol rtp-audio
policy-map NAME
 class NAME
  set dscp ef
wireless autoqos policy-profile PP-VOICE mode voice
ap profile NAME
 no qos-map trust-dscp
wireless multicast
ap capwap multicast 239.1.1.1 | no ap capwap multicast
ip igmp snooping [vlan 10]
<span class="c">! SW1</span>
mls qos
interface GigabitEthernet0/1
 mls qos trust dscp</pre>
<pre class="out">show policy-map [NAME]            show class-map [NAME]
show wlan name NAME               show wireless profile policy detailed NAME
show wireless multicast           show ip igmp snooping [groups]
show mdns-sd summary              show mls qos interface [INTF]
wifi qos trace                    wifi mcast test GROUP</pre>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b> and <b>Configuration &gt; Wireless &gt; Multicast</b>.</p>

<div class="eg"><p><b>Worked example.</b> Quick self-test. A WLAN has wmm disabled, silver, and SW1 Gi0/1 untrusted. Which fixes are needed for a clean voice call? All three: WMM allowed or required on the WLAN, platinum pair on the policy profile, trust dscp on Gi0/1. Fix them one at a time and re-trace after each: you will see the verdict change.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day:</b></p><ul>
<li>Mixing UP and DSCP as if they were the same field.</li>
<li>Thinking a metal policy raises a marking.</li>
<li>Forgetting that the AP ports carry the outer CAPWAP DSCP.</li>
<li>Choosing multicast-multicast "because it is better" without the underlay.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> when an answer says QoS "guarantees" voice quality on Wi-Fi, it is wrong. EDCA gives better odds; CAC and design provide the rest.</p></div>

<div class="scn"><h4>The pre-go-live review</h4><p>Before opening a new office, an engineer walks the checklist: WMM on the voice WLAN, platinum pair on the policy profile, AP trust, switch trust on all four ports, a trace from a test phone, CAC planned, multicast mode chosen, mDNS limited to printers. Two items fail in testing, both on the switch. They are fixed before the staff arrive.</p><p><b>Lesson:</b> checklists find the boring faults before users do.</p></div>

<div class="iv"><p class="q">"Give me the end-to-end design for a voice WLAN on a 9800."</p><p>5 GHz-capable design with good signal; a dedicated WLAN with wmm require; policy profile with platinum-up and platinum; AP trust of DSCP; trust dscp on every switch port in the path; CAC for capacity; verify with a trace. Add that metals cap, AVC adds application awareness, and Videostream and multicast need their own design.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi QoS is statistical; the wire and controller must keep the marking.</li>
<li>Four things to check: WMM, policy profile policies and monitor, switch trust, AP trust.</li>
<li>Multicast: enable wireless multicast, pick the mode, mind the underlay and IGMP snooping.</li>
<li>mDNS gateway filters Bonjour between VLANs; the data plane is concept only in the lab.</li>
<li>Always prove with the same trace or test that showed the fault.</li>
</ul></div>
`,hi:`
<p>Pilot har flight se pehle checklist chalata hai, isliye nahi ki woh udna bhool gaya, balki isliye ki checklist woh ek cheez pakad leti hai jo nuksan karti. Yeh chapter wireless QoS, AVC aur multicast ki aapki checklist hai: aap kya kar sakte ho, kaun se words aane chahiye, examiners ko pasand facts, aur commands ek jagah.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki Wi-Fi QoS statistical priority (EDCA) hai, guarantee nahi.</li>
<li>Chaar access categories ke naam batao aur kaun si UP values unhe chunti hain.</li>
<li>Batao ki DSCP, UP aur CAPWAP outer header ka aapas mein kya rishta hai, upstream aur downstream.</li>
<li>Sahi direction mein platinum, gold, silver ya bronze chuno aur attach karo.</li>
<li>Class-map aur policy-map likho aur input ya output attach karo.</li>
<li>Samjhao ki match protocol class ko AVC flow monitor kyun chahiye.</li>
<li>Controller port aur AP ports par switch trust configure karo.</li>
<li>WMM allowed, require ya disabled set karo aur predict karo ki kaun refuse hoga.</li>
<li>Multicast-unicast ya multicast-multicast chuno aur underlay ki zaroorat samjhao.</li>
<li>IGMP snooping aur mDNS gateway samjhao.</li>
<li>Trace aur multicast test chalao aur batao ki har ek kya prove karta hai.</li>
<li>Batao ki concept only kya hai: queueing, police enforcement, CAC aur Videostream, per-application statistics, custom NetFlow records, match access-group, mDNS data plane, source se multicast routing.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>WMM</dt><dd>Wi-Fi Multimedia, 802.11e ka certified subset.</dd>
<dt>EDCA</dt><dd>Enhanced Distributed Channel Access: alag AIFSN, CW aur TXOP wali chaar queues.</dd>
<dt>AC / UP</dt><dd>Access category aur 3-bit user priority (0 se 7).</dd>
<dt>DSCP</dt><dd>6-bit IP marking; EF 46, AF41 34, CS3 24, CS1 8.</dd>
<dt>Metal policy</dt><dd>Built-in platinum, gold, silver, bronze policy-maps (output) aur unke -up forms (input) jo DSCP cap karte hain.</dd>
<dt>MQC</dt><dd>class-map, policy-map, service-policy.</dd>
<dt>AVC</dt><dd>NBAR2 recognition plus flexible NetFlow monitor (wireless-avc-basic).</dd>
<dt>CAC / TSPEC</dt><dd>Admission control aur woh traffic specification jo client ADDTS mein bhejta hai.</dd>
<dt>IGMP snooping</dt><dd>Multicast sirf un receivers ki taraf forward karo jinhone join kiya.</dd>
<dt>mDNS</dt><dd>224.0.0.251, UDP 5353 par link-local multicast service discovery.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>AC se UP</td><td>VO 7,6; VI 5,4; BE 0,3; BK 2,1</td></tr>
<tr><td>Metal caps (lab model)</td><td>platinum 46, gold 34, silver 0, bronze 8</td></tr>
<tr><td>Direction</td><td>input = client se network, output = network se client</td></tr>
<tr><td>WMM modes</td><td>allowed (default), require, disabled</td></tr>
<tr><td>mls qos on ho aur port untrusted</td><td>DSCP ko 0 kar deta hai</td></tr>
<tr><td>Protocol class</td><td>same direction mein wireless-avc-basic chahiye</td></tr>
<tr><td>Default multicast mode</td><td>multicast-unicast; multicast-multicast ko PIM underlay chahiye</td></tr>
<tr><td>Wireless multicast</td><td>default mein off; enable karna padta hai</td></tr>
<tr><td>Edits</td><td>WLAN aur policy profile pehle shut hone chahiye</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">wlan NK-VOICE
 wmm require | allowed | disabled
wireless profile policy PP-VOICE
 service-policy input platinum-up
 service-policy output platinum
 ipv4 flow monitor wireless-avc-basic input
 mdns-sd service-policy SP-OFFICE
class-map match-any NAME
 match dscp ef | match protocol rtp-audio
policy-map NAME
 class NAME
  set dscp ef
wireless autoqos policy-profile PP-VOICE mode voice
ap profile NAME
 no qos-map trust-dscp
wireless multicast
ap capwap multicast 239.1.1.1 | no ap capwap multicast
ip igmp snooping [vlan 10]
<span class="c">! SW1</span>
mls qos
interface GigabitEthernet0/1
 mls qos trust dscp</pre>
<pre class="out">show policy-map [NAME]            show class-map [NAME]
show wlan name NAME               show wireless profile policy detailed NAME
show wireless multicast           show ip igmp snooping [groups]
show mdns-sd summary              show mls qos interface [INTF]
wifi qos trace                    wifi mcast test GROUP</pre>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b> aur <b>Configuration &gt; Wireless &gt; Multicast</b>.</p>

<div class="eg"><p><b>Worked example.</b> Quick self-test. Ek WLAN par wmm disabled hai, silver hai, aur SW1 Gi0/1 untrusted hai. Saaf voice call ke liye kaun se fixes chahiye? Teeno: WLAN par WMM allowed ya required, policy profile par platinum pair, Gi0/1 par trust dscp. Ek ek karke fix karo aur har baad re-trace karo: aap verdict badalte dekhoge.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali common mistakes:</b></p><ul>
<li>UP aur DSCP ko ek hi field samajhna.</li>
<li>Yeh sochna ki metal policy marking badhati hai.</li>
<li>Yeh bhoolna ki AP ports outer CAPWAP DSCP carry karte hain.</li>
<li>Underlay ke bina "behtar hai" sochkar multicast-multicast chunna.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> jab koi answer kehta hai ki QoS Wi-Fi par voice quality "guarantee" karta hai, to woh galat hai. EDCA behtar mauka deta hai; CAC aur design baaki dete hain.</p></div>

<div class="scn"><h4>Go-live se pehle review</h4><p>Naya office kholne se pehle engineer checklist chalata hai: voice WLAN par WMM, policy profile par platinum pair, AP trust, chaaron ports par switch trust, test phone se trace, CAC plan, multicast mode ka choice, mDNS sirf printers tak limit. Testing mein do items fail hote hain, dono switch par. Staff ke aane se pehle fix ho jaate hain.</p><p><b>Lesson:</b> checklists boring faults ko users se pehle dhundh leti hain.</p></div>

<div class="iv"><p class="q">"9800 par voice WLAN ka end-to-end design batao."</p><p>Achhe signal wala 5 GHz-capable design; wmm require wala dedicated WLAN; platinum-up aur platinum wala policy profile; AP DSCP trust karta hai; path ke har switch port par trust dscp; capacity ke liye CAC; trace se verify. Jodo ki metals cap karte hain, AVC application awareness jodta hai, aur Videostream aur multicast ko apna design chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi QoS statistical hai; wire aur controller ko marking rakhni padti hai.</li>
<li>Chaar cheezein check karo: WMM, policy profile ki policies aur monitor, switch trust, AP trust.</li>
<li>Multicast: wireless multicast enable karo, mode chuno, underlay aur IGMP snooping ka dhyan rakho.</li>
<li>mDNS gateway VLANs ke beech Bonjour filter karta hai; lab mein data plane concept only hai.</li>
<li>Hamesha usi trace ya test se prove karo jisne fault dikhaya tha.</li>
</ul></div>
`}};export{e as default};