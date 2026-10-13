var e={id:`interfaces`,h:{en:`Interfaces: physical ports, logical units and families`,hi:`Interfaces: physical ports, logical units aur families`},body:{en:`
<p>Think of an apartment building. The <b>building entrance</b> is the physical port. Behind it are <b>flats</b> (logical units) and each flat can have a <b>phone line</b>, a <b>post address</b> and a <b>cable TV connection</b> (protocol families). The building's properties (its gate, its size) belong to the building; the addresses belong to flats.</p>

<h3>Interface naming</h3>
<p>A Junos interface name is <code>type-fpc/pic/port</code>:</p>
<table class="cmp"><tr><th>Part</th><th>Meaning</th><th>Example</th></tr>
<tr><td>type</td><td>media and speed</td><td><code>ge</code> gigabit, <code>xe</code> 10G, <code>et</code> 25/40/100G, <code>fe</code> fast Ethernet</td></tr>
<tr><td>fpc</td><td>Flexible PIC Concentrator (line card or slot)</td><td>0</td></tr>
<tr><td>pic</td><td>Physical Interface Card (module position)</td><td>0</td></tr>
<tr><td>port</td><td>port number</td><td>1</td></tr></table>
<p>So <code>ge-0/0/1</code> is a gigabit port in slot 0, PIC 0, port 1. Adding <code>.0</code> names the <b>logical unit</b>: <code>ge-0/0/1.0</code>.</p>
<p>Special interfaces: <code>lo0</code> (loopback, always up), <code>fxp0</code> / <code>em0</code> / <code>me0</code> / <code>vme</code> (out-of-band management), <code>irb</code> (Integrated Routing and Bridging: Layer 3 for VLANs), <code>ae0</code> (aggregated Ethernet, a LAG), <code>st0</code> (secure tunnel), <code>gr-</code> (GRE), <code>vlan</code> (RVI on some switches).</p>

<h3>Physical versus logical</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Physical interface, units and families">
<rect x="20" y="20" width="600" height="170" rx="12" fill="#e2e8f0"/><text x="40" y="44" class="svg-ink" font-size="13">Physical interface ge-0/0/1  (description, mtu, speed, disable)</text>
<rect x="50" y="60" width="250" height="110" rx="10" fill="#bae6fd"/><text x="175" y="82" text-anchor="middle" class="svg-ink" font-size="13">unit 0  (ge-0/0/1.0)</text>
<rect x="65" y="94" width="105" height="30" rx="6" fill="#bbf7d0"/><text x="117" y="114" text-anchor="middle" class="svg-ink" font-size="12">family inet</text>
<rect x="180" y="94" width="105" height="30" rx="6" fill="#ddd6fe"/><text x="232" y="114" text-anchor="middle" class="svg-ink" font-size="12">family inet6</text>
<text x="175" y="150" text-anchor="middle" class="svg-muted" font-size="11">172.16.10.1/24</text>
<rect x="340" y="60" width="250" height="110" rx="10" fill="#fde68a"/><text x="465" y="82" text-anchor="middle" class="svg-ink" font-size="13">unit 100  (vlan-id 100)</text>
<rect x="355" y="94" width="105" height="30" rx="6" fill="#bbf7d0"/><text x="407" y="114" text-anchor="middle" class="svg-ink" font-size="12">family inet</text>
<text x="465" y="150" text-anchor="middle" class="svg-muted" font-size="11">needs vlan-tagging</text>
</svg><p class="cap">Hardware properties sit on the physical interface; addresses sit on unit and family.</p></div>
<pre class="code">interfaces {
    ge-0/0/1 {
        description "to Pune LAN";          <span class="c">! physical property</span>
        mtu 1514;                           <span class="c">! physical property</span>
        unit 0 {                            <span class="c">! logical interface ge-0/0/1.0</span>
            family inet {                   <span class="c">! IPv4</span>
                address 172.16.10.1/24;
            }
            family inet6 {
                address 2001:db8:10::1/64;
            }
        }
    }
}</pre>
<table class="cmp"><tr><th>Family</th><th>Carries</th></tr>
<tr><td><code>inet</code></td><td>IPv4</td></tr><tr><td><code>inet6</code></td><td>IPv6</td></tr>
<tr><td><code>iso</code></td><td>IS-IS</td></tr><tr><td><code>mpls</code></td><td>MPLS labels</td></tr>
<tr><td><code>ethernet-switching</code></td><td>Layer 2 switching (EX and QFX)</td></tr></table>

<h3>Several units on one port: VLAN tagging</h3>
<pre class="code">set interfaces ge-0/0/3 vlan-tagging
set interfaces ge-0/0/3 unit 100 vlan-id 100 family inet address 10.60.100.1/24
set interfaces ge-0/0/3 unit 200 vlan-id 200 family inet address 10.60.200.1/24</pre>
<p>Without <code>vlan-tagging</code> only unit 0 is allowed. With it, each unit needs a <code>vlan-id</code>. The unit number is only a label; it is common (not required) to make it equal to the VLAN ID.</p>

<h3>Common interface settings</h3>
<ul>
<li><code>description "text"</code> labels the port; always set it for uplinks and customer ports.</li>
<li><code>mtu 9000</code> sets the physical MTU; <code>family inet mtu 1500</code> sets the protocol MTU.</li>
<li><code>disable</code> administratively shuts the port. Junos ports are <b>enabled by default</b>, the opposite of some vendors. To restore, <code>delete interfaces ge-0/0/2 disable</code>.</li>
<li><code>speed 1g</code>, <code>link-mode full-duplex</code>, <code>gigether-options</code> adjust media settings.</li>
</ul>

<h3>Verification</h3>
<pre class="code">lab@R1&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.50.12.1/30
ge-0/0/1                up    up
ge-0/0/1.0              up    up   inet     10.50.1.1/24
ge-0/0/2                up    down
lo0.0                   up    up   inet     10.255.50.1  --&gt; 0/0

lab@R1&gt; show interfaces ge-0/0/1 brief
Physical interface: ge-0/0/1, Enabled, Physical link is Up
  Link-level type: Ethernet, MTU: <span class="hl">9000</span>, Speed: 1000mbps
lab@R1&gt; show interfaces ge-0/0/1 extensive | match "errors|drops"</pre>
<p><code>terse</code> is the summary. <code>brief</code> and <code>detail</code> add attributes; <code>extensive</code> adds error counters and queue statistics. <code>show interfaces descriptions</code> lists only ports and their labels.</p>

<div class="eg"><p><b>Worked example.</b> The Bengaluru distribution router R1 uses ge-0/0/0 for 10.50.12.1/30 (to the core R2), ge-0/0/1 for 10.50.1.1/24 (the PC LAN) and ge-0/0/2 for 10.50.2.1/24 (the file-server LAN). Each address is under unit 0, family inet, on a different physical port. The ge-0/0/2 server port needs a different MTU than the others, which you will handle with configuration groups next.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting <code>address</code> directly under the physical interface; using a <code>/24</code> mask by habit on a point-to-point link where a <code>/30</code> was agreed; forgetting <code>vlan-tagging</code>; confusing admin down with link down.</p></div>
<div class="exam"><p><b>Exam trap.</b> The name format is type-fpc/pic/port. IPv4 is <code>family inet</code>. <code>fxp0</code> is out-of-band and not forwarded by the data plane. Junos interfaces are up by default; <code>disable</code> shuts them. <code>lo0</code> is the loopback.</p></div>

<div class="scn"><h4>Addresses on the wrong level</h4><p>A trainee copied a configuration from a screenshot and placed <code>family inet address 10.50.1.1/24</code> directly under <code>ge-0/0/1</code>, skipping <code>unit 0</code>. Junos refused the commit with a syntax error and the trainee blamed the IP. An experienced colleague showed the tree: physical properties first, then <code>unit</code>, then <code>family</code>, then <code>address</code>.</p><p><b>Lesson:</b> addresses always live on a unit and a family.</p></div>

<div class="iv"><p class="q">"What is the difference between a physical and a logical interface in Junos?"</p><p>The physical interface (ge-0/0/1) represents the port and carries hardware properties like MTU, speed and description. Logical interfaces (units, such as ge-0/0/1.0) carry protocol families and addresses. Multiple units on one port need <code>vlan-tagging</code> and a VLAN ID each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Names follow type-fpc/pic/port; logical interfaces add .unit.</li>
<li>Addresses belong to unit and family inet (IPv4) or inet6 (IPv6).</li>
<li>Physical properties (description, mtu, speed, disable) sit on the physical interface.</li>
<li>Several units per port require vlan-tagging and vlan-id.</li>
<li>lo0, fxp0/em0/me0, irb and ae are special interfaces; <code>show interfaces terse</code> is the quick check.</li>
</ul></div>
`,hi:`
<p>Ek apartment building socho. <b>Building ka entrance</b> physical port hai. Uske peeche <b>flats</b> (logical units) hain aur har flat mein <b>phone line</b>, <b>post address</b> aur <b>cable TV connection</b> (protocol families) ho sakte hain. Building ki properties (gate, size) building ki hain; addresses flats ke hain.</p>

<h3>Interface naming</h3>
<p>Junos interface ka naam <code>type-fpc/pic/port</code> hota hai:</p>
<table class="cmp"><tr><th>Hissa</th><th>Matlab</th><th>Example</th></tr>
<tr><td>type</td><td>media aur speed</td><td><code>ge</code> gigabit, <code>xe</code> 10G, <code>et</code> 25/40/100G, <code>fe</code> fast Ethernet</td></tr>
<tr><td>fpc</td><td>Flexible PIC Concentrator (line card ya slot)</td><td>0</td></tr>
<tr><td>pic</td><td>Physical Interface Card (module position)</td><td>0</td></tr>
<tr><td>port</td><td>port number</td><td>1</td></tr></table>
<p>To <code>ge-0/0/1</code> slot 0, PIC 0, port 1 ka gigabit port hai. <code>.0</code> jodne se <b>logical unit</b> ban jaati hai: <code>ge-0/0/1.0</code>.</p>
<p>Special interfaces: <code>lo0</code> (loopback, hamesha up), <code>fxp0</code> / <code>em0</code> / <code>me0</code> / <code>vme</code> (out-of-band management), <code>irb</code> (Integrated Routing and Bridging: VLANs ke liye Layer 3), <code>ae0</code> (aggregated Ethernet, LAG), <code>st0</code> (secure tunnel), <code>gr-</code> (GRE), <code>vlan</code> (kuch switches par RVI).</p>

<h3>Physical versus logical</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Physical interface, units aur families">
<rect x="20" y="20" width="600" height="170" rx="12" fill="#e2e8f0"/><text x="40" y="44" class="svg-ink" font-size="13">Physical interface ge-0/0/1  (description, mtu, speed, disable)</text>
<rect x="50" y="60" width="250" height="110" rx="10" fill="#bae6fd"/><text x="175" y="82" text-anchor="middle" class="svg-ink" font-size="13">unit 0  (ge-0/0/1.0)</text>
<rect x="65" y="94" width="105" height="30" rx="6" fill="#bbf7d0"/><text x="117" y="114" text-anchor="middle" class="svg-ink" font-size="12">family inet</text>
<rect x="180" y="94" width="105" height="30" rx="6" fill="#ddd6fe"/><text x="232" y="114" text-anchor="middle" class="svg-ink" font-size="12">family inet6</text>
<text x="175" y="150" text-anchor="middle" class="svg-muted" font-size="11">172.16.10.1/24</text>
<rect x="340" y="60" width="250" height="110" rx="10" fill="#fde68a"/><text x="465" y="82" text-anchor="middle" class="svg-ink" font-size="13">unit 100  (vlan-id 100)</text>
<rect x="355" y="94" width="105" height="30" rx="6" fill="#bbf7d0"/><text x="407" y="114" text-anchor="middle" class="svg-ink" font-size="12">family inet</text>
<text x="465" y="150" text-anchor="middle" class="svg-muted" font-size="11">vlan-tagging chahiye</text>
</svg><p class="cap">Hardware properties physical interface par; addresses unit aur family par.</p></div>
<pre class="code">interfaces {
    ge-0/0/1 {
        description "to Pune LAN";          <span class="c">! physical property</span>
        mtu 1514;                           <span class="c">! physical property</span>
        unit 0 {                            <span class="c">! logical interface ge-0/0/1.0</span>
            family inet {                   <span class="c">! IPv4</span>
                address 172.16.10.1/24;
            }
            family inet6 {
                address 2001:db8:10::1/64;
            }
        }
    }
}</pre>
<table class="cmp"><tr><th>Family</th><th>Kya carry karti hai</th></tr>
<tr><td><code>inet</code></td><td>IPv4</td></tr><tr><td><code>inet6</code></td><td>IPv6</td></tr>
<tr><td><code>iso</code></td><td>IS-IS</td></tr><tr><td><code>mpls</code></td><td>MPLS labels</td></tr>
<tr><td><code>ethernet-switching</code></td><td>Layer 2 switching (EX aur QFX)</td></tr></table>

<h3>Ek port par kai units: VLAN tagging</h3>
<pre class="code">set interfaces ge-0/0/3 vlan-tagging
set interfaces ge-0/0/3 unit 100 vlan-id 100 family inet address 10.60.100.1/24
set interfaces ge-0/0/3 unit 200 vlan-id 200 family inet address 10.60.200.1/24</pre>
<p><code>vlan-tagging</code> ke bina sirf unit 0 allowed hai. Iske saath har unit ko <code>vlan-id</code> chahiye. Unit number sirf label hai; use VLAN ID ke barabar rakhna common hai (zaroori nahi).</p>

<h3>Common interface settings</h3>
<ul>
<li><code>description "text"</code> port ko label karta hai; uplinks aur customer ports ke liye hamesha set karo.</li>
<li><code>mtu 9000</code> physical MTU set karta hai; <code>family inet mtu 1500</code> protocol MTU.</li>
<li><code>disable</code> port ko administratively band karta hai. Junos ports <b>default mein enabled</b> hote hain, kuch vendors se ulta. Wapas laane ke liye <code>delete interfaces ge-0/0/2 disable</code>.</li>
<li><code>speed 1g</code>, <code>link-mode full-duplex</code>, <code>gigether-options</code> media settings adjust karte hain.</li>
</ul>

<h3>Verification</h3>
<pre class="code">lab@R1&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.50.12.1/30
ge-0/0/1                up    up
ge-0/0/1.0              up    up   inet     10.50.1.1/24
ge-0/0/2                up    down
lo0.0                   up    up   inet     10.255.50.1  --&gt; 0/0

lab@R1&gt; show interfaces ge-0/0/1 brief
Physical interface: ge-0/0/1, Enabled, Physical link is Up
  Link-level type: Ethernet, MTU: <span class="hl">9000</span>, Speed: 1000mbps
lab@R1&gt; show interfaces ge-0/0/1 extensive | match "errors|drops"</pre>
<p><code>terse</code> summary hai. <code>brief</code> aur <code>detail</code> attributes jodte hain; <code>extensive</code> error counters aur queue statistics jodta hai. <code>show interfaces descriptions</code> sirf ports aur unke labels dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Bengaluru distribution router R1 ge-0/0/0 par 10.50.12.1/30 (core R2 ki taraf), ge-0/0/1 par 10.50.1.1/24 (PC LAN) aur ge-0/0/2 par 10.50.2.1/24 (file-server LAN) use karta hai. Har address unit 0, family inet ke neeche, alag physical port par hai. ge-0/0/2 server port ko baaki se alag MTU chahiye, jo aap agle chapter mein configuration groups se sambhaloge.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>address</code> ko seedhe physical interface ke neeche rakh dena; point-to-point link par jahan <code>/30</code> tay hua tha wahan aadatan <code>/24</code> mask lagana; <code>vlan-tagging</code> bhool jaana; admin down aur link down ko confuse karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Naam format type-fpc/pic/port hai. IPv4 <code>family inet</code> hai. <code>fxp0</code> out-of-band hai aur data plane use forward nahi karta. Junos interfaces default mein up hote hain; <code>disable</code> unhe band karta hai. <code>lo0</code> loopback hai.</p></div>

<div class="scn"><h4>Address galat level par</h4><p>Ek trainee ne screenshot se configuration copy ki aur <code>family inet address 10.50.1.1/24</code> ko <code>unit 0</code> chhodkar seedhe <code>ge-0/0/1</code> ke neeche rakh diya. Junos ne syntax error ke saath commit refuse kiya aur trainee ne IP ko doshi thehraya. Experienced colleague ne tree dikhaya: pehle physical properties, phir <code>unit</code>, phir <code>family</code>, phir <code>address</code>.</p><p><b>Lesson:</b> addresses hamesha unit aur family par rehte hain.</p></div>

<div class="iv"><p class="q">"Junos mein physical aur logical interface mein kya difference hai?"</p><p>Physical interface (ge-0/0/1) port ko represent karta hai aur MTU, speed, description jaisi hardware properties rakhta hai. Logical interfaces (units, jaise ge-0/0/1.0) protocol families aur addresses rakhte hain. Ek port par kai units ke liye <code>vlan-tagging</code> aur har ek ka VLAN ID chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Naam type-fpc/pic/port; logical interfaces .unit jodte hain.</li>
<li>Addresses unit aur family inet (IPv4) ya inet6 (IPv6) par hote hain.</li>
<li>Physical properties (description, mtu, speed, disable) physical interface par hoti hain.</li>
<li>Ek port par kai units ke liye vlan-tagging aur vlan-id chahiye.</li>
<li>lo0, fxp0/em0/me0, irb aur ae special interfaces hain; <code>show interfaces terse</code> quick check hai.</li>
</ul></div>
`}};export{e as default};