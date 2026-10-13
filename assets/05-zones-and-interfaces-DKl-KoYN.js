var e={id:`zones-and-interfaces`,h:{en:`Security zones and interfaces`,hi:`Security zones aur interfaces`},body:{en:`<p><b>Analogy.</b> An airport has areas: the public hall, the departure lounge after security, the staff-only corridor. People move between areas only through checkpoints. A <b>security zone</b> is one such area. The firewall rules are written as "from this area to that area", not as a long list of individual doors.</p>
<h3>What a zone is</h3>
<p>A <b>security zone</b> is a named group of interfaces that share the same trust level. The names <code>trust</code>, <code>untrust</code> and <code>dmz</code> are conventions; you can call a zone <code>guest</code> or <code>servers</code>. You put a <b>logical interface</b> (a unit, such as <code>ge-0/0/1.0</code>) into exactly one zone. Policies are then written between zones.</p>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet address 203.0.113.2/30
set interfaces ge-0/0/1 unit 0 family inet address 192.168.10.1/24
set security zones security-zone untrust interfaces ge-0/0/0.0
set security zones security-zone trust interfaces ge-0/0/1.0
commit</pre>
<pre class="out">user@BRANCH-SRX&gt; show security zones
Security zone: untrust
  Send reset for non-SYN session TCP packets: Off
  Policy configurable: Yes
  Interfaces bound: 1
  Interfaces:
    <span class="hl">ge-0/0/0.0</span>

Security zone: trust
  Send reset for non-SYN session TCP packets: Off
  Policy configurable: Yes
  Interfaces bound: 1
  Interfaces:
    <span class="hl">ge-0/0/1.0</span></pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Two interfaces, two zones"><rect x="20" y="30" width="200" height="90" rx="12" fill="#bbf7d0"/><text x="120" y="60" text-anchor="middle" class="svg-ink" font-size="14">zone trust</text><text x="120" y="88" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/1.0 192.168.10.1/24</text><rect x="420" y="30" width="200" height="90" rx="12" fill="#bae6fd"/><text x="520" y="60" text-anchor="middle" class="svg-ink" font-size="14">zone untrust</text><text x="520" y="88" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0.0 203.0.113.2/30</text><rect x="270" y="45" width="100" height="60" rx="10" fill="#fed7aa"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">SRX</text><path d="M220 75H270M370 75H420" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Policies are written between the two zones, never between interface names.</p></div>
<h3>Other things you will meet</h3>
<ul><li>The SRX itself is a zone for policy purposes, called <code>junos-host</code>. Traffic to the box is controlled by host-inbound-traffic (chapter 8), not by this zone.</li><li>A <b>functional zone</b> named <code>management</code> exists for out-of-band management ports; it cannot carry transit traffic.</li><li>The address on the interface and the zone are two separate settings. An interface can have an IP address and still be in no zone.</li></ul>
<div class="eg"><p><b>Worked example.</b> A branch has ge-0/0/0 to the ISP, ge-0/0/1 to the office and ge-0/0/2 to a small server rack. Three zones: <code>untrust</code>, <code>trust</code>, <code>dmz</code>. Later you will write only the policies you need between them, which is far easier than reasoning about three separate interfaces.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting to put an interface in a zone. Traffic arriving on an interface that is in no zone is dropped, even if the interface has an IP address and a route. Another trap: using the physical name <code>ge-0/0/1</code> in your head; the zone holds the logical unit <code>ge-0/0/1.0</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> An interface can belong to only one zone, but a zone can contain many interfaces. Commit rejects an interface listed in two zones.</p></div>
<div class="scn"><h4>The new port nobody could use</h4><p>A technician connected a new lab switch to ge-0/0/3, gave it an address and a route, and nothing worked. <code>show security zones</code> showed no zone for ge-0/0/3.0. Adding it to the <code>dmz</code> zone fixed it in one commit.</p><p><b>Lesson:</b> address, route and zone are three separate checks. Verify all three.</p></div>
<div class="iv"><p class="q">"What is a security zone?"</p><p>A named group of interfaces with the same trust level. Policies are written from one zone to another. An interface is in exactly one zone, and traffic on an interface with no zone is dropped.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A zone groups logical interfaces of equal trust.</li><li>An interface belongs to one zone only.</li><li>No zone means the traffic is dropped.</li><li>Verify with show security zones.</li></ul></div>`,hi:`<p><b>Analogy.</b> Airport mein areas hote hain: public hall, security ke baad departure lounge, staff-only corridor. Log areas ke beech sirf checkpoints se guzarte hain. <b>Security zone</b> aisa ek area hai. Firewall rules "is area se us area tak" likhe jaate hain, individual darwazon ki lambi list ki tarah nahi.</p>
<h3>Zone kya hai</h3>
<p><b>Security zone</b> interfaces ka ek naam wala group hai jinka trust level same hota hai. <code>trust</code>, <code>untrust</code> aur <code>dmz</code> naam conventions hain; aap zone ka naam <code>guest</code> ya <code>servers</code> bhi rakh sakte ho. Aap <b>logical interface</b> (ek unit, jaise <code>ge-0/0/1.0</code>) ko ek hi zone mein daalte ho. Phir policies zones ke beech likhi jaati hain.</p>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet address 203.0.113.2/30
set interfaces ge-0/0/1 unit 0 family inet address 192.168.10.1/24
set security zones security-zone untrust interfaces ge-0/0/0.0
set security zones security-zone trust interfaces ge-0/0/1.0
commit</pre>
<pre class="out">user@BRANCH-SRX&gt; show security zones
Security zone: untrust
  Send reset for non-SYN session TCP packets: Off
  Policy configurable: Yes
  Interfaces bound: 1
  Interfaces:
    <span class="hl">ge-0/0/0.0</span>

Security zone: trust
  Send reset for non-SYN session TCP packets: Off
  Policy configurable: Yes
  Interfaces bound: 1
  Interfaces:
    <span class="hl">ge-0/0/1.0</span></pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Do interfaces, do zones"><rect x="20" y="30" width="200" height="90" rx="12" fill="#bbf7d0"/><text x="120" y="60" text-anchor="middle" class="svg-ink" font-size="14">zone trust</text><text x="120" y="88" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/1.0 192.168.10.1/24</text><rect x="420" y="30" width="200" height="90" rx="12" fill="#bae6fd"/><text x="520" y="60" text-anchor="middle" class="svg-ink" font-size="14">zone untrust</text><text x="520" y="88" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0.0 203.0.113.2/30</text><rect x="270" y="45" width="100" height="60" rx="10" fill="#fed7aa"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">SRX</text><path d="M220 75H270M370 75H420" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Policies dono zones ke beech likhi jaati hain, interface names ke beech nahi.</p></div>
<h3>Aur cheezein jo milengi</h3>
<ul><li>Policy ke liye SRX khud bhi ek zone hai, jiska naam <code>junos-host</code> hai. Box tak traffic host-inbound-traffic (chapter 8) se control hota hai, is zone se nahi.</li><li><code>management</code> naam ka <b>functional zone</b> out-of-band management ports ke liye hai; woh transit traffic carry nahi kar sakta.</li><li>Interface ka address aur zone do alag settings hain. Interface par IP address ho sakta hai aur phir bhi woh kisi zone mein na ho.</li></ul>
<div class="eg"><p><b>Worked example.</b> Ek branch mein ge-0/0/0 ISP ki taraf, ge-0/0/1 office ki taraf aur ge-0/0/2 chhote server rack ki taraf hai. Teen zones: <code>untrust</code>, <code>trust</code>, <code>dmz</code>. Aage aap un ke beech sirf zaroori policies likhoge, jo teen alag interfaces ke baare mein sochne se kahin aasaan hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Interface ko zone mein daalna bhool jana. Jo interface kisi zone mein nahi hai us par aane wala traffic drop hota hai, chahe interface par IP address aur route ho. Ek aur jaal: dimaag mein physical naam <code>ge-0/0/1</code> use karna; zone mein logical unit <code>ge-0/0/1.0</code> aata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek interface sirf ek zone ka ho sakta hai, lekin zone mein kai interfaces ho sakte hain. Do zones mein listed interface ko commit reject kar deta hai.</p></div>
<div class="scn"><h4>Naya port jo koi use nahi kar paya</h4><p>Ek technician ne naya lab switch ge-0/0/3 se jodha, address aur route diya, aur kuch nahi chala. <code>show security zones</code> ne ge-0/0/3.0 ke liye koi zone nahi dikhaya. Use <code>dmz</code> zone mein daalte hi ek commit mein theek ho gaya.</p><p><b>Lesson:</b> address, route aur zone teen alag checks hain. Teeno verify karo.</p></div>
<div class="iv"><p class="q">"Security zone kya hai?"</p><p>Same trust level wale interfaces ka naam wala group. Policies ek zone se doosre zone tak likhi jaati hain. Interface ek hi zone mein hota hai, aur bina zone wale interface ka traffic drop hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Zone barabar trust wale logical interfaces ko group karta hai.</li><li>Interface sirf ek zone ka hota hai.</li><li>Zone nahi to traffic drop.</li><li>show security zones se verify karo.</li></ul></div>`}};export{e as default};