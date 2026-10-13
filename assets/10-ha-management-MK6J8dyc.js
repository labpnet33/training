var e={id:`ha-management`,h:{en:`Reaching every unit: the reserved management interface`,hi:`Har unit tak pahunchna: reserved management interface`},body:{en:`
<p>Think of a two-flat building with one front door and one doorbell. Visitors ring the bell and the flat on duty answers. That is how a cluster looks from the network: one virtual MAC, one set of addresses, and only the <b>primary</b> answers. But the building manager sometimes needs to knock on the <i>other</i> flat directly, to check the meter or change a lock. For a FortiGate cluster this private side door is the <b>reserved management interface</b>. This chapter prepares lab <b>n7-ha-build</b>, task 3.</p>

<h3>The problem: a secondary with no addresses</h3>
<p>In an FGCP cluster the secondary takes over the whole configuration of the primary, but it does not use the data-interface addresses while it is secondary. Only the primary owns the IP addresses and the virtual MAC. Result: you cannot ping, SSH or poll SNMP on the secondary through its normal interfaces. You cannot see its logs, its session table, its own CPU or its firmware version without a way in. Monitoring systems also need to know if the secondary is healthy <i>before</i> the night it has to take over.</p>

<h3>The solution: ha-mgmt-status and ha-mgmt-interfaces</h3>
<p>You pick one physical interface that is <b>not</b> part of the normal data path and reserve it. In the lab it is <b>port8</b>, alias MGMT, cabled to the switch SW-MGMT where the NOC PC (PC-NOC, 10.99.0.10/24, gateway 10.99.0.1) sits. A reserved interface behaves differently from every other interface:</p>
<ul>
<li>It keeps <b>its own IP address</b> on every unit, also on the secondary: 10.99.0.11/24 on FGT-A, 10.99.0.12/24 on FGT-B.</li>
<li>It keeps its <b>own hardware MAC</b>, never the virtual MAC.</li>
<li>It gets its <b>own route</b> through the gateway you set (10.99.0.1), independent of the routing table of the cluster.</li>
<li>The HA setting (<code>ha-mgmt-status</code> and the <code>ha-mgmt-interfaces</code> entry) is synchronised, but the <b>interface entry</b> (IP address, allowaccess) is <b>per unit</b> and is not synchronised.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Reserved management interface">
<rect x="40" y="30" width="170" height="64" rx="10" fill="#bae6fd"/><text x="125" y="54" text-anchor="middle" class="svg-ink" font-size="14">FGT-A (primary)</text><text x="125" y="74" text-anchor="middle" class="svg-muted" font-size="12">port8 10.99.0.11/24</text>
<rect x="40" y="150" width="170" height="64" rx="10" fill="#ddd6fe"/><text x="125" y="174" text-anchor="middle" class="svg-ink" font-size="14">FGT-B (secondary)</text><text x="125" y="194" text-anchor="middle" class="svg-muted" font-size="12">port8 10.99.0.12/24</text>
<rect x="290" y="92" width="130" height="64" rx="10" fill="#fde68a"/><text x="355" y="120" text-anchor="middle" class="svg-ink" font-size="14">SW-MGMT</text><text x="355" y="140" text-anchor="middle" class="svg-muted" font-size="12">gateway 10.99.0.1</text>
<rect x="500" y="92" width="120" height="64" rx="10" fill="#bbf7d0"/><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="14">PC-NOC</text><text x="560" y="140" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.10/24</text>
<line x1="210" y1="62" x2="290" y2="115" stroke="#64748b" stroke-width="3"/><line x1="210" y1="182" x2="290" y2="133" stroke="#64748b" stroke-width="3"/><line x1="420" y1="124" x2="500" y2="124" stroke="#64748b" stroke-width="3"/>
<text x="250" y="80" text-anchor="middle" class="svg-accent" font-size="12">Gi0/2</text><text x="250" y="178" text-anchor="middle" class="svg-accent" font-size="12">Gi0/3</text>
<text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="12">Each unit: own IP, own hardware MAC, own route. Data ports of FGT-B hold no addresses.</text>
</svg><p class="cap">Out-of-band management: the NOC reaches both units on port8, whoever is primary.</p></div>

<h3>Configuration (lab 1, task 3)</h3>
<p>Type the HA part once on the primary. It travels to FGT-B by itself. Then give port8 an address on <b>each</b> unit.</p>
<pre class="code"><span class="c">! FGT-A: reserve the interface (synchronised)</span>
config system ha
    set ha-mgmt-status enable
    config ha-mgmt-interfaces
        edit 1
            set interface "port8"
            set gateway 10.99.0.1
        next
    end
end
<span class="c">! FGT-A: its own address (not synchronised)</span>
config system interface
    edit port8
        set ip 10.99.0.11 255.255.255.0
        set allowaccess ping h&#116;tps ssh
    next
end
<span class="c">! FGT-B: its own address</span>
config system interface
    edit port8
        set ip 10.99.0.12 255.255.255.0
        set allowaccess ping h&#116;tps ssh
    next
end</pre>
<p>Then verify from PC-NOC: <code>ping 10.99.0.11</code> and <code>ping 10.99.0.12</code> must both answer. Also check the HA configuration on the secondary:</p>
<pre class="out">FGT-B # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password ENC ...
    set hbdev "port3" 100 "port4" 50
    <span class="hl">set ha-mgmt-status enable</span>
    config ha-mgmt-interfaces
        edit 1
            <span class="hl">set interface "port8"</span>
            <span class="hl">set gateway 10.99.0.1</span>
        next
    end
    set priority 100
    set monitor "port1" "port2"
end</pre>
<p>The gateway line is the key detail. Without it the unit has an address on 10.99.0.0/24 but no way to answer a request from another subnet.</p>

<div class="eg"><p><b>Worked example.</b> The NOC runs a monitoring server at 10.99.5.20, one router hop behind 10.99.0.1. FGT-B has 10.99.0.12 on port8 and the reserved route through 10.99.0.1. The server polls SNMP on 10.99.0.12: the request arrives on port8, the answer leaves through the reserved route. The cluster routing table, which on the secondary is not used for data, is not involved. If someone had given port8 the address 10.99.0.11 on both units, the two would fight over one address, so each unit needs a different IP.</p></div>

<h3>In-band or out-of-band, and what runs per unit</h3>
<p>Managing through a data port (in-band) reaches only the primary. The reserved interface is the <b>out-of-band</b> path and is the usual choice for SNMP polling, syslog sources, SSH and GUI access, and for checking the health of the secondary. Some traffic is naturally per unit: each member has its own serial number, so its own licence and certificate status, its own logs and its own SNMP identity. Expect to register and check licences per unit, and to monitor both serials, not "the cluster". Which services may use the reserved port for their outgoing traffic differs between FortiOS versions, so check the release notes for your version instead of assuming.</p>
<p>Real FortiOS also has <code>execute ha manage &lt;id&gt; &lt;admin&gt;</code>, which opens a CLI session on the other unit through the heartbeat. <b>In the lab this command only prints a message:</b> every unit has its own console, so you log into FGT-B directly.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing the interface IP on the primary only and expecting it on the secondary: the interface entry is not synchronised. (2) Forgetting the gateway in <code>ha-mgmt-interfaces</code>. (3) Choosing a heartbeat port or a non-physical interface: the reserved interface cannot be a heartbeat device or a VLAN, aggregate or other virtual interface. (4) Overlapping subnets between port8 and a data interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which settings are NOT synchronised?" Host name, priority, override, override-wait-time and the interface entry of the reserved management interface. The HA part (<code>ha-mgmt-status</code>, the <code>ha-mgmt-interfaces</code> entry) <i>is</i> synchronised.</p></div>

<div class="scn"><h4>The silent secondary</h4><p>For eight months the NOC graphs showed only FGT-A. On the night FGT-A failed, FGT-B took over and its disk was full of old logs, so it stopped logging within the hour. Nobody could SSH to it, because it had no reachable address. After the incident the team reserved port8, gave both units a management address and added both to monitoring.</p><p><b>Lesson:</b> a standby you cannot see is a standby you cannot trust. Monitor both units, always.</p></div>
<div class="iv"><p class="q">"How do you manage the secondary unit of a FortiGate cluster?"</p><p>Say: through the reserved management interface, set with <code>ha-mgmt-status enable</code> and <code>ha-mgmt-interfaces</code>. It has its own IP, own hardware MAC and own route on each unit. The HA setting is synchronised, the interface IP is configured per unit. Mention <code>execute ha manage</code> as the CLI alternative, and that monitoring should poll both serial numbers.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A secondary holds no data-interface addresses, so it needs a reserved interface to be reachable.</li>
<li>Enable with <code>ha-mgmt-status enable</code> and an <code>ha-mgmt-interfaces</code> entry (interface, gateway).</li>
<li>The interface keeps its own IP, hardware MAC and route on every unit; the IP is per unit and not synchronised.</li>
<li>The reserved interface cannot be a heartbeat or a virtual interface.</li>
<li>Lab: port8, 10.99.0.11 (FGT-A), 10.99.0.12 (FGT-B), gateway 10.99.0.1, tested from PC-NOC.</li>
</ul></div>
`,hi:`
<p>Ek do-flat wali building socho jisme ek hi front door aur ek hi doorbell hai. Visitor bell bajata hai aur jo flat duty par hai woh jawab deta hai. Network ko cluster aisa hi dikhta hai: ek virtual MAC, ek addresses ka set, aur sirf <b>primary</b> jawab deta hai. Lekin building manager ko kabhi-kabhi <i>doosre</i> flat ka darwaza seedha khatkhatana padta hai, meter dekhne ya lock badalne ke liye. FortiGate cluster mein yeh private side door <b>reserved management interface</b> hai. Yeh chapter lab <b>n7-ha-build</b>, task 3 ki taiyari karata hai.</p>

<h3>Problem: bina addresses wala secondary</h3>
<p>FGCP cluster mein secondary primary ki poori configuration le leta hai, lekin secondary rehte hue woh data-interface addresses use nahi karta. IP addresses aur virtual MAC sirf primary ke paas hote hain. Natija: aap normal interfaces se secondary par ping, SSH ya SNMP poll nahi kar sakte. Uske logs, session table, CPU ya firmware version dekhne ka koi raasta nahi. Monitoring systems ko bhi jaanna hota hai ki secondary healthy hai ya nahi, us raat se <i>pehle</i> jab use take over karna hai.</p>

<h3>Solution: ha-mgmt-status aur ha-mgmt-interfaces</h3>
<p>Aap ek physical interface chunte ho jo normal data path ka hissa <b>nahi</b> hai aur use reserve kar dete ho. Lab mein woh <b>port8</b> hai, alias MGMT, jo switch SW-MGMT se juda hai jahan NOC PC (PC-NOC, 10.99.0.10/24, gateway 10.99.0.1) baitha hai. Reserved interface baaki sab interfaces se alag behave karta hai:</p>
<ul>
<li>Har unit par, secondary par bhi, uska <b>apna IP address</b> rehta hai: FGT-A par 10.99.0.11/24, FGT-B par 10.99.0.12/24.</li>
<li>Uska <b>apna hardware MAC</b> rehta hai, kabhi virtual MAC nahi.</li>
<li>Aapke set kiye gateway (10.99.0.1) ke through uska <b>apna route</b> hota hai, cluster ki routing table se alag.</li>
<li>HA setting (<code>ha-mgmt-status</code> aur <code>ha-mgmt-interfaces</code> entry) synchronise hoti hai, lekin <b>interface entry</b> (IP address, allowaccess) <b>har unit ki apni</b> hai aur synchronise nahi hoti.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Reserved management interface">
<rect x="40" y="30" width="170" height="64" rx="10" fill="#bae6fd"/><text x="125" y="54" text-anchor="middle" class="svg-ink" font-size="14">FGT-A (primary)</text><text x="125" y="74" text-anchor="middle" class="svg-muted" font-size="12">port8 10.99.0.11/24</text>
<rect x="40" y="150" width="170" height="64" rx="10" fill="#ddd6fe"/><text x="125" y="174" text-anchor="middle" class="svg-ink" font-size="14">FGT-B (secondary)</text><text x="125" y="194" text-anchor="middle" class="svg-muted" font-size="12">port8 10.99.0.12/24</text>
<rect x="290" y="92" width="130" height="64" rx="10" fill="#fde68a"/><text x="355" y="120" text-anchor="middle" class="svg-ink" font-size="14">SW-MGMT</text><text x="355" y="140" text-anchor="middle" class="svg-muted" font-size="12">gateway 10.99.0.1</text>
<rect x="500" y="92" width="120" height="64" rx="10" fill="#bbf7d0"/><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="14">PC-NOC</text><text x="560" y="140" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.10/24</text>
<line x1="210" y1="62" x2="290" y2="115" stroke="#64748b" stroke-width="3"/><line x1="210" y1="182" x2="290" y2="133" stroke="#64748b" stroke-width="3"/><line x1="420" y1="124" x2="500" y2="124" stroke="#64748b" stroke-width="3"/>
<text x="250" y="80" text-anchor="middle" class="svg-accent" font-size="12">Gi0/2</text><text x="250" y="178" text-anchor="middle" class="svg-accent" font-size="12">Gi0/3</text>
<text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="12">Har unit: apna IP, apna hardware MAC, apna route. FGT-B ke data ports par koi address nahi.</text>
</svg><p class="cap">Out-of-band management: primary koi bhi ho, NOC dono units tak port8 par pahunchta hai.</p></div>

<h3>Configuration (lab 1, task 3)</h3>
<p>HA wala hissa primary par ek baar type karo. Woh khud FGT-B tak jaata hai. Phir port8 ko <b>har</b> unit par address do.</p>
<pre class="code"><span class="c">! FGT-A: interface reserve karo (synchronised)</span>
config system ha
    set ha-mgmt-status enable
    config ha-mgmt-interfaces
        edit 1
            set interface "port8"
            set gateway 10.99.0.1
        next
    end
end
<span class="c">! FGT-A: apna address (synchronise nahi hota)</span>
config system interface
    edit port8
        set ip 10.99.0.11 255.255.255.0
        set allowaccess ping h&#116;tps ssh
    next
end
<span class="c">! FGT-B: apna address</span>
config system interface
    edit port8
        set ip 10.99.0.12 255.255.255.0
        set allowaccess ping h&#116;tps ssh
    next
end</pre>
<p>Phir PC-NOC se verify karo: <code>ping 10.99.0.11</code> aur <code>ping 10.99.0.12</code> dono ka jawab aana chahiye. Secondary par HA configuration bhi check karo:</p>
<pre class="out">FGT-B # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password ENC ...
    set hbdev "port3" 100 "port4" 50
    <span class="hl">set ha-mgmt-status enable</span>
    config ha-mgmt-interfaces
        edit 1
            <span class="hl">set interface "port8"</span>
            <span class="hl">set gateway 10.99.0.1</span>
        next
    end
    set priority 100
    set monitor "port1" "port2"
end</pre>
<p>Gateway line sabse zaroori detail hai. Uske bina unit ke paas 10.99.0.0/24 ka address to hai, lekin doosre subnet se aaye request ka jawab dene ka raasta nahi.</p>

<div class="eg"><p><b>Worked example.</b> NOC ka monitoring server 10.99.5.20 par hai, 10.99.0.1 ke peeche ek router hop door. FGT-B ke paas port8 par 10.99.0.12 hai aur 10.99.0.1 ke through reserved route. Server 10.99.0.12 par SNMP poll karta hai: request port8 par aata hai, jawab reserved route se nikalta hai. Cluster ki routing table, jo secondary par data ke liye use nahi hoti, isme involve nahi hai. Agar kisi ne dono units par port8 ko 10.99.0.11 de diya hota to dono ek address ke liye ladte, isliye har unit ka IP alag hona chahiye.</p></div>

<h3>In-band ya out-of-band, aur per unit kya chalta hai</h3>
<p>Data port se management (in-band) sirf primary tak pahunchata hai. Reserved interface <b>out-of-band</b> raasta hai aur SNMP polling, syslog source, SSH aur GUI access, aur secondary ki health check ke liye usual choice hai. Kuch traffic natural taur par per unit hota hai: har member ka apna serial number hai, isliye apni licence aur certificate status, apne logs aur apni SNMP identity. Licences per unit register aur check karne ki ummeed rakho, aur dono serials ko monitor karo, "cluster" ko nahi. Kaunsi services apna outgoing traffic reserved port se bhej sakti hain, yeh FortiOS versions mein alag hota hai, isliye maan lene ke bajay apne version ke release notes dekho.</p>
<p>Real FortiOS mein <code>execute ha manage &lt;id&gt; &lt;admin&gt;</code> bhi hai, jo heartbeat ke through doosre unit par CLI session kholta hai. <b>Lab mein yeh command sirf ek message print karta hai:</b> har unit ka apna console hai, isliye FGT-B mein seedha login karo.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Interface IP sirf primary par type karna aur secondary par aane ki ummeed rakhna: interface entry synchronise nahi hoti. (2) <code>ha-mgmt-interfaces</code> mein gateway bhool jaana. (3) Heartbeat port ya non-physical interface chunna: reserved interface heartbeat device ya VLAN, aggregate ya koi aur virtual interface nahi ho sakta. (4) port8 aur kisi data interface ke subnets ka overlap.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsi settings synchronise NAHI hoti?" Host name, priority, override, override-wait-time aur reserved management interface ki interface entry. HA wala hissa (<code>ha-mgmt-status</code>, <code>ha-mgmt-interfaces</code> entry) synchronise <i>hota</i> hai.</p></div>

<div class="scn"><h4>Khamosh secondary</h4><p>Aath mahine tak NOC ke graphs mein sirf FGT-A dikhta tha. Jis raat FGT-A fail hua, FGT-B ne take over kiya aur uski disk purane logs se bhari thi, to ghante bhar mein logging band ho gayi. Koi us par SSH nahi kar paya kyunki uska koi reachable address nahi tha. Incident ke baad team ne port8 reserve kiya, dono units ko management address diya aur dono ko monitoring mein jodh diya.</p><p><b>Lesson:</b> jo standby aap dekh nahi sakte, us par bharosa nahi kar sakte. Hamesha dono units monitor karo.</p></div>
<div class="iv"><p class="q">"FortiGate cluster ke secondary unit ko aap kaise manage karte ho?"</p><p>Kaho: reserved management interface se, jo <code>ha-mgmt-status enable</code> aur <code>ha-mgmt-interfaces</code> se set hota hai. Har unit par uska apna IP, apna hardware MAC aur apna route hota hai. HA setting synchronise hoti hai, interface IP har unit par alag configure hota hai. CLI alternative ke taur par <code>execute ha manage</code> batao, aur yeh bhi ki monitoring dono serial numbers ko poll kare.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secondary ke paas data-interface addresses nahi hote, isliye reachable hone ke liye reserved interface chahiye.</li>
<li>Enable karo <code>ha-mgmt-status enable</code> aur ek <code>ha-mgmt-interfaces</code> entry (interface, gateway) se.</li>
<li>Interface har unit par apna IP, hardware MAC aur route rakhta hai; IP per unit hai aur synchronise nahi hota.</li>
<li>Reserved interface heartbeat ya virtual interface nahi ho sakta.</li>
<li>Lab: port8, 10.99.0.11 (FGT-A), 10.99.0.12 (FGT-B), gateway 10.99.0.1, PC-NOC se test.</li>
</ul></div>
`}};export{e as default};