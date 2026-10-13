var e={id:`lab-verify`,h:{en:`The all-active lab end to end: build, verify and test failover`,hi:`All-active lab end to end: build, verify aur failover test`},body:{en:`
<p>A pilot does not trust the plane until she has done a pre-flight check and a test of the controls. In the same spirit, a multi-homed segment is not "done" when the configuration is typed; it is done when you have proved five things in order: the bundle forms, the segment is recognised, the DF election is consistent, remote leaves alias, and a failure is survived. This chapter is your lab runbook for <code>sre-esi-aa</code>.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Five proofs">
<g font-size="12" class="svg-ink">
<rect x="10" y="40" width="115" height="50" rx="6" fill="#bae6fd"/><text x="67" y="62" text-anchor="middle">1 LACP</text><text x="67" y="78" text-anchor="middle" class="svg-muted">Po10 (SU)</text>
<rect x="135" y="40" width="115" height="50" rx="6" fill="#bae6fd"/><text x="192" y="62" text-anchor="middle">2 Segment</text><text x="192" y="78" text-anchor="middle" class="svg-muted">ESI + peer</text>
<rect x="260" y="40" width="115" height="50" rx="6" fill="#bae6fd"/><text x="317" y="62" text-anchor="middle">3 DF</text><text x="317" y="78" text-anchor="middle" class="svg-muted">mirror lists</text>
<rect x="385" y="40" width="115" height="50" rx="6" fill="#bae6fd"/><text x="442" y="62" text-anchor="middle">4 Aliasing</text><text x="442" y="78" text-anchor="middle" class="svg-muted">2 next hops</text>
<rect x="510" y="40" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="570" y="62" text-anchor="middle">5 Failover</text><text x="570" y="78" text-anchor="middle" class="svg-muted">ping survives</text>
</g></svg><p class="cap">Five proofs, one per rung.</p></div>

<h3>Proof 1: the bundle forms on both leaves</h3>
<pre class="out">LEAF1# show etherchannel summary
Group  Port-channel  Protocol    Ports
------+-------------+-----------+---------------------------
10     Po10(SU)      LACP        Gi1/0/6(P)

SW-CE# show etherchannel summary
Group  Port-channel  Protocol    Ports
10     Po10(SU)      LACP        Gi0/1(P)  Gi0/2(P)</pre>
<p>On SW-CE both ports are <b>(P)</b> bundled; if one is <b>(s)</b> suspended, the leaves present different LACP system IDs, which usually means ESI values or LACP settings disagree.</p>

<h3>Proof 2: the segment is recognised</h3>
<pre class="out">LEAF2# show l2vpn evpn ethernet-segment
Ethernet Segment ID           Interface   Redundancy   Peers
0000.1122.3344.5566.7788      Po10        all-active   10.255.1.11</pre>
<p>Same ESI on both leaves and the peer is the other leaf.</p>

<h3>Proof 3: the DF election is consistent</h3>
<p>Run <code>show l2vpn evpn ethernet-segment detail</code> on both leaves. The "DF by VLAN" lines must be mirror images (see the previous chapter).</p>

<h3>Proof 4: remote leaves see two next hops</h3>
<p>Make H5 talk (ping the gateway), then on LEAF3:</p>
<pre class="out">LEAF3# show l2vpn evpn mac evi 10
MAC Address    EVI   VLAN  ESI                      Ether Tag  Next Hop(s)
0050.56aa.0005 10    10    0000.1122.3344.5566.7788 0          <span class="hl">10.255.1.11, 10.255.1.12</span>
LEAF3# show bgp l2vpn evpn route-type 1
 (two per-EVI routes for ESI 7788, one from each next hop)</pre>

<h3>Proof 5: survive a failure</h3>
<ol>
<li>On H2 (LEAF2, VLAN 10) start a continuous ping to H5: <code>ping 10.10.10.15 repeat 1000</code>.</li>
<li>On LEAF1 shut the member port: <code>interface GigabitEthernet1/0/6</code> then <code>shutdown</code>.</li>
<li>Observe at most a few lost replies. On LEAF3 the MAC now shows one next hop, 10.255.1.12.</li>
<li>Check <code>show l2vpn evpn ethernet-segment detail</code> on LEAF2: LEAF2 is DF for all VLANs while LEAF1's link is down.</li>
<li>Restore with <code>no shutdown</code> and verify the DF returns to mirror-image lists after the wait-time.</li>
</ol>

<div class="eg"><p><b>Worked example: reading the failover.</b> Before the cut: LEAF3 MAC 0050.56aa.0005 via 10.255.1.11 and 10.255.1.12. After the cut: only 10.255.1.12 (the mass withdraw from LEAF1). After the restore: both again, but only after LEAF1 re-announces type 1 and finishes the DF wait. If both next hops return immediately but the ping is unstable for three seconds, that is the DF wait-time window.</p></div>

<h3>What the lab brief expects you to know</h3>
<ul>
<li>The topology: LEAF1, LEAF2 and LEAF3 as in the fabric, SW-CE with Po10 to LEAF1 and LEAF2, H5 10.10.10.15 behind it in VLAN 10.</li>
<li>The task checks <b>behaviour</b>: ESI present and equal, mode all-active, DF assigned, remote MAC with two next hops, ping H1 to H5 works after you shut one link.</li>
<li>Boundary: the lab models the BGP control plane only; LACP timers and hashing are simplified.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Verifying only that H5 pings. A ping works with one link and one leaf. The proof of multi-homing is the pair of next hops and the survival of a failure.</p></div>

<div class="exam"><p><b>Exam trap.</b> After the failover test, the correct recovery order is: link up, LACP bundle, type 4 and type 1 re-announced, DF wait, DF re-election. Do not assume traffic returns to the recovered leaf instantly.</p></div>

<div class="scn"><h4>The change window that proved itself</h4><p>A network team had to move a rack to a new leaf pair. They built the segment, then ran the five proofs. At proof 3 the two DF lists were identical ("local" on both leaves for VLAN 20) because a stale preference remained from a previous design. They fixed it before cutting over any server. During the cutover, shutting one link produced zero lost pings.</p><p><b>Lesson:</b> run the proofs before production traffic, not after the first complaint.</p></div>

<div class="iv"><p class="q">"How would you validate a new multi-homed segment before go-live?"</p><p>Strong answer: confirm the LACP bundle on the customer side, the ESI and peer on both leaves, mirror-image DF lists, remote leaves showing two next hops, then a controlled link failure with a continuous ping, observing mass withdraw and DF takeover, and finally restoring and verifying re-election.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five proofs: bundle, segment, DF, aliasing, failover.</li>
<li>Suspended LACP port usually means ESI or LACP mismatch.</li>
<li>A working ping alone is not proof of multi-homing.</li>
<li>Test failure and recovery before go-live.</li>
</ul></div>
`,hi:`
<p>Pilot plane par tab tak bharosa nahi karti jab tak pre-flight check aur controls ka test na kar le. Isi tarah multi-homed segment tab "done" nahi hota jab configuration type ho jaaye; tab done hota hai jab aap paanch cheezein order mein prove kar dein: bundle ban gaya, segment recognise hua, DF election consistent hai, remote leaves alias karte hain, aur failure survive hua. Yeh chapter <code>sre-esi-aa</code> ke liye aapka lab runbook hai.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Five proofs">
<g font-size="12" class="svg-ink">
<rect x="10" y="40" width="115" height="50" rx="6" fill="#bae6fd"/><text x="67" y="62" text-anchor="middle">1 LACP</text><text x="67" y="78" text-anchor="middle" class="svg-muted">Po10 (SU)</text>
<rect x="135" y="40" width="115" height="50" rx="6" fill="#bae6fd"/><text x="192" y="62" text-anchor="middle">2 Segment</text><text x="192" y="78" text-anchor="middle" class="svg-muted">ESI + peer</text>
<rect x="260" y="40" width="115" height="50" rx="6" fill="#bae6fd"/><text x="317" y="62" text-anchor="middle">3 DF</text><text x="317" y="78" text-anchor="middle" class="svg-muted">mirror lists</text>
<rect x="385" y="40" width="115" height="50" rx="6" fill="#bae6fd"/><text x="442" y="62" text-anchor="middle">4 Aliasing</text><text x="442" y="78" text-anchor="middle" class="svg-muted">2 next hops</text>
<rect x="510" y="40" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="570" y="62" text-anchor="middle">5 Failover</text><text x="570" y="78" text-anchor="middle" class="svg-muted">ping survive</text>
</g></svg><p class="cap">Paanch proofs, har rung ke liye ek.</p></div>

<h3>Proof 1: dono leaves par bundle ban jaata hai</h3>
<pre class="out">LEAF1# show etherchannel summary
Group  Port-channel  Protocol    Ports
------+-------------+-----------+---------------------------
10     Po10(SU)      LACP        Gi1/0/6(P)

SW-CE# show etherchannel summary
Group  Port-channel  Protocol    Ports
10     Po10(SU)      LACP        Gi0/1(P)  Gi0/2(P)</pre>
<p>SW-CE par dono ports <b>(P)</b> bundled hone chahiye; agar ek <b>(s)</b> suspended hai, to leaves alag LACP system IDs dikha rahe hain, jiska matlab aam taur par ESI values ya LACP settings agree nahi karti.</p>

<h3>Proof 2: segment recognise hota hai</h3>
<pre class="out">LEAF2# show l2vpn evpn ethernet-segment
Ethernet Segment ID           Interface   Redundancy   Peers
0000.1122.3344.5566.7788      Po10        all-active   10.255.1.11</pre>
<p>Dono leaves par same ESI aur peer doosra leaf hai.</p>

<h3>Proof 3: DF election consistent hai</h3>
<p>Dono leaves par <code>show l2vpn evpn ethernet-segment detail</code> chalao. "DF by VLAN" lines mirror image honi chahiye (pichhla chapter dekho).</p>

<h3>Proof 4: remote leaves do next hops dekhte hain</h3>
<p>H5 ko baat karwao (gateway ko ping), phir LEAF3 par:</p>
<pre class="out">LEAF3# show l2vpn evpn mac evi 10
MAC Address    EVI   VLAN  ESI                      Ether Tag  Next Hop(s)
0050.56aa.0005 10    10    0000.1122.3344.5566.7788 0          <span class="hl">10.255.1.11, 10.255.1.12</span>
LEAF3# show bgp l2vpn evpn route-type 1
 (ESI 7788 ke do per-EVI routes, har next hop se ek)</pre>

<h3>Proof 5: failure survive karo</h3>
<ol>
<li>H2 (LEAF2, VLAN 10) par H5 ko continuous ping shuru karo: <code>ping 10.10.10.15 repeat 1000</code>.</li>
<li>LEAF1 par member port shut karo: <code>interface GigabitEthernet1/0/6</code> phir <code>shutdown</code>.</li>
<li>Zyada se zyada kuch replies lost dikhte hain. LEAF3 par MAC ab ek next hop dikhata hai, 10.255.1.12.</li>
<li>LEAF2 par <code>show l2vpn evpn ethernet-segment detail</code> check karo: LEAF1 ka link down hone par LEAF2 saare VLANs ka DF hai.</li>
<li><code>no shutdown</code> se restore karo aur verify karo ki wait-time ke baad DF mirror-image lists par wapas aata hai.</li>
</ol>

<div class="eg"><p><b>Worked example: failover padhna.</b> Cut se pehle: LEAF3 par MAC 0050.56aa.0005 10.255.1.11 aur 10.255.1.12 se. Cut ke baad: sirf 10.255.1.12 (LEAF1 se mass withdraw). Restore ke baad: dono phir se, lekin tabhi jab LEAF1 type 1 dobara announce kare aur DF wait khatam kare. Agar dono next hops turant wapas aa jaayein lekin ping teen second unstable rahe, to woh DF wait-time window hai.</p></div>

<h3>Lab brief aapse kya umeed karta hai</h3>
<ul>
<li>Topology: fabric ke jaise LEAF1, LEAF2 aur LEAF3, SW-CE jiska Po10 LEAF1 aur LEAF2 ko jaata hai, aur uske peeche VLAN 10 mein H5 10.10.10.15.</li>
<li>Task <b>behaviour</b> check karta hai: ESI present aur barabar, mode all-active, DF assigned, do next hops wala remote MAC, ek link shut karne ke baad bhi H1 se H5 ping chalta hai.</li>
<li>Boundary: lab sirf BGP control plane model karta hai; LACP timers aur hashing simplified hain.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Sirf yeh verify karna ki H5 ping hota hai. Ping ek link aur ek leaf se bhi chalta hai. Multi-homing ka saboot do next hops ka jodi aur failure survive karna hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Failover test ke baad sahi recovery order: link up, LACP bundle, type 4 aur type 1 dobara announce, DF wait, DF re-election. Yeh mat maano ki traffic recovered leaf par turant wapas aa jaata hai.</p></div>

<div class="scn"><h4>Change window jisne khud ko prove kiya</h4><p>Network team ko rack ko naye leaf pair par move karna tha. Unhone segment banaya, phir paanch proofs chalaye. Proof 3 par dono DF lists identical thi (VLAN 20 ke liye dono leaves par "local") kyunki pichhle design ki ek stale preference reh gayi thi. Unhone kisi server ko cutover karne se pehle theek kiya. Cutover ke dauraan ek link shut karne par zero pings lost hue.</p><p><b>Seekh:</b> production traffic se pehle proofs chalao, pehli complaint ke baad nahi.</p></div>

<div class="iv"><p class="q">"Go-live se pehle naye multi-homed segment ko validate kaise karoge?"</p><p>Strong answer: customer side par LACP bundle, dono leaves par ESI aur peer, mirror-image DF lists, do next hops dikhane wale remote leaves confirm karo, phir continuous ping ke saath controlled link failure karke mass withdraw aur DF takeover dekho, aur aakhir mein restore karke re-election verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch proofs: bundle, segment, DF, aliasing, failover.</li>
<li>Suspended LACP port aam taur par ESI ya LACP mismatch hai.</li>
<li>Sirf working ping multi-homing ka saboot nahi.</li>
<li>Go-live se pehle failure aur recovery test karo.</li>
</ul></div>
`}};export{e as default};