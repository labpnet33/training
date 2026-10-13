var e={id:`verification`,h:{en:`Verification: reading the flags and the partner`,hi:`Verification: flags aur partner padhna`},body:{en:`
<p>A doctor does not declare a patient healthy because he walked into the clinic. She checks pulse, blood pressure and temperature, each telling her something different. A port-channel that passes a ping is the patient who walked in. <b>Verification</b> means checking the vital signs: the bundle state, every member's flag, the partner's identity, the bandwidth, and how STP and the trunk see the bundle.</p>

<h3>Command 1: show etherchannel summary</h3>
<p>This is the first command in every EtherChannel check. Learn the legend by heart.</p>
<pre class="out">DSW1# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator

        M - not in use, minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">10     Po10(SU)        LACP      Gi0/1(P)    Gi0/2(P)    Gi0/3(P)</span></pre>

<table class="cmp"><tr><th>Flag</th><th>Applies to</th><th>Meaning and what to do</th></tr>
<tr><td><code>SU</code></td><td>Po</td><td>Layer 2, in use. Healthy.</td></tr>
<tr><td><code>RU</code></td><td>Po</td><td>Layer 3, in use. Healthy.</td></tr>
<tr><td><code>SD</code> / <code>RD</code></td><td>Po</td><td>Exists but down: no member is bundled. Look at the member flags.</td></tr>
<tr><td><code>SM</code> / <code>RM</code></td><td>Po</td><td>Not in use because <code>port-channel min-links</code> is not met.</td></tr>
<tr><td><code>P</code></td><td>Member</td><td>Bundled and forwarding. What you want on every member.</td></tr>
<tr><td><code>I</code></td><td>Member</td><td>Stand-alone: no compatible LACP/PAgP partner. Check modes and cabling on both ends.</td></tr>
<tr><td><code>s</code></td><td>Member</td><td>Suspended: configuration incompatible with the bundle. Check the log and compare settings.</td></tr>
<tr><td><code>H</code></td><td>Member</td><td>LACP hot-standby (more than 8 ports, or max-bundle). Normal if intended.</td></tr>
<tr><td><code>D</code></td><td>Member</td><td>Physically down: shut, cable, optic or err-disabled.</td></tr>
<tr><td><code>w</code></td><td>Member</td><td>Waiting to be aggregated; usually transient right after a change.</td></tr></table>
<p>The Protocol column tells you <code>LACP</code>, <code>PAgP</code>, or <code>-</code> for static on.</p>

<h3>Command 2: show etherchannel port-channel</h3>
<pre class="out">DSW1# show etherchannel port-channel
                Channel-group listing:
                ----------------------

Group: 10
----------
                Port-channels in the group:
                ---------------------------

Port-channel: Po10    (Primary Aggregator)

------------

Age of the Port-channel   = 0d:00h:12m:31s
Logical slot/port   = 16/0          Number of ports = 3
HotStandBy port = null
<span class="hl">Port state          = Port-channel Ag-Inuse</span>
<span class="hl">Protocol            =   LACP</span>
Port security       = Disabled

Ports in the Port-channel:

Index   Load   Port     EC state        No of bits
------+------+------+------------------+-----------
  0     49     Gi0/1    Active             3
  1     92     Gi0/2    Active             3
  2     24     Gi0/3    Active             2

Time since last port bundled:    0d:00h:11m:58s    Gi0/3</pre>
<p>This view adds the age of the bundle, the protocol, and the <b>Load</b> column: a hex mask of the 8 hash buckets each member owns. 0x49, 0x92 and 0x24 in binary own 3, 3 and 2 buckets, which is the 3/3/2 split from chapter 8. <b>No of bits</b> says the same thing in decimal. The EC state column shows the LACP mode on this switch. Time since last port bundled is handy after an outage: a recent time means a member flapped.</p>

<h3>Command 3: show lacp neighbor (and show pagp neighbor)</h3>
<pre class="out">DSW1# show lacp neighbor
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode

Channel group 10 neighbors

Partner's information:

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
<span class="hl">Gi0/1     SP      32768     5254.0002.0001  14s    0x0    0xA    0x2     0x3C</span>
Gi0/2     SP      32768     5254.0002.0001  14s    0x0    0xA    0x3     0x3C
Gi0/3     SP      32768     5254.0002.0001  15s    0x0    0xA    0x4     0x3C</pre>
<p>Check three things. <b>Flags</b>: SP means the partner (ASW1) requests slow LACPDUs and is passive. <b>Dev ID</b>: identical on every row, so every member reaches the same partner. <b>Age</b>: seconds since the last LACPDU; with slow timers it should stay below 30. If a member has no row at all, no LACPDUs arrive on it. <code>show lacp internal</code> shows the same fields for the local side, and <code>show lacp sys-id</code> the local system priority and MAC. For PAgP, <code>show pagp neighbor</code> shows the partner name, device ID and flags such as SC or SAC.</p>

<h3>Command 4: how the rest of the switch sees the bundle</h3>
<pre class="out">DSW1# show interfaces port-channel 10 | include BW|Members
  MTU 1500 bytes, <span class="hl">BW 3000000 Kbit/sec</span>, DLY 10 usec,
  <span class="hl">Members in this channel: Gi0/1 Gi0/2 Gi0/3</span>

SW1# show interfaces trunk
Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Po1         on               802.1q         trunking      1</span>

Port        Vlans allowed on trunk
Po1         10,20

SW1# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/5               Desg FWD 4         128.5    P2p
<span class="hl">Po1                 Desg FWD 3         128.65   P2p</span></pre>
<p>BW is the sum of the active members (3 x 1 Gbps). The trunk and STP list only <code>Po1</code>, never Gi0/1 or Gi0/2, and STP gives the 2 Gbps bundle a lower cost (3) than a single 1 Gbps link (4).</p>

<div class="eg"><p><b>Worked example: a five-step health check.</b> After building Po10 in the LACP lab: (1) <code>show etherchannel summary</code> on both switches: Po10(SU), three (P). (2) <code>show lacp neighbor</code> on ASW1: SA flags, one Dev ID. (3) <code>show etherchannel load-balance</code>: src-dst-ip on both. (4) <code>show interfaces trunk</code>: Po10 trunking VLANs 30,40. (5) Ping AP1 to CAM1 through DSW1. Only when all five pass is the task done.</p></div>

<div class="warn"><p><b>Common mistake.</b> Checking only one switch. A bundle can look perfect on the switch set to on while the other switch shows (I) members. Always verify both ends.</p></div>

<div class="exam"><p><b>Exam trap.</b> Uppercase <code>S</code> on the Po means Layer 2; lowercase <code>s</code> on a member means suspended. <code>I</code> is stand-alone, not "in use" (that is <code>U</code>). <code>H</code> exists only with LACP.</p></div>

<div class="scn"><h4>Pings worked, the bundle did not</h4><p>A contractor handed over a new access switch saying "uplink tested, pings fine". The next week users reported slow backups. <code>show etherchannel summary</code> showed <code>Po1(SD) LACP Gi1/0/49(I) Gi1/0/50(I)</code>: the bundle had never formed, and STP was blocking Gi1/0/50. <code>show lacp neighbor</code> was empty; the distribution side had been configured with channel-group 1 on the wrong ports. Correcting the ports gave Po1(SU) with both members (P).</p><p><b>Lesson:</b> ping tests reachability, not bundling. Verify flags and partners.</p></div>

<div class="iv"><p class="q">"How do you verify an EtherChannel?"</p><p>Strong answer: start with <code>show etherchannel summary</code> on both switches and explain the flags (SU/RU on the Po, P on each member, I, s, H, D). Then <code>show lacp neighbor</code> to confirm the same partner on every member, <code>show etherchannel port-channel</code> for protocol and load distribution, and <code>show interfaces port-channel</code>, <code>show interfaces trunk</code> and <code>show spanning-tree</code> to confirm the rest of the switch uses the Po.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Healthy: Po (SU) or (RU), every member (P), same partner Dev ID on every row.</li>
<li>Member flags: I = no partner, s = config mismatch, H = hot-standby, D = down.</li>
<li><code>show etherchannel port-channel</code> shows protocol, age and per-member load buckets.</li>
<li><code>show lacp neighbor</code> flags SA/SP reveal the partner's mode; Age should stay under 30 s.</li>
<li>STP, trunks and interface BW should all reference the Po, never the members.</li>
</ul></div>
`,hi:`
<p>Doctor kisi patient ko sirf isliye healthy declare nahi karti ki woh chal kar clinic mein aaya. Woh pulse, blood pressure aur temperature check karti hai, har ek alag baat batata hai. Jo port-channel ping pass kar deta hai, woh chal kar aaya hua patient hai. <b>Verification</b> ka matlab hai vital signs check karna: bundle state, har member ka flag, partner ki identity, bandwidth, aur STP aur trunk bundle ko kaise dekhte hain.</p>

<h3>Command 1: show etherchannel summary</h3>
<p>Har EtherChannel check ka yahi pehla command hai. Legend ratt lo.</p>
<pre class="out">DSW1# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator

        M - not in use, minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">10     Po10(SU)        LACP      Gi0/1(P)    Gi0/2(P)    Gi0/3(P)</span></pre>

<table class="cmp"><tr><th>Flag</th><th>Kis par</th><th>Matlab aur kya karna hai</th></tr>
<tr><td><code>SU</code></td><td>Po</td><td>Layer 2, in use. Healthy.</td></tr>
<tr><td><code>RU</code></td><td>Po</td><td>Layer 3, in use. Healthy.</td></tr>
<tr><td><code>SD</code> / <code>RD</code></td><td>Po</td><td>Exist karta hai lekin down: koi member bundled nahi. Member flags dekho.</td></tr>
<tr><td><code>SM</code> / <code>RM</code></td><td>Po</td><td>In use nahi kyunki <code>port-channel min-links</code> poora nahi hua.</td></tr>
<tr><td><code>P</code></td><td>Member</td><td>Bundled aur forwarding. Har member par yahi chahiye.</td></tr>
<tr><td><code>I</code></td><td>Member</td><td>Stand-alone: koi compatible LACP/PAgP partner nahi. Dono ends par modes aur cabling check karo.</td></tr>
<tr><td><code>s</code></td><td>Member</td><td>Suspended: configuration bundle se incompatible. Log check karo aur settings compare karo.</td></tr>
<tr><td><code>H</code></td><td>Member</td><td>LACP hot-standby (8 se zyada ports, ya max-bundle). Agar intended hai to normal.</td></tr>
<tr><td><code>D</code></td><td>Member</td><td>Physically down: shut, cable, optic ya err-disabled.</td></tr>
<tr><td><code>w</code></td><td>Member</td><td>Aggregate hone ka intezaar; aam taur par change ke turant baad thodi der ke liye.</td></tr></table>
<p>Protocol column batata hai <code>LACP</code>, <code>PAgP</code>, ya static on ke liye <code>-</code>.</p>

<h3>Command 2: show etherchannel port-channel</h3>
<pre class="out">DSW1# show etherchannel port-channel
                Channel-group listing:
                ----------------------

Group: 10
----------
                Port-channels in the group:
                ---------------------------

Port-channel: Po10    (Primary Aggregator)

------------

Age of the Port-channel   = 0d:00h:12m:31s
Logical slot/port   = 16/0          Number of ports = 3
HotStandBy port = null
<span class="hl">Port state          = Port-channel Ag-Inuse</span>
<span class="hl">Protocol            =   LACP</span>
Port security       = Disabled

Ports in the Port-channel:

Index   Load   Port     EC state        No of bits
------+------+------+------------------+-----------
  0     49     Gi0/1    Active             3
  1     92     Gi0/2    Active             3
  2     24     Gi0/3    Active             2

Time since last port bundled:    0d:00h:11m:58s    Gi0/3</pre>
<p>Yeh view bundle ki age, protocol, aur <b>Load</b> column jodta hai: 8 hash buckets ka hex mask jo har member ke paas hain. 0x49, 0x92 aur 0x24 binary mein 3, 3 aur 2 buckets rakhte hain, jo chapter 8 ka 3/3/2 split hai. <b>No of bits</b> yahi baat decimal mein kehta hai. EC state column is switch par LACP mode dikhata hai. Time since last port bundled outage ke baad kaam aata hai: haal ka time matlab koi member flap hua.</p>

<h3>Command 3: show lacp neighbor (aur show pagp neighbor)</h3>
<pre class="out">DSW1# show lacp neighbor
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode

Channel group 10 neighbors

Partner's information:

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
<span class="hl">Gi0/1     SP      32768     5254.0002.0001  14s    0x0    0xA    0x2     0x3C</span>
Gi0/2     SP      32768     5254.0002.0001  14s    0x0    0xA    0x3     0x3C
Gi0/3     SP      32768     5254.0002.0001  15s    0x0    0xA    0x4     0x3C</pre>
<p>Teen cheezein check karo. <b>Flags</b>: SP matlab partner (ASW1) slow LACPDUs maang raha hai aur passive hai. <b>Dev ID</b>: har row par same, isliye har member same partner tak pahunchta hai. <b>Age</b>: aakhri LACPDU ke baad ke seconds; slow timers ke saath yeh 30 se neeche rehna chahiye. Agar kisi member ki row hi nahi hai, to us par LACPDUs nahi aa rahe. <code>show lacp internal</code> local side ke liye yahi fields dikhata hai, aur <code>show lacp sys-id</code> local system priority aur MAC. PAgP ke liye <code>show pagp neighbor</code> partner name, device ID aur SC ya SAC jaise flags dikhata hai.</p>

<h3>Command 4: baaki switch bundle ko kaise dekhta hai</h3>
<pre class="out">DSW1# show interfaces port-channel 10 | include BW|Members
  MTU 1500 bytes, <span class="hl">BW 3000000 Kbit/sec</span>, DLY 10 usec,
  <span class="hl">Members in this channel: Gi0/1 Gi0/2 Gi0/3</span>

SW1# show interfaces trunk
Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Po1         on               802.1q         trunking      1</span>

Port        Vlans allowed on trunk
Po1         10,20

SW1# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/5               Desg FWD 4         128.5    P2p
<span class="hl">Po1                 Desg FWD 3         128.65   P2p</span></pre>
<p>BW active members ka total hai (3 x 1 Gbps). Trunk aur STP sirf <code>Po1</code> list karte hain, Gi0/1 ya Gi0/2 kabhi nahi, aur STP 2 Gbps bundle ko single 1 Gbps link (4) se kam cost (3) deta hai.</p>

<div class="eg"><p><b>Worked example: paanch step ka health check.</b> LACP lab mein Po10 banane ke baad: (1) dono switches par <code>show etherchannel summary</code>: Po10(SU), teen (P). (2) ASW1 par <code>show lacp neighbor</code>: SA flags, ek Dev ID. (3) <code>show etherchannel load-balance</code>: dono par src-dst-ip. (4) <code>show interfaces trunk</code>: Po10 VLANs 30,40 trunk kar raha hai. (5) DSW1 ke through AP1 se CAM1 ping. Jab paanchon pass hon tabhi task poora hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf ek switch check karna. On par set switch par bundle perfect dikh sakta hai jabki doosra switch (I) members dikhata hai. Hamesha dono ends verify karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Po par capital <code>S</code> matlab Layer 2; member par chhota <code>s</code> matlab suspended. <code>I</code> stand-alone hai, "in use" nahi (woh <code>U</code> hai). <code>H</code> sirf LACP ke saath hota hai.</p></div>

<div class="scn"><h4>Pings chale, bundle nahi</h4><p>Ek contractor ne naya access switch handover kiya aur kaha "uplink tested, pings theek". Agle hafte users ne slow backups report kiye. <code>show etherchannel summary</code> ne <code>Po1(SD) LACP Gi1/0/49(I) Gi1/0/50(I)</code> dikhaya: bundle kabhi bana hi nahi tha, aur STP Gi1/0/50 block kar raha tha. <code>show lacp neighbor</code> khaali tha; distribution side par channel-group 1 galat ports par configure hua tha. Ports theek karne par Po1(SU) aur dono members (P) mile.</p><p><b>Seekh:</b> ping reachability test karta hai, bundling nahi. Flags aur partners verify karo.</p></div>

<div class="iv"><p class="q">"EtherChannel verify kaise karte ho?"</p><p>Strong answer: dono switches par <code>show etherchannel summary</code> se shuru karo aur flags samjhao (Po par SU/RU, har member par P, I, s, H, D). Phir <code>show lacp neighbor</code> se confirm karo ki har member par same partner hai, protocol aur load distribution ke liye <code>show etherchannel port-channel</code>, aur <code>show interfaces port-channel</code>, <code>show interfaces trunk</code> aur <code>show spanning-tree</code> se confirm karo ki baaki switch Po use kar raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Healthy: Po (SU) ya (RU), har member (P), har row par same partner Dev ID.</li>
<li>Member flags: I = partner nahi, s = config mismatch, H = hot-standby, D = down.</li>
<li><code>show etherchannel port-channel</code> protocol, age aur per-member load buckets dikhata hai.</li>
<li><code>show lacp neighbor</code> ke SA/SP flags partner ka mode batate hain; Age 30 s se neeche rehni chahiye.</li>
<li>STP, trunks aur interface BW sab Po ko reference karein, members ko kabhi nahi.</li>
</ul></div>
`}};export{e as default};