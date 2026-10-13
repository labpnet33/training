var e={id:`dynamic-authz-coa`,h:{en:`Dynamic authorization: VLANs, dACLs, SGTs and Change of Authorization`,hi:`Dynamic authorization: VLANs, dACLs, SGTs aur Change of Authorization`},body:{en:`
<p>A hotel key card does two jobs. It proves you are a guest, and it is programmed with <i>which</i> doors you can open: your room, the gym, maybe the executive lounge. If you upgrade your room at midnight, reception reprograms the card remotely and your old door stops opening. In 802.1X, the Access-Accept is the programmed card, and <b>Change of Authorization (CoA)</b> is the remote reprogramming.</p>

<h3>What an Access-Accept can carry</h3>
<p>Authentication answers "who are you?". Authorization answers "what do you get?". ISE puts the answer into RADIUS attributes inside the same Access-Accept:</p>
<table class="cmp"><tr><th>Result</th><th>RADIUS attributes</th><th>Effect on the switch</th></tr>
<tr><td><b>Dynamic VLAN</b></td><td>Tunnel-Type (64) = VLAN (13), Tunnel-Medium-Type (65) = 802 (6), <b>Tunnel-Private-Group-ID (81)</b> = <code>20</code> or a VLAN name</td><td>The port's data VLAN becomes 20 for this session</td></tr>
<tr><td><b>Downloadable ACL (dACL)</b></td><td>Cisco-AVPair naming the dACL; the switch downloads its entries from ISE</td><td>A per-session ACL filters traffic from the host</td></tr>
<tr><td><b>Named ACL</b></td><td>Filter-Id (11) = <code>EMPLOYEE-ACL.in</code></td><td>Applies an ACL that already exists on the switch</td></tr>
<tr><td><b>Security Group Tag</b></td><td>Cisco-AVPair <code>cts:security-group-tag=000a-00</code></td><td>Traffic from the host is classified as SGT 10</td></tr>
<tr><td><b>Voice domain</b></td><td>Cisco-AVPair <code>device-traffic-class=voice</code></td><td>The phone may use the voice VLAN (multi-domain)</td></tr>
<tr><td><b>Redirect</b></td><td><code>url-redirect</code>, <code>url-redirect-acl</code></td><td>Web traffic sent to an ISE portal (CWA, posture)</td></tr>
<tr><td><b>Reauth timer</b></td><td>Session-Timeout (27), Termination-Action (29)</td><td>Reauthenticate after N seconds</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Access-Accept attributes applied to a switchport">
<rect x="10" y="20" width="270" height="190" rx="10" fill="#ddd6fe"/><text x="145" y="44" text-anchor="middle" class="svg-ink" font-size="13">Access-Accept from ISE</text>
<text x="25" y="72" class="svg-ink" font-size="12">EAP-Message: EAP-Success</text>
<text x="25" y="96" class="svg-ink" font-size="12">Tunnel-Type: VLAN (13)</text>
<text x="25" y="120" class="svg-ink" font-size="12">Tunnel-Medium-Type: 802 (6)</text>
<text x="25" y="144" class="svg-accent" font-size="12">Tunnel-Private-Group-ID: 20</text>
<text x="25" y="168" class="svg-accent" font-size="12">cts:security-group-tag=000a-00</text>
<text x="25" y="192" class="svg-ink" font-size="12">Class: CACS:0A0A6301...</text>
<rect x="360" y="60" width="270" height="110" rx="10" fill="#bbf7d0"/><text x="495" y="86" text-anchor="middle" class="svg-ink" font-size="13">SW1 Gi0/1</text>
<text x="495" y="112" text-anchor="middle" class="svg-ink" font-size="12">Authorized, VLAN 20</text><text x="495" y="136" text-anchor="middle" class="svg-ink" font-size="12">SGT 10 (Employees)</text>
<line x1="280" y1="115" x2="360" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">apply</text>
<text x="495" y="200" text-anchor="middle" class="svg-muted" font-size="12">needs aaa authorization network</text>
</svg><p class="cap">One Access-Accept carries the yes, the VLAN and the tag. SGT 10 is 0x000a in hex.</p></div>

<h3>Rules that make dynamic VLANs work</h3>
<ul>
<li>The switch must have <code>aaa authorization network default group radius</code>, otherwise it ignores every attribute and keeps the static VLAN.</li>
<li>The VLAN must <b>exist</b> on the switch (by number or by name). If it does not, authorization fails and the port stays closed, even though ISE said yes.</li>
<li>The endpoint must get a new IP address in the new VLAN. At first login this happens naturally because DHCP runs after authorization. If the VLAN changes later, the endpoint may keep its old address; that is why ISE can use a <b>port bounce</b> CoA.</li>
</ul>

<h3>Downloadable ACLs in a little more detail</h3>
<p>A dACL is defined once in ISE (for example <code>PRINTER-DACL</code>: permit IPP and LPD to the print servers, deny everything else). The Access-Accept carries only its name and version; the switch sends a second RADIUS request to fetch the entries (and caches them). It then applies them inbound on the port for that session only, replacing the source <code>any</code> with the host's IP address, which the switch learns through <b>device tracking</b>. That is why dACLs need device tracking enabled, and in low-impact mode a pre-auth port ACL must exist first.</p>

<h3>Change of Authorization (CoA)</h3>
<p>Normal RADIUS is client-initiated: the switch asks, ISE answers. <b>CoA</b> (RFC 5176) reverses it: ISE sends a request to the switch to change an existing session. The switch answers CoA-ACK or CoA-NAK. Cisco devices listen on <b>UDP 1700</b> (the RFC port is 3799).</p>
<table class="cmp"><tr><th>CoA type</th><th>What the switch does</th><th>Used when</th></tr>
<tr><td><b>Reauthenticate</b></td><td>Re-runs authentication for the session and applies the new result</td><td>CWA guest login finished, posture became compliant, profile changed</td></tr>
<tr><td><b>Port bounce</b></td><td>Shuts and re-enables the port briefly</td><td>VLAN must change and the endpoint must renew DHCP</td></tr>
<tr><td><b>Port disable</b></td><td>Shuts the port</td><td>Severe threat; ANC quarantine</td></tr>
<tr><td><b>Disconnect / terminate</b></td><td>Ends the session</td><td>Admin action, account revoked</td></tr>
</table>
<pre class="code">SW1(config)# aaa server radius dynamic-author
SW1(config-locsvr-da-radius)# client 10.99.99.10 server-key NKsecret   <span class="c">! who may send CoA</span>
SW1(config-locsvr-da-radius)# auth-type any</pre>
<p>Without this block, the switch silently discards CoA requests, and CWA, posture and ANC quarantine all break in confusing ways: the portal login succeeds but nothing changes.</p>

<h3>Verify (lab task 6)</h3>
<pre class="out">SW1# show authentication sessions interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0101
            User-Name:  alice
               Status:  Authorized
Server Policies:
           Vlan Group:  Vlan: 20
<span class="hl">            SGT Value:  10</span>
Method status list:
       Method           State
       dot1x            Authc Success</pre>
<p>The same value is visible on the wire: in a capture of Gi0/7 (the ISE link), the Access-Accept contains the Vendor-Specific attribute <code>cts:security-group-tag=000a-00</code>. 0x000a is 10, the Employees tag; the <code>-00</code> is a generation number.</p>

<div class="eg"><p><b>Worked example.</b> Alice's laptop fails posture at 08:55 because its antivirus definitions are 9 days old. ISE authorizes it with VLAN 20 plus the dACL <code>REMEDIATE</code> (only the update servers and ISE) and a redirect to the posture portal. At 09:03 the agent reports compliant. ISE sends a CoA reauthenticate; the new Access-Accept carries VLAN 20, SGT 10 and the dACL <code>PERMIT-ALL</code>. The VLAN did not change, so no bounce and no new DHCP was needed; alice noticed nothing except that the portal closed.</p></div>

<div class="warn"><p><b>Common mistake.</b> Returning a VLAN <b>name</b> from ISE that differs in case or spelling from the switch's VLAN name ("Employees" versus "EMPLOYEES"), or a VLAN number not created on some switches. Authorization then fails only on those switches. Standardise VLAN names or numbers across all access switches.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tunnel-Private-Group-ID carries the VLAN; Tunnel-Type must be 13 and Tunnel-Medium-Type 6. CoA is sent <b>by the server to the switch</b> (UDP 1700 on Cisco), the opposite direction of normal RADIUS. A reauthenticate CoA keeps the port up; a bounce CoA flaps it.</p></div>

<div class="scn"><h4>Quarantine that did nothing</h4><p>During an incident, the SOC applied an ANC quarantine to a suspicious host in ISE. ISE showed the CoA as sent, but the host kept full access. On the switch, <code>show running-config | section dynamic-author</code> returned nothing: CoA had never been configured on that switch model's template. ISE's CoA was silently dropped. After adding <code>aaa server radius dynamic-author</code> with the PSN addresses and key, a test quarantine moved the host to the quarantine SGT within a second.</p><p><b>Lesson:</b> test CoA as part of every deployment. Containment depends on it.</p></div>

<div class="iv"><p class="q">"What is CoA and give three situations where ISE uses it."</p><p>Strong answer: Change of Authorization, RFC 5176, a RADIUS request from the server to the network device to change an active session, on UDP 1700 for Cisco. ISE uses it after Central WebAuth login (reauthenticate), after posture changes from unknown to compliant or non-compliant, when profiling reclassifies an endpoint, and for ANC quarantine from a firewall or SOC. Types: reauthenticate, port bounce, port disable, disconnect. The switch needs aaa server radius dynamic-author with the ISE nodes as clients.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access-Accept can carry VLAN (Tunnel attributes 64/65/81), dACL, Filter-Id, SGT, voice permission, redirect, timers.</li>
<li>Dynamic VLAN needs the authorization network list and a VLAN that exists on the switch.</li>
<li>dACLs are downloaded per session and need device tracking to know the host IP.</li>
<li>CoA: server-initiated, UDP 1700 on Cisco; reauthenticate, bounce, disable, disconnect.</li>
<li>Configure <code>aaa server radius dynamic-author</code>, or CWA, posture and quarantine silently fail.</li>
</ul></div>
`,hi:`
<p>Hotel ka key card do kaam karta hai. Yeh prove karta hai ki aap guest ho, aur isme program hota hai ki aap <i>kaunse</i> darwaze khol sakte ho: aapka room, gym, shayad executive lounge. Agar aap aadhi raat room upgrade karo, to reception card ko remotely reprogram karti hai aur aapka purana darwaza khulna band ho jaata hai. 802.1X mein Access-Accept programmed card hai, aur <b>Change of Authorization (CoA)</b> remote reprogramming hai.</p>

<h3>Access-Accept kya carry kar sakta hai</h3>
<p>Authentication jawab deta hai "tum kaun ho?". Authorization jawab deta hai "tumhe kya milega?". ISE jawab ko usi Access-Accept ke andar RADIUS attributes mein daalta hai:</p>
<table class="cmp"><tr><th>Result</th><th>RADIUS attributes</th><th>Switch par asar</th></tr>
<tr><td><b>Dynamic VLAN</b></td><td>Tunnel-Type (64) = VLAN (13), Tunnel-Medium-Type (65) = 802 (6), <b>Tunnel-Private-Group-ID (81)</b> = <code>20</code> ya VLAN name</td><td>Is session ke liye port ka data VLAN 20 ban jaata hai</td></tr>
<tr><td><b>Downloadable ACL (dACL)</b></td><td>dACL ka naam batane wala Cisco-AVPair; switch uski entries ISE se download karta hai</td><td>Per-session ACL host se aane wala traffic filter karta hai</td></tr>
<tr><td><b>Named ACL</b></td><td>Filter-Id (11) = <code>EMPLOYEE-ACL.in</code></td><td>Switch par pehle se maujood ACL apply karta hai</td></tr>
<tr><td><b>Security Group Tag</b></td><td>Cisco-AVPair <code>cts:security-group-tag=000a-00</code></td><td>Host ka traffic SGT 10 classify hota hai</td></tr>
<tr><td><b>Voice domain</b></td><td>Cisco-AVPair <code>device-traffic-class=voice</code></td><td>Phone voice VLAN use kar sakta hai (multi-domain)</td></tr>
<tr><td><b>Redirect</b></td><td><code>url-redirect</code>, <code>url-redirect-acl</code></td><td>Web traffic ISE portal par bheja jaata hai (CWA, posture)</td></tr>
<tr><td><b>Reauth timer</b></td><td>Session-Timeout (27), Termination-Action (29)</td><td>N seconds baad reauthenticate</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switchport par apply hote Access-Accept attributes">
<rect x="10" y="20" width="270" height="190" rx="10" fill="#ddd6fe"/><text x="145" y="44" text-anchor="middle" class="svg-ink" font-size="13">ISE se Access-Accept</text>
<text x="25" y="72" class="svg-ink" font-size="12">EAP-Message: EAP-Success</text>
<text x="25" y="96" class="svg-ink" font-size="12">Tunnel-Type: VLAN (13)</text>
<text x="25" y="120" class="svg-ink" font-size="12">Tunnel-Medium-Type: 802 (6)</text>
<text x="25" y="144" class="svg-accent" font-size="12">Tunnel-Private-Group-ID: 20</text>
<text x="25" y="168" class="svg-accent" font-size="12">cts:security-group-tag=000a-00</text>
<text x="25" y="192" class="svg-ink" font-size="12">Class: CACS:0A0A6301...</text>
<rect x="360" y="60" width="270" height="110" rx="10" fill="#bbf7d0"/><text x="495" y="86" text-anchor="middle" class="svg-ink" font-size="13">SW1 Gi0/1</text>
<text x="495" y="112" text-anchor="middle" class="svg-ink" font-size="12">Authorized, VLAN 20</text><text x="495" y="136" text-anchor="middle" class="svg-ink" font-size="12">SGT 10 (Employees)</text>
<line x1="280" y1="115" x2="360" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">apply</text>
<text x="495" y="200" text-anchor="middle" class="svg-muted" font-size="12">aaa authorization network chahiye</text>
</svg><p class="cap">Ek Access-Accept haan, VLAN aur tag teeno carry karta hai. SGT 10 hex mein 0x000a hai.</p></div>

<h3>Dynamic VLANs kaam karne ke rules</h3>
<ul>
<li>Switch par <code>aaa authorization network default group radius</code> hona chahiye, warna woh har attribute ignore karke static VLAN rakhta hai.</li>
<li>VLAN switch par <b>exist</b> karna chahiye (number ya name se). Agar nahi hai, to authorization fail hota hai aur port band rehta hai, halanki ISE ne haan kaha.</li>
<li>Endpoint ko naye VLAN mein naya IP address milna chahiye. Pehle login par yeh apne aap hota hai kyunki DHCP authorization ke baad chalta hai. Agar VLAN baad mein badle, to endpoint purana address rakh sakta hai; isiliye ISE <b>port bounce</b> CoA use kar sakta hai.</li>
</ul>

<h3>Downloadable ACLs thoda aur detail mein</h3>
<p>dACL ISE mein ek baar define hota hai (jaise <code>PRINTER-DACL</code>: print servers tak IPP aur LPD permit, baaki sab deny). Access-Accept sirf uska naam aur version carry karta hai; switch entries lene ke liye doosri RADIUS request bhejta hai (aur unhe cache karta hai). Phir woh unhe sirf us session ke liye port par inbound apply karta hai, source <code>any</code> ko host ke IP address se replace karke, jo switch <b>device tracking</b> se seekhta hai. Isiliye dACLs ko device tracking enabled chahiye, aur low-impact mode mein pehle pre-auth port ACL hona chahiye.</p>

<h3>Change of Authorization (CoA)</h3>
<p>Normal RADIUS client-initiated hai: switch poochta hai, ISE jawab deta hai. <b>CoA</b> (RFC 5176) ise ulta karta hai: ISE existing session badalne ke liye switch ko request bhejta hai. Switch CoA-ACK ya CoA-NAK se jawab deta hai. Cisco devices <b>UDP 1700</b> par sunte hain (RFC port 3799 hai).</p>
<table class="cmp"><tr><th>CoA type</th><th>Switch kya karta hai</th><th>Kab use hota hai</th></tr>
<tr><td><b>Reauthenticate</b></td><td>Session ke liye authentication dobara chalata hai aur naya result apply karta hai</td><td>CWA guest login khatam, posture compliant hua, profile badla</td></tr>
<tr><td><b>Port bounce</b></td><td>Port ko thodi der shut karke phir enable karta hai</td><td>VLAN badalna hai aur endpoint ko DHCP renew karna hai</td></tr>
<tr><td><b>Port disable</b></td><td>Port shut karta hai</td><td>Gambhir threat; ANC quarantine</td></tr>
<tr><td><b>Disconnect / terminate</b></td><td>Session khatam karta hai</td><td>Admin action, account revoke</td></tr>
</table>
<pre class="code">SW1(config)# aaa server radius dynamic-author
SW1(config-locsvr-da-radius)# client 10.99.99.10 server-key NKsecret   <span class="c">! kaun CoA bhej sakta hai</span>
SW1(config-locsvr-da-radius)# auth-type any</pre>
<p>Is block ke bina switch CoA requests chupchaap discard karta hai, aur CWA, posture aur ANC quarantine sab confusing tareeke se toot-te hain: portal login succeed hota hai lekin kuch nahi badalta.</p>

<h3>Verify (lab task 6)</h3>
<pre class="out">SW1# show authentication sessions interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0101
            User-Name:  alice
               Status:  Authorized
Server Policies:
           Vlan Group:  Vlan: 20
<span class="hl">            SGT Value:  10</span>
Method status list:
       Method           State
       dot1x            Authc Success</pre>
<p>Wahi value wire par bhi dikhti hai: Gi0/7 (ISE link) ke capture mein Access-Accept mein Vendor-Specific attribute <code>cts:security-group-tag=000a-00</code> hai. 0x000a matlab 10, Employees tag; <code>-00</code> generation number hai.</p>

<div class="eg"><p><b>Worked example.</b> 08:55 par alice ka laptop posture fail karta hai kyunki uski antivirus definitions 9 din purani hain. ISE use VLAN 20 plus dACL <code>REMEDIATE</code> (sirf update servers aur ISE) aur posture portal redirect ke saath authorize karta hai. 09:03 par agent compliant report karta hai. ISE CoA reauthenticate bhejta hai; naya Access-Accept VLAN 20, SGT 10 aur dACL <code>PERMIT-ALL</code> carry karta hai. VLAN nahi badla, isliye na bounce chahiye tha na naya DHCP; alice ko portal band hone ke alawa kuch pata nahi chala.</p></div>

<div class="warn"><p><b>Common galti.</b> ISE se aisa VLAN <b>name</b> return karna jo switch ke VLAN name se case ya spelling mein alag ho ("Employees" versus "EMPLOYEES"), ya aisa VLAN number jo kuch switches par bana hi nahi. Tab authorization sirf un switches par fail hota hai. Saare access switches par VLAN names ya numbers standardise karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tunnel-Private-Group-ID VLAN carry karta hai; Tunnel-Type 13 aur Tunnel-Medium-Type 6 hona chahiye. CoA <b>server se switch ko</b> bheja jaata hai (Cisco par UDP 1700), normal RADIUS ki ulti direction. Reauthenticate CoA port up rakhta hai; bounce CoA use flap karta hai.</p></div>

<div class="scn"><h4>Quarantine jisne kuch nahi kiya</h4><p>Ek incident ke dauraan SOC ne ISE mein ek suspicious host par ANC quarantine apply kiya. ISE ne CoA sent dikhaya, lekin host ke paas full access bana raha. Switch par <code>show running-config | section dynamic-author</code> ne kuch nahi diya: us switch model ke template mein CoA kabhi configure hi nahi hua tha. ISE ka CoA chupchaap drop hua. PSN addresses aur key ke saath <code>aaa server radius dynamic-author</code> jodne ke baad test quarantine ne host ko ek second mein quarantine SGT mein daal diya.</p><p><b>Seekh:</b> har deployment mein CoA test karo. Containment isi par depend karta hai.</p></div>

<div class="iv"><p class="q">"CoA kya hai aur teen situations batao jahan ISE ise use karta hai."</p><p>Strong answer: Change of Authorization, RFC 5176, server se network device ko active session badalne ki RADIUS request, Cisco ke liye UDP 1700 par. ISE ise Central WebAuth login ke baad (reauthenticate), posture unknown se compliant ya non-compliant hone par, profiling endpoint ko reclassify kare tab, aur firewall ya SOC se ANC quarantine ke liye use karta hai. Types: reauthenticate, port bounce, port disable, disconnect. Switch ko ISE nodes ko clients ki tarah rakhne wala aaa server radius dynamic-author chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access-Accept VLAN (Tunnel attributes 64/65/81), dACL, Filter-Id, SGT, voice permission, redirect, timers carry kar sakta hai.</li>
<li>Dynamic VLAN ko authorization network list aur switch par exist karne wala VLAN chahiye.</li>
<li>dACLs per session download hote hain aur host IP jaanne ke liye device tracking chahiye.</li>
<li>CoA: server-initiated, Cisco par UDP 1700; reauthenticate, bounce, disable, disconnect.</li>
<li><code>aaa server radius dynamic-author</code> configure karo, warna CWA, posture aur quarantine chupchaap fail hote hain.</li>
</ul></div>
`}};export{e as default};