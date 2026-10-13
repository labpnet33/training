var e={id:`troubleshooting`,h:{en:`Troubleshooting MPLS: LDP sessions, labels and VPNs (Lab 2 walkthrough)`,hi:`MPLS troubleshooting: LDP sessions, labels aur VPNs (Lab 2 walkthrough)`},body:{en:`
<p>A good electrician does not start by replacing the light bulb. He checks the building supply, then the fuse box, then the switch, then the bulb, in that order, and stops at the first thing that is wrong. MPLS troubleshooting works the same way, layer by layer: <b>IGP → LDP interfaces → discovery → session → bindings → LFIB → end-to-end LSP → VPN</b>. Skipping a layer is how engineers lose hours.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="MPLS troubleshooting ladder">
<rect x="5" y="20" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="52" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 IGP</text><text x="52" y="56" text-anchor="middle" class="svg-muted" font-size="12">loopbacks</text>
<rect x="110" y="20" width="95" height="44" rx="8" fill="#bae6fd"/><text x="157" y="40" text-anchor="middle" class="svg-ink" font-size="12">2 mpls ip</text><text x="157" y="56" text-anchor="middle" class="svg-muted" font-size="12">interfaces</text>
<rect x="215" y="20" width="95" height="44" rx="8" fill="#bae6fd"/><text x="262" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 discovery</text><text x="262" y="56" text-anchor="middle" class="svg-muted" font-size="12">xmit/recv</text>
<rect x="320" y="20" width="95" height="44" rx="8" fill="#ddd6fe"/><text x="367" y="40" text-anchor="middle" class="svg-ink" font-size="12">4 session</text><text x="367" y="56" text-anchor="middle" class="svg-muted" font-size="12">Oper</text>
<rect x="425" y="20" width="95" height="44" rx="8" fill="#ddd6fe"/><text x="472" y="40" text-anchor="middle" class="svg-ink" font-size="12">5 LFIB</text><text x="472" y="56" text-anchor="middle" class="svg-muted" font-size="12">labels</text>
<rect x="530" y="20" width="105" height="44" rx="8" fill="#fde68a"/><text x="582" y="40" text-anchor="middle" class="svg-ink" font-size="12">6 LSP / VPN</text><text x="582" y="56" text-anchor="middle" class="svg-muted" font-size="12">traceroute</text>
<text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="13">Work left to right; stop at the first failing step</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">show ip route · show mpls interfaces · show mpls ldp discovery</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">show mpls ldp neighbor · show mpls forwarding-table · traceroute</text>
</svg><p class="cap">The six-step MPLS troubleshooting ladder.</p></div>

<table class="cmp"><tr><th>Step</th><th>Command</th><th>Healthy</th><th>Typical faults</th></tr>
<tr><td>1 IGP</td><td>show ip route</td><td>/32 route to every LDP router ID</td><td>Loopback not in OSPF, summarised loopbacks</td></tr>
<tr><td>2 Interfaces</td><td>show mpls interfaces</td><td>Every core link listed, Operational Yes</td><td>mpls ip missing on one end, no CEF</td></tr>
<tr><td>3 Discovery</td><td>show mpls ldp discovery</td><td>xmit/recv with the right LDP Id</td><td>"xmit" only; "no route" after the LDP Id</td></tr>
<tr><td>4 Session</td><td>show mpls ldp neighbor</td><td>State: Oper</td><td>No route to transport address, TCP 646 filtered, MD5 password mismatch</td></tr>
<tr><td>5 Labels</td><td>show mpls ldp bindings, show mpls forwarding-table</td><td>Numeric or Pop Label toward the next hop</td><td>"No Label" toward a core neighbour</td></tr>
<tr><td>6 LSP</td><td>traceroute between loopbacks</td><td>Labels on every core hop</td><td>Unlabelled hop, MTU drops, one-way LSP</td></tr></table>

<h3>Lab 2 walkthrough: "Troubleshoot: LDP sessions and PHP"</h3>
<p>The Metro core is PE1 – P1 – P2 – PE2 with loopbacks 1.1.1.1, 2.2.2.2, 3.3.3.3 and 4.4.4.4. A junior engineer "finished" the rollout, but PE1 has no LDP neighbour and traffic to PE2 leaves unlabelled. Start where the complaint is.</p>

<pre class="out">PE1# show mpls ldp neighbor
PE1#
PE1# show mpls ldp discovery
 Local LDP Identifier:
    1.1.1.1:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/1 (ldp): xmit/recv
<span class="hl">            LDP Id: 7.7.7.7:0; no route</span></pre>
<p>Discovery works in both directions (xmit/recv), so <code>mpls ip</code> is on both ends and Hellos pass. But P1 identifies itself as <b>7.7.7.7</b>, and PE1 has <b>no route</b> to it. Check P1:</p>
<pre class="out">P1# show running-config | include ldp router-id
<span class="hl">mpls ldp router-id Loopback1 force</span>
P1# show ip interface brief | include Loopback
Loopback0              2.2.2.2         YES manual up                    up
Loopback1              7.7.7.7         YES manual up                    up
P1# show running-config | section router ospf
router ospf 1
 network 2.2.2.2 0.0.0.0 area 0
 network 10.0.12.0 0.0.0.255 area 0
 network 10.0.23.0 0.0.0.255 area 0</pre>
<p><b>Fault 1:</b> P1 uses Loopback1 (7.7.7.7) as LDP router ID and transport address, but OSPF does not advertise it. Neither PE1 nor P2 can open TCP 646 to it. The task says not to renumber anything, so there are two valid fixes:</p>
<pre class="code"><span class="c">! Fix A (cleanest): use the advertised loopback</span>
P1(config)# mpls ldp router-id Loopback0 force
<span class="c">! Fix B: advertise the loopback that LDP uses</span>
P1(config)# router ospf 1
P1(config-router)# network 7.7.7.7 0.0.0.0 area 0</pre>
<p>After fix A, PE1 and P2 both show P1 as 2.2.2.2:0 in State Oper. Next, PE2 is still alone:</p>
<pre class="out">PE2# show mpls ldp discovery
    Interfaces:
<span class="hl">        GigabitEthernet0/3 (ldp): xmit</span>
P2# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
GigabitEthernet0/2     Yes (ldp)     No       No  No     Yes</pre>
<p><b>Fault 2:</b> PE2 sends Hellos but receives none, and P2's Gi0/3 is missing from <code>show mpls interfaces</code>. The fix is <code>interface GigabitEthernet0/3</code> / <code>mpls ip</code> on P2. Before the fix, P2's LFIB showed <b>No Label</b> for 4.4.4.4/32; after it, the entry becomes <b>Pop Label</b>:</p>
<pre class="out">P2# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
16         Pop Label  2.2.2.2/32       0             Gi0/2      10.0.23.2
<span class="hl">17         Pop Label  4.4.4.4/32       0             Gi0/3      10.0.34.4</span>
18         Pop Label  10.0.12.0/24     0             Gi0/2      10.0.23.2
19         20         1.1.1.1/32       0             Gi0/2      10.0.23.2

PE1# traceroute 4.4.4.4
  1 10.0.12.2 [MPLS: Label 22 Exp 0] 2 msec 2 msec 2 msec
<span class="hl">  2 10.0.23.3 [MPLS: Label 17 Exp 0] 2 msec 2 msec 3 msec</span>
  3 10.0.34.4 3 msec 3 msec 3 msec</pre>
<p>The lab questions: the Outgoing Label for 4.4.4.4/32 on P2 is <b>Pop Label</b>, and the penultimate hop that removes the label from PE1's packets to 4.4.4.4 is <b>P2</b>. PE1 now imposes a numeric label for 4.4.4.4/32, and the path is push, swap, pop.</p>

<h3>Other classic causes</h3>
<ul>
<li><b>LDP authentication mismatch</b>: <code>mpls ldp neighbor 2.2.2.2 password</code> on one side only. Hellos work, TCP fails, and the log shows TCP MD5 errors such as "No MD5 digest".</li>
<li><b>ACL on the core interface</b> blocking UDP 646 (discovery shows "xmit" only) or TCP 646 (discovery xmit/recv but no session).</li>
<li><b>Duplicate LDP router IDs</b>: sessions flap or never form.</li>
<li><b>MTU</b>: small pings work, large ones fail. Test with <code>ping 4.4.4.4 size 1500 df-bit</code> from a PE loopback.</li>
<li><b>IGP converged before LDP</b>: short blackholes after link recovery; fix with <code>mpls ldp sync</code>.</li>
</ul>

<h3>Extending the ladder to L3VPN</h3>
<ol>
<li>VRF and interface: <code>show vrf</code>, <code>show ip route vrf CUST-A connected</code>.</li>
<li>CE-PE: the CE route is in the VRF table (static, OSPF or BGP in the VRF).</li>
<li>MP-BGP: <code>show bgp vpnv4 unicast all summary</code> has a prefix count for the remote PE.</li>
<li>RT: the remote route is in <code>show bgp vpnv4 unicast all</code> but not in the VRF → import RT mismatch.</li>
<li>Labels: <code>show bgp vpnv4 unicast all labels</code> shows an out-label; the LSP to the BGP next hop is intact (traceroute to the remote PE loopback).</li>
<li>End to end: <code>ping vrf CUST-A</code> and <code>traceroute vrf CUST-A</code>.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Symptom: "xmit/recv, LDP Id 10.0.23.2:0" on PE1's neighbour P1, session Oper, but P1's LDP ID changes every time an interface flaps. Cause: no <code>mpls ldp router-id</code> and no loopback, so LDP picked the highest interface IP. Fix: create Loopback0, advertise it, set <code>mpls ldp router-id Loopback0 force</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Seeing a neighbour in <code>show mpls ldp discovery</code> and assuming the session is fine. Discovery is only UDP Hellos. Always confirm "State: Oper" in <code>show mpls ldp neighbor</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "xmit" only = the other side sends no Hellos (mpls ip missing, UDP 646 blocked). "xmit/recv" plus "no route" = Hellos fine, TCP to the transport address impossible. "Pop Label" = normal PHP. "No Label" toward a core neighbour = no binding from that neighbour.</p></div>

<div class="scn"><h4>The LDP session that only failed on the new router</h4><p>A new P router from a different platform team joined the core. Discovery showed xmit/recv on both sides, but the session never reached Oper, and the log filled with TCP MD5 messages. The existing core used a global LDP password (<code>mpls ldp password fallback</code>) together with <code>mpls ldp password required</code>; the new router had none. Adding the same LDP password brought the sessions up immediately.</p><p><b>Lesson:</b> when Hellos work but TCP 646 does not, check reachability of the transport address, ACLs, and LDP MD5 authentication.</p></div>

<div class="iv"><p class="q">"An LDP neighbour appears in discovery but the session never comes up. How do you troubleshoot?"</p><p>Discovery proves UDP Hellos are exchanged, so look at the TCP side. Check the LDP ID and transport address in show mpls ldp discovery, and whether it says "no route". Verify a route and ping to that address from the loopback, check ACLs for TCP 646, check LDP MD5 passwords on both sides, and look for duplicate router IDs. Fix by advertising the loopback or changing the router ID with force.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder: IGP, mpls interfaces, discovery, session, labels, LSP, then VPN.</li>
<li>"no route" after the LDP Id: the transport address is unreachable; advertise it or change the router ID.</li>
<li>"xmit" only: the neighbour sends no Hellos; add mpls ip there or remove the filter.</li>
<li>Lab 2: P1 router ID on unadvertised Loopback1, P2 Gi0/3 missing mpls ip; afterwards P2 shows Pop Label for 4.4.4.4.</li>
<li>For VPNs also check VPNv4 session, RT import, VPN labels and ping vrf.</li>
</ul></div>
`,hi:`
<p>Ek achha electrician shuru mein bulb nahi badalta. Woh building supply check karta hai, phir fuse box, phir switch, phir bulb, isi order mein, aur pehli galat cheez par ruk jaata hai. MPLS troubleshooting bhi aise hi layer by layer hoti hai: <b>IGP → LDP interfaces → discovery → session → bindings → LFIB → end-to-end LSP → VPN</b>. Ek layer chhodna hi woh tarika hai jisse engineers ghante gawate hain.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="MPLS troubleshooting ladder">
<rect x="5" y="20" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="52" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 IGP</text><text x="52" y="56" text-anchor="middle" class="svg-muted" font-size="12">loopbacks</text>
<rect x="110" y="20" width="95" height="44" rx="8" fill="#bae6fd"/><text x="157" y="40" text-anchor="middle" class="svg-ink" font-size="12">2 mpls ip</text><text x="157" y="56" text-anchor="middle" class="svg-muted" font-size="12">interfaces</text>
<rect x="215" y="20" width="95" height="44" rx="8" fill="#bae6fd"/><text x="262" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 discovery</text><text x="262" y="56" text-anchor="middle" class="svg-muted" font-size="12">xmit/recv</text>
<rect x="320" y="20" width="95" height="44" rx="8" fill="#ddd6fe"/><text x="367" y="40" text-anchor="middle" class="svg-ink" font-size="12">4 session</text><text x="367" y="56" text-anchor="middle" class="svg-muted" font-size="12">Oper</text>
<rect x="425" y="20" width="95" height="44" rx="8" fill="#ddd6fe"/><text x="472" y="40" text-anchor="middle" class="svg-ink" font-size="12">5 LFIB</text><text x="472" y="56" text-anchor="middle" class="svg-muted" font-size="12">labels</text>
<rect x="530" y="20" width="105" height="44" rx="8" fill="#fde68a"/><text x="582" y="40" text-anchor="middle" class="svg-ink" font-size="12">6 LSP / VPN</text><text x="582" y="56" text-anchor="middle" class="svg-muted" font-size="12">traceroute</text>
<text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="13">Left se right chalo; pehle fail hone wale step par ruko</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">show ip route · show mpls interfaces · show mpls ldp discovery</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">show mpls ldp neighbor · show mpls forwarding-table · traceroute</text>
</svg><p class="cap">Chhe step wali MPLS troubleshooting ladder.</p></div>

<table class="cmp"><tr><th>Step</th><th>Command</th><th>Healthy</th><th>Typical faults</th></tr>
<tr><td>1 IGP</td><td>show ip route</td><td>Har LDP router ID tak /32 route</td><td>Loopback OSPF mein nahi, summarised loopbacks</td></tr>
<tr><td>2 Interfaces</td><td>show mpls interfaces</td><td>Har core link listed, Operational Yes</td><td>Ek end par mpls ip missing, CEF nahi</td></tr>
<tr><td>3 Discovery</td><td>show mpls ldp discovery</td><td>Sahi LDP Id ke saath xmit/recv</td><td>Sirf "xmit"; LDP Id ke baad "no route"</td></tr>
<tr><td>4 Session</td><td>show mpls ldp neighbor</td><td>State: Oper</td><td>Transport address tak route nahi, TCP 646 filtered, MD5 password mismatch</td></tr>
<tr><td>5 Labels</td><td>show mpls ldp bindings, show mpls forwarding-table</td><td>Next hop ki taraf numeric ya Pop Label</td><td>Core neighbour ki taraf "No Label"</td></tr>
<tr><td>6 LSP</td><td>Loopbacks ke beech traceroute</td><td>Har core hop par labels</td><td>Unlabelled hop, MTU drops, one-way LSP</td></tr></table>

<h3>Lab 2 walkthrough: "Troubleshoot: LDP sessions aur PHP"</h3>
<p>Metro core PE1 – P1 – P2 – PE2 hai, loopbacks 1.1.1.1, 2.2.2.2, 3.3.3.3 aur 4.4.4.4. Ek junior engineer ne rollout "poora" kar diya, par PE1 ka koi LDP neighbour nahi hai aur PE2 ka traffic bina label ke jaata hai. Wahan se shuru karo jahan complaint hai.</p>

<pre class="out">PE1# show mpls ldp neighbor
PE1#
PE1# show mpls ldp discovery
 Local LDP Identifier:
    1.1.1.1:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/1 (ldp): xmit/recv
<span class="hl">            LDP Id: 7.7.7.7:0; no route</span></pre>
<p>Discovery dono directions mein kaam karta hai (xmit/recv), matlab <code>mpls ip</code> dono ends par hai aur Hellos pass ho rahe hain. Par P1 khud ko <b>7.7.7.7</b> batata hai, aur PE1 ke paas uska <b>koi route nahi</b> hai. P1 check karo:</p>
<pre class="out">P1# show running-config | include ldp router-id
<span class="hl">mpls ldp router-id Loopback1 force</span>
P1# show ip interface brief | include Loopback
Loopback0              2.2.2.2         YES manual up                    up
Loopback1              7.7.7.7         YES manual up                    up
P1# show running-config | section router ospf
router ospf 1
 network 2.2.2.2 0.0.0.0 area 0
 network 10.0.12.0 0.0.0.255 area 0
 network 10.0.23.0 0.0.0.255 area 0</pre>
<p><b>Fault 1:</b> P1 Loopback1 (7.7.7.7) ko LDP router ID aur transport address ki tarah use karta hai, par OSPF use advertise nahi karta. Na PE1 na P2 us par TCP 646 khol sakte hain. Task kehta hai kuch renumber mat karo, isliye do valid fixes hain:</p>
<pre class="code"><span class="c">! Fix A (sabse saaf): advertised loopback use karo</span>
P1(config)# mpls ldp router-id Loopback0 force
<span class="c">! Fix B: jo loopback LDP use karta hai use advertise karo</span>
P1(config)# router ospf 1
P1(config-router)# network 7.7.7.7 0.0.0.0 area 0</pre>
<p>Fix A ke baad PE1 aur P2 dono P1 ko 2.2.2.2:0 State Oper mein dikhate hain. Aage, PE2 abhi bhi akela hai:</p>
<pre class="out">PE2# show mpls ldp discovery
    Interfaces:
<span class="hl">        GigabitEthernet0/3 (ldp): xmit</span>
P2# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
GigabitEthernet0/2     Yes (ldp)     No       No  No     Yes</pre>
<p><b>Fault 2:</b> PE2 Hellos bhejta hai par koi receive nahi karta, aur P2 ka Gi0/3 <code>show mpls interfaces</code> se gayab hai. Fix hai P2 par <code>interface GigabitEthernet0/3</code> / <code>mpls ip</code>. Fix se pehle P2 ki LFIB 4.4.4.4/32 ke liye <b>No Label</b> dikhati thi; uske baad entry <b>Pop Label</b> ban jaati hai:</p>
<pre class="out">P2# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
16         Pop Label  2.2.2.2/32       0             Gi0/2      10.0.23.2
<span class="hl">17         Pop Label  4.4.4.4/32       0             Gi0/3      10.0.34.4</span>
18         Pop Label  10.0.12.0/24     0             Gi0/2      10.0.23.2
19         20         1.1.1.1/32       0             Gi0/2      10.0.23.2

PE1# traceroute 4.4.4.4
  1 10.0.12.2 [MPLS: Label 22 Exp 0] 2 msec 2 msec 2 msec
<span class="hl">  2 10.0.23.3 [MPLS: Label 17 Exp 0] 2 msec 2 msec 3 msec</span>
  3 10.0.34.4 3 msec 3 msec 3 msec</pre>
<p>Lab ke sawaal: P2 par 4.4.4.4/32 ka Outgoing Label <b>Pop Label</b> hai, aur jo penultimate hop PE1 ke 4.4.4.4 jaane wale packets se label hataata hai woh <b>P2</b> hai. PE1 ab 4.4.4.4/32 ke liye numeric label impose karta hai, aur path push, swap, pop hai.</p>

<h3>Doosre classic causes</h3>
<ul>
<li><b>LDP authentication mismatch</b>: <code>mpls ldp neighbor 2.2.2.2 password</code> sirf ek side par. Hellos chalte hain, TCP fail hota hai, aur log mein "No MD5 digest" jaise TCP MD5 errors dikhte hain.</li>
<li><b>Core interface par ACL</b> jo UDP 646 block kare (discovery sirf "xmit" dikhata hai) ya TCP 646 (discovery xmit/recv par session nahi).</li>
<li><b>Duplicate LDP router IDs</b>: sessions flap karte hain ya kabhi nahi bante.</li>
<li><b>MTU</b>: chhote pings chalte hain, bade fail. PE loopback se <code>ping 4.4.4.4 size 1500 df-bit</code> se test karo.</li>
<li><b>IGP LDP se pehle converge</b>: link recovery ke baad chhote blackholes; <code>mpls ldp sync</code> se fix.</li>
</ul>

<h3>Ladder ko L3VPN tak badhana</h3>
<ol>
<li>VRF aur interface: <code>show vrf</code>, <code>show ip route vrf CUST-A connected</code>.</li>
<li>CE-PE: CE ka route VRF table mein hai (VRF mein static, OSPF ya BGP).</li>
<li>MP-BGP: <code>show bgp vpnv4 unicast all summary</code> mein remote PE ka prefix count hai.</li>
<li>RT: remote route <code>show bgp vpnv4 unicast all</code> mein hai par VRF mein nahi → import RT mismatch.</li>
<li>Labels: <code>show bgp vpnv4 unicast all labels</code> out-label dikhata hai; BGP next hop tak LSP salamat hai (remote PE loopback tak traceroute).</li>
<li>End to end: <code>ping vrf CUST-A</code> aur <code>traceroute vrf CUST-A</code>.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Symptom: PE1 ke neighbour P1 par "xmit/recv, LDP Id 10.0.23.2:0", session Oper, par har baar interface flap hone par P1 ka LDP ID badal jaata hai. Wajah: na <code>mpls ldp router-id</code> hai na loopback, isliye LDP ne sabse bada interface IP chuna. Fix: Loopback0 banao, advertise karo, <code>mpls ldp router-id Loopback0 force</code> set karo.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>show mpls ldp discovery</code> mein neighbour dekhkar maan lena ki session theek hai. Discovery sirf UDP Hellos hai. Hamesha <code>show mpls ldp neighbor</code> mein "State: Oper" confirm karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sirf "xmit" = doosri side Hellos nahi bhejti (mpls ip missing, UDP 646 blocked). "xmit/recv" plus "no route" = Hellos theek, transport address tak TCP namumkin. "Pop Label" = normal PHP. Core neighbour ki taraf "No Label" = us neighbour se koi binding nahi.</p></div>

<div class="scn"><h4>LDP session jo sirf naye router par fail hota tha</h4><p>Ek alag platform team ka naya P router core mein joda gaya. Discovery dono sides xmit/recv dikhata tha, par session kabhi Oper tak nahi pahuncha, aur log TCP MD5 messages se bhar gaya. Existing core ek global LDP password (<code>mpls ldp password fallback</code>) ke saath <code>mpls ldp password required</code> use karta tha; naye router par koi password nahi tha. Same LDP password jodte hi sessions turant up ho gaye.</p><p><b>Seekh:</b> jab Hellos chalein par TCP 646 nahi, to transport address ki reachability, ACLs aur LDP MD5 authentication check karo.</p></div>

<div class="iv"><p class="q">"Ek LDP neighbour discovery mein dikhta hai par session kabhi up nahi hota. Kaise troubleshoot karoge?"</p><p>Discovery prove karta hai ki UDP Hellos exchange ho rahe hain, isliye TCP side dekho. show mpls ldp discovery mein LDP ID aur transport address check karo, aur kya woh "no route" kehta hai. Loopback se us address tak route aur ping verify karo, TCP 646 ke liye ACLs check karo, dono sides LDP MD5 passwords check karo, aur duplicate router IDs dhoondho. Loopback advertise karke ya force ke saath router ID badalkar fix karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder: IGP, mpls interfaces, discovery, session, labels, LSP, phir VPN.</li>
<li>LDP Id ke baad "no route": transport address unreachable hai; use advertise karo ya router ID badlo.</li>
<li>Sirf "xmit": neighbour Hellos nahi bhejta; wahan mpls ip jodo ya filter hatao.</li>
<li>Lab 2: P1 ka router ID unadvertised Loopback1 par, P2 Gi0/3 par mpls ip missing; uske baad P2 4.4.4.4 ke liye Pop Label dikhata hai.</li>
<li>VPNs ke liye VPNv4 session, RT import, VPN labels aur ping vrf bhi check karo.</li>
</ul></div>
`}};export{e as default};