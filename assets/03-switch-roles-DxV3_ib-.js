var e={id:`switch-roles`,h:{en:`The switch side: auth-role, reject-role and critical-role`,hi:`Switch side: auth-role, reject-role aur critical-role`},body:{en:`
<h3>Start with an analogy: the building has three kinds of fallback keys</h3>
<p>A facilities manager keeps a ring of spare keys. One key is for "approved but nothing specific was said", one is for "turned away at the door" and one is for "the badge system is dead". The switch holds the same ring. Each key is simply the name of a <b>role</b> that you configured on the switch, and each is attached to a port with one command.</p>

<h3>What a port-access role is</h3>
<p>On AOS-CX a <b>port-access role</b> is a local policy object. At the least it carries a VLAN. You create it once and reuse it on many ports. ClearPass refers to it by name through the Aruba-User-Role attribute; the switch looks the name up in its own configuration. Names are compared exactly, upper and lower case included.</p>
<pre class="code"><span class="c">! Lab shell: ACCESS (AOS-CX style)</span>
ACCESS# configure terminal
ACCESS(config)# port-access role GUEST
ACCESS(config-pa-role)# vlan access 40
ACCESS(config-pa-role)# exit
ACCESS(config)# show port-access role GUEST</pre>
<pre class="out">Role Name : GUEST
Type      : Local
Status    : Completed
------------------------------------------------------------
Description     :
<span class="hl">Access VLAN     : 40</span>
Native VLAN     :
Allowed Trunk VLANs :</pre>
<p>The line <code>Status : Completed</code> matters. If the role names a VLAN that does not exist, the status shows <code>Incomplete</code> and the role cannot be applied. You will meet this again in the troubleshooting chapter.</p>

<h3>The three fallback attachments</h3>
<p>Per port, in interface configuration mode, three commands attach a role as a fallback:</p>
<table class="cmp"><tr><th>Command</th><th>When the switch uses it</th></tr>
<tr><td><code>aaa authentication port-access auth-role ROLE</code></td><td>The client is authenticated but no role or VLAN came back from the server.</td></tr>
<tr><td><code>aaa authentication port-access reject-role ROLE</code></td><td>The authentication was rejected by the server.</td></tr>
<tr><td><code>aaa authentication port-access critical-role ROLE</code></td><td>The RADIUS server is unreachable (dead).</td></tr></table>
<p>The lab model orders the result of an accepted request like this: first, a role returned by ClearPass (Aruba-User-Role) if a role of exactly that name exists on the switch; otherwise a Tunnel VLAN, if all three Tunnel attributes were returned; otherwise the port's own auth-role or access VLAN. A returned role that does not exist, or whose VLAN is missing, cannot be applied and the client is treated as not authorized, so the reject-role applies if the port has one.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Decision order on the switch">
<rect x="230" y="8" width="180" height="36" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Client sends credentials</text>
<line x1="320" y1="44" x2="320" y2="64" stroke="#64748b"/>
<rect x="215" y="64" width="210" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">RADIUS server answers?</text>
<line x1="215" y1="82" x2="110" y2="130" stroke="#64748b"/><line x1="425" y1="82" x2="530" y2="130" stroke="#64748b"/><line x1="320" y1="100" x2="320" y2="130" stroke="#64748b"/>
<text x="130" y="112" text-anchor="middle" class="svg-muted" font-size="12">no answer</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">Accept</text><text x="520" y="112" text-anchor="middle" class="svg-muted" font-size="12">Reject</text>
<rect x="20" y="130" width="180" height="56" rx="8" fill="#bbf7d0"/><text x="110" y="154" text-anchor="middle" class="svg-ink" font-size="13">critical-role</text><text x="110" y="173" text-anchor="middle" class="svg-muted" font-size="12">server dead</text>
<rect x="230" y="130" width="180" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">RADIUS role or VLAN</text><text x="320" y="173" text-anchor="middle" class="svg-muted" font-size="12">else auth-role / port VLAN</text>
<rect x="440" y="130" width="180" height="56" rx="8" fill="#fed7aa"/><text x="530" y="154" text-anchor="middle" class="svg-ink" font-size="13">reject-role</text><text x="530" y="173" text-anchor="middle" class="svg-muted" font-size="12">login refused</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">No fallback configured on the port: the client stays unauthorized.</text>
</svg><p class="cap">The switch chooses the role by what the server did: answered yes, answered no, or did not answer.</p></div>

<h3>Where 802.1X and MAC authentication fit in</h3>
<p>The lab switch tries 802.1X first. A client without a supplicant, such as a printer, does not answer EAP, so after about 10 seconds the port falls over to MAC authentication. A client that is rejected waits out a quiet period (20 seconds in the model) before it is allowed to try again. Remember this when you test: after a change you either wait for the next attempt or bounce the port with <code>shutdown</code> and <code>no shutdown</code>.</p>

<h3>Reading the per-port settings</h3>
<pre class="code">ACCESS# show aaa authentication port-access interface all configuration</pre>
<pre class="out">Port    802.1X   MAC-auth  Auth-role  Reject-role  Critical-role  Client-limit
1/1/3   enabled  disabled  -          -            CRITICAL       1
<span class="hl">1/1/4   enabled  disabled  -          GUEST        -              1</span>
1/1/5   enabled  enabled   -          -            -              1</pre>
<p>Here port 1/1/4 has a reject-role, port 1/1/3 has a critical-role and port 1/1/5 has neither. A fallback you did not configure does not exist.</p>

<div class="eg"><p><b>Worked example.</b> Bob types a wrong password on 1/1/4. ClearPass sends Access-Reject. The port has reject-role GUEST, GUEST maps to VLAN 40, and VLAN 40 exists on ACCESS and on the 1/1/1 trunk. Bob's laptop gets an address from 10.20.40.0/24. Had the trunk not allowed VLAN 40, the role would have been applied but DHCP would have failed. Each condition is a separate thing to verify.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating the role but forgetting to attach it to the port. <code>port-access role GUEST</code> only defines the role. Nothing uses it until <code>aaa authentication port-access reject-role GUEST</code> is entered under the interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> The three roles answer three different questions. Reject-role = the server said no. Critical-role = the server could not be reached. Auth-role = the server accepted but sent no role or VLAN. Do not mix them up.</p></div>

<div class="scn"><h4>The role that was only half there</h4><p>An engineer set a reject-role GUEST on a printer port, but the role named VLAN 40 and VLAN 40 had been deleted in a clean-up. The role showed Incomplete in <code>show port-access role GUEST</code>. Rejected devices stayed unauthorized instead of landing in guest. Re-creating VLAN 40 and allowing it on the uplink fixed it.</p><p><b>Lesson:</b> a role is only as good as the VLAN behind it. Always check the role status after you create it.</p></div>

<div class="iv"><p class="q">"What is the difference between auth-role, reject-role and critical-role on AOS-CX?"</p><p>Strong answer: all three are fallback port-access roles configured per interface. Auth-role is for an authenticated client with nothing returned; reject-role for an authentication that the server refused; critical-role for when the server is unreachable. A role returned by RADIUS in Aruba-User-Role wins over them when it exists on the switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A port-access role is a local switch object with a VLAN; ClearPass refers to it by exact name.</li>
<li>Three per-port fallbacks: auth-role, reject-role and critical-role.</li>
<li>Defining a role is not enough; attach it under the interface.</li>
<li>A role pointing at a missing VLAN shows Incomplete and cannot be applied.</li>
<li>802.1X is tried first; clients without a supplicant fall over to MAC authentication after about 10 seconds.</li>
</ul></div>
`,hi:`
<h3>Ek analogy se shuru karo: building ke paas teen tarah ki fallback keys hain</h3>
<p>Facilities manager ke paas spare keys ka ring hota hai. Ek key "approve hua lekin kuch specific nahi bola gaya" ke liye hai, ek "darwaze se wapas kar diya gaya" ke liye, aur ek "badge system dead hai" ke liye. Switch ke paas bhi wahi ring hai. Har key bas us <b>role</b> ka naam hai jo aapne switch par configure kiya, aur har ek ko ek command se port par attach karte hain.</p>

<h3>Port-access role kya hota hai</h3>
<p>AOS-CX par <b>port-access role</b> ek local policy object hai. Kam se kam woh VLAN carry karta hai. Aap ek baar banate ho aur kai ports par reuse karte ho. ClearPass use Aruba-User-Role attribute ke through naam se refer karta hai; switch naam ko apni configuration mein dhundhta hai. Names exactly compare hote hain, upper aur lower case included.</p>
<pre class="code"><span class="c">! Lab shell: ACCESS (AOS-CX style)</span>
ACCESS# configure terminal
ACCESS(config)# port-access role GUEST
ACCESS(config-pa-role)# vlan access 40
ACCESS(config-pa-role)# exit
ACCESS(config)# show port-access role GUEST</pre>
<pre class="out">Role Name : GUEST
Type      : Local
Status    : Completed
------------------------------------------------------------
Description     :
<span class="hl">Access VLAN     : 40</span>
Native VLAN     :
Allowed Trunk VLANs :</pre>
<p><code>Status : Completed</code> wali line matter karti hai. Agar role aisi VLAN ka naam leta hai jo exist nahi karti, to status <code>Incomplete</code> dikhata hai aur role apply nahi ho sakta. Yeh aap troubleshooting chapter mein phir dekhoge.</p>

<h3>Teen fallback attachments</h3>
<p>Per port, interface configuration mode mein, teen commands role ko fallback ke roop mein attach karti hain:</p>
<table class="cmp"><tr><th>Command</th><th>Switch ise kab use karta hai</th></tr>
<tr><td><code>aaa authentication port-access auth-role ROLE</code></td><td>Client authenticated hai lekin server se koi role ya VLAN nahi aaya.</td></tr>
<tr><td><code>aaa authentication port-access reject-role ROLE</code></td><td>Authentication server ne reject kar di.</td></tr>
<tr><td><code>aaa authentication port-access critical-role ROLE</code></td><td>RADIUS server unreachable (dead) hai.</td></tr></table>
<p>Lab model accepted request ka result is order mein decide karta hai: pehle ClearPass ka returned role (Aruba-User-Role) agar switch par exactly us naam ka role exist karta hai; nahi to Tunnel VLAN, agar teeno Tunnel attributes return hue; nahi to port ka apna auth-role ya access VLAN. Jo returned role exist nahi karta, ya jiski VLAN missing hai, woh apply nahi ho sakta aur client not authorized treat hota hai, to port par reject-role ho to woh apply hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch par decision order">
<rect x="230" y="8" width="180" height="36" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Client credentials bhejta hai</text>
<line x1="320" y1="44" x2="320" y2="64" stroke="#64748b"/>
<rect x="215" y="64" width="210" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">RADIUS server jawab deta hai?</text>
<line x1="215" y1="82" x2="110" y2="130" stroke="#64748b"/><line x1="425" y1="82" x2="530" y2="130" stroke="#64748b"/><line x1="320" y1="100" x2="320" y2="130" stroke="#64748b"/>
<text x="130" y="112" text-anchor="middle" class="svg-muted" font-size="12">jawab nahi</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">Accept</text><text x="520" y="112" text-anchor="middle" class="svg-muted" font-size="12">Reject</text>
<rect x="20" y="130" width="180" height="56" rx="8" fill="#bbf7d0"/><text x="110" y="154" text-anchor="middle" class="svg-ink" font-size="13">critical-role</text><text x="110" y="173" text-anchor="middle" class="svg-muted" font-size="12">server dead</text>
<rect x="230" y="130" width="180" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">RADIUS role ya VLAN</text><text x="320" y="173" text-anchor="middle" class="svg-muted" font-size="12">warna auth-role / port VLAN</text>
<rect x="440" y="130" width="180" height="56" rx="8" fill="#fed7aa"/><text x="530" y="154" text-anchor="middle" class="svg-ink" font-size="13">reject-role</text><text x="530" y="173" text-anchor="middle" class="svg-muted" font-size="12">login refuse hua</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Port par fallback configured nahi: client unauthorized rehta hai.</text>
</svg><p class="cap">Switch role is se choose karta hai ki server ne kya kiya: haan bola, na bola, ya jawab hi nahi diya.</p></div>

<h3>802.1X aur MAC authentication kahan fit hote hain</h3>
<p>Lab switch pehle 802.1X try karta hai. Supplicant ke bina client, jaise printer, EAP ka jawab nahi deta, isliye lagbhag 10 second baad port MAC authentication par fall over kar jaata hai. Rejected client dobara try karne se pehle quiet period (model mein 20 second) wait karta hai. Test karte waqt yeh yaad rakho: change ke baad ya to agle attempt ka wait karo ya <code>shutdown</code> aur <code>no shutdown</code> se port bounce karo.</p>

<h3>Per-port settings padhna</h3>
<pre class="code">ACCESS# show aaa authentication port-access interface all configuration</pre>
<pre class="out">Port    802.1X   MAC-auth  Auth-role  Reject-role  Critical-role  Client-limit
1/1/3   enabled  disabled  -          -            CRITICAL       1
<span class="hl">1/1/4   enabled  disabled  -          GUEST        -              1</span>
1/1/5   enabled  enabled   -          -            -              1</pre>
<p>Yahan port 1/1/4 par reject-role hai, port 1/1/3 par critical-role hai aur port 1/1/5 par dono nahi. Jo fallback aapne configure nahi kiya woh exist hi nahi karta.</p>

<div class="eg"><p><b>Worked example.</b> Bob 1/1/4 par galat password type karta hai. ClearPass Access-Reject bhejta hai. Port par reject-role GUEST hai, GUEST VLAN 40 se map hai, aur VLAN 40 ACCESS aur 1/1/1 trunk par exist karti hai. Bob ke laptop ko 10.20.40.0/24 se address milta hai. Agar trunk VLAN 40 allow nahi karta to role apply ho jaata lekin DHCP fail hota. Har condition alag verify karni padti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Role banana lekin use port par attach karna bhool jaana. <code>port-access role GUEST</code> sirf role define karta hai. Jab tak interface ke neeche <code>aaa authentication port-access reject-role GUEST</code> nahi daalte, koi use nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teen roles teen alag sawaalon ke jawab hain. Reject-role = server ne na bola. Critical-role = server tak pahunch nahi sake. Auth-role = server ne accept kiya lekin role ya VLAN nahi bheja. Inhe mix mat karo.</p></div>

<div class="scn"><h4>Role jo aadha hi tha</h4><p>Ek engineer ne printer port par reject-role GUEST set kiya, lekin role ne VLAN 40 ka naam liya aur clean-up mein VLAN 40 delete ho chuki thi. <code>show port-access role GUEST</code> mein role Incomplete dikha. Rejected devices guest mein land hone ke bajaye unauthorized rahe. VLAN 40 dobara banane aur uplink par allow karne se fix hua.</p><p><b>Seekh:</b> role utna hi achha hai jitni uske peeche ki VLAN. Role banane ke baad hamesha uska status check karo.</p></div>

<div class="iv"><p class="q">"AOS-CX par auth-role, reject-role aur critical-role mein kya difference hai?"</p><p>Strong answer: teeno per interface configure hone wale fallback port-access roles hain. Auth-role authenticated client ke liye hai jiske liye kuch return nahi hua; reject-role us authentication ke liye jo server ne refuse ki; critical-role tab ke liye jab server unreachable ho. RADIUS ka Aruba-User-Role mein returned role, agar switch par exist karta hai, to in sab par jeetta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port-access role ek local switch object hai jisme VLAN hoti hai; ClearPass use exact naam se refer karta hai.</li>
<li>Teen per-port fallbacks: auth-role, reject-role aur critical-role.</li>
<li>Role define karna kaafi nahi; use interface ke neeche attach karo.</li>
<li>Missing VLAN wala role Incomplete dikhata hai aur apply nahi ho sakta.</li>
<li>802.1X pehle try hota hai; supplicant ke bina clients lagbhag 10 second baad MAC authentication par fall over karte hain.</li>
</ul></div>
`}};export{e as default};