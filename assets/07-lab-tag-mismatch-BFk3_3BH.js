var e={id:`lab-tag-mismatch`,h:{en:`Lab walkthrough: wl-roam-tag-mismatch`,hi:`Lab walkthrough: wl-roam-tag-mismatch`},body:{en:`
<h3>The ticket</h3>
<div class="eg"><p><b>Ticket.</b> Users who walk from AP1 to AP2 get a different IP subnet and lose their sessions. A second policy tag, PT-FLOOR2, was created for AP2 and maps NK-STAFF to a different policy profile. Prove the mismatch from the client and the tags, then make AP1 and AP2 both serve NK-STAFF in VLAN 20 using the existing objects. Finally prove LAPTOP1 near AP2 is in the staff subnet.</p></div>
<p>Before the commands, remember the logic from chapters 4 and 5. A client's VLAN comes from: SSID, then the AP's policy tag, then the policy profile, then the VLAN. Two APs with different policy tags can place the same SSID into two different VLANs. We will prove that with evidence, not guess.</p>

<h3>Step 1: compare the AP tags</h3>
<pre class="code">show ap tag summary</pre>
<pre class="out">WLC1# show ap tag summary

Number of APs: 2

AP Name   AP Mac          Site Tag Name     Policy Tag Name   RF Tag Name     Misconfigured  Tag Source
AP1       0011.2233.4401  default-site-tag  <span class="hl">PT-CAMPUS</span>         default-rf-tag  No             Static
AP2       0011.2233.4402  default-site-tag  <span class="hl">PT-FLOOR2</span>         default-rf-tag  No             Static</pre>
<p>The first clue: two different policy tags. This alone is not a proof of a fault, because different tags can be legitimate. It becomes a fault only if the VLAN differs for the SSID people roam on. So we read what each tag does.</p>
<pre class="code">show wireless tag policy detailed PT-FLOOR2
show wireless profile policy summary</pre>
<p>On PT-FLOOR2 you see NK-STAFF mapped to a policy profile that is not PP-STAFF. Its VLAN is not 20. Keep this evidence for your ticket notes.</p>

<h3>Step 2: prove it from the client</h3>
<p>Take LAPTOP1 near AP1, connect, then move it near AP2 and reconnect. From the controller read the clients:</p>
<pre class="code">show wireless client summary
show wireless client mac-address 0050.7966.6801 detail</pre>
<pre class="out">WLC1# show wireless client mac-address 0050.7966.6801 detail

Client MAC Address : 0050.7966.6801
Client IPv4 Address: 10.10.41.37
Client State       : Associated
AP Name            : <span class="hl">AP2</span>
WLAN Profile Name  : NK-STAFF
Wireless LAN Id    : 1
SSID               : NK-STAFF
Policy Profile     : <span class="hl">PP-FLOOR2</span>
Policy Tag         : <span class="hl">PT-FLOOR2</span>
VLAN               : <span class="hl">41</span></pre>
<p>Your exact names and VLAN number may differ; in your lab the policy profile in PT-FLOOR2 and its VLAN are shown by the commands. The point: on AP1 the same laptop was in VLAN 20 with <b>PP-STAFF</b>; on AP2 it is in a different VLAN with a different policy profile. The SSID, the passphrase (NkStaff2024), and the radio were all fine. Only the tag differs.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Tag mismatch before and after">
<text x="20" y="22" class="svg-ink" font-size="13">Before</text>
<rect x="20" y="30" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="52" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="110" y="30" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="165" y="52" text-anchor="middle" class="svg-ink" font-size="12">PT-CAMPUS</text>
<rect x="230" y="30" width="100" height="34" rx="6" fill="#bbf7d0"/><text x="280" y="52" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20</text>
<rect x="20" y="72" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="94" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<rect x="110" y="72" width="110" height="34" rx="6" fill="#fed7aa"/><text x="165" y="94" text-anchor="middle" class="svg-ink" font-size="12">PT-FLOOR2</text>
<rect x="230" y="72" width="100" height="34" rx="6" fill="#fed7aa"/><text x="280" y="94" text-anchor="middle" class="svg-ink" font-size="12">other VLAN</text>
<text x="360" y="75" class="svg-accent" font-size="13">mismatch</text>
<text x="20" y="140" class="svg-ink" font-size="13">After: ap name AP2 policy-tag PT-CAMPUS</text>
<rect x="20" y="150" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="172" text-anchor="middle" class="svg-ink" font-size="12">AP1+AP2</text>
<rect x="110" y="150" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="165" y="172" text-anchor="middle" class="svg-ink" font-size="12">PT-CAMPUS</text>
<rect x="230" y="150" width="100" height="34" rx="6" fill="#bbf7d0"/><text x="280" y="172" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20</text>
</svg><p class="cap">The fix is to point AP2 back at the campus policy tag.</p></div>

<h3>Step 3: fix it on the right object</h3>
<p>Which object is wrong? Options:</p>
<ul>
<li>Edit PT-FLOOR2 to map NK-STAFF to PP-STAFF. That works but keeps a needless extra tag.</li>
<li>Delete or rebuild everything. Overkill and risky.</li>
<li><b>Re-tag AP2 with PT-CAMPUS.</b> One statement, uses existing objects, removes the split. This is what the ticket asks.</li>
</ul>
<pre class="code">ap name AP2 policy-tag PT-CAMPUS</pre>
<p>No output means success. Clients on AP2 reassociate and receive the right VLAN. In real networks an AP tag change causes a brief radio reset on that AP, so plan the window.</p>
<pre class="out">WLC1# show ap tag summary

AP Name   AP Mac          Site Tag Name     Policy Tag Name   RF Tag Name     Misconfigured  Tag Source
AP1       0011.2233.4401  default-site-tag  <span class="hl">PT-CAMPUS</span>         default-rf-tag  No             Static
AP2       0011.2233.4402  default-site-tag  <span class="hl">PT-CAMPUS</span>         default-rf-tag  No             Static</pre>

<h3>Step 4: prove the result on the client</h3>
<p>On LAPTOP1 near AP2, reconnect and check:</p>
<pre class="code">wifi connect NK-STAFF psk NkStaff2024
wifi status</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:43:a6:9a:10
AP          : <span class="hl">AP2</span>
Band/channel: 5 GHz / 40
Signal      : -49 dBm
Security    : WPA2-Personal (PSK)
IP address  : <span class="hl">10.10.20.11/24 (DHCP)</span></pre>
<p>Exact formatting depends on the lab, but the proof is the same: the address is in 10.10.20.0/24 while associated to AP2. Optionally run <code>ping 10.10.60.20</code> to show RAD1 is reachable. A closing note for the ticket should list: before evidence (tag summary, client VLAN), the single command, and after evidence (tag summary, client address).</p>

<h3>Why this fault is sneaky</h3>
<p>Both APs show up in <code>show ap summary</code> as Registered. The SSID is visible and the password works on both. Ping tests near AP1 pass. A test engineer sitting at one desk would see nothing wrong. Only a walking test, or a comparison of tags, exposes it. That is why the first step is always to read tags and client VLAN, not RF graphs.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Deleting PT-FLOOR2 while it is still assigned: the controller refuses (the tag is assigned to an AP). Re-tag the AP first. (2) Retagging AP1 instead of AP2, which moves the problem. (3) Testing from only one location. (4) Forgetting that existing clients may need to renew DHCP after the change; deauthenticate the client with <code>wireless client mac-address &lt;mac&gt; deauthenticate</code> if it holds a stale address.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Users change subnet when roaming" almost always points to different policy profile or VLAN mapping between APs, not to a DHCP server problem.</p></div>

<div class="scn"><h4>Floor 2 pilot never reverted</h4><p>A project created PT-FLOOR2 for a pilot that moved Floor 2 users to a new VLAN. The pilot ended, but AP2 kept the pilot tag. Help desk logged "calls drop at the corridor". Engineers first blamed RF, then roaming settings. The tag summary and the client detail showed the real cause in two minutes. One re-tag command fixed it.</p><p><b>Lesson:</b> clean up temporary tags and always compare tags across neighbours.</p></div>

<div class="iv"><p class="q">"Users get a new IP when they walk between floors. Where do you look first?"</p><p>I compare the policy tag of both APs, read the policy profile and VLAN each tag gives the SSID, and read the client detail on each AP. If they differ, I re-tag the AP to the common tag, then verify the address from the client. I would not touch DHCP until the controller side is consistent.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> Compare the tags in <b>Configuration &gt; Wireless &gt; Access Points</b> and the client in <b>Monitoring &gt; Wireless &gt; Clients</b>. Fix AP2 by selecting it in <b>Configuration &gt; Wireless &gt; Access Points</b>, tab <b>Tags</b>, and choosing PT-CAMPUS.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk-dependent symptoms: compare policy tags and client VLAN first.</li>
<li><code>show ap tag summary</code> and the client detail view prove the mismatch.</li>
<li>Fix with <code>ap name AP2 policy-tag PT-CAMPUS</code>; reuse existing objects.</li>
<li>Prove with the client address and the AP it uses.</li>
<li>Remove or reuse temporary tags after pilots.</li>
</ul></div>
`,hi:`
<h3>Ticket</h3>
<div class="eg"><p><b>Ticket.</b> Jo users AP1 se AP2 tak chalte hain unhe alag IP subnet milta hai aur unke sessions toot jaate hain. AP2 ke liye doosra policy tag, PT-FLOOR2, banaya gaya hai jo NK-STAFF ko alag policy profile se map karta hai. Client aur tags se mismatch prove karo, phir existing objects use karke AP1 aur AP2 dono ko VLAN 20 mein NK-STAFF serve karwao. Aakhir mein prove karo ki AP2 ke paas LAPTOP1 staff subnet mein hai.</p></div>
<p>Commands se pehle chapters 4 aur 5 ka logic yaad karo. Client ka VLAN aata hai: SSID, phir AP ka policy tag, phir policy profile, phir VLAN. Alag policy tags wale do APs ek hi SSID ko do alag VLANs mein place kar sakte hain. Hum isse guess se nahi, evidence se prove karenge.</p>

<h3>Step 1: AP tags compare karo</h3>
<pre class="code">show ap tag summary</pre>
<pre class="out">WLC1# show ap tag summary

Number of APs: 2

AP Name   AP Mac          Site Tag Name     Policy Tag Name   RF Tag Name     Misconfigured  Tag Source
AP1       0011.2233.4401  default-site-tag  <span class="hl">PT-CAMPUS</span>         default-rf-tag  No             Static
AP2       0011.2233.4402  default-site-tag  <span class="hl">PT-FLOOR2</span>         default-rf-tag  No             Static</pre>
<p>Pehla clue: do alag policy tags. Yeh akela fault ka proof nahi hai, kyunki alag tags legitimate bhi ho sakte hain. Fault tab banta hai jab jis SSID par log roam karte hain uska VLAN alag ho. Isliye hum padhte hain ki har tag kya karta hai.</p>
<pre class="code">show wireless tag policy detailed PT-FLOOR2
show wireless profile policy summary</pre>
<p>PT-FLOOR2 mein NK-STAFF aise policy profile se mapped dikhta hai jo PP-STAFF nahi hai. Uska VLAN 20 nahi hai. Yeh evidence apne ticket notes ke liye rakho.</p>

<h3>Step 2: client se prove karo</h3>
<p>LAPTOP1 ko AP1 ke paas connect karo, phir AP2 ke paas le jaakar dobara connect karo. Controller se clients padho:</p>
<pre class="code">show wireless client summary
show wireless client mac-address 0050.7966.6801 detail</pre>
<pre class="out">WLC1# show wireless client mac-address 0050.7966.6801 detail

Client MAC Address : 0050.7966.6801
Client IPv4 Address: 10.10.41.37
Client State       : Associated
AP Name            : <span class="hl">AP2</span>
WLAN Profile Name  : NK-STAFF
Wireless LAN Id    : 1
SSID               : NK-STAFF
Policy Profile     : <span class="hl">PP-FLOOR2</span>
Policy Tag         : <span class="hl">PT-FLOOR2</span>
VLAN               : <span class="hl">41</span></pre>
<p>Aapke lab mein exact names aur VLAN number alag ho sakte hain; PT-FLOOR2 ka policy profile aur uska VLAN commands se dikhte hain. Point yeh hai: AP1 par wahi laptop <b>PP-STAFF</b> ke saath VLAN 20 mein tha; AP2 par woh alag policy profile ke saath alag VLAN mein hai. SSID, passphrase (NkStaff2024) aur radio sab theek the. Sirf tag alag hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Tag mismatch before and after">
<text x="20" y="22" class="svg-ink" font-size="13">Pehle</text>
<rect x="20" y="30" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="52" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="110" y="30" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="165" y="52" text-anchor="middle" class="svg-ink" font-size="12">PT-CAMPUS</text>
<rect x="230" y="30" width="100" height="34" rx="6" fill="#bbf7d0"/><text x="280" y="52" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20</text>
<rect x="20" y="72" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="94" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<rect x="110" y="72" width="110" height="34" rx="6" fill="#fed7aa"/><text x="165" y="94" text-anchor="middle" class="svg-ink" font-size="12">PT-FLOOR2</text>
<rect x="230" y="72" width="100" height="34" rx="6" fill="#fed7aa"/><text x="280" y="94" text-anchor="middle" class="svg-ink" font-size="12">alag VLAN</text>
<text x="360" y="75" class="svg-accent" font-size="13">mismatch</text>
<text x="20" y="140" class="svg-ink" font-size="13">Baad mein: ap name AP2 policy-tag PT-CAMPUS</text>
<rect x="20" y="150" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="172" text-anchor="middle" class="svg-ink" font-size="12">AP1+AP2</text>
<rect x="110" y="150" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="165" y="172" text-anchor="middle" class="svg-ink" font-size="12">PT-CAMPUS</text>
<rect x="230" y="150" width="100" height="34" rx="6" fill="#bbf7d0"/><text x="280" y="172" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20</text>
</svg><p class="cap">Fix yeh hai ki AP2 ko wapas campus policy tag par point karo.</p></div>

<h3>Step 3: sahi object par fix karo</h3>
<p>Kaunsa object galat hai? Options:</p>
<ul>
<li>PT-FLOOR2 edit karke NK-STAFF ko PP-STAFF se map karo. Yeh chalta hai lekin ek bekaar extra tag rakhta hai.</li>
<li>Sab delete ya rebuild karo. Overkill aur risky.</li>
<li><b>AP2 ko PT-CAMPUS se re-tag karo.</b> Ek statement, existing objects use karta hai, split hata deta hai. Ticket yahi maangta hai.</li>
</ul>
<pre class="code">ap name AP2 policy-tag PT-CAMPUS</pre>
<p>Koi output nahi matlab success. AP2 ke clients reassociate hote hain aur sahi VLAN paate hain. Real networks mein AP tag change se us AP par chhota radio reset hota hai, isliye window plan karo.</p>
<pre class="out">WLC1# show ap tag summary

AP Name   AP Mac          Site Tag Name     Policy Tag Name   RF Tag Name     Misconfigured  Tag Source
AP1       0011.2233.4401  default-site-tag  <span class="hl">PT-CAMPUS</span>         default-rf-tag  No             Static
AP2       0011.2233.4402  default-site-tag  <span class="hl">PT-CAMPUS</span>         default-rf-tag  No             Static</pre>

<h3>Step 4: client par result prove karo</h3>
<p>AP2 ke paas LAPTOP1 par dobara connect karo aur check karo:</p>
<pre class="code">wifi connect NK-STAFF psk NkStaff2024
wifi status</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:43:a6:9a:10
AP          : <span class="hl">AP2</span>
Band/channel: 5 GHz / 40
Signal      : -49 dBm
Security    : WPA2-Personal (PSK)
IP address  : <span class="hl">10.10.20.11/24 (DHCP)</span></pre>
<p>Exact formatting lab par depend karti hai, lekin proof wahi hai: AP2 se associated hote hue address 10.10.20.0/24 mein hai. Optional taur par <code>ping 10.10.60.20</code> chalao taaki RAD1 reachable dikhe. Ticket ka closing note mein yeh hona chahiye: before evidence (tag summary, client VLAN), ek command, aur after evidence (tag summary, client address).</p>

<h3>Yeh fault chalaak kyun hai</h3>
<p>Dono APs <code>show ap summary</code> mein Registered dikhte hain. SSID dikhta hai aur password dono par chalta hai. AP1 ke paas ping tests pass hote hain. Ek desk par baitha test engineer kuch galat nahi dekhega. Sirf walking test ya tags ka comparison hi isse expose karta hai. Isliye pehla step hamesha tags aur client VLAN padhna hai, RF graphs nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) PT-FLOOR2 ko tab delete karna jab woh abhi bhi assigned hai: controller mana kar deta hai (tag AP ko assigned hai). Pehle AP re-tag karo. (2) AP2 ki jagah AP1 re-tag karna, jisse problem sirf move hoti hai. (3) Sirf ek location se test karna. (4) Yeh bhoolna ki change ke baad maujooda clients ko DHCP renew karna pad sakta hai; agar client stale address rakhe to <code>wireless client mac-address &lt;mac&gt; deauthenticate</code> se use deauthenticate karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Roam karte waqt users ka subnet badalta hai" lagbhag hamesha APs ke beech alag policy profile ya VLAN mapping ki taraf ishara karta hai, DHCP server problem ki taraf nahi.</p></div>

<div class="scn"><h4>Floor 2 pilot kabhi revert nahi hua</h4><p>Ek project ne pilot ke liye PT-FLOOR2 banaya jisme Floor 2 users naye VLAN mein gaye. Pilot khatam hua, lekin AP2 pilot tag rakhe raha. Help desk ne "corridor mein calls drop hoti hain" log kiya. Engineers ne pehle RF ko blame kiya, phir roaming settings ko. Tag summary aur client detail ne do minute mein asli kaaran dikha diya. Ek re-tag command ne fix kar diya.</p><p><b>Lesson:</b> temporary tags saaf karo aur hamesha padosi APs ke tags compare karo.</p></div>

<div class="iv"><p class="q">"Floors ke beech chalne par users ko naya IP milta hai. Pehle kahan dekhoge?"</p><p>Main dono APs ka policy tag compare karta hoon, har tag SSID ko kaunsa policy profile aur VLAN deta hai woh padhta hoon, aur har AP par client detail padhta hoon. Agar alag hain, to AP ko common tag par re-tag karta hoon, phir client se address verify karta hoon. Controller side consistent hone tak main DHCP ko touch nahi karunga.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> Tags <b>Configuration &gt; Wireless &gt; Access Points</b> mein aur client <b>Monitoring &gt; Wireless &gt; Clients</b> mein compare karo. AP2 fix karne ke liye use <b>Configuration &gt; Wireless &gt; Access Points</b> mein select karo, tab <b>Tags</b>, PT-CAMPUS chuno.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chalne par depend karne wale symptoms: pehle policy tags aur client VLAN compare karo.</li>
<li><code>show ap tag summary</code> aur client detail view mismatch prove karte hain.</li>
<li>Fix: <code>ap name AP2 policy-tag PT-CAMPUS</code>; existing objects reuse karo.</li>
<li>Client address aur use hone wale AP se prove karo.</li>
<li>Pilots ke baad temporary tags hatao ya reuse karo.</li>
</ul></div>
`}};export{e as default};